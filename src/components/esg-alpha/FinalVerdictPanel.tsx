"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Target } from "lucide-react";
import type { EsgScanResult } from "@/types/esg";

type FinalVerdictPanelProps = {
  result: EsgScanResult;
};

function verdictCopy(result: EsgScanResult) {
  switch (result.classification) {
    case "Already Recognised":
      return `${result.companyName} shows strong ESG activity across live evidence sources, but public recognition is already high. This means the company may still be ESG-relevant, but the early-alpha window is narrowing.`;
    case "Early Alpha Opportunity":
      return "This company shows strong ESG transformation evidence while public recognition remains incomplete. This may create an early-entry window before the market fully prices in the improvement.";
    case "Emerging ESG Improver":
      return "Signals are developing across multiple sources, but the investment case should be monitored until confidence or recognition gap strengthens.";
    case "Innovation Watchlist":
      return "Patent and hiring layers show early innovation activity, but public news recognition is limited. This is a monitoring candidate rather than an immediate signal.";
    case "Evidence Watchlist":
    case "Watchlist":
      return "The evidence is not yet strong enough for an investor action signal.";
  }
}

export function FinalVerdictPanel({ result }: FinalVerdictPanelProps) {
  return (
    <section id="verdict" className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          className="rounded-xl bg-[#143b34] p-5 text-white"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
        >
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/12">
            <Target className="h-5 w-5 text-amber-200" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/80">
            Final Investor Verdict
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight">
            {result.classification}
          </h2>
          <p className="mt-4 text-sm leading-6 text-emerald-50/78">
            {verdictCopy(result)}
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-emerald-50">
            {result.alphaWindowMonths}-month alpha window
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </motion.div>

        <div className="grid gap-3">
          <div className="rounded-xl border border-white/65 bg-white/48 p-4">
            <p className="text-sm font-semibold text-[#17211e]">
              Problem solved
            </p>
            <p className="mt-2 text-sm leading-6 text-[#596662]">
              Traditional ESG scores are often static and backward-looking. ESG
              Alpha Gap focuses on timing: identifying whether ESG
              transformation signals appear before broad market recognition.
            </p>
          </div>
          <div className="rounded-xl border border-white/65 bg-white/48 p-4">
            <p className="text-sm font-semibold text-[#17211e]">
              Investor use case
            </p>
            <p className="mt-2 text-sm leading-6 text-[#596662]">
              Screen companies where transformation is happening faster than
              public recognition.
            </p>
          </div>
          <div className="flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <p className="text-sm leading-6 text-[#465651]">
              Next step: use this output to prioritise deeper due diligence,
              compare peers, and monitor whether recognition catches up to the
              transformation evidence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
