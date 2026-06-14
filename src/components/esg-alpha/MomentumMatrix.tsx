"use client";

import { motion } from "framer-motion";
import { Crosshair } from "lucide-react";
import type { EsgScanResult } from "@/types/esg";

type MomentumMatrixProps = {
  result: EsgScanResult;
  comparisonResults?: EsgScanResult[];
};

function axisPosition(value: number) {
  return `${Math.max(4, Math.min(96, value))}%`;
}

function quadrantLabel(transformation: number, recognition: number) {
  if (transformation >= 60 && recognition < 50) return "Hidden Winners";
  if (transformation >= 60 && recognition >= 50) return "Future Leaders";
  if (transformation < 60 && recognition >= 50) return "Overrated Leaders";
  return "Value Traps";
}

export function MomentumMatrix({ result, comparisonResults = [] }: MomentumMatrixProps) {
  const points = [
    { result, primary: true },
    ...comparisonResults
      .filter((item) => item.companyId !== result.companyId)
      .map((item) => ({ result: item, primary: false }))
  ];
  const currentQuadrant = quadrantLabel(
    result.transformationStrength,
    result.recognitionScore ?? 0
  );

  return (
    <motion.section
      className="glass-panel print-keep rounded-2xl p-5 sm:p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mb-5 flex gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#143b34] text-white">
          <Crosshair className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
            ESG Momentum Matrix
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-[#17211e]">
            Transformation strength plotted against market recognition.
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#596662]">
            Current quadrant: <span className="font-semibold text-[#143b34]">{currentQuadrant}</span>
          </p>
        </div>
      </div>

      <div className="relative h-[420px] overflow-hidden rounded-xl border border-white/65 bg-white/48 p-4">
        <div className="absolute inset-4 rounded-lg bg-[linear-gradient(rgba(20,59,52,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(20,59,52,0.07)_1px,transparent_1px)] bg-[length:28px_28px]" />
        <div className="absolute left-1/2 top-4 h-[calc(100%-2rem)] w-px bg-[#9fb5ae]" />
        <div className="absolute left-4 top-1/2 h-px w-[calc(100%-2rem)] bg-[#9fb5ae]" />

        <div className="absolute left-6 top-6 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
          Hidden Winners
        </div>
        <div className="absolute right-6 top-6 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900">
          Future Leaders
        </div>
        <div className="absolute bottom-6 right-6 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
          Overrated Leaders
        </div>
        <div className="absolute bottom-6 left-6 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-900">
          Value Traps
        </div>

        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-[#596662]">
          Recognition Score
        </span>
        <span className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-semibold text-[#596662]">
          Transformation Strength
        </span>

        {points.map(({ result: point, primary }) => {
          const recognition = point.recognitionScore ?? 0;

          return (
            <motion.div
              key={`${point.companyId}-${primary ? "primary" : "comparison"}`}
              className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border shadow-lg ${
                primary
                  ? "border-emerald-200 bg-[#143b34] text-white"
                  : "border-white/80 bg-white text-[#143b34]"
              }`}
              style={{
                left: axisPosition(recognition),
                top: axisPosition(100 - point.transformationStrength)
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35 }}
              title={`${point.companyName}: Transformation ${point.transformationStrength}, Recognition ${recognition}`}
            >
              <div className="flex min-w-24 flex-col items-center px-3 py-2 text-center">
                <span className="text-xs font-semibold">{point.companyName}</span>
                <span className="text-[11px] opacity-80">
                  {point.transformationStrength}/{recognition}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
