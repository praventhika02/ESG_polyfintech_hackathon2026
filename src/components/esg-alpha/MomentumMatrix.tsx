"use client";

import { useEffect, useMemo, useState } from "react";
import type { EsgScanResult } from "@/types/esg";

type MomentumMatrixProps = {
  result: EsgScanResult;
  comparisonResults?: EsgScanResult[];
};

type SavedAnalysis = {
  id: string;
  savedAt: string;
  result: EsgScanResult;
};

type MomentumQuadrant =
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
  investorDecision: string;
  quadrant: MomentumQuadrant;
  x: number;
  y: number;
  label: string;
  color: string;
  radius: number;
};

const savedAnalysisKey = "esg-alpha-gap-saved-analyses";
const recognitionThreshold = 50;
const transformationThreshold = 50;

const svgW = 1000;
const svgH = 650;
const plotX = 110;
const plotY = 70;
const plotW = 760;
const plotH = 460;
const topZoneH = plotH * 0.5;
const bottomZoneH = plotH * 0.5;
const thresholdX = plotX + plotW * 0.5;
const thresholdY = plotY + topZoneH;

const pointColors = ["#F5FFF9", "#B8C7FF", "#D8B4FE", "#CBD5E1", "#FBCFE8"];
const pointOffsets = [
  { x: 0, y: 0 },
  { x: 16, y: -14 },
  { x: -16, y: 14 },
  { x: 18, y: 14 },
  { x: -18, y: -14 }
];

const quadrantCopy: Record<
  MomentumQuadrant,
  { meaning: string; implication: string }
> = {
  "Hidden Winners": {
    meaning:
      "Transformation is strong while recognition is still low. This is the strongest early-alpha zone.",
    implication: "Act Early candidate"
  },
  "Future Leaders": {
    meaning:
      "Transformation and recognition are both high. This suggests ESG quality, but less hidden upside.",
    implication: "Quality ESG leader"
  },
  "Overrated Leaders": {
    meaning:
      "Recognition is high while transformation is comparatively weaker. This may indicate crowded ESG attention.",
    implication: "Be cautious"
  },
  "Value Traps": {
    meaning:
      "Both transformation and recognition are low. Evidence is not strong enough yet.",
    implication: "Avoid until evidence improves"
  }
};

export function getMomentumQuadrant(
  transformationStrength: number,
  recognitionScore: number
): MomentumQuadrant {
  if (transformationStrength >= transformationThreshold && recognitionScore < recognitionThreshold) {
    return "Hidden Winners";
  }
  if (transformationStrength >= transformationThreshold && recognitionScore >= recognitionThreshold) {
    return "Future Leaders";
  }
  if (transformationStrength < transformationThreshold && recognitionScore >= recognitionThreshold) {
    return "Overrated Leaders";
  }
  return "Value Traps";
}

export function MomentumMatrix({ result, comparisonResults = [] }: MomentumMatrixProps) {
  const [mode, setMode] = useState<"current" | "saved">("current");
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  const hasExternalComparison = comparisonResults.length > 0;

  useEffect(() => {
    try {
      const savedValue = window.localStorage.getItem(savedAnalysisKey);
      if (savedValue) setSavedAnalyses(JSON.parse(savedValue) as SavedAnalysis[]);
    } catch (error) {
      console.error("[UI] Failed to load saved matrix scans", error);
    }
  }, []);

  const rawResults = useMemo(() => {
    if (hasExternalComparison) return [result, ...comparisonResults];
    if (mode === "saved") return savedAnalyses.map((item) => item.result).slice(0, 5);
    return [result];
  }, [comparisonResults, hasExternalComparison, mode, result, savedAnalyses]);

  const points = useMemo(
    () =>
      rawResults.map((scanResult, index) =>
        resultToPoint(scanResult, index, mode === "current" && !hasExternalComparison)
      ),
    [hasExternalComparison, mode, rawResults]
  );

  const hoveredPoint = points.find((point) => point.id === hoveredPointId);
  const selectedPoint =
    points.find((point) => point.id === selectedPointId) ?? points[0] ?? resultToPoint(result, 0, true);

  const showSavedEmpty = !hasExternalComparison && mode === "saved" && points.length < 2;

  return (
    <section className="rounded-2xl border border-white/10 bg-[#061c1a]/92 p-5 shadow-2xl shadow-black/30">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-mint">
            Momentum Matrix
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-foreground">
            Where does this company sit?
          </h2>
        </div>

        {!hasExternalComparison ? (
          <div className="flex w-fit rounded-xl border border-white/10 bg-white/[0.045] p-1">
            {[
              ["current", "Current scan"],
              ["saved", "Saved comparison"]
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setMode(value as "current" | "saved");
                  setHoveredPointId(null);
                  setSelectedPointId(null);
                }}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  mode === value ? "bg-mint text-[#05201c]" : "text-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {showSavedEmpty ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.045] p-8 text-center">
          <p className="text-base font-semibold text-foreground">
            Save at least two analyses to compare.
          </p>
          <p className="mt-2 text-sm text-muted">
            Saved comparison uses locally saved scan results only.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-white/10 bg-[#071f22] p-2">
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="h-[560px] w-full"
              role="img"
              aria-label="ESG Alpha Gap momentum matrix scatter plot"
            >
              <defs>
                <filter id="matrixDotGlow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <rect width={svgW} height={svgH} rx="22" fill="#071f22" />
              <QuadrantBackgrounds />
              <GridLines />
              <ThresholdLines />
              <Axes />
              <QuadrantLabels />

              {points.map((point) => (
                <PointMark
                  key={point.id}
                  point={point}
                  isSelected={selectedPoint.id === point.id}
                  onHover={() => setHoveredPointId(point.id)}
                  onLeave={() => setHoveredPointId(null)}
                  onSelect={() => setSelectedPointId(point.id)}
                />
              ))}

              {hoveredPoint ? <PointTooltip point={hoveredPoint} /> : null}
            </svg>
          </div>

          <SidePanel point={selectedPoint} isComparison={mode === "saved" || hasExternalComparison} />
        </div>
      )}

      {!showSavedEmpty ? <MatrixCalculationDetails points={points} /> : null}
    </section>
  );
}

function resultToPoint(result: EsgScanResult, index: number, isCurrentOnly: boolean): MatrixPoint {
  const recognitionScore = clamp(
    result.recognitionScore ?? result.scoreBreakdown?.marketRecognition.recognitionScore ?? 0
  );
  const transformationStrength = clamp(result.transformationStrength);
  const baseX = plotX + (recognitionScore / 100) * plotW;
  const baseY = plotY + ((100 - transformationStrength) / 100) * plotH;
  const offset = isCurrentOnly ? { x: 0, y: 0 } : pointOffsets[index % pointOffsets.length];
  const x = clampNumber(baseX + offset.x, plotX + 18, plotX + plotW - 96);
  const y = clampNumber(baseY + offset.y, plotY + 24, plotY + plotH - 24);
  const recognitionGap = result.recognitionGap ?? transformationStrength - recognitionScore;
  const quadrant = getMomentumQuadrant(transformationStrength, recognitionScore);

  return {
    id: `${result.companyId}-${result.generatedAt}-${index}`,
    companyName: result.companyName,
    transformationStrength,
    recognitionScore,
    recognitionGap,
    investorDecision: decisionFromClassification(result.classification),
    quadrant,
    x,
    y,
    label: shortName(result.companyName),
    color: isCurrentOnly ? "#F5FFF9" : pointColors[index % pointColors.length],
    radius: isCurrentOnly ? 9 : 7
  };
}

function QuadrantBackgrounds() {
  return (
    <>
      <rect x={plotX} y={plotY} width={plotW / 2} height={topZoneH} fill="rgba(0, 229, 168, 0.14)" />
      <rect x={thresholdX} y={plotY} width={plotW / 2} height={topZoneH} fill="rgba(34, 211, 238, 0.12)" />
      <rect x={plotX} y={thresholdY} width={plotW / 2} height={bottomZoneH} fill="rgba(251, 113, 133, 0.10)" />
      <rect x={thresholdX} y={thresholdY} width={plotW / 2} height={bottomZoneH} fill="rgba(246, 200, 95, 0.10)" />
      <rect
        x={plotX}
        y={plotY}
        width={plotW}
        height={plotH}
        rx="14"
        fill="transparent"
        stroke="rgba(245,255,249,0.22)"
        strokeWidth="2"
      />
    </>
  );
}

function GridLines() {
  return (
    <>
      {Array.from({ length: 11 }).map((_, index) => {
        const x = plotX + (index / 10) * plotW;
        const y = plotY + (index / 10) * plotH;

        return (
          <g key={`grid-${index}`}>
            <line x1={x} y1={plotY} x2={x} y2={plotY + plotH} stroke="rgba(255,255,255,0.07)" />
            <line x1={plotX} y1={y} x2={plotX + plotW} y2={y} stroke="rgba(255,255,255,0.07)" />
          </g>
        );
      })}
    </>
  );
}

function ThresholdLines() {
  return (
    <>
      <line
        x1={thresholdX}
        y1={plotY}
        x2={thresholdX}
        y2={plotY + plotH}
        stroke="rgba(245,255,249,0.35)"
        strokeWidth="2"
      />
      <line
        x1={plotX}
        y1={thresholdY}
        x2={plotX + plotW}
        y2={thresholdY}
        stroke="rgba(245,255,249,0.35)"
        strokeWidth="2"
      />
    </>
  );
}

function Axes() {
  return (
    <>
      <text x={plotX + plotW / 2} y={plotY + plotH + 64} textAnchor="middle" fill="#F5FFF9" fontSize="18" fontWeight="800">
        {"Recognition Score \u2192"}
      </text>
      <text x={plotX} y={plotY + plotH + 38} textAnchor="start" fill="#A9C8BF" fontSize="14" fontWeight="700">
        Low Recognition
      </text>
      <text x={plotX + plotW} y={plotY + plotH + 38} textAnchor="end" fill="#A9C8BF" fontSize="14" fontWeight="700">
        High Recognition
      </text>

      <text
        x={58}
        y={plotY + plotH / 2}
        transform={`rotate(-90 58 ${plotY + plotH / 2})`}
        textAnchor="middle"
        fill="#F5FFF9"
        fontSize="18"
        fontWeight="800"
      >
        {"Transformation Strength \u2192"}
      </text>
      <text x={plotX} y={plotY - 20} textAnchor="start" fill="#A9C8BF" fontSize="13" fontWeight="700">
        High Transformation
      </text>
      <text x={plotX} y={plotY + plotH + 22} textAnchor="start" fill="#A9C8BF" fontSize="13" fontWeight="700">
        Low Transformation
      </text>
    </>
  );
}

function QuadrantLabels() {
  return (
    <>
      <QuadrantBadge x={plotX + 90} y={plotY + 45} label="Hidden Winners" tone="mint" />
      <QuadrantBadge x={plotX + plotW - 160} y={plotY + 45} label="Future Leaders" tone="cyan" />
      <QuadrantBadge x={plotX + 90} y={plotY + plotH - 40} label="Value Traps" tone="rose" />
      <QuadrantBadge x={plotX + plotW - 190} y={plotY + plotH - 40} label="Overrated Leaders" tone="gold" />
    </>
  );
}

function QuadrantBadge({
  x,
  y,
  label,
  tone
}: {
  x: number;
  y: number;
  label: string;
  tone: "mint" | "cyan" | "gold" | "rose";
}) {
  const colors = {
    mint: ["rgba(0,229,168,0.16)", "rgba(0,229,168,0.35)", "#9FFFE5"],
    cyan: ["rgba(34,211,238,0.15)", "rgba(34,211,238,0.34)", "#A5F3FC"],
    gold: ["rgba(246,200,95,0.14)", "rgba(246,200,95,0.32)", "#F6C85F"],
    rose: ["rgba(251,113,133,0.13)", "rgba(251,113,133,0.30)", "#FDA4AF"]
  }[tone];
  const width = Math.max(132, label.length * 8 + 28);

  return (
    <g>
      <rect x={x - width / 2} y={y - 19} width={width} height="34" rx="17" fill={colors[0]} stroke={colors[1]} />
      <text x={x} y={y + 3} textAnchor="middle" fill={colors[2]} fontSize="13" fontWeight="800">
        {label}
      </text>
    </g>
  );
}

function PointMark({
  point,
  isSelected,
  onHover,
  onLeave,
  onSelect
}: {
  point: MatrixPoint;
  isSelected: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
}) {
  return (
    <g
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onSelect}
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect();
      }}
    >
      <circle
        cx={point.x}
        cy={point.y}
        r={isSelected ? point.radius + 3 : point.radius}
        fill={point.color}
        stroke={isSelected ? "#F5FFF9" : "rgba(245,255,249,0.75)"}
        strokeWidth={isSelected ? 3 : 2}
        filter="url(#matrixDotGlow)"
      />
      <text x={point.x + 15} y={point.y + 5} fill="#F5FFF9" fontSize="13" fontWeight="800">
        {point.label}
      </text>
    </g>
  );
}

function PointTooltip({ point }: { point: MatrixPoint }) {
  const width = 230;
  const height = 92;
  const x = clampNumber(point.x - width / 2, plotX + 8, plotX + plotW - width - 8);
  const y = point.y - height - 18 < plotY ? point.y + 20 : point.y - height - 18;

  return (
    <g pointerEvents="none">
      <rect x={x} y={y} width={width} height={height} rx="14" fill="rgba(6,28,26,0.96)" stroke="rgba(0,229,168,0.35)" />
      <text x={x + 14} y={y + 25} fill="#F5FFF9" fontSize="13" fontWeight="800">
        {point.companyName}
      </text>
      <text x={x + 14} y={y + 48} fill="#A9C8BF" fontSize="12" fontWeight="700">
        T: {point.transformationStrength} | R: {point.recognitionScore} | Gap: {formatGap(point.recognitionGap)}
      </text>
      <text x={x + 14} y={y + 71} fill="#00E5A8" fontSize="12" fontWeight="800">
        {point.quadrant}
      </text>
    </g>
  );
}

function SidePanel({
  point,
  isComparison
}: {
  point: MatrixPoint;
  isComparison: boolean;
}) {
  const info = quadrantCopy[point.quadrant];

  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mint">
        {isComparison ? "Selected Quadrant" : "Current Quadrant"}
      </p>
      <h3 className="mt-3 text-3xl font-semibold text-foreground">{point.quadrant}</h3>

      <div className="mt-5 rounded-xl border border-white/10 bg-[#061c1a]/54 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Company
        </p>
        <p className="mt-2 text-lg font-semibold text-foreground">{point.companyName}</p>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.045] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Why</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          Transformation Strength is{" "}
          <span className="font-semibold text-foreground">{point.transformationStrength}</span>{" "}
          and Recognition Score is{" "}
          <span className="font-semibold text-foreground">{point.recognitionScore}</span>.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-mint/20 bg-mint/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
          Meaning
        </p>
        <p className="mt-2 text-sm leading-6 text-foreground">{info.meaning}</p>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.045] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Decision
        </p>
        <p className="mt-2 text-base font-semibold text-foreground">{point.investorDecision}</p>
        <p className="mt-1 text-xs text-mint">{info.implication}</p>
      </div>
    </aside>
  );
}

function MatrixCalculationDetails({ points }: { points: MatrixPoint[] }) {
  return (
    <details className="mt-5 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <summary className="cursor-pointer text-sm font-semibold text-mint">
        How matrix placement is calculated
      </summary>
      <div className="mt-4 grid gap-4 text-sm leading-6 text-muted lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-xl border border-white/10 bg-[#061c1a]/54 p-4">
          <p className="font-semibold text-foreground">Placement formula</p>
          <p className="mt-2">
            Horizontal position uses Recognition Score from 0 to 100. Vertical
            position uses Transformation Strength from 0 to 100, with higher
            transformation plotted higher on the chart.
          </p>
          <p className="mt-3">
            The matrix midpoint is 50 on each axis. This is a visual split for
            comparing high versus low scores, not a company-specific rule.
          </p>
        </div>

        <div className="grid gap-3">
          {points.map((point) => (
            <div
              key={`calc-${point.id}`}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold text-foreground">{point.companyName}</p>
                <span className="w-fit rounded-full border border-mint/20 bg-mint/10 px-2.5 py-1 text-xs font-semibold text-mint">
                  {point.quadrant}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted">
                Transformation {point.transformationStrength}{" "}
                {point.transformationStrength >= transformationThreshold ? ">=" : "<"}{" "}
                {transformationThreshold}; Recognition {point.recognitionScore}{" "}
                {point.recognitionScore >= recognitionThreshold ? ">=" : "<"}{" "}
                {recognitionThreshold}. Therefore: {point.quadrant}.
              </p>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

function shortName(name: string) {
  const cleaned = name
    .replace("Group Holdings", "")
    .replace("Industries", "")
    .replace("International", "")
    .replace("Investment", "")
    .replace("Ltd", "")
    .trim();

  return cleaned.length > 12 ? `${cleaned.slice(0, 11)}...` : cleaned;
}

function decisionFromClassification(classification: string) {
  if (classification === "Early Alpha Opportunity") return "Act Early";
  if (classification === "Emerging ESG Improver") return "Monitor Closely";
  if (classification === "Already Recognised") return "Already Priced In";
  if (classification === "Innovation Watchlist") return "Wait for Confirmation";
  return "Avoid for Now";
}

function formatGap(gap: number) {
  return gap > 0 ? `+${gap}` : `${gap}`;
}

function clamp(value: number) {
  return clampNumber(value, 0, 100);
}

function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
