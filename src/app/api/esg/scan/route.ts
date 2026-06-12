import { NextResponse } from "next/server";
import { fetchLiveEsgNews } from "@/lib/esg/providers/newsProvider";
import { scoreSignals } from "@/lib/esg/scoring";
import { extractSignalsFromArticles } from "@/lib/esg/signalExtraction";
import { mockResults } from "@/lib/esg/mockResults";
import type { EsgScanResult, EvidenceImpact, EvidenceSourceType } from "@/types/esg";

type ScanRequest = {
  companyId?: string;
  companyName?: string;
};

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
    investorAction: fallback.investorAction,
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
      source: "Demo fallback"
    })),
    articlesFound: debug?.articlesFound ?? 0,
    queryUsed: debug?.queryUsed ?? "Demo fallback",
    providerUsed: debug?.providerUsed ?? "fallback"
  };
}

export async function POST(request: Request) {
  let requestedCompanyId = "sembcorp";
  let requestedCompanyName = "Sembcorp Industries";

  try {
    const body = (await request.json()) as ScanRequest;
    const companyId = body.companyId?.trim();
    const companyName = body.companyName?.trim();

    if (!companyId || !companyName) {
      return NextResponse.json(
        { error: "companyId and companyName are required" },
        { status: 400 }
      );
    }

    requestedCompanyId = companyId;
    requestedCompanyName = companyName;

    console.log("[API] Scan started", companyName);

    const liveNews = await withTimeout(fetchLiveEsgNews(companyName), 14000);

    if (liveNews.articles.length === 0) {
      const fallback = fallbackResult(companyId, companyName, {
        articlesFound: liveNews.articlesFound,
        queryUsed: liveNews.queryUsed,
        providerUsed: "fallback"
      });

      console.log("[API] Returning response", {
        dataMode: fallback.dataMode,
        evidenceCount: fallback.evidenceTimeline.length
      });

      return NextResponse.json(fallback);
    }

    const signals = extractSignalsFromArticles(liveNews.articles);
    const liveResult = scoreSignals({
      companyId,
      companyName,
      signals
    });

    liveResult.articlesFound = liveNews.articlesFound;
    liveResult.queryUsed = liveNews.queryUsed;
    liveResult.providerUsed = liveNews.providerUsed;

    console.log("[API] Returning response", {
      dataMode: liveResult.dataMode,
      evidenceCount: liveResult.evidenceTimeline.length
    });

    return NextResponse.json(liveResult);
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
