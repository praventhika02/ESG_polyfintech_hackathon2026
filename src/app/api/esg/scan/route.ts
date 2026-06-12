import { NextResponse } from "next/server";
import { fetchLiveEsgNews } from "@/lib/esg/providers/newsProvider";
import { getPatentSignals } from "@/lib/esg/providers/patentProvider";
import { scoreSignals } from "@/lib/esg/scoring";
import { extractSignalsFromArticles } from "@/lib/esg/signalExtraction";
import { mockResults } from "@/lib/esg/mockResults";
import type { EsgScanResult, EvidenceImpact, EvidenceSourceType } from "@/types/esg";

type ScanRequest = {
  companyId?: string;
  companyName?: string;
  reportFileName?: string;
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
    queryUsed: debug?.queryUsed ?? "Demo fallback",
    providerUsed: debug?.providerUsed ?? "fallback"
  };
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
  reportFileName?: string
): EsgScanResult {
  if (!reportFileName) {
    return result;
  }

  return {
    ...result,
    evidenceTimeline: [
      {
        date: "Uploaded",
        sourceType: "Reports",
        title: "Uploaded report included in scan",
        summary:
          "The uploaded report will be parsed for ESG commitments in the next module.",
        url: "",
        impact: "Neutral",
        signalScore: 5,
        positiveKeywordCount: 0,
        negativeKeywordCount: 0,
        source: reportFileName,
        sourceReliability: "High"
      },
      ...result.evidenceTimeline
    ]
  };
}

export async function POST(request: Request) {
  let requestedCompanyId = "sembcorp";
  let requestedCompanyName = "Sembcorp Industries";

  try {
    const body = (await request.json()) as ScanRequest;
    const companyId = body.companyId?.trim();
    const companyName = body.companyName?.trim();
    const reportFileName = body.reportFileName?.trim();

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

    if (liveNews.articles.length === 0) {
      const fallback = withPatentSignals(
        fallbackResult(companyId, companyName, {
          articlesFound: liveNews.articlesFound,
          queryUsed: liveNews.queryUsed,
          providerUsed: "fallback"
        }),
        patentSignals
      );

      console.log("[API] Returning response", {
        dataMode: fallback.dataMode,
        evidenceCount: fallback.evidenceTimeline.length
      });

      return NextResponse.json(withUploadedReportSignal(fallback, reportFileName));
    }

    const signals = extractSignalsFromArticles(liveNews.articles);
    const liveResult = scoreSignals({
      companyId,
      companyName,
      signals,
      patentSignalCount: patentSignals.length
    });

    liveResult.articlesFound = liveNews.articlesFound;
    liveResult.patentSignalsFound = patentSignals.length;
    liveResult.queryUsed = liveNews.queryUsed;
    liveResult.providerUsed = liveNews.providerUsed;
    liveResult.investorAction =
      investorActionForClassification(liveResult.classification) ??
      liveResult.investorAction;
    const responseResult = withUploadedReportSignal(
      withPatentSignals(liveResult, patentSignals),
      reportFileName
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
