"use client";

import { useMemo, useState } from "react";
import type { EsgScanResult } from "@/types/esg";

type Quadrant =
  | "Hidden Winners"
  | "Future Leaders"
  | "Overrated Leaders"
  | "Value Traps";

type MatrixPoint = {
  id: string;
  companyName: string;
  transformationStrength: number;
  recognitionScore: number;
  recognitionGap: number;
  confidence: number;
  investorDecision: string;
};

type SavedAnalysis = {
  id: string;
  savedAt: string;
  result: EsgScanResult;
};

type MomentumMatrixProps = {
  result: EsgScanResult;
};

const savedAnalysisKey = "esg-alpha-gap-saved-analyses";

const SVG_W = 1200;
const SVG_H = 720;

const plot = {
  x: 120,
  y: 80,
  w: 900,
  h: 520,
};

const axisMid = 50;

const palette = ["#00e5a8", "#22d3ee", "#f6c85f", "#a78bfa", "#fb7185"];

const offsets = [
  { x: 0, y: 0 },
  { x: 18, y: -18 },
  { x: -18, y: 18 },
  { x: 24, y: 16 },
  { x: -24, y: -16 },
];

export function MomentumMatrix({ result }: MomentumMatrixProps) {
  const [mode, setMode] = useState<"current" | "saved">("current");

  const currentPoint = useMemo(() => resultToPoint(result, "current"), [result]);

  const savedPoints = useMemo(() => {
    if (typeof window === "undefined") return [];

    try {
      const raw = window.localStorage.getItem(savedAnalysisKey);
      if (!raw) return [];

      const saved = JSON.parse(raw) as SavedAnalysis[];

      return saved
        .filter((item) => item?.result)
        .slice(0, 5)
        .map((item) => resultToPoint(item.result, item.id));
    } catch {
      return [];
    }
  }, []);

  const points = mode === "saved" ? savedPoints : [currentPoint];

  const activePoint =
    mode === "saved" && points.length > 0
      ? [...points].sort((a, b) => b.recognitionGap - a.recognitionGap)[0]
      : currentPoint;

  const activeQuadrant = getMomentumQuadrant(
    activePoint.transformationStrength,
    activePoint.recognitionScore
  );

  const activeInfo = getQuadrantInfo(activeQuadrant);

  const comparisonSummary = useMemo(() => {
    if (points.length < 2) return null;

    return {
      count: points.length,
      bestGap: [...points].sort((a, b) => b.recognitionGap - a.recognitionGap)[0],
      mostRecognised: [...points].sort(
        (a, b) => b.recognitionScore - a.recognitionScore
      )[0],
      strongestTransformation: [...points].sort(
        (a, b) => b.transformationStrength - a.transformationStrength
      )[0],
    };
  }, [points]);

  return (
    <section className="rounded-[30px] border border-white/10 bg-[#061c1a]/95 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#00e5a8]">
            Momentum Matrix
          </p>
          <h2 className="mt-2 text-3xl font-black text-[#f5fff9]">
            Where does this company sit?
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a9c8bf]">
            Live scores place each company by transformation strength and market
            recognition.
          </p>
        </div>

        <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setMode("current")}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
              mode === "current"
                ? "bg-[#00e5a8] text-[#05201c]"
                : "text-[#a9c8bf] hover:text-white"
            }`}
          >
            Current scan
          </button>
          <button
            type="button"
            onClick={() => setMode("saved")}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
              mode === "saved"
                ? "bg-[#00e5a8] text-[#05201c]"
                : "text-[#a9c8bf] hover:text-white"
            }`}
          >
            Saved comparison
          </button>
        </div>
      </div>

      {mode === "saved" && points.length < 2 ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-10 text-center">
          <p className="text-lg font-bold text-[#f5fff9]">
            Save at least two analyses to compare.
          </p>
          <p className="mt-2 text-sm text-[#a9c8bf]">
            Scan companies, save results locally, then return here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="rounded-[28px] border border-white/10 bg-[#031416] p-4">
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="h-[650px] w-full"
              role="img"
              aria-label="ESG Alpha Gap momentum matrix"
            >
              <defs>
                <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <rect width={SVG_W} height={SVG_H} rx="28" fill="#031416" />

              <rect
                x={plot.x}
                y={plot.y}
                width={plot.w}
                height={plot.h}
                rx="22"
                fill="#062322"
                stroke="rgba(245,255,249,0.22)"
                strokeWidth="2"
              />

              <rect x={plot.x} y={plot.y} width={plot.w / 2} height={plot.h / 2} fill="rgba(0,229,168,0.16)" />
              <rect x={plot.x + plot.w / 2} y={plot.y} width={plot.w / 2} height={plot.h / 2} fill="rgba(34,211,238,0.15)" />
              <rect x={plot.x} y={plot.y + plot.h / 2} width={plot.w / 2} height={plot.h / 2} fill="rgba(251,113,133,0.12)" />
              <rect x={plot.x + plot.w / 2} y={plot.y + plot.h / 2} width={plot.w / 2} height={plot.h / 2} fill="rgba(246,200,95,0.12)" />

              {Array.from({ length: 11 }).map((_, index) => {
                const x = plot.x + (index / 10) * plot.w;
                return (
                  <line
                    key={`x-${index}`}
                    x1={x}
                    y1={plot.y}
                    x2={x}
                    y2={plot.y + plot.h}
                    stroke="rgba(255,255,255,0.07)"
                  />
                );
              })}

              {Array.from({ length: 11 }).map((_, index) => {
                const y = plot.y + (index / 10) * plot.h;
                return (
                  <line
                    key={`y-${index}`}
                    x1={plot.x}
                    y1={y}
                    x2={plot.x + plot.w}
                    y2={y}
                    stroke="rgba(255,255,255,0.07)"
                  />
                );
              })}

              <line
                x1={plot.x + plot.w / 2}
                y1={plot.y}
                x2={plot.x + plot.w / 2}
                y2={plot.y + plot.h}
                stroke="rgba(245,255,249,0.42)"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
              <line
                x1={plot.x}
                y1={plot.y + plot.h / 2}
                x2={plot.x + plot.w}
                y2={plot.y + plot.h / 2}
                stroke="rgba(245,255,249,0.42)"
                strokeWidth="2"
                strokeDasharray="6 6"
              />

              <QuadrantBadge x={plot.x + 34} y={plot.y + 38} label="Hidden Winners" />
              <QuadrantBadge x={plot.x + plot.w - 188} y={plot.y + 38} label="Future Leaders" tone="cyan" />
              <QuadrantBadge x={plot.x + 34} y={plot.y + plot.h - 28} label="Value Traps" tone="rose" />
              <QuadrantBadge x={plot.x + plot.w - 220} y={plot.y + plot.h - 28} label="Overrated Leaders" tone="gold" />

              <text x={plot.x + plot.w / 2} y={plot.y + plot.h + 58} textAnchor="middle" fill="#d8fff2" fontSize="20" fontWeight="900">
                Recognition Score →
              </text>
              <text x={plot.x} y={plot.y + plot.h + 88} textAnchor="start" fill="#a9c8bf" fontSize="16" fontWeight="800">
                Low Recognition
              </text>
              <text x={plot.x + plot.w} y={plot.y + plot.h + 88} textAnchor="end" fill="#a9c8bf" fontSize="16" fontWeight="800">
                High Recognition
              </text>

              <text
                x={48}
                y={plot.y + plot.h / 2}
                transform={`rotate(-90 48 ${plot.y + plot.h / 2})`}
                textAnchor="middle"
                fill="#d8fff2"
                fontSize="20"
                fontWeight="900"
              >
                Transformation Strength ↑
              </text>
              <text x={72} y={plot.y + 10} fill="#a9c8bf" fontSize="16" fontWeight="800" textAnchor="middle">
                High
              </text>
              <text x={72} y={plot.y + plot.h} fill="#a9c8bf" fontSize="16" fontWeight="800" textAnchor="middle">
                Low
              </text>

              {points.map((point, index) => {
                const { x, y } = getPointPosition(point, index);
                const color = mode === "current" ? "#00e5a8" : palette[index % palette.length];

                return (
                  <g key={point.id}>
                    <circle
                      cx={x}
                      cy={y}
                      r="13"
                      fill={color}
                      stroke="#f5fff9"
                      strokeWidth="3"
                      filter="url(#dotGlow)"
                    />
                    <text
                      x={x + 20}
                      y={y + 6}
                      fill="#f5fff9"
                      fontSize="16"
                      fontWeight="900"
                    >
                      {shortName(point.companyName)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <aside className="rounded-[28px] border border-white/10 bg-white/[0.06] p-6">
            {mode === "saved" && comparisonSummary ? (
              <>
                <p className="text-xs font-black uppercase tracking-[0.32em] text-[#00e5a8]">
                  Saved comparison
                </p>
                <h3 className="mt-4 text-3xl font-black text-[#f5fff9]">
                  {comparisonSummary.count} analyses plotted
                </h3>

                <div className="mt-7 grid gap-4">
                  <SideCard
                    label="Best gap"
                    title={comparisonSummary.bestGap.companyName}
                    detail={`Gap ${formatGap(comparisonSummary.bestGap.recognitionGap)}`}
                  />
                  <SideCard
                    label="Most recognised"
                    title={comparisonSummary.mostRecognised.companyName}
                    detail={`Recognition ${comparisonSummary.mostRecognised.recognitionScore}`}
                  />
                  <SideCard
                    label="Highest transformation"
                    title={comparisonSummary.strongestTransformation.companyName}
                    detail={`Transformation ${comparisonSummary.strongestTransformation.transformationStrength}`}
                  />
                </div>
              </>
            ) : (
              <CurrentPointPanel point={activePoint} />
            )}
          </aside>
        </div>
      )}

      <details className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <summary className="cursor-pointer text-sm font-bold text-[#00e5a8]">
          View quadrant rules
        </summary>

        <div className="mt-4 grid gap-3 text-sm text-[#a9c8bf] md:grid-cols-2">
          <div className="rounded-xl bg-black/20 p-3">
            <p className="font-bold text-[#f5fff9]">Top-left: Hidden Winners</p>
            <p>T ≥ 50 and R &lt; 50</p>
          </div>

          <div className="rounded-xl bg-black/20 p-3">
            <p className="font-bold text-[#f5fff9]">Top-right: Future Leaders</p>
            <p>T ≥ 50 and R ≥ 50</p>
          </div>

          <div className="rounded-xl bg-black/20 p-3">
            <p className="font-bold text-[#f5fff9]">
              Bottom-right: Overrated Leaders
            </p>
            <p>T &lt; 50 and R ≥ 50</p>
          </div>

          <div className="rounded-xl bg-black/20 p-3">
            <p className="font-bold text-[#f5fff9]">Bottom-left: Value Traps</p>
            <p>T &lt; 50 and R &lt; 50</p>
          </div>
        </div>
      </details>
    </section>
  );
}

function resultToPoint(result: EsgScanResult, id: string): MatrixPoint {
  const recognitionScore =
    result.recognitionScore ??
    result.scoreBreakdown?.marketRecognition?.recognitionScore ??
    0;

  const recognitionGap =
    result.recognitionGap ?? result.transformationStrength - recognitionScore;

  return {
    id,
    companyName: result.companyName,
    transformationStrength: result.transformationStrength,
    recognitionScore,
    recognitionGap,
    confidence: result.confidence,
    investorDecision: decisionFromClassification(result.classification),
  };
}

function decisionFromClassification(classification: string) {
  if (classification === "Early Alpha Opportunity") return "Act Early";
  if (classification === "Emerging ESG Improver") return "Monitor Closely";
  if (classification === "Already Recognised") return "Already Priced In";
  if (classification === "Innovation Watchlist") return "Wait for Confirmation";
  return "Avoid for Now";
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getPointPosition(point: MatrixPoint, index: number) {
  const offset = offsets[index % offsets.length];

  const x = plot.x + (clamp(point.recognitionScore) / 100) * plot.w + offset.x;
  const y =
    plot.y + ((100 - clamp(point.transformationStrength)) / 100) * plot.h + offset.y;

  return {
    x: Math.max(plot.x + 34, Math.min(plot.x + plot.w - 130, x)),
    y: Math.max(plot.y + 34, Math.min(plot.y + plot.h - 44, y)),
  };
}

function getMomentumQuadrant(
  transformationStrength: number,
  recognitionScore: number
): Quadrant {
  if (transformationStrength >= axisMid && recognitionScore < axisMid) {
    return "Hidden Winners";
  }
  if (transformationStrength >= axisMid && recognitionScore >= axisMid) {
    return "Future Leaders";
  }
  if (transformationStrength < axisMid && recognitionScore >= axisMid) {
    return "Overrated Leaders";
  }
  return "Value Traps";
}

function getQuadrantInfo(quadrant: Quadrant) {
  if (quadrant === "Hidden Winners") {
    return {
      meaning: "High transformation, low recognition.",
      implication: "Act Early candidate — transformation is ahead of recognition.",
    };
  }

  if (quadrant === "Future Leaders") {
    return {
      meaning: "High transformation, high recognition.",
      implication: "Quality ESG leader — monitor valuation and execution.",
    };
  }

  if (quadrant === "Overrated Leaders") {
    return {
      meaning: "Low transformation, high recognition.",
      implication: "Already recognised or crowded — be cautious.",
    };
  }

  return {
    meaning: "Low transformation, low recognition.",
    implication: "Weak signal — avoid until evidence improves.",
  };
}

function shortName(name: string) {
  return name
    .replace("Group Holdings", "")
    .replace("Industries", "")
    .replace("International", "")
    .replace("Investment", "")
    .replace("Ltd", "")
    .trim();
}

function formatGap(gap: number) {
  return gap > 0 ? `+${gap}` : `${gap}`;
}

function QuadrantBadge({
  x,
  y,
  label,
  tone = "mint",
}: {
  x: number;
  y: number;
  label: string;
  tone?: "mint" | "cyan" | "gold" | "rose";
}) {
  const style = {
    mint: ["rgba(0,229,168,0.18)", "rgba(0,229,168,0.38)", "#9fffe5"],
    cyan: ["rgba(34,211,238,0.18)", "rgba(34,211,238,0.38)", "#a5f3fc"],
    gold: ["rgba(246,200,95,0.18)", "rgba(246,200,95,0.38)", "#f6c85f"],
    rose: ["rgba(251,113,133,0.18)", "rgba(251,113,133,0.38)", "#fb7185"],
  }[tone];

  const width = Math.max(150, label.length * 9);

  return (
    <g>
      <rect
        x={x}
        y={y - 25}
        width={width}
        height="34"
        rx="17"
        fill={style[0]}
        stroke={style[1]}
      />
      <text
        x={x + width / 2}
        y={y - 3}
        textAnchor="middle"
        fill={style[2]}
        fontSize="14"
        fontWeight="900"
      >
        {label}
      </text>
    </g>
  );
}

function CurrentPointPanel({ point }: { point: MatrixPoint }) {
  const quadrant = getMomentumQuadrant(
    point.transformationStrength,
    point.recognitionScore
  );
  const info = getQuadrantInfo(quadrant);

  return (
    <>
      <p className="text-xs font-black uppercase tracking-[0.32em] text-[#00e5a8]">
        Current quadrant
      </p>
      <h3 className="mt-4 text-3xl font-black text-[#f5fff9]">{quadrant}</h3>
      <p className="mt-4 text-sm leading-6 text-[#a9c8bf]">{info.meaning}</p>

      <div className="mt-6 rounded-2xl border border-[#00e5a8]/25 bg-[#00e5a8]/10 p-4">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00e5a8]">
          Investor implication
        </p>
        <p className="mt-2 font-bold leading-6 text-[#f5fff9]">
          {info.implication}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#a9c8bf]">
          Company
        </p>
        <p className="mt-3 text-lg font-black text-[#f5fff9]">{point.companyName}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-[#a9c8bf]">
          <p>
            T:{" "}
            <span className="font-black text-[#f5fff9]">
              {point.transformationStrength}
            </span>
          </p>
          <p>
            R:{" "}
            <span className="font-black text-[#f5fff9]">
              {point.recognitionScore}
            </span>
          </p>
          <p>
            Gap:{" "}
            <span className="font-black text-[#f5fff9]">
              {formatGap(point.recognitionGap)}
            </span>
          </p>
          <p>
            <span className="font-black text-[#f5fff9]">
              {point.investorDecision}
            </span>
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs leading-5 text-[#a9c8bf]">
          Rule used: T {point.transformationStrength}{" "}
          {point.transformationStrength >= axisMid ? "≥" : "<"} 50 and R{" "}
          {point.recognitionScore} {point.recognitionScore >= axisMid ? "≥" : "<"}{" "}
          50 → <span className="font-bold text-[#f5fff9]">{quadrant}</span>
        </div>
      </div>
    </>
  );
}

function SideCard({
  label,
  title,
  detail,
}: {
  label: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <p className="text-xs font-black uppercase tracking-[0.26em] text-[#00e5a8]">
        {label}
      </p>
      <p className="mt-3 text-lg font-black text-[#f5fff9]">{title}</p>
      <p className="mt-1 text-sm font-semibold text-[#a9c8bf]">{detail}</p>
    </div>
  );
}