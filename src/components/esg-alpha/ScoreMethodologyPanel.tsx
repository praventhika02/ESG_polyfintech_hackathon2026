"use client";

import { motion } from "framer-motion";
import { BarChart3, BrainCircuit, Clock3, GitCompareArrows, Radar } from "lucide-react";
import type { EsgScanResult } from "@/types/esg";

type ScoreMethodologyPanelProps = {
  result: EsgScanResult;
};

function BreakdownRow({
  label,
  value,
  max,
  tone
}: {
  label: string;
  value: number;
  max: number;
  tone: string;
}) {
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
          className={`h-full rounded-full bg-gradient-to-r ${tone}`}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.65 }}
        />
      </div>
    </div>
  );
}

export function ScoreMethodologyPanel({ result }: ScoreMethodologyPanelProps) {
  const breakdown = result.scoreBreakdown;

  if (!breakdown) return null;

  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
          Why this result?
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-[#17211e]">
          How ESG Alpha Gap separates transformation strength from market
          recognition.
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-[#596662]">
          Early alpha exists only when transformation strength is meaningfully
          ahead of recognition. If recognition is already high, the alpha window
          narrows.
        </p>
        <p className="mt-3 inline-flex rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-900">
          Verdicts are generated from live evidence layers and verified uploaded
          documents. Company names retrieve relevant data only. No
          company-specific scoring bias is applied.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div className="rounded-xl border border-white/65 bg-white/48 p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#143b34] text-white">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-[#17211e]">Transformation Strength</h3>
              <p className="text-sm text-[#65726e]">{breakdown.transformation.total}/100</p>
            </div>
          </div>
          <p className="mb-4 text-sm leading-6 text-[#596662]">
            Measures ESG change signals from news, patent intelligence, hiring
            intelligence, and verified uploaded reports.
          </p>
          <div className="space-y-3">
            <BreakdownRow label="News" value={breakdown.transformation.newsScore} max={40} tone="from-emerald-500 to-teal-500" />
            <BreakdownRow label="Patents" value={breakdown.transformation.patentScore} max={10} tone="from-blue-500 to-cyan-500" />
            <BreakdownRow label="Hiring" value={breakdown.transformation.hiringScore} max={10} tone="from-violet-500 to-blue-500" />
            <BreakdownRow label="Verified reports" value={breakdown.transformation.reportScore} max={15} tone="from-amber-500 to-yellow-500" />
            <BreakdownRow label="Source diversity" value={breakdown.transformation.diversityBonus} max={10} tone="from-emerald-500 to-blue-500" />
          </div>
        </motion.div>

        <motion.div className="rounded-xl border border-white/65 bg-white/48 p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#143b34] text-white">
              <Radar className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-[#17211e]">Recognition Score</h3>
              <p className="text-sm text-[#65726e]">
                {breakdown.marketRecognition.recognitionScore}/100 · {breakdown.marketRecognition.level}
              </p>
            </div>
          </div>
          <p className="mb-4 text-sm leading-6 text-[#596662]">
            Measures how much the market has already noticed the ESG story
            through news visibility, formal recognition signals, institutional
            attention, and source reliability.
          </p>
          <div className="space-y-3">
            <BreakdownRow label="News visibility" value={breakdown.marketRecognition.newsVisibilityScore} max={35} tone="from-sky-500 to-blue-500" />
            <BreakdownRow label="Formal recognition" value={breakdown.marketRecognition.formalRecognitionScore} max={35} tone="from-amber-500 to-yellow-500" />
            <BreakdownRow label="Institutional visibility" value={breakdown.marketRecognition.institutionalVisibilityScore} max={20} tone="from-blue-500 to-violet-500" />
            <BreakdownRow label="Source reliability" value={breakdown.marketRecognition.sourceReliabilityVisibilityScore} max={10} tone="from-emerald-500 to-teal-500" />
          </div>
        </motion.div>

        <motion.div className="rounded-xl border border-white/65 bg-white/48 p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#143b34] text-white">
              <GitCompareArrows className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-[#17211e]">Recognition Gap</h3>
              <p className="text-sm text-[#65726e]">
                {breakdown.recognitionGap.transformationStrength} - {breakdown.recognitionGap.recognitionScore} = {breakdown.recognitionGap.gap}
              </p>
            </div>
          </div>
          <p className="text-sm leading-6 text-[#596662]">
            Transformation Strength minus Recognition Score. A larger positive
            gap means transformation may be ahead of market recognition.
          </p>
          <div className="mt-4 rounded-xl border border-white/70 bg-white/45 p-3 text-sm leading-6 text-[#465651]">
            {breakdown.recognitionGap.interpretation}
          </div>
        </motion.div>

        <motion.div className="rounded-xl border border-white/65 bg-white/48 p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#143b34] text-white">
              <BrainCircuit className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-[#17211e]">Confidence</h3>
              <p className="text-sm text-[#65726e]">{breakdown.confidence.total}/100</p>
            </div>
          </div>
          <p className="mb-4 text-sm leading-6 text-[#596662]">
            Reliability of the signal based on evidence volume, source
            diversity, reliability, verified reports, and consistency.
          </p>
          <div className="space-y-3">
            <BreakdownRow label="Volume" value={breakdown.confidence.volumeScore} max={25} tone="from-blue-500 to-teal-500" />
            <BreakdownRow label="Diversity" value={breakdown.confidence.diversityScore} max={25} tone="from-emerald-500 to-blue-500" />
            <BreakdownRow label="Reliability" value={breakdown.confidence.reliabilityScore} max={25} tone="from-sky-500 to-blue-500" />
            <BreakdownRow label="Report support" value={breakdown.confidence.reportSupport} max={15} tone="from-amber-500 to-yellow-500" />
            <BreakdownRow label="Source agreement" value={breakdown.confidence.consistencyScore} max={10} tone="from-teal-500 to-emerald-500" />
          </div>
          <p className="mt-4 text-sm leading-6 text-[#596662]">
            {breakdown.confidence.appliedCap}
          </p>
        </motion.div>

        <motion.div className="rounded-xl border border-white/65 bg-white/48 p-4 lg:col-span-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#143b34] text-white">
              <Clock3 className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-[#17211e]">Alpha Window</h3>
              <p className="text-sm text-[#65726e]">{breakdown.alphaWindow.months} months</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-[#596662]">
            Estimated timing window based on recognition gap and confidence.
            {` ${breakdown.alphaWindow.explanation}`}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
