import { NextResponse } from "next/server";
import { demoCompanies } from "@/lib/esg/mockCompanies";
import { fetchLiveEsgNews } from "@/lib/esg/providers/newsProvider";
import { getPatentSignals } from "@/lib/esg/providers/patentProvider";
import { getJobSignals } from "@/lib/esg/providers/jobProvider";
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
  jobCount,
  newsProvider
}: {
  newsCount: number;
  patentCount: number;
  jobCount: number;
  newsProvider: ProviderUsed;
}): Pick<EsgScanResult, "dataMode" | "providerUsed"> {
  const liveSourceCount = [newsCount > 0, patentCount > 0, jobCount > 0].filter(
    Boolean
  ).length;

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

  return { dataMode: "fallback", providerUsed: "fallback" };
}

async function testCompany(company: (typeof demoCompanies)[number]) {
  const [newsResult, patentSignals, jobSignals] = await Promise.all([
    withTimeout(fetchLiveEsgNews(company.name), 2500).catch(() => ({
      articles: [],
      articlesFound: 0,
      queryUsed: "Timed out in test-all",
      providerUsed: "fallback" as ProviderUsed
    })),
    getPatentSignals(company.name).catch(() => []),
    getJobSignals(company.name).catch(() => [])
  ]);
  const newsCount = newsResult.articles.length;
  const patentCount = patentSignals.length;
  const jobCount = jobSignals.length;
  const { dataMode, providerUsed } = resolveProvider({
    newsCount,
    patentCount,
    jobCount,
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
      jobSignalCount: jobCount,
      hasAdditionalSource: patentCount > 0 || jobCount > 0
    });
    classification = result.classification;
    evidenceCount =
      result.evidenceTimeline.length +
      Math.min(3, patentCount) +
      Math.min(3, jobCount);
  } else if (dataMode === "partial_live") {
    const result = scorePartialLiveSignals({
      companyId: company.id,
      companyName: company.name,
      patentSignalCount: patentCount,
      jobSignalCount: jobCount,
      hasReportSignal: false
    });
    classification = result.classification;
    evidenceCount = Math.min(3, patentCount) + Math.min(3, jobCount);
  }

  return {
    companyName: company.name,
    dataMode,
    providerUsed,
    articlesFound: newsResult.articlesFound,
    patentSignalsFound: patentCount,
    jobSignalsFound: jobCount,
    evidenceCount,
    classification
  };
}

export async function GET() {
  const results = await Promise.all(demoCompanies.map(testCompany));

  return NextResponse.json(results);
}
