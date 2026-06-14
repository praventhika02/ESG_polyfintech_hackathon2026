"use client";

import { motion } from "framer-motion";
import { Gauge, TimerReset } from "lucide-react";
import type { EsgScanResult } from "@/types/esg";

type RecognitionGapVisualProps = {
  result: EsgScanResult;
};

function arcDash(value: number) {
  const max = 188;
  return `${Math.max(8, Math.min(max, (value / 100) * max))} ${max}`;
}

export function RecognitionGapVisual({ result }: RecognitionGapVisualProps) {
  const recognitionScore = result.recognitionScore ?? 0;
  const gap = result.recognitionGap ?? result.transformationStrength - recognitionScore;
  const direction =
    gap >= 0 ? "Transformation ahead of recognition" : "Recognition ahead of transformation";

  return (
    <motion.section
      className="glass-panel overflow-hidden rounded-2xl p-5 sm:p-7"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
            Recognition Gap
          </p>
          <h1 className="mt-2 max-w-2xl text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Is transformation moving before the market notices?
          </h1>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-mint/20 bg-mint/10 px-3 py-1.5 text-sm font-semibold text-mint">
            <Gauge className="h-4 w-4" />
            {direction}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-muted">
              Transformation {result.transformationStrength}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-muted">
              Recognition {recognitionScore}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-muted">
              Confidence {result.confidence}
            </span>
          </div>
        </div>

        <div className="relative mx-auto h-80 w-full max-w-xl">
          <div className="absolute inset-0 rounded-full bg-mint/10 blur-3xl" />
          <svg viewBox="0 0 420 300" className="relative h-full w-full">
            <path
              d="M95 220 A120 120 0 0 1 210 80"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <motion.path
              d="M95 220 A120 120 0 0 1 210 80"
              fill="none"
              stroke="#00E5A8"
              strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray={arcDash(result.transformationStrength)}
              initial={{ strokeDashoffset: 188 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.9 }}
            />
            <path
              d="M325 220 A120 120 0 0 0 210 80"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <motion.path
              d="M325 220 A120 120 0 0 0 210 80"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray={arcDash(recognitionScore)}
              initial={{ strokeDashoffset: 188 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
            />
          </svg>
          <div className="absolute inset-x-0 top-[34%] text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Recognition Gap
            </p>
            <p className="mt-1 text-7xl font-semibold text-foreground">{gap}</p>
            <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-sm font-semibold text-gold">
              <TimerReset className="h-4 w-4" />
              {result.alphaWindowMonths} month window
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
