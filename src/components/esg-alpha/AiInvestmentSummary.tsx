"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Copy, Sparkles } from "lucide-react";
import type { EsgScanResult } from "@/types/esg";

type AiInvestmentSummaryProps = {
  result: EsgScanResult;
};

export function buildInvestmentSummary(result: EsgScanResult) {
  const gap = result.recognitionGap ?? 0;

  if (result.classification === "Early Alpha Opportunity") {
    return `${result.companyName} shows strong ESG transformation evidence across live sources while market recognition remains incomplete. The recognition gap of ${gap} suggests a potential early-entry window. Investors should prioritise deeper due diligence before the market catches up.`;
  }

  if (result.classification === "Already Recognised") {
    return `${result.companyName} shows strong ESG activity, but public recognition is already high. The alpha window appears narrow because the market may have already priced in the ESG story. Investors may treat this as ESG quality exposure rather than early-alpha discovery.`;
  }

  if (result.classification === "Innovation Watchlist") {
    return `${result.companyName} shows early patent and hiring signals, but public news recognition remains limited. The current evidence is not yet strong enough for immediate action. Investors should monitor for confirmation through reports or high-reliability news.`;
  }

  if (result.classification === "Emerging ESG Improver") {
    return `${result.companyName} shows developing ESG transformation evidence across multiple signal layers. The recognition gap of ${gap} indicates the story is building, but not yet a decisive early-alpha call. Investors should monitor closely and rescan after new disclosures or high-reliability news.`;
  }

  return `${result.companyName} does not yet show enough confirmed evidence for an investor action signal. The recognition gap and source mix are not strong enough to support early-alpha conviction. Investors should wait for stronger source diversity, verified reports, or higher-reliability news.`;
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
