"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  Gauge,
  Hourglass,
  ShieldCheck,
  Target,
  TrendingUp
} from "lucide-react";
import type { Classification, EsgScanResult } from "@/types/esg";

type FinalVerdictPanelProps = {
  result: EsgScanResult;
};

type Decision = {
  label: string;
  tone: string;
  icon: typeof Target;
  nextSteps: string[];
  message: string;
};

function decisionFor(classification: Classification, companyName: string): Decision {
  switch (classification) {
    case "Early Alpha Opportunity":
      return {
        label: "Act Early",
        tone: "border-emerald-200 bg-emerald-100 text-emerald-800",
        icon: TrendingUp,
        message:
          "Strong transformation evidence is present while public recognition remains incomplete.",
        nextSteps: [
          "Prioritise deeper due diligence immediately.",
          "Compare current valuation against peers before market recognition catches up.",
          "Track whether news, hiring, patents, and reports continue aligning."
        ]
      };
    case "Emerging ESG Improver":
      return {
        label: "Monitor Closely",
        tone: "border-teal-200 bg-teal-100 text-teal-800",
        icon: Eye,
        message:
          "Signals are building, but the recognition gap needs stronger confirmation.",
        nextSteps: [
          "Add to active watchlist.",
          "Re-scan after new quarterly updates or report releases.",
          "Look for stronger recognition gap before taking action."
        ]
      };
    case "Already Recognised":
      return {
        label: "Already Priced In",
        tone: "border-amber-200 bg-amber-100 text-amber-800",
        icon: ShieldCheck,
        message: `${companyName} shows strong ESG activity, but public recognition is already high.`,
        nextSteps: [
          "Compare valuation against ESG peers before entering.",
          "Monitor whether recognition continues converting into financial performance.",
          "Use as ESG quality holding, not early-alpha discovery."
        ]
      };
    case "Innovation Watchlist":
      return {
        label: "Wait for Confirmation",
        tone: "border-violet-200 bg-violet-100 text-violet-800",
        icon: Hourglass,
        message:
          "Patent and hiring layers suggest early activity, but public confirmation is still limited.",
        nextSteps: [
          "Monitor patent and hiring signals for confirmation.",
          "Wait for stronger live news or report evidence.",
          "Compare with direct competitors to validate whether this is early transformation."
        ]
      };
    case "Evidence Watchlist":
    case "Watchlist":
      return {
        label: "Avoid for Now",
        tone: "border-rose-200 bg-rose-100 text-rose-800",
        icon: AlertTriangle,
        message: "The evidence is not yet strong enough for an investor action signal.",
        nextSteps: [
          "Do not act yet.",
          "Wait for stronger source diversity.",
          "Re-scan when new public disclosures or news appear."
        ]
      };
  }
}

export function FinalVerdictPanel({ result }: FinalVerdictPanelProps) {
  const decision = decisionFor(result.classification, result.companyName);
  const DecisionIcon = decision.icon;
  const confidenceLevel =
    result.confidence >= 80 ? "High" : result.confidence >= 60 ? "Medium" : "Low";

  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
          Final Investor Verdict
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-[#17211e]">
          Clear action signal from the ESG Alpha Gap scan.
        </h2>
      </div>

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
            Verdict status
          </p>
          <h3 className="mt-2 text-2xl font-semibold leading-tight">
            {result.classification}
          </h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-emerald-100/70">Alpha Window</p>
              <p className="mt-1 font-semibold">
                {result.alphaWindowMonths} months
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-emerald-100/70">Recognition</p>
              <p className="mt-1 font-semibold">{result.marketRecognition}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-emerald-100/70">Confidence</p>
              <p className="mt-1 font-semibold">
                {confidenceLevel} ({result.confidence}/100)
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-emerald-100/70">Strength</p>
              <p className="mt-1 font-semibold">
                {result.transformationStrength}/100
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl border border-white/65 bg-white/48 p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900/60">
                Investor decision
              </p>
              <h3 className="mt-1 text-3xl font-semibold text-[#17211e]">
                {decision.label}
              </h3>
            </div>
            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${decision.tone}`}
            >
              <DecisionIcon className="h-4 w-4" />
              {decision.label}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-[#596662]">
            {decision.message}
          </p>

          <div className="mt-5 grid gap-3">
            {decision.nextSteps.map((step) => (
              <div
                key={step}
                className="flex gap-3 rounded-xl border border-white/70 bg-white/52 p-3"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <p className="text-sm leading-6 text-[#465651]">{step}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70 text-emerald-800">
            <Gauge className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#17211e]">
              What ESG Alpha Gap solves
            </p>
            <p className="mt-2 text-sm leading-6 text-[#596662]">
              Traditional ESG tools tell investors who looks good today. ESG
              Alpha Gap focuses on timing: who is changing, whether the market
              has recognised it, and how much action window may remain.
            </p>
          </div>
          <ArrowRight className="mt-2 hidden h-5 w-5 shrink-0 text-emerald-700 sm:block" />
        </div>
      </div>
    </section>
  );
}
