"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Copy } from "lucide-react";
import type { EsgScanResult } from "@/types/esg";

type AiInvestmentSummaryProps = {
  result: EsgScanResult;
};

export function buildInvestmentSummary(result: EsgScanResult) {
  const gap = result.recognitionGap ?? 0;
  if (gap < 0) {
    return `${result.companyName} shows public ESG recognition ahead of current transformation strength, so the early-alpha window is limited.`;
  }
  if (gap >= 30) {
    return `${result.companyName} shows transformation strength meaningfully ahead of market recognition, creating a potential early-alpha setup.`;
  }
  if (gap >= 15) {
    return `${result.companyName} shows a developing ESG improvement signal, but the recognition gap still needs confirmation.`;
  }
  return `${result.companyName} shows a balanced ESG signal where transformation and recognition are moving close together.`;
}

function decisionLabel(classification: string) {
  if (classification === "Early Alpha Opportunity") return "Act Early";
  if (classification === "Emerging ESG Improver") return "Monitor Closely";
  if (classification === "Already Recognised") return "Already Priced In";
  if (classification === "Overrated ESG Story") return "Be Cautious";
  if (classification === "Innovation Watchlist") return "Wait for Confirmation";
  return "Avoid for Now";
}

function briefBullets(result: EsgScanResult) {
  const recognition = result.recognitionScore ?? 0;
  const gap = result.recognitionGap ?? 0;
  const reports = result.verifiedReportsFound ?? result.reportSignalsFound ?? 0;
  const first =
    result.transformationStrength > recognition
      ? "Transformation evidence is ahead of market recognition, creating possible timing value."
      : "Transformation evidence is not strong enough to exceed current recognition.";
  const second =
    gap < 0
      ? "Recognition score is higher than transformation strength, reducing hidden-upside potential."
      : `Recognition gap is ${gap}, leaving an estimated ${result.alphaWindowMonths}-month action window.`;
  const third =
    reports > 0
      ? "Verified disclosure evidence supports confidence, but source agreement should still be monitored."
      : "Next useful trigger: verified disclosure evidence or stronger high-reliability ESG news.";

  return [first, second, third];
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
              AI Investment Brief
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#17211e]">
              Concise investor readout from the scan.
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={copySummary}
          className="no-print inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/58 px-3 py-1.5 text-xs font-semibold text-[#143b34] transition hover:bg-white/80"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
        <p className="text-lg font-semibold leading-7 text-[#17211e]">
          {summary}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#143b34]">
            Gap: {result.recognitionGap ?? 0}
          </span>
          <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#143b34]">
            Recognition: {result.marketRecognition}
          </span>
          <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#143b34]">
            Decision: {decisionLabel(result.classification)}
          </span>
        </div>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-[#42534d]">
          {briefBullets(result).map((bullet) => (
            <li key={bullet} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
