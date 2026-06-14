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
};

function BreakdownRow({ label, value, max }: Factor) {
  const width = Math.min(100, Math.round((value / max) * 100));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-[#4c5b56]">{label}</span>
        <span className="font-semibold text-[#17211e]">
          {value} / {max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#d8e1dd]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.55 }}
        />
      </div>
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
    { label: "News transformation", value: breakdown.transformation.newsScore, max: 40 },
    { label: "Patents", value: breakdown.transformation.patentScore, max: 10 },
    { label: "Hiring", value: breakdown.transformation.hiringScore, max: 10 },
    { label: "Verified reports", value: breakdown.transformation.reportScore, max: 15 },
    { label: "Source diversity", value: breakdown.transformation.diversityBonus, max: 10 }
  ];
  const recognitionFactors = [
    { label: "News visibility", value: breakdown.marketRecognition.newsVisibilityScore, max: 35 },
    { label: "Formal recognition", value: breakdown.marketRecognition.formalRecognitionScore, max: 35 },
    { label: "Institutional attention", value: breakdown.marketRecognition.institutionalVisibilityScore, max: 20 },
    { label: "Source reliability", value: breakdown.marketRecognition.sourceReliabilityVisibilityScore, max: 10 }
  ];
  const confidenceFactors = [
    { label: "Evidence volume", value: breakdown.confidence.volumeScore, max: 25 },
    { label: "Source diversity", value: breakdown.confidence.diversityScore, max: 25 },
    { label: "Reliability", value: breakdown.confidence.reliabilityScore, max: 25 },
    { label: "Verified report support", value: breakdown.confidence.reportSupport, max: 15 },
    { label: "Source agreement", value: breakdown.confidence.consistencyScore, max: 10 }
  ];

  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
            How the result was calculated
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-[#17211e]">
            High transformation + low recognition = alpha opportunity.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#596662]">
            The model separates evidence of company change from evidence that
            the market has already noticed it.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-900">
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
          <>
            <div key={step.title} className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
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
          </>
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
        <div className="rounded-xl border border-white/65 bg-white/42 p-4">
          <p className="text-sm font-semibold text-[#17211e]">Transformation</p>
          <p className="mt-1 text-2xl font-semibold">{breakdown.transformation.total}</p>
          <p className="mt-2 text-sm text-[#596662]">
            Top drivers: {topFactors(transformationFactors).map((item) => item.label).join(", ")}
          </p>
        </div>
        <div className="rounded-xl border border-white/65 bg-white/42 p-4">
          <p className="text-sm font-semibold text-[#17211e]">Recognition</p>
          <p className="mt-1 text-2xl font-semibold">{breakdown.marketRecognition.recognitionScore}</p>
          <p className="mt-2 text-sm text-[#596662]">
            Top drivers: {topFactors(recognitionFactors).map((item) => item.label).join(", ")}
          </p>
        </div>
        <div className="rounded-xl border border-white/65 bg-white/42 p-4">
          <p className="text-sm font-semibold text-[#17211e]">Confidence</p>
          <p className="mt-1 text-2xl font-semibold">{breakdown.confidence.total}</p>
          <p className="mt-2 text-sm text-[#596662]">{breakdown.confidence.appliedCap}</p>
        </div>
        <div className="rounded-xl border border-white/65 bg-white/42 p-4">
          <p className="text-sm font-semibold text-[#17211e]">Alpha Window</p>
          <p className="mt-1 text-2xl font-semibold">{breakdown.alphaWindow.months} months</p>
          <p className="mt-2 text-sm text-[#596662]">
            Based on recognition gap and confidence.
          </p>
        </div>
      </div>

      <details className="mt-4 rounded-xl border border-white/65 bg-white/42 p-4">
        <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-[#143b34]">
          View full calculation
          <ChevronDown className="h-4 w-4" />
        </summary>
        <div className="mt-4 grid gap-5 lg:grid-cols-3">
          <div className="space-y-3">
            <p className="font-semibold text-[#17211e]">Transformation</p>
            {transformationFactors.map((factor) => (
              <BreakdownRow key={factor.label} {...factor} />
            ))}
          </div>
          <div className="space-y-3">
            <p className="font-semibold text-[#17211e]">Recognition</p>
            {recognitionFactors.map((factor) => (
              <BreakdownRow key={factor.label} {...factor} />
            ))}
          </div>
          <div className="space-y-3">
            <p className="font-semibold text-[#17211e]">Confidence</p>
            {confidenceFactors.map((factor) => (
              <BreakdownRow key={factor.label} {...factor} />
            ))}
          </div>
        </div>
      </details>
    </section>
  );
}
