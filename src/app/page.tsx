"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  BarChart3,
  BrainCircuit,
  Calculator,
  FileSearch,
  HomeIcon,
  RotateCcw,
  Save,
  Target
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AnnualReportUpload } from "@/components/esg-alpha/AnnualReportUpload";
import { CompanySelector } from "@/components/esg-alpha/CompanySelector";
import { EvidenceBrowser } from "@/components/esg-alpha/EvidenceBrowser";
import { ExecutiveBriefCard } from "@/components/esg-alpha/ExecutiveBriefCard";
import { ExportReportActions } from "@/components/esg-alpha/ExportReportActions";
import { FinalVerdictPanel } from "@/components/esg-alpha/FinalVerdictPanel";
import { HeroSection } from "@/components/esg-alpha/HeroSection";
import { MomentumMatrix } from "@/components/esg-alpha/MomentumMatrix";
import { RecognitionGapVisual } from "@/components/esg-alpha/RecognitionGapVisual";
import { ReportFindingsPanel } from "@/components/esg-alpha/ReportFindingsPanel";
import { SavedComparisonPanel } from "@/components/esg-alpha/SavedComparisonPanel";
import { ScanButton } from "@/components/esg-alpha/ScanButton";
import { ScanningPanel } from "@/components/esg-alpha/ScanningPanel";
import { ScoreMethodologyPanel } from "@/components/esg-alpha/ScoreMethodologyPanel";
import { SignalSourcePanel } from "@/components/esg-alpha/SignalSourcePanel";
import { demoCompanies, type CompanyId, type MockCompany } from "@/lib/esg/mockCompanies";
import { mockResults } from "@/lib/esg/mockResults";
import { verifyReportFileNames } from "@/lib/esg/reportVerification";
import type { EsgScanResult, EvidenceImpact, EvidenceSourceType } from "@/types/esg";

type ActiveView =
  | "scan"
  | "overview"
  | "matrix"
  | "methodology"
  | "evidence"
  | "decision"
  | "saved";

type SavedAnalysis = {
  id: string;
  savedAt: string;
  result: EsgScanResult;
};

const savedAnalysisKey = "esg-alpha-gap-saved-analyses";

const navItems: { id: ActiveView; label: string; icon: LucideIcon }[] = [
  { id: "scan", label: "Scan", icon: HomeIcon },
  { id: "overview", label: "Overview", icon: BrainCircuit },
  { id: "matrix", label: "Matrix", icon: BarChart3 },
  { id: "methodology", label: "Methodology", icon: Calculator },
  { id: "evidence", label: "Evidence", icon: FileSearch },
  { id: "decision", label: "Decision", icon: Target },
  { id: "saved", label: "Saved", icon: Archive }
];

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
  if (sourceType === "Report") return "Reports";
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
  if (lowered.includes("risk") || lowered.includes("limited")) return "Neutral";
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
  const [activeView, setActiveView] = useState<ActiveView>("scan");
  const [selectedCompanyId, setSelectedCompanyId] = useState<CompanyId>("sembcorp");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<EsgScanResult | null>(null);
  const [reportFileNames, setReportFileNames] = useState<string[]>([]);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
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
      if (saved) setSavedAnalyses(JSON.parse(saved) as SavedAnalysis[]);
    } catch (error) {
      console.error("[UI] Failed to load saved analyses", error);
    }
  }, []);

  function handleSelect(companyId: CompanyId) {
    setSelectedCompanyId(companyId);
    setScanResult(null);
    setActiveView("scan");
    setSaveMessage("");
  }

  async function runCompanyScan(company: MockCompany, reports = reportFileNames) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch("/api/esg/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: company.id,
          companyName: company.name,
          reportFileNames: reports
        }),
        signal: controller.signal
      });

      if (!response.ok) throw new Error(`Scan failed: ${response.status}`);
      return (await response.json()) as EsgScanResult;
    } catch (error) {
      console.error("[Scan UI] Scan failed:", error);
      return demoFallbackResult(company.id, company.name);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function handleRunScan() {
    setIsScanning(true);
    setScanResult(null);

    try {
      const result = await runCompanyScan(selectedCompany, reportFileNames);
      setScanResult(result);
      setActiveView("overview");
    } finally {
      setIsScanning(false);
    }
  }

  function handleNewScan() {
    setScanResult(null);
    setIsScanning(false);
    setActiveView("scan");
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
    setSaveMessage("Saved locally.");
  }

  function loadSaved(saved: SavedAnalysis) {
    const company = demoCompanies.find((item) => item.id === saved.result.companyId);
    if (company) setSelectedCompanyId(company.id);
    setScanResult(saved.result);
    setActiveView("overview");
  }

  function AppNav() {
    return (
      <aside className="glass-panel sticky top-4 z-20 rounded-2xl p-3 lg:min-h-[calc(100vh-2rem)]">
        <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
            ESG Alpha Gap
          </p>
          <p className="mt-1 text-sm text-muted">AI investment terminal</p>
        </div>
        <nav className="grid gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeView;
            const disabled = item.id !== "scan" && item.id !== "saved" && !scanResult;

            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "border-mint/35 bg-mint/15 text-mint shadow-[0_0_24px_rgba(0,229,168,0.12)]"
                    : "border-white/10 bg-white/[0.035] text-muted hover:bg-white/[0.07] hover:text-foreground"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    );
  }

  function SavedPreview() {
    if (savedAnalyses.length === 0) return null;
    return (
      <section className="glass-panel rounded-2xl p-5 sm:p-6">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
            Saved analyses
          </p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">
            Recent local scans.
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {savedAnalyses.slice(0, 4).map((saved) => (
            <button
              key={saved.id}
              type="button"
              onClick={() => loadSaved(saved)}
              className="rounded-xl border border-white/10 bg-white/[0.045] p-4 text-left transition hover:bg-white/[0.075]"
            >
              <p className="font-semibold text-foreground">{saved.result.companyName}</p>
              <p className="mt-1 text-sm text-muted">{saved.result.classification}</p>
              <p className="mt-3 text-xs font-semibold text-mint">
                Gap {saved.result.recognitionGap ?? 0} - {saved.result.alphaWindowMonths} months
              </p>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-5 lg:grid-cols-[240px_1fr]">
        <AppNav />

        <AnimatePresence mode="wait">
          {activeView === "scan" ? (
            <motion.div
              key="scan"
              className="grid gap-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
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
              <SavedPreview />
              <section className="glass-panel rounded-2xl p-5 sm:p-6">
                <ScanButton isScanning={isScanning} onRunScan={handleRunScan} />
              </section>
              {isScanning ? <ScanningPanel company={selectedCompany} /> : null}
            </motion.div>
          ) : activeView === "overview" && scanResult ? (
            <motion.div key="overview" className="grid gap-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <RecognitionGapVisual result={scanResult} />
              <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                <ExecutiveBriefCard result={scanResult} />
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
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveView("decision")}
                  className="rounded-xl bg-mint px-5 py-3 text-sm font-semibold text-[#05201c] transition hover:bg-cyan-300"
                >
                  Open Decision
                </button>
              </div>
            </motion.div>
          ) : activeView === "matrix" && scanResult ? (
            <motion.div key="matrix" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <MomentumMatrix result={scanResult} />
            </motion.div>
          ) : activeView === "methodology" && scanResult ? (
            <motion.div key="methodology" className="grid gap-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ScoreMethodologyPanel result={scanResult} />
              <ReportFindingsPanel findings={scanResult.reportFindings} verifications={scanResult.reportVerifications} />
            </motion.div>
          ) : activeView === "evidence" && scanResult ? (
            <motion.div key="evidence" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <EvidenceBrowser events={scanResult.evidenceTimeline} />
            </motion.div>
          ) : activeView === "decision" && scanResult ? (
            <motion.div key="decision" className="grid gap-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <FinalVerdictPanel result={scanResult} />
              <div className="glass-panel rounded-2xl p-5 sm:p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
                      Decision actions
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-foreground">
                      Save or export the decision report.
                    </h2>
                    {saveMessage ? <p className="mt-2 text-sm font-semibold text-mint">{saveMessage}</p> : null}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleSaveAnalysis}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-mint/20 bg-mint/10 px-4 py-3 text-sm font-semibold text-mint transition hover:bg-mint/15"
                    >
                      <Save className="h-4 w-4" />
                      Save Analysis
                    </button>
                    <ExportReportActions result={scanResult} />
                    <button
                      type="button"
                      onClick={handleNewScan}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/8 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-white/12"
                    >
                      <RotateCcw className="h-4 w-4" />
                      New Scan
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeView === "saved" ? (
            <motion.div key="saved" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <SavedComparisonPanel />
            </motion.div>
          ) : (
            <motion.section
              key="empty"
              className="glass-panel rounded-2xl p-6 text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-sm font-medium text-muted">
                Run a scan to unlock this view.
              </p>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
