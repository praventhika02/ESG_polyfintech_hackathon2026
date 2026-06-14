"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Hourglass,
  ShieldCheck,
  Target,
  TrendingUp
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Classification, EsgScanResult } from "@/types/esg";

type FinalVerdictPanelProps = {
  result: EsgScanResult;
};

type Decision = {
  label: string;
  tone: string;
  icon: LucideIcon;
  nextSteps: string[];
  changeTrigger: string;
};

function decisionFor(classification: Classification): Decision {
  switch (classification) {
    case "Early Alpha Opportunity":
      return {
        label: "Act Early",
        tone: "border-emerald-200 bg-emerald-100 text-emerald-800",
        icon: TrendingUp,
        changeTrigger:
          "Formal ESG rating upgrades or heavy analyst coverage would reduce the alpha gap.",
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
        changeTrigger:
          "More high-quality evidence or a wider recognition gap could upgrade this to Early Alpha Opportunity.",
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
        changeTrigger:
          "New transformation signals without matching public recognition could reopen the alpha window.",
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
        changeTrigger:
          "Confirmed news, report disclosures, or high-reliability evidence could upgrade this to Emerging ESG Improver.",
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
        changeTrigger:
          "More consistent evidence across news, reports, jobs, and patents could move this into watchlist status.",
        nextSteps: [
          "Do not act yet.",
          "Wait for stronger source diversity.",
          "Re-scan when new public disclosures or news appear."
        ]
      };
  }
}

function verdictWhy(result: EsgScanResult) {
  const gap = result.recognitionGap ?? 0;
  const recognition = result.recognitionScore ?? 0;

  if (result.classification === "Early Alpha Opportunity") {
    return `${result.companyName} has Transformation Strength of ${result.transformationStrength}/100, Recognition Score of ${recognition}/100, and a positive gap of ${gap}. The evidence suggests change is moving faster than market recognition.`;
  }

  if (result.classification === "Emerging ESG Improver") {
    return `${result.companyName} shows a developing transformation signal with a ${gap}-point recognition gap and ${result.confidence}/100 confidence. The signal is promising, but not yet a decisive early-alpha call.`;
  }

  if (result.classification === "Already Recognised") {
    return `${result.companyName} has Recognition Score of ${recognition}/100 against Transformation Strength of ${result.transformationStrength}/100. Public visibility has largely caught up, narrowing the alpha window.`;
  }

  if (result.classification === "Innovation Watchlist") {
    return `${result.companyName} has limited live news recognition but active intelligence layers: ${result.patentSignalsFound ?? 0} patent queries and ${result.jobSignalsFound ?? 0} hiring queries. This is a monitoring signal, not a confirmed action call.`;
  }

  return `${result.companyName} currently has Transformation Strength of ${result.transformationStrength}/100 and Confidence of ${result.confidence}/100. Evidence quality or agreement is not strong enough for an investor action signal.`;
}

function evidenceSummary(result: EsgScanResult) {
  return `${result.articlesFound ?? 0} news articles, ${result.patentSignalsFound ?? 0} patent intelligence queries, ${result.jobSignalsFound ?? 0} hiring intelligence queries, and ${result.verifiedReportsFound ?? result.reportSignalsFound ?? 0} verified report signals contributed to this verdict.`;
}

function shortStand(result: EsgScanResult) {
  const gap = result.recognitionGap ?? 0;

  if (result.classification === "Early Alpha Opportunity") {
    return `Act early only after due diligence — transformation is ${gap} points ahead of recognition.`;
  }
  if (result.classification === "Emerging ESG Improver") {
    return `Monitor closely — the gap is positive, but confirmation still matters.`;
  }
  if (result.classification === "Already Recognised") {
    return "Be valuation-aware — public recognition has already caught up.";
  }
  if (result.classification === "Innovation Watchlist") {
    return "Wait for confirmation — early intelligence exists, but public evidence is limited.";
  }
  if (gap < 0) {
    return "Do not act yet — recognition is already ahead of transformation.";
  }
  return "Do not act yet — the evidence is not strong enough for an action signal.";
}

export function FinalVerdictPanel({ result }: FinalVerdictPanelProps) {
  const decision = decisionFor(result.classification);
  const DecisionIcon = decision.icon;
  const confidenceLevel =
    result.confidence >= 80 ? "High" : result.confidence >= 60 ? "Medium" : "Low";

  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-7">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
          Final Investor Verdict
        </p>
        <h2 className="mt-1 text-4xl font-semibold tracking-normal text-[#17211e]">
          Decision: {decision.label}
        </h2>
        <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-[#4c5b56]">
          {shortStand(result)}
        </p>
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
            Decision signal
          </p>
          <h3 className="mt-2 text-4xl font-semibold leading-tight">
            {decision.label}
          </h3>
          <p className="mt-3 text-sm leading-6 text-emerald-50/72">
            {result.classification}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-emerald-100/70">Alpha Window</p>
              <p className="mt-1 font-semibold">
                {result.alphaWindowMonths} months
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-emerald-100/70">Recognition</p>
              <p className="mt-1 font-semibold">
                {result.marketRecognition} ({result.recognitionScore ?? 0}/100)
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-emerald-100/70">Confidence</p>
              <p className="mt-1 font-semibold">
                {confidenceLevel} ({result.confidence}/100)
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-emerald-100/70">Recognition Gap</p>
              <p className="mt-1 font-semibold">
                {result.recognitionGap ?? 0}
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
                Why this stand
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-[#17211e]">
                Evidence-backed decision
              </h3>
            </div>
            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${decision.tone}`}
            >
              <DecisionIcon className="h-4 w-4" />
              {decision.label}
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl border border-white/70 bg-white/52 p-3">
              <p className="text-sm font-semibold text-[#17211e]">Why</p>
              <p className="mt-1 text-sm leading-6 text-[#596662]">
                {verdictWhy(result)}
              </p>
            </div>
            <div className="rounded-xl border border-white/70 bg-white/52 p-3">
              <p className="text-sm font-semibold text-[#17211e]">
                Evidence summary
              </p>
              <p className="mt-1 text-sm leading-6 text-[#596662]">
                {evidenceSummary(result)}
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-900/60">
            Next steps
          </p>
          <div className="mt-3 grid gap-3">
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
          <div className="mt-4 rounded-xl border border-white/70 bg-white/52 p-3">
            <p className="text-sm font-semibold text-[#17211e]">
              What would change the verdict
            </p>
            <p className="mt-1 text-sm leading-6 text-[#596662]">
              {decision.changeTrigger}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="mt-5 rounded-xl border border-white/65 bg-white/45 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900/60">
          Disclaimer
        </p>
        <p className="mt-2 text-sm leading-6 text-[#596662]">
          This supports due diligence and is not investment advice. Verdicts are
          generated from live evidence layers and verified uploaded documents.
          No company-specific scoring bias is applied.
        </p>
      </div>
    </section>
  );
}
