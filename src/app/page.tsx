"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { CompanySelector } from "@/components/esg-alpha/CompanySelector";
import { AnnualReportUpload } from "@/components/esg-alpha/AnnualReportUpload";
import { EvidenceTimeline } from "@/components/esg-alpha/EvidenceTimeline";
import { FinalVerdictPanel } from "@/components/esg-alpha/FinalVerdictPanel";
import { HeroSection } from "@/components/esg-alpha/HeroSection";
import { ResultSummary } from "@/components/esg-alpha/ResultSummary";
import { ScanButton } from "@/components/esg-alpha/ScanButton";
import { ScanningPanel } from "@/components/esg-alpha/ScanningPanel";
import { ScoreMethodologyPanel } from "@/components/esg-alpha/ScoreMethodologyPanel";
import { SignalSourcePanel } from "@/components/esg-alpha/SignalSourcePanel";
import { demoCompanies, type CompanyId } from "@/lib/esg/mockCompanies";
import { mockResults } from "@/lib/esg/mockResults";
import type { EsgScanResult, EvidenceImpact, EvidenceSourceType } from "@/types/esg";

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

function impactFromText(text: string): EvidenceImpact {
  const lowered = text.toLowerCase();

  if (lowered.includes("risk") || lowered.includes("limited")) {
    return "Neutral";
  }

  return "Positive";
}

function demoFallbackResult(companyId: CompanyId, companyName: string): EsgScanResult {
  const fallback = mockResults[companyId];

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
    articlesFound: 0,
    patentSignalsFound: 0,
    jobSignalsFound: 0,
    reportSignalIncluded: false,
    reportSignalsFound: 0,
    queryUsed: "Client fallback",
    providerUsed: "fallback"
  };
}

export default function Home() {
  console.log("[UI] demoCompanies count:", demoCompanies.length);

  const [selectedCompanyId, setSelectedCompanyId] = useState<CompanyId>("sembcorp");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<EsgScanResult | null>(null);
  const [reportFileNames, setReportFileNames] = useState<string[]>([]);

  const selectedCompany = useMemo(
    () =>
      demoCompanies.find((company) => company.id === selectedCompanyId) ??
      demoCompanies[0],
    [selectedCompanyId]
  );

  function handleSelect(companyId: CompanyId) {
    setSelectedCompanyId(companyId);
    setScanResult(null);
  }

  async function handleRunScan() {
    if (!selectedCompany) {
      return;
    }

    console.log("[Scan UI] Starting scan", selectedCompany.name);
    setIsScanning(true);
    setScanResult(null);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      const response = await fetch("/api/esg/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          companyName: selectedCompany.name,
          reportFileNames
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.status}`);
      }

      const data = (await response.json()) as EsgScanResult;

      console.log("[Scan UI] Received scan result", data);
      setScanResult(data);
    } catch (error) {
      console.error("[Scan UI] Scan failed:", error);
      setScanResult(demoFallbackResult(selectedCompany.id, selectedCompany.name));
    } finally {
      window.clearTimeout(timeout);
      setIsScanning(false);
      console.log("[Scan UI] Scan finished");
    }
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:gap-6">
        <HeroSection />

        <CompanySelector
          companies={demoCompanies}
          selectedCompanyId={selectedCompany.id}
          onSelect={handleSelect}
        />

        <AnnualReportUpload
          fileNames={reportFileNames}
          onFileNamesChange={setReportFileNames}
        />

        <section className="glass-panel rounded-2xl p-5 sm:p-6">
          <ScanButton isScanning={isScanning} onRunScan={handleRunScan} />
        </section>

        <AnimatePresence mode="wait">
          {isScanning ? (
            <ScanningPanel key="scan" company={selectedCompany} />
          ) : scanResult ? (
            <motion.div
              key={selectedCompany.id}
              className="grid gap-5 sm:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ResultSummary company={selectedCompany} result={scanResult} />
              <SignalSourcePanel
                providerUsed={scanResult.providerUsed}
                dataMode={scanResult.dataMode}
                articlesFound={scanResult.articlesFound}
                patentSignalsFound={scanResult.patentSignalsFound}
                jobSignalsFound={scanResult.jobSignalsFound}
                reportSignalIncluded={scanResult.reportSignalIncluded}
                reportSignalsFound={scanResult.reportSignalsFound}
                queryUsed={scanResult.queryUsed}
                generatedAt={scanResult.generatedAt}
              />
              <ScoreMethodologyPanel result={scanResult} />
              <EvidenceTimeline events={scanResult.evidenceTimeline} />
              <FinalVerdictPanel result={scanResult} />
            </motion.div>
          ) : (
            <motion.section
              key="empty"
              className="glass-panel rounded-2xl p-6 text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-sm font-medium text-[#596662]">
                {selectedCompany.name} selected. Run the scan to generate the
                Alpha Window insight.
              </p>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
