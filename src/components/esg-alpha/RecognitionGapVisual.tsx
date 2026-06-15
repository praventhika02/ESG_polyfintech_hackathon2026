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

function markerPosition(gap: number) {
  const clamped = Math.max(-50, Math.min(50, gap));
  return ((clamped + 50) / 100) * 100;
}

function gapMessage(gap: number) {
  if (gap > 8) return "Transformation is ahead of recognition.";
  if (gap < -8) return "Recognition is ahead of transformation.";
  return "Transformation and recognition are broadly aligned.";
}

export function RecognitionGapVisual({ result }: RecognitionGapVisualProps) {
  const recognitionScore = result.recognitionScore ?? 0;
  const gap = result.recognitionGap ?? result.transformationStrength - recognitionScore;
  const shortWindow = result.alphaWindowMonths <= 3;

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
            {gapMessage(gap)}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Transformation", result.transformationStrength],
              ["Recognition", recognitionScore],
              ["Confidence", result.confidence]
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.045] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto min-h-96 w-full max-w-xl">
          <div className="absolute inset-0 rounded-full bg-mint/10 blur-3xl" />
          <svg viewBox="0 0 420 300" className="relative h-80 w-full">
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
          <div className="relative -mt-2 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
            <div className="mb-2 flex justify-between text-[11px] font-semibold text-muted">
              <span>-50</span>
              <span>-25</span>
              <span>0</span>
              <span>+25</span>
              <span>+50</span>
            </div>
            <div className="relative h-3 rounded-full bg-gradient-to-r from-rose-400 via-white/20 to-mint">
              <motion.span
                className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#061c1a] bg-gold shadow-[0_0_18px_rgba(246,200,95,0.55)]"
                initial={{ left: "50%" }}
                animate={{ left: `${markerPosition(gap)}%` }}
                transition={{ duration: 0.55 }}
              />
            </div>
            <div className="mt-3 flex justify-between gap-2 text-[11px] font-semibold text-muted">
              <span>Recognition ahead</span>
              <span>Balanced</span>
              <span>Transformation ahead</span>
            </div>
            {shortWindow ? (
              <p className="mt-3 rounded-xl border border-gold/20 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold">
                Short window because recognition is already high or the gap is negative.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
