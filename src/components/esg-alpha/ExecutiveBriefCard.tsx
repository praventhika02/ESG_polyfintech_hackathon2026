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

  if (gap > 20) {
    return "Transformation is ahead of market recognition.";
  }
  if (gap >= 0) {
    return "Transformation is developing, but the gap is still narrow.";
  }
  return "Recognition is running ahead of transformation.";
}

function bullets(result: EsgScanResult) {
  const gap = result.recognitionGap ?? 0;
  const reports = result.verifiedReportsFound ?? result.reportSignalsFound ?? 0;
  const highReliability = result.evidenceTimeline.filter(
    (item) => item.sourceReliability === "High"
  ).length;

  return [
    gap > 20
      ? "Market timing: the scan found timing value before recognition fully catches up."
      : gap >= 0
      ? "Market timing: the signal is improving, but the recognition gap is still modest."
      : "Market timing: public visibility is moving faster than fresh transformation evidence.",
    reports > 0 || highReliability > 0
      ? "Evidence quality: verified disclosure or high-reliability sources support the readout."
      : "Evidence quality: confidence is limited without verified disclosure support.",
    gap > 20
      ? "Next trigger: watch for analyst coverage or ESG rankings that could close the gap."
      : "Next trigger: look for verified reports or high-reliability operational ESG news."
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
    `${result.companyName}:`,
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
