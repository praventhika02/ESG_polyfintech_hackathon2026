"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { CompanySelector } from "@/components/esg-alpha/CompanySelector";
import { EvidenceTimeline } from "@/components/esg-alpha/EvidenceTimeline";
import { HeroSection } from "@/components/esg-alpha/HeroSection";
import { InvestorActionCard } from "@/components/esg-alpha/InvestorActionCard";
import { ResultSummary } from "@/components/esg-alpha/ResultSummary";
import { ScanButton } from "@/components/esg-alpha/ScanButton";
import { ScanningPanel } from "@/components/esg-alpha/ScanningPanel";
import { mockCompanies, type CompanyId } from "@/lib/esg/mockCompanies";
import { mockResults } from "@/lib/esg/mockResults";
import type { EsgScanResult, EvidenceImpact, EvidenceSourceType } from "@/types/esg";

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
    }))
  };
}

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

export default function Home() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<CompanyId>("sembcorp");
  const [isScanning, setIsScanning] = useState(false);
  const [hasResult, setHasResult] = useState(true);
  const [scanResult, setScanResult] = useState<EsgScanResult>(() =>
    demoFallbackResult("sembcorp", "Sembcorp Industries")
  );

  const selectedCompany = useMemo(
    () =>
      mockCompanies.find((company) => company.id === selectedCompanyId) ??
      mockCompanies[0],
    [selectedCompanyId]
  );

  function handleSelect(companyId: CompanyId) {
    setSelectedCompanyId(companyId);
    setHasResult(false);
  }

  async function handleRunScan() {
    setIsScanning(true);
    setHasResult(false);

    try {
      const [response] = await Promise.all([
        fetch("/api/esg/scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            companyId: selectedCompany.id,
            companyName: selectedCompany.name
          })
        }),
        wait(1800)
      ]);

      if (!response.ok) {
        throw new Error(`Scan request failed with ${response.status}`);
      }

      const result = (await response.json()) as EsgScanResult;
      setScanResult(result);
    } catch (error) {
      console.error("Client ESG scan failed", error);
      setScanResult(demoFallbackResult(selectedCompany.id, selectedCompany.name));
    } finally {
      setIsScanning(false);
      setHasResult(true);
    }
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:gap-6">
        <HeroSection />

        <CompanySelector
          companies={mockCompanies}
          selectedCompanyId={selectedCompany.id}
          onSelect={handleSelect}
        />

        <section className="glass-panel rounded-2xl p-5 sm:p-6">
          <ScanButton isScanning={isScanning} onRunScan={handleRunScan} />
        </section>

        <AnimatePresence mode="wait">
          {isScanning ? (
            <ScanningPanel key="scan" company={selectedCompany} />
          ) : hasResult ? (
            <motion.div
              key={selectedCompany.id}
              className="grid gap-5 sm:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ResultSummary company={selectedCompany} result={scanResult} />
              <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <InvestorActionCard result={scanResult} />
                <EvidenceTimeline events={scanResult.evidenceTimeline} />
              </div>
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
