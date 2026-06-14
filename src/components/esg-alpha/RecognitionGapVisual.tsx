"use client";

import { motion } from "framer-motion";
import { GitCompareArrows, TimerReset } from "lucide-react";
import type { EsgScanResult } from "@/types/esg";

type RecognitionGapVisualProps = {
  result: EsgScanResult;
};

function barWidth(value: number) {
  return `${Math.max(4, Math.min(100, value))}%`;
}

export function RecognitionGapVisual({ result }: RecognitionGapVisualProps) {
  const recognitionScore = result.recognitionScore ?? 0;
  const gap = result.recognitionGap ?? result.transformationStrength - recognitionScore;

  return (
    <motion.section
      className="glass-panel overflow-hidden rounded-2xl p-5 sm:p-6"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
        <div className="rounded-xl border border-white/65 bg-white/48 p-5">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#143b34] text-white">
              <GitCompareArrows className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
                Recognition Gap Hero
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-[#17211e]">
                Transformation strength versus market recognition.
              </h2>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm font-semibold text-[#42534d]">
                <span>Transformation Strength</span>
                <span>{result.transformationStrength}/100</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-[#d4ded9]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  initial={{ width: 0 }}
                  animate={{ width: barWidth(result.transformationStrength) }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm font-semibold text-[#42534d]">
                <span>Recognition Score</span>
                <span>{recognitionScore}/100</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-[#d4ded9]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: barWidth(recognitionScore) }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[#10231f] p-5 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
            <TimerReset className="h-5 w-5 text-amber-200" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/70">
            Alpha timing signal
          </p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-6xl font-semibold">{gap}</span>
            <span className="pb-2 text-sm text-emerald-50/70">
              recognition gap points
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-emerald-50/72">
            {result.gapInterpretation ??
              "The gap compares evidence of ESG transformation with how much the market appears to have recognised it."}
          </p>
          <div className="mt-5 rounded-xl bg-white/10 p-3">
            <p className="text-xs text-emerald-100/70">Estimated action window</p>
            <p className="mt-1 text-2xl font-semibold">
              {result.alphaWindowMonths} months
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
