"use client";

import { motion } from "framer-motion";
import { BarChart3, BrainCircuit, Clock3, Radar } from "lucide-react";
import type { EsgScanResult } from "@/types/esg";

type ScoreExplanationPanelProps = {
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

export function ScoreExplanationPanel({ result }: ScoreExplanationPanelProps) {
  const breakdown = result.scoreBreakdown;

  if (!breakdown) {
    return null;
  }

  const cards = [
    {
      title: "Transformation Strength",
      icon: BarChart3,
      total: `${breakdown.transformation.total}/100`,
      explanation: breakdown.transformation.explanation,
      rows: [
        ["News", breakdown.transformation.newsScore, 45],
        ["Patents", breakdown.transformation.patentScore, 15],
        ["Hiring", breakdown.transformation.hiringScore, 15],
        ["Reports", breakdown.transformation.reportScore, 10],
        ["Diversity", breakdown.transformation.diversityBonus, 15]
      ] as const,
      tone: "from-emerald-500 to-teal-500"
    },
    {
      title: "Market Recognition",
      icon: Radar,
      total: breakdown.marketRecognition.level,
      explanation: breakdown.marketRecognition.explanation,
      rows: [] as const,
      tone: "from-sky-500 to-blue-500"
    },
    {
      title: "Confidence",
      icon: BrainCircuit,
      total: `${breakdown.confidence.total}/100`,
      explanation: `${breakdown.confidence.explanation} ${breakdown.confidence.appliedCap}`,
      rows: [
        ["Volume", breakdown.confidence.volumeScore, 30],
        ["Source Diversity", breakdown.confidence.diversityScore, 25],
        ["Reliability", breakdown.confidence.reliabilityScore, 25],
        ["Report Support", breakdown.confidence.reportSupport, 10],
        ["Consistency", breakdown.confidence.consistencyScore, 10]
      ] as const,
      tone: "from-blue-500 to-teal-500"
    },
    {
      title: "Alpha Window",
      icon: Clock3,
      total: `${breakdown.alphaWindow.months} months`,
      explanation: breakdown.alphaWindow.explanation,
      rows: [] as const,
      tone: "from-amber-500 to-emerald-500"
    }
  ];

  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
          Why this score?
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-[#17211e]">
          Transparent calculation logic behind the Alpha Window Insight.
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.title}
              className="rounded-xl border border-white/65 bg-white/48 p-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#143b34] text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#17211e]">
                      {card.title}
                    </h3>
                    <p className="text-sm text-[#65726e]">{card.total}</p>
                  </div>
                </div>
              </div>

              {card.rows.length > 0 ? (
                <div className="space-y-3">
                  {card.rows.map(([label, value, max]) => (
                    <BreakdownRow
                      key={label}
                      label={label}
                      value={value}
                      max={max}
                      tone={card.tone}
                    />
                  ))}
                </div>
              ) : null}

              <p className="mt-4 text-sm leading-6 text-[#596662]">
                {card.explanation}
              </p>
            </motion.div>
          );
        })}
      </div>

      {result.scoreRationale && result.scoreRationale.length > 0 ? (
        <div className="mt-4 rounded-xl border border-white/65 bg-white/42 p-4">
          <p className="text-sm font-semibold text-[#17211e]">Score rationale</p>
          <div className="mt-3 grid gap-2">
            {result.scoreRationale.map((reason) => (
              <p key={reason} className="text-sm leading-6 text-[#596662]">
                {reason}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
