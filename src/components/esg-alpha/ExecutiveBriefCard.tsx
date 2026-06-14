"use client";

import { Copy, Sparkles } from "lucide-react";
import type { EsgScanResult } from "@/types/esg";

type ExecutiveBriefCardProps = {
  result: EsgScanResult;
};

function decisionLabel(classification: string) {
  if (classification === "Early Alpha Opportunity") return "Act Early";
  if (classification === "Emerging ESG Improver") return "Monitor Closely";
  if (classification === "Already Recognised") return "Already Priced In";
  if (classification === "Innovation Watchlist") return "Wait";
  return "Avoid";
}

function headline(result: EsgScanResult) {
  const gap = result.recognitionGap ?? 0;

  if (gap >= 30) {
    return `${result.companyName} shows transformation ahead of recognition, creating a possible alpha window.`;
  }
  if (gap >= 15) {
    return `${result.companyName} shows a positive recognition gap, but confirmation still matters.`;
  }
  if (gap < 0) {
    return `${result.companyName} shows recognition ahead of transformation, limiting early-alpha potential.`;
  }
  return `${result.companyName} shows a balanced ESG signal with limited timing gap.`;
}

function bullets(result: EsgScanResult) {
  const recognition = result.recognitionScore ?? 0;
  const gap = result.recognitionGap ?? 0;
  const reports = result.verifiedReportsFound ?? result.reportSignalsFound ?? 0;

  return [
    result.transformationStrength > recognition
      ? "Transformation evidence is stronger than current recognition."
      : "Transformation evidence does not exceed current recognition.",
    gap > 0
      ? `Recognition gap remains positive at +${gap}, creating timing value.`
      : `Recognition gap is ${gap}, reducing hidden-upside potential.`,
    reports > 0
      ? "Verified disclosure support improves confidence."
      : "Next trigger: verified disclosure or stronger high-reliability news."
  ];
}

function trigger(result: EsgScanResult) {
  if ((result.recognitionGap ?? 0) >= 30) {
    return "Downgrade if recognition rises without new transformation evidence.";
  }

  return "Upgrade if recognition gap exceeds +30 with confidence above 72.";
}

export function ExecutiveBriefCard({ result }: ExecutiveBriefCardProps) {
  const summary = [
    headline(result),
    ...bullets(result),
    trigger(result)
  ].join(" ");

  async function copy() {
    await navigator.clipboard?.writeText(summary);
  }

  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
            Executive Brief
          </p>
          <h2 className="mt-2 max-w-2xl text-2xl font-semibold leading-tight text-foreground">
            {headline(result)}
          </h2>
        </div>
        <button
          type="button"
          onClick={copy}
          className="no-print inline-flex items-center gap-2 rounded-full border border-mint/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-mint transition hover:bg-white/10"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full border border-mint/20 bg-mint/10 px-3 py-1.5 text-xs font-semibold text-mint">
          Gap {result.recognitionGap ?? 0}
        </span>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-200">
          Window {result.alphaWindowMonths} months
        </span>
        <span className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold">
          Decision {decisionLabel(result.classification)}
        </span>
      </div>

      <ul className="mt-5 grid gap-3">
        {bullets(result).map((item) => (
          <li key={item} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.045] p-3 text-sm leading-6 text-muted">
            <Sparkles className="mt-1 h-4 w-4 shrink-0 text-mint" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-xl border border-gold/20 bg-gold/10 p-3 text-sm font-semibold text-gold">
        {trigger(result)}
      </div>
    </section>
  );
}
