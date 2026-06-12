export type MarketRecognition = "Low" | "Medium" | "High";

export type Classification =
  | "Early Alpha Opportunity"
  | "Emerging ESG Improver"
  | "Already Recognised"
  | "Watchlist"
  | "Innovation Watchlist"
  | "Evidence Watchlist";

export type DataMode = "live" | "partial_live" | "fallback";

export type ProviderUsed =
  | "gdelt"
  | "google_news_rss"
  | "patents_only"
  | "report_only"
  | "mixed_live"
  | "fallback";

export type EvidenceSourceType =
  | "News"
  | "Jobs"
  | "Patents"
  | "Reports"
  | "Recognition"
  | "Filings"
  | "Policy";

export type EvidenceImpact = "Positive" | "Neutral" | "Negative";

export type SourceReliability = "High" | "Medium" | "Low";

export type NewsArticle = {
  title: string;
  snippet: string;
  url: string;
  publishedAt: string;
  source: string;
  sourceReliability: SourceReliability;
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
  sourceReliability: SourceReliability;
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
  articlesFound?: number;
  patentSignalsFound?: number;
  reportSignalIncluded?: boolean;
  reportSignalsFound?: number;
  queryUsed?: string;
  providerUsed?: ProviderUsed;
};
