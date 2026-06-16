"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calculator, ChevronDown, Minus } from "lucide-react";
import type { EsgScanResult } from "@/types/esg";

type ScoreMethodologyPanelProps = {
  result: EsgScanResult;
};

type Factor = {
  label: string;
  value: number;
  max: number;
  capReason?: string;
};

function BreakdownRow({ label, value, max, capReason }: Factor) {
  const width = Math.min(100, Math.round((value / max) * 100));
  const status =
    value >= max
      ? "Reached cap"
      : value === 0
      ? "Missing"
      : width >= 70
      ? "Strong"
      : "Moderate";

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3">
      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-semibold text-muted">
          {value} / {max} · {status}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.55 }}
        />
      </div>
      {value >= max && capReason ? (
        <p className="mt-2 text-xs leading-5 text-muted">{capReason}</p>
      ) : null}
    </div>
  );
}

function topFactors(factors: Factor[]) {
  return [...factors].sort((a, b) => b.value - a.value).slice(0, 2);
}

export function ScoreMethodologyPanel({ result }: ScoreMethodologyPanelProps) {
  const breakdown = result.scoreBreakdown;

  if (!breakdown) return null;

  const transformationFactors = [
    { label: "News transformation", value: breakdown.transformation.newsScore, max: 35, capReason: "Capped at 35 because only operational ESG action news counts as transformation." },
    { label: "Patents", value: breakdown.transformation.patentScore, max: 15, capReason: "Capped at 15 because patent links are intelligence queries, not confirmed filings." },
    { label: "Hiring", value: breakdown.transformation.hiringScore, max: 15, capReason: "Capped at 15 because hiring links indicate intent, not confirmed headcount." },
    { label: "Verified reports", value: breakdown.transformation.reportScore, max: 20, capReason: "Capped at 20 because verified disclosure supports but does not decide the verdict alone." },
    { label: "Source diversity", value: breakdown.transformation.diversityBonus, max: 10, capReason: "Capped at 10 because all active evidence layers were represented." }
  ];
  const recognitionFactors = [
    { label: "News visibility", value: breakdown.marketRecognition.newsVisibilityScore, max: 30, capReason: "Capped at 30 because public ESG visibility reached the model threshold." },
    { label: "Formal recognition", value: breakdown.marketRecognition.formalRecognitionScore, max: 25, capReason: "Capped at 25 because formal ESG recognition signals were already saturated." },
    { label: "Institutional attention", value: breakdown.marketRecognition.institutionalVisibilityScore, max: 20, capReason: "Capped at 20 because market attention signals reached the model limit." },
    { label: "Source prominence", value: breakdown.marketRecognition.sourceReliabilityVisibilityScore, max: 15, capReason: "Capped at 15 because prominent source visibility reached the maximum threshold." },
    { label: "Repeated coverage", value: breakdown.marketRecognition.repeatedCoverageScore, max: 10, capReason: "Capped at 10 because repeated coverage is limited to prevent media volume dominating." }
  ];
  const confidenceFactors = [
    { label: "Evidence volume", value: breakdown.confidence.volumeScore, max: 25, capReason: "Capped at 25 to avoid overweighting raw evidence count." },
    { label: "Source diversity", value: breakdown.confidence.diversityScore, max: 25, capReason: "Capped at 25 because all active evidence layers were represented." },
    { label: "Reliability", value: breakdown.confidence.reliabilityScore, max: 25, capReason: "Capped at 25 because source reliability reached the model limit." },
    { label: "Verified report support", value: breakdown.confidence.reportSupport, max: 15, capReason: "Capped at 15 because report support cannot decide confidence alone." },
    { label: "Source agreement", value: breakdown.confidence.consistencyScore, max: 10, capReason: "Capped at 10 because signal consistency was strong." }
  ];

  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
            How the result was calculated
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-foreground">
            High transformation + low recognition = alpha opportunity.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            The model separates evidence of company change from evidence that
            the market has already noticed it.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-mint/20 bg-mint/10 px-3 py-1.5 text-sm font-semibold text-mint">
          <Calculator className="h-4 w-4" />
          Evidence-only scoring
        </span>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] xl:items-stretch">
        {[
          {
            title: "1. Transformation Strength",
            question: "What changed inside the company?",
            value: `${breakdown.transformation.total}/100`,
            inputs: "News transformation, patents, hiring, verified reports"
          },
          {
            title: "2. Recognition Score",
            question: "Has the market noticed?",
            value: `${breakdown.marketRecognition.recognitionScore}/100`,
            inputs: "News visibility, recognition signals, institutional attention"
          },
          {
            title: "3. Recognition Gap",
            question: "Is there timing value?",
            value: `${breakdown.recognitionGap.transformationStrength} - ${breakdown.recognitionGap.recognitionScore} = ${breakdown.recognitionGap.gap}`,
            inputs: "Transformation Strength minus Recognition Score"
          }
        ].map((step, index) => (
          <div key={step.title} className="contents">
            <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
              <p className="text-sm font-semibold text-mint">{step.title}</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{step.value}</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{step.question}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{step.inputs}</p>
            </div>
            {index === 0 ? (
              <div className="hidden items-center justify-center xl:flex">
                <Minus className="h-6 w-6 text-gold" />
              </div>
            ) : index === 1 ? (
              <div className="hidden items-center justify-center xl:flex">
                <span className="text-xl font-semibold text-gold">=</span>
              </div>
            ) : index === 2 ? (
              <div className="hidden items-center justify-center xl:flex">
                <ArrowRight className="h-6 w-6 text-gold" />
              </div>
            ) : null}
          </div>
        ))}
        <div className="rounded-xl border border-gold/20 bg-gold/10 p-4">
          <p className="text-sm font-semibold text-gold">4. Alpha Window</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">
            {breakdown.alphaWindow.months} mo
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            Investor timing window.
          </p>
          <p className="mt-1 text-sm leading-6 text-muted">
            Leads to {result.classification}.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
          <p className="text-sm font-semibold text-foreground">Transformation</p>
          <p className="mt-1 text-2xl font-semibold">{breakdown.transformation.total}</p>
          <p className="mt-2 text-sm text-muted">
            Top drivers: {topFactors(transformationFactors).map((item) => item.label).join(", ")}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
          <p className="text-sm font-semibold text-foreground">Recognition</p>
          <p className="mt-1 text-2xl font-semibold">{breakdown.marketRecognition.recognitionScore}</p>
          <p className="mt-2 text-sm text-muted">
            Top drivers: {topFactors(recognitionFactors).map((item) => item.label).join(", ")}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
          <p className="text-sm font-semibold text-foreground">Confidence</p>
          <p className="mt-1 text-2xl font-semibold">{breakdown.confidence.total}</p>
          <p className="mt-2 text-sm text-muted">{breakdown.confidence.appliedCap}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
          <p className="text-sm font-semibold text-foreground">Alpha Window</p>
          <p className="mt-1 text-2xl font-semibold">{breakdown.alphaWindow.months} months</p>
          <p className="mt-2 text-sm text-muted">
            Based on recognition gap and confidence.
          </p>
        </div>
      </div>

      <details className="mt-4 rounded-xl border border-white/10 bg-white/[0.045] p-4">
        <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-mint">
          View full calculation
          <ChevronDown className="h-4 w-4" />
        </summary>
        <p className="mt-3 rounded-xl border border-gold/20 bg-gold/10 px-3 py-2 text-sm leading-6 text-gold">
          Scores use stricter thresholds: high transformation starts at 70,
          high recognition starts at 65, and weak publicity-only evidence is
          penalised rather than treated as transformation.
        </p>
        <div className="mt-4 grid gap-5 lg:grid-cols-3">
          <div className="space-y-3">
            <p className="font-semibold text-foreground">Transformation</p>
            {transformationFactors.map((factor) => (
              <BreakdownRow key={factor.label} {...factor} />
            ))}
            <div className="rounded-xl border border-rose-300/20 bg-rose-400/10 p-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-foreground">Weak evidence penalty</span>
                <span className="font-semibold text-rose-200">
                  -{breakdown.transformation.weakEvidencePenalty}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted">
                Applied when public ESG mentions do not show operational
                transformation and no verified report supports the signal.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="font-semibold text-foreground">Recognition</p>
            {recognitionFactors.map((factor) => (
              <BreakdownRow key={factor.label} {...factor} />
            ))}
          </div>
          <div className="space-y-3">
            <p className="font-semibold text-foreground">Confidence</p>
            {confidenceFactors.map((factor) => (
              <BreakdownRow key={factor.label} {...factor} />
            ))}
            <p className="rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-xs leading-5 text-muted">
              {breakdown.confidence.appliedCap || "Verified disclosure evidence increases confidence."}
            </p>
          </div>
        </div>
      </details>
    </section>
  );
}
