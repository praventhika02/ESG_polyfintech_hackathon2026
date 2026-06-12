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
    queryUsed: debug?.queryUsed ?? "Demo fallback"
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

    console.log("[ESG Scan] Starting scan for:", companyName);

    const liveNews = await fetchLiveEsgNews(companyName);

    if (liveNews.articles.length === 0) {
      console.log("[ESG Scan] Data mode:", "fallback");
      return NextResponse.json(
        fallbackResult(companyId, companyName, {
          articlesFound: liveNews.articlesFound,
          queryUsed: liveNews.queryUsed
        })
      );
    }

    const signals = extractSignalsFromArticles(liveNews.articles);
    const liveResult = scoreSignals({
      companyId,
      companyName,
      signals
    });

    liveResult.articlesFound = liveNews.articlesFound;
    liveResult.queryUsed = liveNews.queryUsed;

    console.log("[ESG Scan] Data mode:", liveResult.dataMode);

    return NextResponse.json(liveResult);
  } catch (error) {
    console.error("ESG scan route failed", error);
    console.log("[ESG Scan] Data mode:", "fallback");

    return NextResponse.json(
      fallbackResult(requestedCompanyId, requestedCompanyName),
      { status: 200 }
    );
  }
}
