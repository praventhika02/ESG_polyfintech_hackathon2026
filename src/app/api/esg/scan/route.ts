import { NextResponse } from "next/server";
import { fetchLiveEsgNews } from "@/lib/esg/providers/newsProvider";
import { getPatentSignals } from "@/lib/esg/providers/patentProvider";
import { scorePartialLiveSignals, scoreSignals } from "@/lib/esg/scoring";
import { extractSignalsFromArticles } from "@/lib/esg/signalExtraction";
import { mockResults } from "@/lib/esg/mockResults";
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
    return "ESG signals are strong, but public recognition is already high. This may be less attractive for early-alpha entry, though still relevant for ESG quality screening.";
  }

  if (classification === "Early Alpha Opportunity") {
    return "Strong ESG transformation signals are emerging while public recognition remains incomplete. This may indicate an early-entry window before broader market pricing.";
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
    reportSignalIncluded: false,
    reportSignalsFound: 0,
    queryUsed: debug?.queryUsed ?? "Demo fallback",
    providerUsed: debug?.providerUsed ?? "fallback"
  };
}

function resolveScanMode({
  newsCount,
  patentCount,
  hasReportSignal,
  newsProvider
}: {
  newsCount: number;
  patentCount: number;
  hasReportSignal: boolean;
  newsProvider: ProviderUsed;
}): Pick<EsgScanResult, "dataMode" | "providerUsed"> {
  if (newsCount > 0 && patentCount > 0) {
    return { dataMode: "live", providerUsed: "mixed_live" };
  }

  if (newsCount > 0) {
    return { dataMode: "live", providerUsed: newsProvider };
  }

  if (patentCount > 0 && hasReportSignal) {
    return { dataMode: "partial_live", providerUsed: "mixed_live" };
  }

  if (patentCount > 0) {
    return { dataMode: "partial_live", providerUsed: "patents_only" };
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

    if (!companyId || !companyName) {
      return NextResponse.json(
        { error: "companyId and companyName are required" },
        { status: 400 }
      );
    }

    requestedCompanyId = companyId;
    requestedCompanyName = companyName;

    console.log("[API] Scan started", companyName);

    const [liveNews, patentSignals] = await Promise.all([
      withTimeout(fetchLiveEsgNews(companyName), 14000),
      getPatentSignals(companyName).catch((error) => {
        console.error("Patent signal fetch failed", error);
        return [];
      })
    ]);

    const newsCount = liveNews.articles.length;
    const patentCount = patentSignals.length;
    const hasReportSignal = reportFileNames.length > 0;
    const { dataMode, providerUsed } = resolveScanMode({
      newsCount,
      patentCount,
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
        hasReportSignal
      });

      partialResult.providerUsed = providerUsed;
      partialResult.articlesFound = liveNews.articlesFound;
      partialResult.patentSignalsFound = patentCount;
      partialResult.reportSignalIncluded = hasReportSignal;
      partialResult.reportSignalsFound = reportFileNames.length;
      partialResult.queryUsed =
        patentCount > 0
          ? "Google Patents ESG innovation queries"
          : reportFileNames.join(", ") || "Uploaded report";

      const responseResult = withUploadedReportSignal(
        withPatentSignals(partialResult, patentSignals),
        reportFileNames
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
      hasAdditionalSource: patentCount > 0 || hasReportSignal
    });

    liveResult.articlesFound = liveNews.articlesFound;
    liveResult.patentSignalsFound = patentCount;
    liveResult.reportSignalIncluded = hasReportSignal;
    liveResult.reportSignalsFound = reportFileNames.length;
    liveResult.queryUsed = liveNews.queryUsed;
    liveResult.providerUsed = providerUsed;
    liveResult.investorAction =
      investorActionForClassification(liveResult.classification) ??
      liveResult.investorAction;
    const responseResult = withUploadedReportSignal(
      withPatentSignals(liveResult, patentSignals),
      reportFileNames
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
