import { NextResponse } from "next/server";
import { demoCompanies } from "@/lib/esg/mockCompanies";
import { fetchLiveEsgNews } from "@/lib/esg/providers/newsProvider";
import { getPatentSignals } from "@/lib/esg/providers/patentProvider";
import { scorePartialLiveSignals, scoreSignals } from "@/lib/esg/scoring";
import { extractSignalsFromArticles } from "@/lib/esg/signalExtraction";
import type { EsgScanResult, ProviderUsed } from "@/types/esg";

function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Test scan timed out after ${milliseconds}ms`));
    }, milliseconds);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeout));
  });
}

function resolveProvider({
  newsCount,
  patentCount,
  newsProvider
}: {
  newsCount: number;
  patentCount: number;
  newsProvider: ProviderUsed;
}): Pick<EsgScanResult, "dataMode" | "providerUsed"> {
  if (newsCount > 0 && patentCount > 0) {
    return { dataMode: "live", providerUsed: "mixed_live" };
  }

  if (newsCount > 0) {
    return { dataMode: "live", providerUsed: newsProvider };
  }

  if (patentCount > 0) {
    return { dataMode: "partial_live", providerUsed: "patents_only" };
  }

  return { dataMode: "fallback", providerUsed: "fallback" };
}

async function testCompany(company: (typeof demoCompanies)[number]) {
  const [newsResult, patentSignals] = await Promise.all([
    withTimeout(fetchLiveEsgNews(company.name), 2500).catch(() => ({
      articles: [],
      articlesFound: 0,
      queryUsed: "Timed out in test-all",
      providerUsed: "fallback" as ProviderUsed
    })),
    getPatentSignals(company.name).catch(() => [])
  ]);
  const newsCount = newsResult.articles.length;
  const patentCount = patentSignals.length;
  const { dataMode, providerUsed } = resolveProvider({
    newsCount,
    patentCount,
    newsProvider: newsResult.providerUsed
  });

  let classification: EsgScanResult["classification"] = "Watchlist";
  let evidenceCount = 0;

  if (dataMode === "live") {
    const result = scoreSignals({
      companyId: company.id,
      companyName: company.name,
      signals: extractSignalsFromArticles(newsResult.articles),
      patentSignalCount: patentCount,
      hasAdditionalSource: patentCount > 0
    });
    classification = result.classification;
    evidenceCount = result.evidenceTimeline.length + Math.min(3, patentCount);
  } else if (dataMode === "partial_live") {
    const result = scorePartialLiveSignals({
      companyId: company.id,
      companyName: company.name,
      patentSignalCount: patentCount,
      hasReportSignal: false
    });
    classification = result.classification;
    evidenceCount = Math.min(3, patentCount);
  }

  return {
    companyName: company.name,
    dataMode,
    providerUsed,
    articlesFound: newsResult.articlesFound,
    patentSignalsFound: patentCount,
    evidenceCount,
    classification
  };
}

export async function GET() {
  const results = await Promise.all(demoCompanies.map(testCompany));

  return NextResponse.json(results);
}
