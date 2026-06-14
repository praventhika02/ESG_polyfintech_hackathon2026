"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Copy, Sparkles } from "lucide-react";
import type { EsgScanResult } from "@/types/esg";

type AiInvestmentSummaryProps = {
  result: EsgScanResult;
};

export function buildInvestmentSummary(result: EsgScanResult) {
  const gap = result.recognitionGap ?? 0;
  const articles = result.articlesFound ?? 0;
  const patents = result.patentSignalsFound ?? 0;
  const jobs = result.jobSignalsFound ?? 0;
  const reports = result.verifiedReportsFound ?? result.reportSignalsFound ?? 0;
  const evidenceParts = [
    `${articles} live news article${articles === 1 ? "" : "s"}`,
    `${patents} patent intelligence quer${patents === 1 ? "y" : "ies"}`,
    `${jobs} hiring intelligence quer${jobs === 1 ? "y" : "ies"}`,
    `${reports} verified report signal${reports === 1 ? "" : "s"}`
  ];
  const gapMeaning =
    gap >= 30
      ? "transformation evidence is materially ahead of recognition"
      : gap >= 15
        ? "transformation evidence is ahead, but recognition is starting to catch up"
        : gap >= 0
          ? "transformation and recognition are broadly balanced"
          : "recognition appears ahead of the current transformation signal";
  const implication =
    result.classification === "Early Alpha Opportunity"
      ? "prioritise deeper due diligence before wider recognition compresses the window"
      : result.classification === "Emerging ESG Improver"
        ? "monitor the signal trend and look for stronger recognition lag"
        : result.classification === "Already Recognised"
          ? "treat this as ESG quality exposure rather than an early-alpha discovery"
          : result.classification === "Innovation Watchlist"
            ? "wait for confirmation from stronger news or verified report evidence"
            : "avoid immediate action until evidence quality and source agreement improve";

  return `Evidence exists across ${evidenceParts.join(", ")}. This produces Transformation Strength of ${result.transformationStrength}/100 versus Recognition Score of ${result.recognitionScore ?? 0}/100, with Confidence at ${result.confidence}/100. The recognition gap is ${gap}, which means ${gapMeaning}. Investor implication: ${implication}.`;
}

export function AiInvestmentSummary({ result }: AiInvestmentSummaryProps) {
  const summary = buildInvestmentSummary(result);

  async function copySummary() {
    await navigator.clipboard?.writeText(summary);
  }

  return (
    <motion.section
      className="glass-panel print-keep rounded-2xl p-5 sm:p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#143b34] text-white">
            <BrainCircuit className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
              AI Investment Summary
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#17211e]">
              Deterministic analyst-style readout.
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={copySummary}
          className="no-print inline-flex w-fit items-center gap-2 rounded-xl border border-white/70 bg-white/58 px-3 py-2 text-sm font-semibold text-[#143b34] transition hover:bg-white/80"
        >
          <Copy className="h-4 w-4" />
          Copy summary
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
        <div className="flex gap-3">
          <Sparkles className="mt-1 h-5 w-5 shrink-0 text-emerald-800" />
          <p className="text-sm leading-7 text-[#42534d]">{summary}</p>
        </div>
      </div>
    </motion.section>
  );
}
