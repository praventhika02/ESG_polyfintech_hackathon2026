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
  upgradeTrigger: string;
  downgradeTrigger: string;
};

function decisionFor(classification: Classification): Decision {
  switch (classification) {
    case "Early Alpha Opportunity":
      return {
        label: "Act Early",
        tone: "border-emerald-300/30 bg-emerald-400/12 text-emerald-200",
        icon: TrendingUp,
        upgradeTrigger: "Conviction rises if high-reliability operational evidence keeps expanding.",
        downgradeTrigger: "Formal ESG rating upgrades or heavy analyst coverage would reduce the alpha gap.",
        nextSteps: [
          "Prioritise deeper due diligence immediately.",
          "Compare current valuation against peers before market recognition catches up.",
          "Track whether news, hiring, patents, and reports continue aligning."
        ]
      };
    case "Emerging ESG Improver":
      return {
        label: "Monitor Closely",
        tone: "border-cyan-300/30 bg-cyan-300/12 text-cyan-200",
        icon: Eye,
        upgradeTrigger: "Gap widens above +30 with confidence above 72.",
        downgradeTrigger: "Recognition score rises faster than transformation, or negative ESG news increases.",
        nextSteps: [
          "Add to active watchlist.",
          "Re-scan after new quarterly updates or report releases.",
          "Look for stronger recognition gap before taking action."
        ]
      };
    case "Already Recognised":
      return {
        label: "Already Priced In",
        tone: "border-[#f6c85f]/30 bg-[#f6c85f]/12 text-gold",
        icon: ShieldCheck,
        upgradeTrigger: "New transformation signals without matching public recognition could reopen the alpha window.",
        downgradeTrigger: "Recognition remains high while fresh transformation evidence weakens.",
        nextSteps: [
          "Compare valuation against ESG peers before entering.",
          "Monitor whether recognition continues converting into financial performance.",
          "Use as ESG quality exposure, not early-alpha discovery."
        ]
      };
    case "Overrated ESG Story":
      return {
        label: "Be Cautious",
        tone: "border-amber-300/30 bg-amber-400/12 text-amber-200",
        icon: AlertTriangle,
        upgradeTrigger: "Fresh operational ESG evidence lifts transformation above 70 while recognition stops rising.",
        downgradeTrigger: "Recognition keeps rising while transformation remains below the strong threshold.",
        nextSteps: [
          "Do not treat ESG visibility as hidden alpha.",
          "Validate whether public attention is supported by real operational progress.",
          "Wait for stronger transformation evidence before entering."
        ]
      };
    case "Innovation Watchlist":
      return {
        label: "Wait for Confirmation",
        tone: "border-violet-300/30 bg-violet-400/12 text-violet-200",
        icon: Hourglass,
        upgradeTrigger: "Confirmed news, report disclosures, or high-reliability evidence could upgrade this.",
        downgradeTrigger: "Patent and hiring queries fail to convert into verified disclosure or live news.",
        nextSteps: [
          "Monitor patent and hiring queries for confirmation.",
          "Wait for stronger live news or report evidence.",
          "Compare with direct competitors before acting."
        ]
      };
    case "Evidence Watchlist":
    case "Watchlist":
      return {
        label: "Avoid for Now",
        tone: "border-rose-300/30 bg-rose-400/12 text-rose-200",
        icon: AlertTriangle,
        upgradeTrigger: "Verified report evidence or high-reliability news improves source agreement.",
        downgradeTrigger: "Recognition stays ahead of transformation or evidence quality deteriorates.",
        nextSteps: [
          "Do not act yet.",
          "Wait for stronger source diversity.",
          "Re-scan when new disclosures or news appear."
        ]
      };
  }
}

function verdictWhy(result: EsgScanResult) {
  const gap = result.recognitionGap ?? 0;
  const recognition = result.recognitionScore ?? 0;

  if (result.classification === "Early Alpha Opportunity") {
    return `${result.classification}: ${gap}-point gap and ${result.confidence}/100 confidence indicate a timing window before recognition catches up.`;
  }
  if (result.classification === "Emerging ESG Improver") {
    return `${result.classification}: positive gap of ${gap}, but conviction is not yet strong enough for an act-early call.`;
  }
  if (result.classification === "Already Recognised") {
    return `${result.classification}: recognition is ${recognition}/100, so public visibility has narrowed the early-alpha window.`;
  }
  if (result.classification === "Overrated ESG Story") {
    return `${result.classification}: recognition is ${recognition}/100 while transformation is ${result.transformationStrength}/100, so visibility is ahead of operational evidence.`;
  }
  if (result.classification === "Innovation Watchlist") {
    return `${result.classification}: early intelligence layers are active, but live public confirmation is still limited.`;
  }
  return `${result.classification}: evidence strength or agreement is not high enough for an action signal.`;
}

function shortStand(result: EsgScanResult) {
  const gap = result.recognitionGap ?? 0;

  if (result.classification === "Early Alpha Opportunity") {
    return `Act early only after due diligence - transformation is ${gap} points ahead of recognition.`;
  }
  if (result.classification === "Emerging ESG Improver") {
    return "Monitor closely - the gap is positive, but confirmation still matters.";
  }
  if (result.classification === "Already Recognised") {
    return "Be valuation-aware - public recognition has already caught up.";
  }
  if (result.classification === "Overrated ESG Story") {
    return "Be cautious - recognition is stronger than the transformation signal.";
  }
  if (result.classification === "Innovation Watchlist") {
    return "Wait for confirmation - early intelligence exists, but public evidence is limited.";
  }
  if (gap < 0) return "Do not act yet - recognition is already ahead of transformation.";
  return "Do not act yet - the evidence is not strong enough for an action signal.";
}

function evidenceRisk(result: EsgScanResult) {
  const verifiedReports = result.verifiedReportsFound ?? result.reportSignalsFound ?? 0;
  const highReliability = result.evidenceTimeline.filter(
    (item) => item.sourceReliability === "High"
  ).length;

  if (verifiedReports === 0) return "No verified report support";
  if (highReliability < 2) return "Limited high-reliability evidence";
  return "Evidence quality supported";
}

export function FinalVerdictPanel({ result }: FinalVerdictPanelProps) {
  const decision = decisionFor(result.classification);
  const DecisionIcon = decision.icon;
  const confidenceLevel =
    result.confidence >= 80 ? "High" : result.confidence >= 60 ? "Medium" : "Low";

  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-7">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
          Final Investor Verdict
        </p>
        <h2 className="mt-2 text-4xl font-semibold tracking-normal text-foreground">
          Decision: {decision.label}
        </h2>
        <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-muted">
          {shortStand(result)}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          className="rounded-2xl border border-mint/20 bg-[#061c1a] p-5 text-white shadow-[0_0_40px_rgba(0,229,168,0.12)]"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
        >
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/12">
            <Target className="h-5 w-5 text-gold" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/80">
            Decision signal
          </p>
          <h3 className="mt-2 text-4xl font-semibold leading-tight">{decision.label}</h3>
          <p className="mt-3 text-sm leading-6 text-emerald-50/72">
            {result.classification}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Metric label="Alpha Window" value={`${result.alphaWindowMonths} months`} />
            <Metric label="Recognition" value={`${result.marketRecognition} (${result.recognitionScore ?? 0}/100)`} />
            <Metric label="Confidence" value={`${confidenceLevel} (${result.confidence}/100)`} />
            <Metric label="Recognition Gap" value={`${result.recognitionGap ?? 0}`} />
          </div>
        </motion.div>

        <motion.div
          className="rounded-2xl border border-white/10 bg-white/[0.045] p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">
                Why this stand
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-foreground">
                Evidence-backed decision
              </h3>
            </div>
            <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${decision.tone}`}>
              <DecisionIcon className="h-4 w-4" />
              {decision.label}
            </span>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3">
              <p className="text-sm font-semibold text-foreground">Why this decision</p>
              <p className="mt-1 text-sm leading-6 text-muted">{verdictWhy(result)}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Driver label="Gap direction" value={(result.recognitionGap ?? 0) >= 0 ? "Positive gap" : "Recognition ahead"} />
              <Driver label="Confidence level" value={confidenceLevel} />
              <Driver label="Evidence risk" value={evidenceRisk(result)} />
            </div>
          </div>

          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-mint">
            Next actions
          </p>
          <div className="mt-3 grid gap-3">
            {decision.nextSteps.map((step) => (
              <div key={step} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.045] p-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint" />
                <p className="text-sm leading-6 text-muted">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-mint/20 bg-mint/10 p-3">
              <p className="text-sm font-semibold text-mint">Upgrade trigger</p>
              <p className="mt-1 text-sm leading-6 text-muted">{decision.upgradeTrigger}</p>
            </div>
            <div className="rounded-xl border border-rose-300/20 bg-rose-400/10 p-3">
              <p className="text-sm font-semibold text-rose-200">Downgrade trigger</p>
              <p className="mt-1 text-sm leading-6 text-muted">{decision.downgradeTrigger}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.045] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Disclaimer
        </p>
        <p className="mt-2 text-sm leading-6 text-muted">
          This supports due diligence and is not investment advice. Verdicts are
          generated from live evidence layers and verified uploaded documents.
          No company-specific scoring bias is applied.
        </p>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-3">
      <p className="text-xs text-emerald-100/70">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function Driver({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
