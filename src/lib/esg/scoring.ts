import type {
  Classification,
  EsgScanResult,
  ExtractedSignal,
  MarketRecognition,
  ScoreBreakdown,
  SourceReliability
} from "@/types/esg";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function recognitionFromVolume(articleCount: number): MarketRecognition {
  if (articleCount >= 7) {
    return "High";
  }

  if (articleCount >= 3) {
    return "Medium";
  }

  return "Low";
}

function pointsFromCount(count: number, one: number, two: number, threePlus: number) {
  if (count >= 3) {
    return threePlus;
  }

  if (count === 2) {
    return two;
  }

  if (count === 1) {
    return one;
  }

  return 0;
}

function sourceDiversityScore(activeSourceCount: number, mode: "transformation" | "confidence") {
  if (mode === "transformation") {
    return [0, 3, 7, 11, 15][activeSourceCount] ?? 15;
  }

  return [0, 8, 14, 20, 25][activeSourceCount] ?? 25;
}

function alphaWindowMonths(
  transformationStrength: number,
  confidence: number,
  marketRecognition: MarketRecognition
) {
  if (transformationStrength < 60) {
    return confidence < 60 ? 1 : 3;
  }

  const range =
    marketRecognition === "High"
      ? [1, 3]
      : marketRecognition === "Medium"
      ? [4, 7]
      : [8, 12];

  if (transformationStrength >= 80 && confidence >= 75) {
    return range[1];
  }

  if (confidence < 60) {
    return range[0];
  }

  return Math.round((range[0] + range[1]) / 2);
}

function alphaExplanation(level: MarketRecognition, months: number, transformation: number) {
  if (transformation < 60) {
    return `Transformation strength is below 60, so the alpha window is limited to ${months} month${months === 1 ? "" : "s"}.`;
  }

  if (level === "High") {
    return "Because recognition is high, the estimated action window narrows to 1-3 months.";
  }

  if (level === "Medium") {
    return "Because recognition is medium, the estimated action window sits in the 4-7 month range.";
  }

  return "Because recognition is low, the estimated action window can remain open for 8-12 months.";
}

function classify({
  transformationStrength,
  confidence,
  marketRecognition,
  alphaWindow,
  newsCount,
  patentSignalCount,
  jobSignalCount
}: {
  transformationStrength: number;
  confidence: number;
  marketRecognition: MarketRecognition;
  alphaWindow: number;
  newsCount: number;
  patentSignalCount: number;
  jobSignalCount: number;
}): Classification {
  if (marketRecognition === "High" && alphaWindow <= 3) {
    return "Already Recognised";
  }

  if (
    transformationStrength >= 75 &&
    confidence >= 70 &&
    marketRecognition !== "High"
  ) {
    return "Early Alpha Opportunity";
  }

  if (
    transformationStrength >= 65 &&
    confidence >= 60 &&
    marketRecognition !== "High"
  ) {
    return "Emerging ESG Improver";
  }

  if (newsCount === 0 && (patentSignalCount > 0 || jobSignalCount > 0)) {
    return "Innovation Watchlist";
  }

  return "Evidence Watchlist";
}

function investorActionFor(classification: Classification) {
  switch (classification) {
    case "Already Recognised":
      return "ESG signals are strong, but public recognition is already high. The alpha window may be narrowing.";
    case "Early Alpha Opportunity":
      return "Strong transformation evidence is emerging while public recognition remains incomplete. This may indicate an early-entry window.";
    case "Emerging ESG Improver":
      return "ESG transformation evidence is developing across multiple sources. Continue monitoring for stronger recognition lag.";
    case "Innovation Watchlist":
      return "Patent and hiring signals suggest early innovation activity, but live news recognition is limited. Monitor for confirmation.";
    case "Evidence Watchlist":
    case "Watchlist":
      return "Current evidence is not strong enough for an investor action signal. More signals are needed.";
  }
}

function reliabilityPoints(reliability: SourceReliability) {
  if (reliability === "High") {
    return 5;
  }

  if (reliability === "Medium") {
    return 3;
  }

  return 1;
}

function consistencyScore(signals: ExtractedSignal[]) {
  const positiveOrNeutral = signals.filter(
    (signal) => signal.impact === "Positive" || signal.impact === "Neutral"
  ).length;
  const negative = signals.filter((signal) => signal.impact === "Negative").length;
  const total = signals.length;

  if (total === 0) {
    return 10;
  }

  if (negative > positiveOrNeutral) {
    return 2;
  }

  if (negative > 0 && negative / total >= 0.25) {
    return 5;
  }

  return 10;
}

function appliedConfidenceCap({
  rawConfidence,
  reportSignalCount,
  hasHighReliabilityNews,
  newsCount,
  patentSignalCount,
  jobSignalCount
}: {
  rawConfidence: number;
  reportSignalCount: number;
  hasHighReliabilityNews: boolean;
  newsCount: number;
  patentSignalCount: number;
  jobSignalCount: number;
}) {
  const caps = [{ value: 96, reason: "Maximum confidence is capped at 96 to avoid false precision." }];

  if (reportSignalCount === 0) {
    caps.push({
      value: 92,
      reason: "Capped at 92 because no uploaded report was included."
    });
  }

  if (!hasHighReliabilityNews) {
    caps.push({
      value: 86,
      reason: "Capped at 86 because no high-reliability news source was detected."
    });
  }

  if (newsCount === 0) {
    caps.push({
      value: 82,
      reason: "Capped at 82 because no live news was available."
    });
  }

  if (newsCount === 0 && reportSignalCount === 0 && (patentSignalCount > 0 || jobSignalCount > 0)) {
    caps.push({
      value: 76,
      reason: "Capped at 76 because only patent and hiring intelligence links were present."
    });
  }

  const cap = caps.reduce((lowest, candidate) =>
    candidate.value < lowest.value ? candidate : lowest
  );

  return {
    total: Math.min(rawConfidence, cap.value),
    explanation: cap.reason
  };
}

function scoreModel({
  companyId,
  companyName,
  signals,
  patentSignalCount,
  jobSignalCount,
  reportSignalCount,
  dataMode
}: {
  companyId: string;
  companyName: string;
  signals: ExtractedSignal[];
  patentSignalCount: number;
  jobSignalCount: number;
  reportSignalCount: number;
  dataMode: EsgScanResult["dataMode"];
}): EsgScanResult {
  const newsCount = signals.length;
  const positiveSignals = signals.filter((signal) => signal.signalScore > 5);
  const averagePositiveSignalScore =
    positiveSignals.length > 0
      ? positiveSignals.reduce((total, signal) => total + signal.signalScore, 0) /
        positiveSignals.length
      : 0;
  const activeSourceCount = [
    newsCount > 0,
    patentSignalCount > 0,
    jobSignalCount > 0,
    reportSignalCount > 0
  ].filter(Boolean).length;

  const newsScore = clamp(
    Math.round(positiveSignals.length * 5 + averagePositiveSignalScore * 0.5),
    0,
    45
  );
  const patentScore = pointsFromCount(patentSignalCount, 5, 10, 15);
  const hiringScore = pointsFromCount(jobSignalCount, 5, 10, 15);
  const reportScore = reportSignalCount >= 2 ? 10 : reportSignalCount === 1 ? 6 : 0;
  const diversityBonus = sourceDiversityScore(activeSourceCount, "transformation");
  const transformationStrength = clamp(
    newsScore + patentScore + hiringScore + reportScore + diversityBonus,
    0,
    100
  );
  const marketRecognition = recognitionFromVolume(newsCount);
  const evidenceCount = newsCount + patentSignalCount + jobSignalCount + reportSignalCount;
  const volumeScore = Math.min(30, evidenceCount * 3);
  const diversityScore = sourceDiversityScore(activeSourceCount, "confidence");
  const reliabilityScore = Math.min(
    25,
    signals.reduce(
      (total, signal) => total + reliabilityPoints(signal.sourceReliability),
      0
    ) +
      patentSignalCount * 3 +
      jobSignalCount * 3 +
      reportSignalCount * 5
  );
  const reportSupport = reportSignalCount >= 2 ? 10 : reportSignalCount === 1 ? 6 : 0;
  const signalConsistency = consistencyScore(signals);
  const rawConfidence =
    volumeScore + diversityScore + reliabilityScore + reportSupport + signalConsistency;
  const hasHighReliabilityNews = signals.some(
    (signal) => signal.sourceReliability === "High"
  );
  const cappedConfidence = appliedConfidenceCap({
    rawConfidence,
    reportSignalCount,
    hasHighReliabilityNews,
    newsCount,
    patentSignalCount,
    jobSignalCount
  });
  const confidence = cappedConfidence.total;
  const alphaWindow = alphaWindowMonths(
    transformationStrength,
    confidence,
    marketRecognition
  );
  const classification = classify({
    transformationStrength,
    confidence,
    marketRecognition,
    alphaWindow,
    newsCount,
    patentSignalCount,
    jobSignalCount
  });
  const breakdown: ScoreBreakdown = {
    transformation: {
      total: transformationStrength,
      newsScore,
      patentScore,
      hiringScore,
      reportScore,
      diversityBonus,
      explanation:
        "Transformation Strength combines ESG news strength, patent intelligence, hiring intelligence, uploaded report support, and source diversity."
    },
    confidence: {
      total: confidence,
      volumeScore,
      diversityScore,
      reliabilityScore,
      reportSupport,
      consistencyScore: signalConsistency,
      appliedCap: cappedConfidence.explanation,
      explanation:
        "Confidence reflects evidence volume, source diversity, source reliability, report support, and whether signals agree directionally."
    },
    marketRecognition: {
      level: marketRecognition,
      newsArticleCount: newsCount,
      explanation: `${newsCount} live ESG news article${newsCount === 1 ? "" : "s"} were detected, so public recognition is considered ${marketRecognition.toLowerCase()}.`
    },
    alphaWindow: {
      months: alphaWindow,
      explanation: alphaExplanation(marketRecognition, alphaWindow, transformationStrength)
    }
  };
  const scoreRationale = [
    `Transformation strength is driven by ${newsCount} ESG-related news articles, ${patentSignalCount} patent intelligence queries, ${jobSignalCount} hiring intelligence queries, and ${reportSignalCount} uploaded report signals.`,
    `Market recognition is ${marketRecognition.toLowerCase()} because ${newsCount} public ESG news articles were detected.`,
    cappedConfidence.explanation,
    marketRecognition === "High"
      ? "Alpha window is short because public recognition is already high."
      : "Alpha window remains wider because public recognition is not yet high."
  ];

  if (newsCount === 0) {
    scoreRationale.unshift(
      "Live news was unavailable for this scan, so the alpha window is based on patent, hiring, and report signals."
    );
  }

  return {
    companyId,
    companyName,
    generatedAt: new Date().toISOString(),
    dataMode,
    transformationStrength,
    marketRecognition,
    confidence,
    alphaWindowMonths: alphaWindow,
    classification,
    investorAction: investorActionFor(classification),
    whyNow: scoreRationale.slice(0, 3),
    evidenceTimeline: [...signals].sort((a, b) => b.signalScore - a.signalScore).slice(0, 4),
    scoreBreakdown: breakdown,
    scoreRationale
  };
}

export function scoreSignals({
  companyId,
  companyName,
  signals,
  patentSignalCount = 0,
  jobSignalCount = 0,
  reportSignalCount = 0
}: {
  companyId: string;
  companyName: string;
  signals: ExtractedSignal[];
  patentSignalCount?: number;
  jobSignalCount?: number;
  reportSignalCount?: number;
  hasAdditionalSource?: boolean;
}): EsgScanResult {
  return scoreModel({
    companyId,
    companyName,
    signals,
    patentSignalCount,
    jobSignalCount,
    reportSignalCount,
    dataMode: "live"
  });
}

export function scorePartialLiveSignals({
  companyId,
  companyName,
  patentSignalCount,
  jobSignalCount,
  reportSignalCount = 0,
  hasReportSignal
}: {
  companyId: string;
  companyName: string;
  patentSignalCount: number;
  jobSignalCount: number;
  reportSignalCount?: number;
  hasReportSignal: boolean;
}): EsgScanResult {
  return scoreModel({
    companyId,
    companyName,
    signals: [],
    patentSignalCount,
    jobSignalCount,
    reportSignalCount: hasReportSignal ? Math.max(1, reportSignalCount) : 0,
    dataMode: "partial_live"
  });
}
