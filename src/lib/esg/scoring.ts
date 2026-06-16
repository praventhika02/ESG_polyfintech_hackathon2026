import type {
  Classification,
  EsgScanResult,
  ExtractedSignal,
  MarketRecognition,
  ScoreBreakdown,
  SourceReliability
} from "@/types/esg";

const formalRecognitionKeywords = [
  "award",
  "ranking",
  "recognised",
  "recognized",
  "sustainability leader",
  "esg rating",
  "msci",
  "sustainalytics",
  "ftse4good",
  "djsi",
  "index inclusion",
  "etf inclusion",
  "esg etf",
  "media coverage",
  "public discussion",
  "top ranked",
  "sustainability award",
  "annual report ranking"
];

const institutionalKeywords = [
  "analyst",
  "investor",
  "fund manager",
  "market",
  "stock",
  "rating agency",
  "exchange",
  "financial results",
  "annual results",
  "reuters",
  "bloomberg",
  "business times"
];

const transformationActionKeywords = [
  "opens",
  "opened",
  "launch",
  "launched",
  "build",
  "built",
  "develop",
  "develops",
  "developed",
  "invest",
  "invests",
  "investment",
  "expand",
  "expands",
  "expanded",
  "renewable facility",
  "renewable project",
  "solar",
  "wind",
  "battery storage",
  "green hydrogen",
  "emissions reduction",
  "decarbonisation",
  "decarbonization",
  "energy efficiency",
  "green building",
  "sustainable finance",
  "supply chain traceability",
  "carbon capture",
  "transition plan"
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pointsFromCount(count: number, one: number, two: number, threePlus: number) {
  if (count >= 3) return threePlus;
  if (count === 2) return two;
  if (count === 1) return one;
  return 0;
}

function sourceDiversityScore(activeSourceCount: number, mode: "transformation" | "confidence") {
  if (mode === "transformation") {
    return [0, 2, 5, 8, 10][activeSourceCount] ?? 10;
  }

  return [0, 8, 14, 20, 25][activeSourceCount] ?? 25;
}

function recognitionLevelFromScore(score: number): MarketRecognition {
  if (score >= 65) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function keywordHitCount(signals: ExtractedSignal[], keywords: string[]) {
  return signals.reduce((count, signal) => {
    const text = `${signal.title} ${signal.summary} ${signal.source}`.toLowerCase();
    return count + (keywords.some((keyword) => text.includes(keyword)) ? 1 : 0);
  }, 0);
}

function recognitionScoreFromSignals(signals: ExtractedSignal[]) {
  const newsCount = signals.length;
  const uniquePublishers = new Set(signals.map((signal) => signal.source)).size;
  const baseNewsScore =
    newsCount >= 9 ? 28 : newsCount >= 6 ? 24 : newsCount >= 3 ? 16 : newsCount >= 1 ? 8 : 0;
  const newsVisibilityScore = Math.min(
    30,
    baseNewsScore + (uniquePublishers >= 3 ? 2 : 0)
  );
  const formalRecognitionScore = Math.min(
    25,
    keywordHitCount(signals, formalRecognitionKeywords) * 8
  );
  const institutionalVisibilityScore = Math.min(
    20,
    keywordHitCount(signals, institutionalKeywords) * 5
  );
  const sourceReliabilityVisibilityScore = Math.min(
    15,
    signals.reduce((total, signal) => {
      if (signal.sourceReliability === "High") return total + 4;
      if (signal.sourceReliability === "Medium") return total + 2;
      return total + 0.5;
    }, 0)
  );
  const repeatedCoverageScore = Math.min(10, Math.max(0, newsCount - uniquePublishers) * 2);
  const recognitionScore = clamp(
    newsVisibilityScore +
      formalRecognitionScore +
      institutionalVisibilityScore +
      sourceReliabilityVisibilityScore +
      repeatedCoverageScore,
    0,
    100
  );

  return {
    recognitionScore,
    newsVisibilityScore,
    formalRecognitionScore,
    institutionalVisibilityScore,
    sourceReliabilityVisibilityScore,
    repeatedCoverageScore
  };
}

function gapInterpretation(gap: number) {
  if (gap >= 25) {
    return "Strong hidden opportunity: transformation signals are meaningfully ahead of market recognition.";
  }

  if (gap >= 10) {
    return "Developing opportunity: recognition is catching up, but a timing gap remains.";
  }

  if (gap >= -10) {
    return "Fairly recognised: transformation and market recognition appear broadly balanced.";
  }

  return "Already recognised or crowded: market recognition appears ahead of transformation.";
}

function alphaWindowFromGap({
  recognitionGap,
  confidence,
  classification,
  marketRecognition
}: {
  recognitionGap: number;
  confidence: number;
  classification: Classification;
  marketRecognition: MarketRecognition;
}) {
  let months =
    classification === "Already Recognised" || classification === "Overrated ESG Story"
      ? 2
      : recognitionGap >= 25
        ? 10
        : recognitionGap >= 10
          ? 6
          : recognitionGap >= -10
            ? 4
            : 2;

  if (confidence < 60) months = Math.min(months, 4);
  if (marketRecognition === "High") months = Math.min(months, 4);
  if (classification === "Already Recognised" || classification === "Overrated ESG Story") {
    months = Math.min(months, 3);
  }
  if (classification === "Evidence Watchlist") months = Math.min(months, 3);

  return months;
}

function classify({
  transformationStrength,
  confidence,
  recognitionScore,
  recognitionGap,
  marketRecognition
}: {
  transformationStrength: number;
  confidence: number;
  recognitionScore: number;
  recognitionGap: number;
  marketRecognition: MarketRecognition;
}): Classification {
  if (
    transformationStrength >= 70 &&
    recognitionScore < 65 &&
    recognitionGap >= 25 &&
    confidence >= 70 &&
    marketRecognition !== "High"
  ) {
    return "Early Alpha Opportunity";
  }

  if (transformationStrength >= 70 && recognitionScore >= 65) {
    return "Already Recognised";
  }

  if (transformationStrength >= 55 && recognitionScore < 65 && confidence >= 60) {
    return "Emerging ESG Improver";
  }

  if (transformationStrength < 70 && recognitionScore >= 65) {
    return "Overrated ESG Story";
  }

  return "Evidence Watchlist";
}

function investorActionFor(classification: Classification) {
  switch (classification) {
    case "Early Alpha Opportunity":
      return "Strong transformation evidence is emerging while public recognition remains incomplete. This may indicate an early-entry window.";
    case "Emerging ESG Improver":
      return "ESG transformation evidence is developing across multiple sources. Continue monitoring for stronger recognition lag.";
    case "Already Recognised":
      return "ESG activity is strong, but public recognition has already caught up, reducing the early-alpha window.";
    case "Overrated ESG Story":
      return "Public recognition is high while transformation evidence is not strong enough. Treat as crowded ESG attention and be cautious.";
    case "Innovation Watchlist":
      return "Patent and hiring signals suggest early innovation activity, but public evidence is not yet strong enough.";
    case "Evidence Watchlist":
    case "Watchlist":
      return "Current evidence is not strong or reliable enough to support an investor action signal.";
  }
}

function reliabilityPoints(reliability: SourceReliability) {
  if (reliability === "High") return 5;
  if (reliability === "Medium") return 3;
  return 1;
}

function sourceAgreementScore(signals: ExtractedSignal[]) {
  const total = signals.length;
  if (total === 0) return 6;

  const positive = signals.filter((signal) => signal.impact === "Positive").length;
  const neutral = signals.filter((signal) => signal.impact === "Neutral").length;
  const negative = signals.filter((signal) => signal.impact === "Negative").length;
  const supportiveRatio = (positive + neutral * 0.6) / total;
  const penalty = negative / total;

  return clamp(Math.round(supportiveRatio * 10 - penalty * 5), 2, 10);
}

function appliedConfidenceCap({
  rawConfidence,
  verifiedReportCount,
  hasHighReliabilityEvidence,
  newsCount,
  patentSignalCount,
  jobSignalCount
}: {
  rawConfidence: number;
  verifiedReportCount: number;
  hasHighReliabilityEvidence: boolean;
  newsCount: number;
  patentSignalCount: number;
  jobSignalCount: number;
}) {
  const caps = [{ value: 96, reason: "Maximum confidence is capped at 96 to avoid false precision." }];

  if (verifiedReportCount === 0) {
    caps.push({ value: 92, reason: "Capped at 92 because no verified uploaded report was included." });
  }
  if (!hasHighReliabilityEvidence) {
    caps.push({ value: 86, reason: "Capped at 86 because no high-reliability evidence was detected." });
  }
  if (newsCount === 0) {
    caps.push({ value: 82, reason: "Capped at 82 because no live news was available." });
  }
  if (newsCount === 0 && verifiedReportCount === 0 && (patentSignalCount > 0 || jobSignalCount > 0)) {
    caps.push({ value: 76, reason: "Capped at 76 because only patent and hiring intelligence links were present." });
  }

  const cap = caps.reduce((lowest, candidate) =>
    candidate.value < lowest.value ? candidate : lowest
  );

  return { total: Math.min(rawConfidence, cap.value), explanation: cap.reason };
}

function scoreModel({
  companyId,
  companyName,
  signals,
  patentSignalCount,
  jobSignalCount,
  verifiedReportCount,
  reportThemeCount,
  dataMode
}: {
  companyId: string;
  companyName: string;
  signals: ExtractedSignal[];
  patentSignalCount: number;
  jobSignalCount: number;
  verifiedReportCount: number;
  reportThemeCount: number;
  dataMode: EsgScanResult["dataMode"];
}): EsgScanResult {
  const newsCount = signals.length;
  const positiveSignals = signals.filter((signal) => signal.signalScore > 5);
  const actionSignals = positiveSignals.filter((signal) => {
    const text = `${signal.title} ${signal.summary}`.toLowerCase();
    return transformationActionKeywords.some((keyword) => text.includes(keyword));
  });
  const negativeSignals = signals.filter((signal) => signal.impact === "Negative");
  const averagePositiveSignalScore =
    actionSignals.length > 0
      ? actionSignals.reduce((total, signal) => total + signal.signalScore, 0) / actionSignals.length
      : 0;
  const activeSourceCount = [
    newsCount > 0,
    patentSignalCount > 0,
    jobSignalCount > 0,
    verifiedReportCount > 0
  ].filter(Boolean).length;

  const newsScore = clamp(
    Math.round(
      actionSignals.length * 4 +
        averagePositiveSignalScore * 0.4 -
        negativeSignals.length * 4
    ),
    0,
    35
  );
  const patentScore = pointsFromCount(patentSignalCount, 5, 10, 15);
  const hiringScore = pointsFromCount(jobSignalCount, 5, 10, 15);
  const reportScore =
    reportThemeCount >= 6 ? 20 : reportThemeCount >= 3 ? 14 : reportThemeCount >= 1 ? 8 : 0;
  const diversityBonus = sourceDiversityScore(activeSourceCount, "transformation");
  const weakEvidencePenalty =
    newsCount > 0 && actionSignals.length === 0 && verifiedReportCount === 0 ? 10 : 0;
  const transformationStrength = clamp(
    newsScore + patentScore + hiringScore + reportScore + diversityBonus - weakEvidencePenalty,
    0,
    100
  );
  const recognition = recognitionScoreFromSignals(signals);
  const recognitionScore = recognition.recognitionScore;
  const marketRecognition = recognitionLevelFromScore(recognitionScore);
  const recognitionGap = transformationStrength - recognitionScore;
  const interpretation = gapInterpretation(recognitionGap);
  const evidenceCount = newsCount + patentSignalCount + jobSignalCount + verifiedReportCount;
  const volumeScore = Math.min(25, evidenceCount * 1.8);
  const diversityScore = sourceDiversityScore(activeSourceCount, "confidence");
  const reliabilityScore = Math.min(
    25,
    signals.reduce((total, signal) => total + reliabilityPoints(signal.sourceReliability), 0) +
      patentSignalCount * 3 +
      jobSignalCount * 3 +
      verifiedReportCount * 5
  );
  const reportSupport = verifiedReportCount >= 2 ? 15 : verifiedReportCount === 1 ? 8 : 0;
  const signalConsistency = sourceAgreementScore(signals);
  const rawConfidence = volumeScore + diversityScore + reliabilityScore + reportSupport + signalConsistency;
  const hasHighReliabilityEvidence =
    verifiedReportCount > 0 || signals.some((signal) => signal.sourceReliability === "High");
  const cappedConfidence = appliedConfidenceCap({
    rawConfidence,
    verifiedReportCount,
    hasHighReliabilityEvidence,
    newsCount,
    patentSignalCount,
    jobSignalCount
  });
  const confidence = cappedConfidence.total;
  const classification = classify({
    transformationStrength,
    confidence,
    recognitionScore,
    recognitionGap,
    marketRecognition
  });
  const alphaWindow = alphaWindowFromGap({
    recognitionGap,
    confidence,
    classification,
    marketRecognition
  });

  const breakdown: ScoreBreakdown = {
    transformation: {
      total: transformationStrength,
      newsScore,
      patentScore,
      hiringScore,
      reportScore,
      diversityBonus,
      weakEvidencePenalty,
      explanation: "Measures ESG change signals from news, patent intelligence, hiring intelligence, and verified uploaded reports."
    },
    confidence: {
      total: confidence,
      volumeScore,
      diversityScore,
      reliabilityScore,
      reportSupport,
      consistencyScore: signalConsistency,
      appliedCap: cappedConfidence.explanation,
      explanation: "Reliability of the signal based on evidence volume, source diversity, reliability, verified reports, and consistency."
    },
    marketRecognition: {
      level: marketRecognition,
      newsArticleCount: newsCount,
      recognitionScore,
      newsVisibilityScore: recognition.newsVisibilityScore,
      formalRecognitionScore: recognition.formalRecognitionScore,
      institutionalVisibilityScore: recognition.institutionalVisibilityScore,
      sourceReliabilityVisibilityScore: recognition.sourceReliabilityVisibilityScore,
      repeatedCoverageScore: recognition.repeatedCoverageScore,
      explanation: "Measures how much the market has already noticed the ESG story through news visibility, formal recognition signals, institutional attention, and source reliability."
    },
    recognitionGap: {
      transformationStrength,
      recognitionScore,
      gap: recognitionGap,
      interpretation,
      explanation: "Transformation Strength minus Recognition Score. A larger positive gap means transformation may be ahead of market recognition."
    },
    alphaWindow: {
      months: alphaWindow,
      explanation: "The alpha window estimates how much time may remain before transformation signals become widely recognised. It is based on the gap between transformation strength and recognition score."
    }
  };

  const scoreRationale = [
    `${interpretation} Recognition gap: ${transformationStrength} - ${recognitionScore} = ${recognitionGap}.`,
    `Transformation uses ${newsCount} news articles, ${patentSignalCount} patent queries, ${jobSignalCount} hiring queries, and ${verifiedReportCount} verified report signals.`,
    `Recognition score is ${recognitionScore}/100 from news visibility, formal recognition, institutional attention, and source reliability.`,
    cappedConfidence.explanation
  ];

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
    recognitionScore,
    recognitionGap,
    gapInterpretation: interpretation,
    scoreBreakdown: breakdown,
    scoreRationale
  };
}

export function scoreSignals(params: {
  companyId: string;
  companyName: string;
  signals: ExtractedSignal[];
  patentSignalCount?: number;
  jobSignalCount?: number;
  reportSignalCount?: number;
  reportThemeCount?: number;
  needsReviewReportCount?: number;
  hasAdditionalSource?: boolean;
}): EsgScanResult {
  const {
    companyId,
    companyName,
    signals,
    patentSignalCount = 0,
    jobSignalCount = 0,
    reportSignalCount = 0,
    reportThemeCount = 0
  } = params;

  return scoreModel({
    companyId,
    companyName,
    signals,
    patentSignalCount,
    jobSignalCount,
    verifiedReportCount: reportSignalCount,
    reportThemeCount,
    dataMode: "live"
  });
}

export function scorePartialLiveSignals(params: {
  companyId: string;
  companyName: string;
  patentSignalCount: number;
  jobSignalCount: number;
  reportSignalCount?: number;
  reportThemeCount?: number;
  needsReviewReportCount?: number;
  hasReportSignal: boolean;
}): EsgScanResult {
  const {
    companyId,
    companyName,
    patentSignalCount,
    jobSignalCount,
    reportSignalCount = 0,
    reportThemeCount = 0
  } = params;

  return scoreModel({
    companyId,
    companyName,
    signals: [],
    patentSignalCount,
    jobSignalCount,
    verifiedReportCount: reportSignalCount,
    reportThemeCount,
    dataMode: "partial_live"
  });
}
