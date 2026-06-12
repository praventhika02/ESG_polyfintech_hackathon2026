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
  }
}

function whyNowFromSignals(
  signals: ExtractedSignal[],
  marketRecognition: MarketRecognition
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

  return reasons;
}

export function scoreSignals({
  companyId,
  companyName,
  signals,
  hasPatentSignal = false
}: {
  companyId: string;
  companyName: string;
  signals: ExtractedSignal[];
  hasPatentSignal?: boolean;
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
        (hasPatentSignal ? 4 : 0)
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
        (hasPatentSignal ? 3 : 0)
    ),
    0,
    100
  );
  const alphaWindow = alphaWindowMonths(
    transformationStrength,
    marketRecognition
  );
  const classification = classify(transformationStrength, marketRecognition);

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
    whyNow: hasPatentSignal
      ? [
          ...whyNowFromSignals(relevantSignals, marketRecognition).slice(0, 2),
          "Patent search layer indicates ESG-related innovation signals are being monitored."
        ]
      : whyNowFromSignals(relevantSignals, marketRecognition),
    evidenceTimeline: relevantSignals
      .sort((a, b) => b.signalScore - a.signalScore)
      .slice(0, 4)
  };
}
