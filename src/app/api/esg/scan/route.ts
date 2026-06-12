import { NextResponse } from "next/server";
import { fetchLiveEsgNews } from "@/lib/esg/providers/newsProvider";
import { getPatentSignals } from "@/lib/esg/providers/patentProvider";
import { getJobSignals } from "@/lib/esg/providers/jobProvider";
import { scorePartialLiveSignals, scoreSignals } from "@/lib/esg/scoring";
import { extractSignalsFromArticles } from "@/lib/esg/signalExtraction";
import { mockResults } from "@/lib/esg/mockResults";
import { verifyReportFileNames } from "@/lib/esg/reportVerification";
import type {
  EsgScanResult,
  EvidenceImpact,
  EvidenceSourceType,
  ProviderUsed
} from "@/types/esg";

type ScanRequest = {
  companyId?: string;
  companyName?: string;
  reportFileName?: string;
  reportFileNames?: string[];
};

function investorActionForClassification(classification: string) {
  if (classification === "Already Recognised") {
    return "ESG signals are strong, but public recognition is already high. The alpha window may be narrowing.";
  }

  if (classification === "Early Alpha Opportunity") {
    return "Strong transformation evidence is emerging while public recognition remains incomplete. This may indicate an early-entry window.";
  }

  if (classification === "Emerging ESG Improver") {
    return "ESG transformation evidence is developing across multiple sources. Continue monitoring for stronger recognition lag.";
  }

  if (classification === "Innovation Watchlist") {
    return "Patent and hiring signals suggest early innovation activity, but live news recognition is limited. Monitor for confirmation.";
  }

  if (classification === "Evidence Watchlist" || classification === "Watchlist") {
    return "Current evidence is not strong enough for an investor action signal. More signals are needed.";
  }

  return null;
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Scan timed out after ${milliseconds}ms`));
    }, milliseconds);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => {
        clearTimeout(timeout);
      });
  });
}

function impactFromText(text: string): EvidenceImpact {
  const lowered = text.toLowerCase();

  if (
    lowered.includes("risk") ||
    lowered.includes("lower") ||
    lowered.includes("limited") ||
    lowered.includes("compressed")
  ) {
    return "Neutral";
  }

  return "Positive";
}

function normaliseSourceType(sourceType: string): EvidenceSourceType {
  if (sourceType === "Report") {
    return "Reports";
  }

  if (
    sourceType === "News" ||
    sourceType === "Jobs" ||
    sourceType === "Patents" ||
    sourceType === "Reports" ||
    sourceType === "Recognition" ||
    sourceType === "Filings" ||
    sourceType === "Policy"
  ) {
    return sourceType;
  }

  return "News";
}

function fallbackScoreBreakdown(fallback: (typeof mockResults)[keyof typeof mockResults]) {
  return {
    transformation: {
      total: fallback.transformationStrength,
      newsScore: 0,
      patentScore: 0,
      hiringScore: 0,
      reportScore: 0,
      diversityBonus: 0,
      explanation:
        "Fallback scores use a demo scenario because live evidence sources were unavailable."
    },
    confidence: {
      total: Math.min(76, fallback.confidence),
      volumeScore: 0,
      diversityScore: 0,
      reliabilityScore: 0,
      reportSupport: 0,
      consistencyScore: 0,
      appliedCap:
        "Capped at 76 because only fallback demo evidence was available.",
      explanation:
        "Confidence is limited because this response is not based on live source agreement."
    },
    marketRecognition: {
      level: fallback.marketRecognition,
      newsArticleCount: 0,
      recognitionScore: 0,
      newsVisibilityScore: 0,
      formalRecognitionScore: 0,
      institutionalVisibilityScore: 0,
      sourceReliabilityVisibilityScore: 0,
      explanation:
        "No live ESG news articles were available, so market recognition is inferred from the demo fallback scenario."
    },
    recognitionGap: {
      transformationStrength: fallback.transformationStrength,
      recognitionScore: 0,
      gap: fallback.transformationStrength,
      interpretation: "Transformation signals are ahead of market recognition.",
      explanation:
        "Transformation Strength minus Recognition Score. A larger positive gap means transformation may be ahead of market recognition."
    },
    alphaWindow: {
      months: fallback.alphaWindowMonths,
      explanation:
        "The alpha window is illustrative because live evidence sources were unavailable."
    }
  };
}

function fallbackResult(
  companyId: string,
  companyName: string,
  debug?: {
    articlesFound?: number;
    queryUsed?: string;
    providerUsed?: EsgScanResult["providerUsed"];
  }
): EsgScanResult {
  const fallback =
    mockResults[companyId as keyof typeof mockResults] ?? mockResults.sembcorp;

  return {
    companyId,
    companyName,
    generatedAt: new Date().toISOString(),
    dataMode: "fallback",
    transformationStrength: fallback.transformationStrength,
    marketRecognition: fallback.marketRecognition,
    confidence: fallback.confidence,
    alphaWindowMonths: fallback.alphaWindowMonths,
    classification: fallback.classification,
    investorAction:
      investorActionForClassification(fallback.classification) ??
      fallback.investorAction,
    whyNow: fallback.whyNow,
    evidenceTimeline: fallback.evidenceTimeline.map((event, index) => ({
      date: event.date,
      sourceType: normaliseSourceType(event.sourceType),
      title: event.title,
      summary: event.impact,
      url: "",
      impact: impactFromText(event.impact),
      signalScore: Math.max(12, fallback.transformationStrength - 55 - index * 2),
      positiveKeywordCount: 1,
      negativeKeywordCount: 0,
      source: "Demo fallback",
      sourceReliability: "Medium"
    })),
    articlesFound: debug?.articlesFound ?? 0,
    patentSignalsFound: 0,
    jobSignalsFound: 0,
    reportSignalIncluded: false,
    reportSignalsFound: 0,
    verifiedReportsFound: 0,
    mismatchedReportsFound: 0,
    reportVerifications: [],
    recognitionScore: 0,
    recognitionGap: fallback.transformationStrength,
    gapInterpretation: "Transformation signals are ahead of market recognition.",
    queryUsed: debug?.queryUsed ?? "Demo fallback",
    providerUsed: debug?.providerUsed ?? "fallback",
    scoreBreakdown: fallbackScoreBreakdown(fallback),
    scoreRationale: [
      "Live evidence was unavailable, so this response uses demo fallback data.",
      "Scores are illustrative and should be replaced by live news, patent, hiring, or report signals when available.",
      "Confidence is capped because source agreement could not be verified."
    ]
  };
}

function resolveScanMode({
  newsCount,
  patentCount,
  jobCount,
  hasReportSignal,
  newsProvider
}: {
  newsCount: number;
  patentCount: number;
  jobCount: number;
  hasReportSignal: boolean;
  newsProvider: ProviderUsed;
}): Pick<EsgScanResult, "dataMode" | "providerUsed"> {
  const liveSourceCount = [
    newsCount > 0,
    patentCount > 0,
    jobCount > 0,
    hasReportSignal
  ].filter(Boolean).length;

  if (newsCount > 0 && liveSourceCount > 1) {
    return { dataMode: "live", providerUsed: "mixed_live" };
  }

  if (newsCount > 0) {
    return { dataMode: "live", providerUsed: newsProvider };
  }

  if (liveSourceCount > 1) {
    return { dataMode: "partial_live", providerUsed: "mixed_live" };
  }

  if (patentCount > 0) {
    return { dataMode: "partial_live", providerUsed: "patents_only" };
  }

  if (jobCount > 0) {
    return { dataMode: "partial_live", providerUsed: "jobs_only" };
  }

  if (hasReportSignal) {
    return { dataMode: "partial_live", providerUsed: "report_only" };
  }

  return { dataMode: "fallback", providerUsed: "fallback" };
}

function patentSignalsToEvidence(
  patentSignals: Awaited<ReturnType<typeof getPatentSignals>>
): EsgScanResult["evidenceTimeline"] {
  return patentSignals.slice(0, 3).map((signal) => ({
    date: new Intl.DateTimeFormat("en", {
      month: "short",
      year: "numeric"
    }).format(new Date(signal.publishedAt)),
    sourceType: "Patents",
    title: signal.title,
    summary: signal.snippet,
    url: signal.url,
    impact: "Neutral",
    signalScore: signal.signalScore,
    positiveKeywordCount: 1,
    negativeKeywordCount: 0,
    source: signal.source,
    sourceReliability: "Medium"
  }));
}

function withPatentSignals(
  result: EsgScanResult,
  patentSignals: Awaited<ReturnType<typeof getPatentSignals>>
): EsgScanResult {
  if (patentSignals.length === 0) {
    return {
      ...result,
      patentSignalsFound: 0
    };
  }

  return {
    ...result,
    patentSignalsFound: patentSignals.length,
    evidenceTimeline: [
      ...patentSignalsToEvidence(patentSignals),
      ...result.evidenceTimeline
    ]
  };
}

function jobSignalsToEvidence(
  jobSignals: Awaited<ReturnType<typeof getJobSignals>>
): EsgScanResult["evidenceTimeline"] {
  return jobSignals.slice(0, 3).map((signal) => ({
    date: new Intl.DateTimeFormat("en", {
      month: "short",
      year: "numeric"
    }).format(new Date(signal.publishedAt)),
    sourceType: "Jobs",
    title: signal.title,
    summary: signal.snippet,
    url: signal.url,
    impact: "Neutral",
    signalScore: signal.signalScore,
    positiveKeywordCount: 1,
    negativeKeywordCount: 0,
    source: signal.source,
    sourceReliability: "Medium"
  }));
}

function withJobSignals(
  result: EsgScanResult,
  jobSignals: Awaited<ReturnType<typeof getJobSignals>>
): EsgScanResult {
  if (jobSignals.length === 0) {
    return {
      ...result,
      jobSignalsFound: 0
    };
  }

  return {
    ...result,
    jobSignalsFound: jobSignals.length,
    evidenceTimeline: [
      ...jobSignalsToEvidence(jobSignals),
      ...result.evidenceTimeline
    ]
  };
}

function withUploadedReportSignal(
  result: EsgScanResult,
  reportFileNames: string[]
): EsgScanResult {
  if (reportFileNames.length === 0) {
    return {
      ...result,
      reportSignalIncluded: false,
      reportSignalsFound: 0
    };
  }

  const reportEvidence = reportFileNames.slice(0, 3).map((fileName, index) => {
    const remainingCount = reportFileNames.length - 2;
    const isSummary = reportFileNames.length > 3 && index === 2;

    return {
      date: "Uploaded",
      sourceType: "Reports" as const,
      title: isSummary
        ? `+${remainingCount} additional reports included in scan`
        : `Uploaded report included: ${fileName}`,
      summary: isSummary
        ? "Additional uploaded reports have been included as company disclosure signals for ESG transformation review."
        : "This report has been included as a company disclosure signal for ESG transformation review.",
      url: "",
      impact: "Neutral" as const,
      signalScore: 5,
      positiveKeywordCount: 0,
      negativeKeywordCount: 0,
      source: isSummary ? "Multiple uploaded reports" : fileName,
      sourceReliability: "High" as const
    };
  });

  return {
    ...result,
    reportSignalIncluded: true,
    reportSignalsFound: reportFileNames.length,
    evidenceTimeline: [...reportEvidence, ...result.evidenceTimeline]
  };
}

function normaliseReportFileNames(body: ScanRequest) {
  const namesFromArray = Array.isArray(body.reportFileNames)
    ? body.reportFileNames
    : [];
  const legacyName = body.reportFileName ? [body.reportFileName] : [];

  return Array.from(
    new Set(
      [...namesFromArray, ...legacyName]
        .map((fileName) => fileName.trim())
        .filter(Boolean)
    )
  );
}

export async function POST(request: Request) {
  let requestedCompanyId = "sembcorp";
  let requestedCompanyName = "Sembcorp Industries";

  try {
    const body = (await request.json()) as ScanRequest;
    const companyId = body.companyId?.trim();
    const companyName = body.companyName?.trim();
    const reportFileNames = normaliseReportFileNames(body);
    const reportVerifications = companyName
      ? verifyReportFileNames(reportFileNames, companyName)
      : [];
    const verifiedReportFileNames = reportVerifications
      .filter((report) => report.status === "verified")
      .map((report) => report.fileName);
    const needsReviewReportCount = reportVerifications.filter(
      (report) => report.status === "needs_review"
    ).length;
    const mismatchedReportCount = reportVerifications.filter(
      (report) => report.status === "mismatch"
    ).length;

    if (!companyId || !companyName) {
      return NextResponse.json(
        { error: "companyId and companyName are required" },
        { status: 400 }
      );
    }

    requestedCompanyId = companyId;
    requestedCompanyName = companyName;

    console.log("[API] Scan started", companyName);

    const [liveNews, patentSignals, jobSignals] = await Promise.all([
      withTimeout(fetchLiveEsgNews(companyName), 14000),
      getPatentSignals(companyName).catch((error) => {
        console.error("Patent signal fetch failed", error);
        return [];
      }),
      getJobSignals(companyName).catch((error) => {
        console.error("Job signal fetch failed", error);
        return [];
      })
    ]);

    const newsCount = liveNews.articles.length;
    const patentCount = patentSignals.length;
    const jobCount = jobSignals.length;
    const hasReportSignal = verifiedReportFileNames.length > 0 || needsReviewReportCount > 0;
    const { dataMode, providerUsed } = resolveScanMode({
      newsCount,
      patentCount,
      jobCount,
      hasReportSignal,
      newsProvider: liveNews.providerUsed
    });

    if (dataMode === "fallback") {
      const fallback = fallbackResult(companyId, companyName, {
        articlesFound: liveNews.articlesFound,
        queryUsed: liveNews.queryUsed,
        providerUsed
      });

      console.log("[API] Returning response", {
        dataMode: fallback.dataMode,
        evidenceCount: fallback.evidenceTimeline.length
      });

      return NextResponse.json(fallback);
    }

    if (dataMode === "partial_live") {
      const partialResult = scorePartialLiveSignals({
        companyId,
        companyName,
        patentSignalCount: patentCount,
        jobSignalCount: jobCount,
        reportSignalCount: verifiedReportFileNames.length,
        needsReviewReportCount,
        hasReportSignal
      });

      partialResult.providerUsed = providerUsed;
      partialResult.articlesFound = liveNews.articlesFound;
      partialResult.patentSignalsFound = patentCount;
      partialResult.jobSignalsFound = jobCount;
      partialResult.reportSignalIncluded = hasReportSignal;
      partialResult.reportSignalsFound = verifiedReportFileNames.length;
      partialResult.verifiedReportsFound = verifiedReportFileNames.length;
      partialResult.mismatchedReportsFound = mismatchedReportCount;
      partialResult.reportVerifications = reportVerifications;
      partialResult.queryUsed =
        patentCount > 0
          ? "Google Patents ESG innovation queries"
          : jobCount > 0
          ? "Google Jobs ESG hiring queries"
          : verifiedReportFileNames.join(", ") || "Uploaded report";

      const responseResult = withUploadedReportSignal(
        withJobSignals(withPatentSignals(partialResult, patentSignals), jobSignals),
        verifiedReportFileNames
      );

      console.log("[API] Returning response", {
        dataMode: responseResult.dataMode,
        evidenceCount: responseResult.evidenceTimeline.length
      });

      return NextResponse.json(responseResult);
    }

    const signals = extractSignalsFromArticles(liveNews.articles);
    const liveResult = scoreSignals({
      companyId,
      companyName,
      signals,
      patentSignalCount: patentCount,
      jobSignalCount: jobCount,
      reportSignalCount: verifiedReportFileNames.length,
      needsReviewReportCount,
      hasAdditionalSource: patentCount > 0 || jobCount > 0 || hasReportSignal
    });

    liveResult.articlesFound = liveNews.articlesFound;
    liveResult.patentSignalsFound = patentCount;
    liveResult.jobSignalsFound = jobCount;
    liveResult.reportSignalIncluded = hasReportSignal;
    liveResult.reportSignalsFound = verifiedReportFileNames.length;
    liveResult.verifiedReportsFound = verifiedReportFileNames.length;
    liveResult.mismatchedReportsFound = mismatchedReportCount;
    liveResult.reportVerifications = reportVerifications;
    liveResult.queryUsed = liveNews.queryUsed;
    liveResult.providerUsed = providerUsed;
    liveResult.investorAction =
      investorActionForClassification(liveResult.classification) ??
      liveResult.investorAction;
    const responseResult = withUploadedReportSignal(
      withJobSignals(withPatentSignals(liveResult, patentSignals), jobSignals),
      verifiedReportFileNames
    );

    console.log("[API] Returning response", {
      dataMode: responseResult.dataMode,
      evidenceCount: responseResult.evidenceTimeline.length
    });

    return NextResponse.json(responseResult);
  } catch (error) {
    console.error("ESG scan route failed", error);
    const fallback = fallbackResult(requestedCompanyId, requestedCompanyName);

    console.log("[API] Returning response", {
      dataMode: fallback.dataMode,
      evidenceCount: fallback.evidenceTimeline.length
    });

    return NextResponse.json(fallback, { status: 200 });
  }
}
