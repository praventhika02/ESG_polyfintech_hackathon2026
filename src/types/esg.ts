export type MarketRecognition = "Low" | "Medium" | "High";

export type Classification =
  | "Early Alpha Opportunity"
  | "Emerging ESG Improver"
  | "Already Recognised"
  | "Watchlist";

export type DataMode = "live" | "fallback";

export type EvidenceSourceType =
  | "News"
  | "Jobs"
  | "Patents"
  | "Reports"
  | "Recognition"
  | "Filings"
  | "Policy";

export type EvidenceImpact = "Positive" | "Neutral" | "Negative";

export type NewsArticle = {
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
};

export type ExtractedSignal = {
  date: string;
  sourceType: EvidenceSourceType;
  title: string;
  summary: string;
  url: string;
  impact: EvidenceImpact;
  signalScore: number;
  positiveKeywordCount: number;
  negativeKeywordCount: number;
  source: string;
};

export type EsgScanResult = {
  companyId: string;
  companyName: string;
  generatedAt: string;
  dataMode: DataMode;
  transformationStrength: number;
  marketRecognition: MarketRecognition;
  confidence: number;
  alphaWindowMonths: number;
  classification: Classification;
  investorAction: string;
  whyNow: string[];
  evidenceTimeline: ExtractedSignal[];
};
