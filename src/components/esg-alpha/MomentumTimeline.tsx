"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import type { ExtractedSignal } from "@/types/esg";

type MomentumTimelineProps = {
  events: ExtractedSignal[];
};

type MomentumPoint = {
  month: string;
  value: number;
};

function parseMonth(dateValue: string) {
  if (dateValue === "Uploaded") return null;
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric"
  }).format(parsed);
}

function momentumPoints(events: ExtractedSignal[]): MomentumPoint[] {
  const monthlyScores = new Map<string, number>();

  events.forEach((event) => {
    const month = parseMonth(event.date);
    if (!month) return;

    monthlyScores.set(month, (monthlyScores.get(month) ?? 0) + Math.max(0, event.signalScore));
  });

  const points = Array.from(monthlyScores.entries())
    .map(([month, score]) => ({
      month,
      time: new Date(month).getTime(),
      score
    }))
    .filter((point) => !Number.isNaN(point.time))
    .sort((a, b) => a.time - b.time);

  let cumulative = 0;
  const cumulativePoints = points.map((point) => {
    cumulative += point.score;
    return {
      month: point.month,
      raw: cumulative
    };
  });
  const max = Math.max(...cumulativePoints.map((point) => point.raw), 1);

  return cumulativePoints.map((point) => ({
    month: point.month,
    value: Math.round((point.raw / max) * 100)
  }));
}

export function MomentumTimeline({ events }: MomentumTimelineProps) {
  const points = momentumPoints(events);
  const width = 640;
  const height = 220;
  const padding = 28;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const coordinates = points.map((point, index) => {
    const x =
      points.length === 1
        ? padding + chartWidth / 2
        : padding + (index / (points.length - 1)) * chartWidth;
    const y = padding + (1 - point.value / 100) * chartHeight;
    return { ...point, x, y };
  });
  const path = coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <motion.section
      className="glass-panel print-keep rounded-2xl p-5 sm:p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mb-5 flex gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#143b34] text-white">
          <Activity className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
            ESG Momentum Timeline
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-[#17211e]">
            Cumulative transformation signal strength based on dated evidence.
          </h2>
        </div>
      </div>

      {points.length < 2 ? (
        <div className="rounded-xl border border-white/65 bg-white/48 p-5 text-sm leading-6 text-[#596662]">
          More dated evidence is needed to build a momentum trend.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/65 bg-white/48 p-4">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full">
            <line x1={padding} x2={padding} y1={padding} y2={height - padding} stroke="#c9d7d2" />
            <line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} stroke="#c9d7d2" />
            <path d={path} fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round" />
            {coordinates.map((point) => (
              <g key={point.month}>
                <circle cx={point.x} cy={point.y} r="5" fill="#143b34" />
                <text x={point.x} y={height - 8} textAnchor="middle" fontSize="12" fill="#596662">
                  {point.month}
                </text>
                <text x={point.x} y={point.y - 12} textAnchor="middle" fontSize="12" fontWeight="700" fill="#143b34">
                  {point.value}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}
    </motion.section>
  );
}
