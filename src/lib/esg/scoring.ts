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
      return "Strong ESG transformation signals are visible while market recognition remains incomplete. This may indicate an early-entry opportunity.";
    case "Emerging ESG Improver":
      return "ESG transformation signals are developing, but investors should monitor whether momentum strengthens across more sources.";
    case "Already Recognised":
      return "ESG transformation appears visible, but market recognition is already high. The alpha window may be narrowing.";
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
  signals
}: {
  companyId: string;
  companyName: string;
  signals: ExtractedSignal[];
}): EsgScanResult {
  const relevantSignals = signals.filter(
    (signal) => signal.positiveKeywordCount + signal.negativeKeywordCount > 0
  );
  const positiveSignals = relevantSignals.filter(
    (signal) => signal.signalScore > 5
  );
  const negativeSignals = relevantSignals.filter(
    (signal) => signal.signalScore < -5
  );
  const averagePositiveScore =
    positiveSignals.length > 0
      ? positiveSignals.reduce((total, signal) => total + signal.signalScore, 0) /
        positiveSignals.length
      : 0;

  const transformationStrength = clamp(
    Math.round(
      28 +
        averagePositiveScore * 1.35 +
        positiveSignals.length * 6 +
        relevantSignals.length * 2 -
        negativeSignals.length * 9
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
      34 +
        relevantSignals.length * 5 +
        sourceCount * 4 +
        clearSignals * 3 +
        consistency * 18
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
    whyNow: whyNowFromSignals(relevantSignals, marketRecognition),
    evidenceTimeline: relevantSignals
      .sort((a, b) => Math.abs(b.signalScore) - Math.abs(a.signalScore))
      .slice(0, 4)
  };
}
