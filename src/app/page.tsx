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

export default function Home() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<CompanyId>("sembcorp");
  const [isScanning, setIsScanning] = useState(false);
  const [hasResult, setHasResult] = useState(true);

  const selectedCompany = useMemo(
    () =>
      mockCompanies.find((company) => company.id === selectedCompanyId) ??
      mockCompanies[0],
    [selectedCompanyId]
  );

  const selectedResult = mockResults[selectedCompany.id];

  function handleSelect(companyId: CompanyId) {
    setSelectedCompanyId(companyId);
    setHasResult(false);
  }

  function handleRunScan() {
    setIsScanning(true);
    setHasResult(false);

    window.setTimeout(() => {
      setIsScanning(false);
      setHasResult(true);
    }, 2000);
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
              <ResultSummary company={selectedCompany} result={selectedResult} />
              <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <InvestorActionCard result={selectedResult} />
                <EvidenceTimeline events={selectedResult.evidenceTimeline} />
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
