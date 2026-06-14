"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AiInvestmentSummary } from "@/components/esg-alpha/AiInvestmentSummary";
import { CompanySelector } from "@/components/esg-alpha/CompanySelector";
import { CompanyComparison } from "@/components/esg-alpha/CompanyComparison";
import { AnnualReportUpload } from "@/components/esg-alpha/AnnualReportUpload";
import { EvidenceTimeline } from "@/components/esg-alpha/EvidenceTimeline";
import { ExportReportActions } from "@/components/esg-alpha/ExportReportActions";
import { FinalVerdictPanel } from "@/components/esg-alpha/FinalVerdictPanel";
import { HeroSection } from "@/components/esg-alpha/HeroSection";
import { MomentumMatrix } from "@/components/esg-alpha/MomentumMatrix";
import { ReportFindingsPanel } from "@/components/esg-alpha/ReportFindingsPanel";
import { RecognitionGapVisual } from "@/components/esg-alpha/RecognitionGapVisual";
import { ScanButton } from "@/components/esg-alpha/ScanButton";
import { ScanningPanel } from "@/components/esg-alpha/ScanningPanel";
import { ScoreMethodologyPanel } from "@/components/esg-alpha/ScoreMethodologyPanel";
import { SignalSourcePanel } from "@/components/esg-alpha/SignalSourcePanel";
import { demoCompanies, type CompanyId, type MockCompany } from "@/lib/esg/mockCompanies";
import { mockResults } from "@/lib/esg/mockResults";
import { verifyReportFileNames } from "@/lib/esg/reportVerification";
import type { EsgScanResult, EvidenceImpact, EvidenceSourceType } from "@/types/esg";

type ActiveStage = "select" | "analyse" | "results" | "decision";

type SavedAnalysis = {
  id: string;
  savedAt: string;
  result: EsgScanResult;
};

const stageLabels: { id: ActiveStage; label: string }[] = [
  { id: "select", label: "Select" },
  { id: "analyse", label: "Analyse" },
  { id: "results", label: "Results" },
  { id: "decision", label: "Decision" }
];

const savedAnalysisKey = "esg-alpha-gap-saved-analyses";

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
    reportFindings: [],
    queryUsed: "Client fallback",
    providerUsed: "fallback"
  };
}

export default function Home() {
  console.log("[UI] demoCompanies count:", demoCompanies.length);

  const [selectedCompanyId, setSelectedCompanyId] = useState<CompanyId>("sembcorp");
  const [activeStage, setActiveStage] = useState<ActiveStage>("select");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<EsgScanResult | null>(null);
  const [reportFileNames, setReportFileNames] = useState<string[]>([]);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [comparisonResults, setComparisonResults] = useState<EsgScanResult[]>([]);
  const [saveMessage, setSaveMessage] = useState("");

  const selectedCompany = useMemo(
    () =>
      demoCompanies.find((company) => company.id === selectedCompanyId) ??
      demoCompanies[0],
    [selectedCompanyId]
  );
  const reportVerifications = useMemo(
    () => verifyReportFileNames(reportFileNames, selectedCompany.name),
    [reportFileNames, selectedCompany.name]
  );

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(savedAnalysisKey);
      if (saved) {
        setSavedAnalyses(JSON.parse(saved) as SavedAnalysis[]);
      }
    } catch (error) {
      console.error("[UI] Failed to load saved analyses", error);
    }
  }, []);

  function handleSelect(companyId: CompanyId) {
    setSelectedCompanyId(companyId);
    setScanResult(null);
    setActiveStage("select");
    setSaveMessage("");
  }

  async function runCompanyScan(company: MockCompany, reports = reportFileNames) {
    console.log("[Scan UI] Starting scan", company.name);
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
          companyId: company.id,
          companyName: company.name,
          reportFileNames: reports
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.status}`);
      }

      const data = (await response.json()) as EsgScanResult;

      console.log("[Scan UI] Received scan result", data);
      return data;
    } catch (error) {
      console.error("[Scan UI] Scan failed:", error);
      return demoFallbackResult(company.id, company.name);
    } finally {
      window.clearTimeout(timeout);
      console.log("[Scan UI] Scan finished");
    }
  }

  async function handleRunScan() {
    if (!selectedCompany) {
      return;
    }

    setIsScanning(true);
    setScanResult(null);
    setActiveStage("analyse");

    try {
      const result = await runCompanyScan(selectedCompany, reportFileNames);
      setScanResult(result);
      setActiveStage("results");
    } finally {
      setIsScanning(false);
    }
  }

  function handleNewScan() {
    setScanResult(null);
    setIsScanning(false);
    setActiveStage("select");
    setSaveMessage("");
  }

  function handleSaveAnalysis() {
    if (!scanResult) return;

    const nextSaved: SavedAnalysis[] = [
      {
        id: `${scanResult.companyId}-${Date.now()}`,
        savedAt: new Date().toISOString(),
        result: scanResult
      },
      ...savedAnalyses
    ].slice(0, 8);

    setSavedAnalyses(nextSaved);
    window.localStorage.setItem(savedAnalysisKey, JSON.stringify(nextSaved));
    setSaveMessage("Analysis saved locally on this browser.");
  }

  function handleLoadSaved(saved: SavedAnalysis) {
    const company = demoCompanies.find((item) => item.id === saved.result.companyId);
    if (company) {
      setSelectedCompanyId(company.id);
    }
    setScanResult(saved.result);
    setActiveStage("results");
    setSaveMessage("");
  }

  function StageProgress() {
    const activeIndex = stageLabels.findIndex((stage) => stage.id === activeStage);

    return (
      <div className="glass-panel rounded-2xl p-3">
        <div className="grid gap-2 sm:grid-cols-4">
          {stageLabels.map((stage, index) => {
            const isActive = stage.id === activeStage;
            const isComplete = index < activeIndex;

            return (
              <button
                key={stage.id}
                type="button"
                disabled={stage.id === "analyse" || (stage.id !== "select" && !scanResult)}
                onClick={() => setActiveStage(stage.id)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-emerald-300 bg-[#143b34] text-white"
                    : isComplete
                    ? "border-emerald-100 bg-emerald-50 text-emerald-900"
                    : "border-white/65 bg-white/50 text-[#596662]"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {index + 1}. {stage.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function SavedAnalysesPanel() {
    if (savedAnalyses.length === 0) return null;

    return (
      <section className="glass-panel rounded-2xl p-5 sm:p-6">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
            Local saved analyses
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[#17211e]">
            Reopen recent scans stored in this browser.
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {savedAnalyses.map((saved) => (
            <button
              key={saved.id}
              type="button"
              onClick={() => handleLoadSaved(saved)}
              className="rounded-xl border border-white/65 bg-white/48 p-4 text-left transition hover:bg-white/72"
            >
              <p className="font-semibold text-[#17211e]">
                {saved.result.companyName}
              </p>
              <p className="mt-1 text-sm text-[#596662]">
                {saved.result.classification}
              </p>
              <p className="mt-3 text-xs font-semibold text-emerald-800">
                Gap {saved.result.recognitionGap ?? 0} · {saved.result.alphaWindowMonths} months
              </p>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:gap-6">
        <StageProgress />

        <AnimatePresence mode="wait">
          {activeStage === "select" ? (
            <motion.div
              key="select"
              className="grid gap-5 sm:gap-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <HeroSection />
              <CompanySelector
                companies={demoCompanies}
                selectedCompanyId={selectedCompany.id}
                onSelect={handleSelect}
              />
              <AnnualReportUpload
                fileNames={reportFileNames}
                reportVerifications={reportVerifications}
                onFileNamesChange={setReportFileNames}
                selectedCompanyName={selectedCompany.name}
              />
              <CompanyComparison
                companies={demoCompanies}
                onScanCompany={runCompanyScan}
                onResults={setComparisonResults}
              />
              <SavedAnalysesPanel />
              <section className="glass-panel rounded-2xl p-5 sm:p-6">
                <ScanButton isScanning={isScanning} onRunScan={handleRunScan} />
              </section>
            </motion.div>
          ) : activeStage === "analyse" ? (
            <ScanningPanel key="scan" company={selectedCompany} />
          ) : activeStage === "results" && scanResult ? (
            <motion.div
              key="results"
              className="grid gap-5 sm:gap-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <RecognitionGapVisual result={scanResult} />
              <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                <MomentumMatrix
                  result={scanResult}
                  comparisonResults={comparisonResults}
                />
                <AiInvestmentSummary result={scanResult} />
              </div>
              <ReportFindingsPanel
                findings={scanResult.reportFindings}
                verifications={scanResult.reportVerifications}
              />
              <EvidenceTimeline events={scanResult.evidenceTimeline} />
              <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                <SignalSourcePanel
                  providerUsed={scanResult.providerUsed}
                  dataMode={scanResult.dataMode}
                  articlesFound={scanResult.articlesFound}
                  patentSignalsFound={scanResult.patentSignalsFound}
                  jobSignalsFound={scanResult.jobSignalsFound}
                  reportSignalIncluded={scanResult.reportSignalIncluded}
                  reportSignalsFound={scanResult.reportSignalsFound}
                  verifiedReportsFound={scanResult.verifiedReportsFound}
                  mismatchedReportsFound={scanResult.mismatchedReportsFound}
                  queryUsed={scanResult.queryUsed}
                  generatedAt={scanResult.generatedAt}
                />
                <ScoreMethodologyPanel result={scanResult} />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={handleNewScan}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/58 px-4 py-3 text-sm font-semibold text-[#143b34] transition hover:bg-white/80"
                >
                  <RotateCcw className="h-4 w-4" />
                  New Scan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage("decision")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#143b34] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f2f29]"
                >
                  Continue to Decision
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ) : activeStage === "decision" && scanResult ? (
            <motion.div
              key="decision"
              className="grid gap-5 sm:gap-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <FinalVerdictPanel result={scanResult} />
              <div className="glass-panel rounded-2xl p-5 sm:p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
                      Decision workspace
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-[#17211e]">
                      Export, save, or return to the evidence view.
                    </h2>
                    {saveMessage ? (
                      <p className="mt-2 text-sm font-semibold text-emerald-800">
                        {saveMessage}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setActiveStage("results")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/58 px-4 py-3 text-sm font-semibold text-[#143b34] transition hover:bg-white/80"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Results
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAnalysis}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
                    >
                      <Save className="h-4 w-4" />
                      Save analysis locally
                    </button>
                    <ExportReportActions />
                    <button
                      type="button"
                      onClick={handleNewScan}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#143b34] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f2f29]"
                    >
                      <RotateCcw className="h-4 w-4" />
                      New Scan
                    </button>
                  </div>
                </div>
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
                Select a company and run the ESG Alpha Gap scan.
              </p>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
