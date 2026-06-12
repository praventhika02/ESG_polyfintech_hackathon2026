"use client";

import { motion } from "framer-motion";
import { BarChart3, BrainCircuit, Clock3, Radar } from "lucide-react";
import type { EsgScanResult, MarketRecognition } from "@/types/esg";

type ScoreMethodologyPanelProps = {
  result: EsgScanResult;
};

type BreakdownRowProps = {
  label: string;
  value: number;
  max: number;
  tone: string;
};

function BreakdownRow({ label, value, max, tone }: BreakdownRowProps) {
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

function alphaWindowCopy(level: MarketRecognition) {
  if (level === "High") {
    return "1-3 months because public recognition is already high.";
  }

  if (level === "Medium") {
    return "4-7 months because public attention is building.";
  }

  return "8-12 months because early signals exist but market visibility remains limited.";
}

export function ScoreMethodologyPanel({ result }: ScoreMethodologyPanelProps) {
  const breakdown = result.scoreBreakdown;

  if (!breakdown) {
    return null;
  }

  return (
    <section id="methodology" className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
          Why this result?
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-[#17211e]">
          How ESG Alpha Gap converted live signals into an investor action
          window.
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div
          className="rounded-xl border border-white/65 bg-white/48 p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#143b34] text-white">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-[#17211e]">
                Transformation Strength
              </h3>
              <p className="text-sm text-[#65726e]">
                {breakdown.transformation.total}/100
              </p>
            </div>
          </div>
          <p className="mb-4 text-sm leading-6 text-[#596662]">
            This measures how strongly the company is showing ESG
            transformation signals across news, patents, hiring, and uploaded
            reports.
          </p>
          <div className="space-y-3">
            <BreakdownRow
              label="News"
              value={breakdown.transformation.newsScore}
              max={45}
              tone="from-emerald-500 to-teal-500"
            />
            <BreakdownRow
              label="Patents"
              value={breakdown.transformation.patentScore}
              max={15}
              tone="from-blue-500 to-cyan-500"
            />
            <BreakdownRow
              label="Hiring"
              value={breakdown.transformation.hiringScore}
              max={15}
              tone="from-violet-500 to-blue-500"
            />
            <BreakdownRow
              label="Reports"
              value={breakdown.transformation.reportScore}
              max={10}
              tone="from-amber-500 to-yellow-500"
            />
            <BreakdownRow
              label="Source diversity"
              value={breakdown.transformation.diversityBonus}
              max={15}
              tone="from-emerald-500 to-blue-500"
            />
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl border border-white/65 bg-white/48 p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#143b34] text-white">
              <Radar className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-[#17211e]">
                Market Recognition
              </h3>
              <p className="text-sm text-[#65726e]">
                Level: {breakdown.marketRecognition.level}
              </p>
            </div>
          </div>
          <p className="text-sm leading-6 text-[#596662]">
            Market Recognition estimates how visible the ESG story already is
            in public coverage. High recognition means the opportunity may
            already be priced in.
          </p>
          <div className="mt-4 rounded-xl border border-white/70 bg-white/45 p-3 text-sm leading-6 text-[#465651]">
            {breakdown.marketRecognition.newsArticleCount} live ESG news
            articles were detected, so public recognition is considered{" "}
            {breakdown.marketRecognition.level}.{" "}
            {breakdown.marketRecognition.level === "High"
              ? "This reduces the remaining alpha window."
              : "This leaves more room for recognition lag."}
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl border border-white/65 bg-white/48 p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12 }}
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#143b34] text-white">
              <BrainCircuit className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-[#17211e]">Confidence</h3>
              <p className="text-sm text-[#65726e]">
                {breakdown.confidence.total}/100
              </p>
            </div>
          </div>
          <p className="mb-4 text-sm leading-6 text-[#596662]">
            Confidence measures how reliable the signal is based on evidence
            volume, source diversity, source reliability, report support, and
            signal consistency.
          </p>
          <div className="space-y-3">
            <BreakdownRow
              label="Volume"
              value={breakdown.confidence.volumeScore}
              max={30}
              tone="from-blue-500 to-teal-500"
            />
            <BreakdownRow
              label="Diversity"
              value={breakdown.confidence.diversityScore}
              max={25}
              tone="from-emerald-500 to-blue-500"
            />
            <BreakdownRow
              label="Reliability"
              value={breakdown.confidence.reliabilityScore}
              max={25}
              tone="from-sky-500 to-blue-500"
            />
            <BreakdownRow
              label="Report support"
              value={breakdown.confidence.reportSupport}
              max={10}
              tone="from-amber-500 to-yellow-500"
            />
            <BreakdownRow
              label="Consistency"
              value={breakdown.confidence.consistencyScore}
              max={10}
              tone="from-teal-500 to-emerald-500"
            />
          </div>
          <p className="mt-4 text-sm leading-6 text-[#596662]">
            {breakdown.confidence.appliedCap}
          </p>
        </motion.div>

        <motion.div
          className="rounded-xl border border-white/65 bg-white/48 p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18 }}
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#143b34] text-white">
              <Clock3 className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-[#17211e]">Alpha Window</h3>
              <p className="text-sm text-[#65726e]">
                {breakdown.alphaWindow.months} months
              </p>
            </div>
          </div>
          <p className="text-sm leading-6 text-[#596662]">
            Alpha Window estimates how much time may remain before ESG
            transformation becomes widely recognised. A shorter window means the
            market may already be catching up.
          </p>
          <div className="mt-4 rounded-xl border border-white/70 bg-white/45 p-3 text-sm leading-6 text-[#465651]">
            {alphaWindowCopy(breakdown.marketRecognition.level)}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
