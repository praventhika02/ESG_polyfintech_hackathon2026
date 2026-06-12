import type {
  Classification,
  EsgScanResult,
  ExtractedSignal,
  MarketRecognition
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

function alphaWindowMonths(
  transformationStrength: number,
  marketRecognition: MarketRecognition
) {
  if (transformationStrength >= 75 && marketRecognition === "Low") {
    return 11;
  }

  if (transformationStrength >= 75 && marketRecognition === "Medium") {
    return 7;
  }

  if (transformationStrength >= 75 && marketRecognition === "High") {
    return 2;
  }

  if (transformationStrength >= 60 && marketRecognition === "Low") {
    return 6;
  }

  if (transformationStrength < 60) {
    return transformationStrength >= 45 ? 2 : 1;
  }

  return marketRecognition === "Medium" ? 4 : 3;
}

function classify(
  transformationStrength: number,
  marketRecognition: MarketRecognition
): Classification {
  if (transformationStrength >= 75 && marketRecognition !== "High") {
    return "Early Alpha Opportunity";
  }

  if (transformationStrength >= 60 && marketRecognition === "High") {
    return "Already Recognised";
  }

  if (transformationStrength >= 60) {
    return "Emerging ESG Improver";
  }

  if (marketRecognition === "High") {
    return "Already Recognised";
  }

  return "Watchlist";
}

function investorActionFor(classification: Classification) {
  switch (classification) {
    case "Early Alpha Opportunity":
      return "Strong ESG transformation signals are emerging while public recognition remains incomplete. This may indicate an early-entry window before broader market pricing.";
    case "Emerging ESG Improver":
      return "ESG transformation signals are developing, but investors should monitor whether momentum strengthens across more sources.";
    case "Already Recognised":
      return "ESG signals are strong, but public recognition is already high. This may be less attractive for early-alpha entry, though still relevant for ESG quality screening.";
    case "Watchlist":
      return "Current live signals are not strong enough for action. Keep on watchlist until stronger ESG evidence emerges.";
    case "Innovation Watchlist":
      return "Live patent intelligence is monitoring ESG innovation themes, but news confirmation is not yet broad enough for an early-alpha call.";
    case "Evidence Watchlist":
      return "Available live evidence is useful for monitoring, but investors should wait for stronger multi-source confirmation before acting.";
  }
}

function whyNowFromSignals(
  signals: ExtractedSignal[],
  marketRecognition: MarketRecognition,
  patentSignalCount: number,
  jobSignalCount: number
) {
  const positiveSignals = signals.filter((signal) => signal.impact === "Positive");
  const uniqueSources = new Set(signals.map((signal) => signal.source)).size;

  const reasons = [
    signals.length >= 3
      ? "Recent ESG-related news volume increased for this company."
      : "Live ESG-related evidence is limited, so the signal remains early.",
    positiveSignals.length >= 2
      ? "Positive sustainability keywords appear across multiple live sources."
      : "Detected ESG language is still mixed or developing across sources.",
    `Market recognition remains ${marketRecognition.toLowerCase()}, shaping the current timing gap.`
  ];

  if (uniqueSources >= 3) {
    reasons[1] = "ESG signals are appearing across several distinct news sources.";
  }

  if (patentSignalCount >= 3) {
    reasons[2] =
      "Patent intelligence layer is monitoring multiple ESG innovation themes for this company.";
  } else if (patentSignalCount > 0) {
    reasons[2] =
      "Patent search layer indicates ESG-related innovation signals are being monitored.";
  }

  if (jobSignalCount >= 3) {
    reasons[1] =
      "Hiring intelligence layer is monitoring ESG-related capability-building signals.";
  }

  return reasons;
}

function transformationBoostFromPatents(patentSignalCount: number) {
  if (patentSignalCount >= 3) {
    return 6;
  }

  if (patentSignalCount === 2) {
    return 4;
  }

  if (patentSignalCount === 1) {
    return 2;
  }

  return 0;
}

function transformationBoostFromJobs(jobSignalCount: number) {
  if (jobSignalCount >= 3) {
    return 6;
  }

  if (jobSignalCount > 0) {
    return 3;
  }

  return 0;
}

function confidenceBoostFromJobs(jobSignalCount: number) {
  if (jobSignalCount >= 3) {
    return 4;
  }

  if (jobSignalCount > 0) {
    return 2;
  }

  return 0;
}

export function scoreSignals({
  companyId,
  companyName,
  signals,
  patentSignalCount = 0,
  jobSignalCount = 0,
  hasAdditionalSource = false
}: {
  companyId: string;
  companyName: string;
  signals: ExtractedSignal[];
  patentSignalCount?: number;
  jobSignalCount?: number;
  hasAdditionalSource?: boolean;
}): EsgScanResult {
  const relevantSignals = signals;
  const positiveSignals = relevantSignals.filter(
    (signal) => signal.signalScore > 5
  );
  const negativeSignals = relevantSignals.filter(
    (signal) => signal.signalScore < -5
  );
  const averagePositiveScore =
    relevantSignals.length > 0
      ? relevantSignals.reduce(
          (total, signal) => total + Math.max(0, signal.signalScore),
          0
        ) / relevantSignals.length
      : 0;

  const transformationStrength = clamp(
    Math.round(
      18 +
        averagePositiveScore * 1.8 +
        positiveSignals.length * 5 +
        relevantSignals.length * 3 -
        negativeSignals.length * 8 +
        transformationBoostFromPatents(patentSignalCount) +
        transformationBoostFromJobs(jobSignalCount)
    ),
    0,
    100
  );
  const marketRecognition = recognitionFromVolume(relevantSignals.length);
  const sourceCount = new Set(relevantSignals.map((signal) => signal.source)).size;
  const clearSignals = relevantSignals.filter(
    (signal) => Math.abs(signal.signalScore) > 5
  ).length;
  const consistency =
    relevantSignals.length === 0
      ? 0
      : Math.abs(positiveSignals.length - negativeSignals.length) /
        relevantSignals.length;
  const confidence = clamp(
    Math.round(
      28 +
        relevantSignals.length * 4 +
        sourceCount * 4 +
        clearSignals * 3 +
        consistency * 18 +
        Math.min(4, patentSignalCount + 1) +
        confidenceBoostFromJobs(jobSignalCount)
    ),
    0,
    100
  );
  const alphaWindow = alphaWindowMonths(
    transformationStrength,
    marketRecognition
  );
  let classification = classify(transformationStrength, marketRecognition);

  if (
    classification === "Early Alpha Opportunity" &&
    !hasAdditionalSource
  ) {
    classification = "Emerging ESG Improver";
  }

  return {
    companyId,
    companyName,
    generatedAt: new Date().toISOString(),
    dataMode: "live",
    transformationStrength,
    marketRecognition,
    confidence,
    alphaWindowMonths: alphaWindow,
    classification,
    investorAction: investorActionFor(classification),
    whyNow: whyNowFromSignals(
      relevantSignals,
      marketRecognition,
      patentSignalCount,
      jobSignalCount
    ),
    evidenceTimeline: relevantSignals
      .sort((a, b) => b.signalScore - a.signalScore)
      .slice(0, 4)
  };
}

export function scorePartialLiveSignals({
  companyId,
  companyName,
  patentSignalCount,
  jobSignalCount,
  hasReportSignal
}: {
  companyId: string;
  companyName: string;
  patentSignalCount: number;
  jobSignalCount: number;
  hasReportSignal: boolean;
}): EsgScanResult {
  const patentBoost = transformationBoostFromPatents(patentSignalCount);
  const jobBoost = transformationBoostFromJobs(jobSignalCount);
  const transformationStrength = clamp(
    58 +
      patentSignalCount * 5 +
      patentBoost +
      jobSignalCount * 4 +
      jobBoost +
      (hasReportSignal ? 6 : 0),
    60,
    80
  );
  const confidenceCap = hasReportSignal ? 88 : 82;
  const confidence = clamp(
    54 +
      patentSignalCount * 7 +
      jobSignalCount * 5 +
      confidenceBoostFromJobs(jobSignalCount) +
      (hasReportSignal ? 8 : 0),
    55,
    confidenceCap
  );
  const classification: Classification =
    (patentSignalCount > 0 || jobSignalCount > 0) && !hasReportSignal
      ? "Innovation Watchlist"
      : "Evidence Watchlist";
  const whyNow = [
    jobSignalCount >= 3
      ? "Hiring intelligence layer is monitoring ESG-related capability-building signals."
      : patentSignalCount >= 3
      ? "Patent intelligence layer is monitoring multiple ESG innovation themes for this company."
      : "Live news was unavailable for this scan, so the alpha window is based on patent, hiring, and report signals.",
    hasReportSignal
      ? "Uploaded report evidence has been included as a high-reliability source for the next parsing module."
      : "Live news was unavailable for this scan, so the alpha window is based on patent, hiring, and report signals.",
    "The alpha window remains open for monitoring while stronger news confirmation develops."
  ];

  return {
    companyId,
    companyName,
    generatedAt: new Date().toISOString(),
    dataMode: "partial_live",
    transformationStrength,
    marketRecognition: "Low",
    confidence,
    alphaWindowMonths: patentSignalCount >= 3 ? 10 : 8,
    classification,
    investorAction: investorActionFor(classification),
    whyNow,
    evidenceTimeline: []
  };
}
