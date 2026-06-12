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
  | "jobs_only"
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

export type ReportVerificationStatus = "verified" | "mismatch" | "needs_review";

export type ReportVerification = {
  fileName: string;
  status: ReportVerificationStatus;
  detectedCompanyHint: string | null;
  message: string;
};

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

export type ScoreBreakdown = {
  transformation: {
    total: number;
    newsScore: number;
    patentScore: number;
    hiringScore: number;
    reportScore: number;
    diversityBonus: number;
    explanation: string;
  };
  confidence: {
    total: number;
    volumeScore: number;
    diversityScore: number;
    reliabilityScore: number;
    reportSupport: number;
    consistencyScore: number;
    appliedCap: string;
    explanation: string;
  };
  marketRecognition: {
    level: MarketRecognition;
    newsArticleCount: number;
    recognitionScore: number;
    newsVisibilityScore: number;
    formalRecognitionScore: number;
    institutionalVisibilityScore: number;
    sourceReliabilityVisibilityScore: number;
    explanation: string;
  };
  recognitionGap: {
    transformationStrength: number;
    recognitionScore: number;
    gap: number;
    interpretation: string;
    explanation: string;
  };
  alphaWindow: {
    months: number;
    explanation: string;
  };
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
  jobSignalsFound?: number;
  reportSignalIncluded?: boolean;
  reportSignalsFound?: number;
  verifiedReportsFound?: number;
  mismatchedReportsFound?: number;
  reportVerifications?: ReportVerification[];
  recognitionScore?: number;
  recognitionGap?: number;
  gapInterpretation?: string;
  queryUsed?: string;
  providerUsed?: ProviderUsed;
  scoreBreakdown?: ScoreBreakdown;
  scoreRationale?: string[];
};
