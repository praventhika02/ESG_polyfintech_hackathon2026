"use client";

import { useEffect, useMemo, useState } from "react";
import { Crosshair } from "lucide-react";
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

const savedAnalysisKey = "esg-alpha-gap-saved-analyses";
const thresholdX = 50;
const thresholdY = 65;

const quadrantInfo = {
  "Hidden Winners": {
    meaning: "High transformation, low recognition.",
    implication: "Act Early"
  },
  "Future Leaders": {
    meaning: "High transformation, high recognition.",
    implication: "Quality ESG leader / Monitor valuation"
  },
  "Overrated Leaders": {
    meaning: "Low transformation, high recognition.",
    implication: "Already priced / Be cautious"
  },
  "Value Traps": {
    meaning: "Low transformation, low recognition.",
    implication: "Avoid / Weak signal"
  }
};

function quadrantLabel(transformation: number, recognition: number) {
  if (transformation >= thresholdY && recognition < thresholdX) return "Hidden Winners";
  if (transformation >= thresholdY && recognition >= thresholdX) return "Future Leaders";
  if (transformation < thresholdY && recognition >= thresholdX) return "Overrated Leaders";
  return "Value Traps";
}

function clampPercent(value: number) {
  return Math.max(5, Math.min(95, value));
}

function glow(confidence: number) {
  if (confidence >= 80) return "shadow-[0_0_32px_rgba(0,229,168,0.48)]";
  if (confidence >= 60) return "shadow-[0_0_24px_rgba(34,211,238,0.34)]";
  return "shadow-[0_0_16px_rgba(169,200,191,0.18)]";
}

export function MomentumMatrix({ result, comparisonResults = [] }: MomentumMatrixProps) {
  const [mode, setMode] = useState<"current" | "saved">("current");
  const [saved, setSaved] = useState<SavedAnalysis[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const savedValue = window.localStorage.getItem(savedAnalysisKey);
      if (savedValue) setSaved(JSON.parse(savedValue) as SavedAnalysis[]);
    } catch (error) {
      console.error("[UI] Failed to load saved matrix scans", error);
    }
  }, []);

  const savedResults = useMemo(
    () =>
      saved
        .filter((item) => selectedIds.includes(item.id))
        .map((item) => item.result),
    [saved, selectedIds]
  );
  const externalComparison = comparisonResults.length > 0;
  const plotted = externalComparison
    ? [result, ...comparisonResults]
    : mode === "saved" && savedResults.length > 0
    ? savedResults
    : [result];
  const recognition = result.recognitionScore ?? 0;
  const currentQuadrant = quadrantLabel(result.transformationStrength, recognition);
  const currentInfo = quadrantInfo[currentQuadrant];

  function toggleSaved(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 4) return current;
      return [...current, id];
    });
  }

  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mint/10 text-mint">
            <Crosshair className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
              Momentum Matrix
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Where does this company sit?
            </h2>
          </div>
        </div>
        {!externalComparison ? (
          <div className="flex rounded-xl border border-white/10 bg-white/[0.045] p-1">
            {[
              ["current", "Current scan only"],
              ["saved", "Saved comparison"]
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value as "current" | "saved")}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  mode === value ? "bg-mint text-[#05201c]" : "text-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {mode === "saved" && !externalComparison ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {saved.length < 2 ? (
            <span className="rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-sm text-muted">
              Save at least two analyses to compare.
            </span>
          ) : (
            saved.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleSaved(item.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  selectedIds.includes(item.id)
                    ? "border-mint/30 bg-mint/15 text-mint"
                    : "border-white/10 bg-white/5 text-muted"
                }`}
              >
                {item.result.companyName}
              </button>
            ))
          )}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative min-h-[620px] rounded-2xl border border-white/10 bg-white/[0.04] p-[48px_48px_60px_80px]">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-semibold text-muted">
            Transformation Strength
          </div>
          <div className="absolute left-14 top-12 text-xs font-semibold text-muted">High</div>
          <div className="absolute bottom-20 left-14 text-xs font-semibold text-muted">Low</div>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm font-semibold text-muted">
            Recognition Score
          </div>
          <div className="absolute bottom-10 left-24 text-xs font-semibold text-muted">
            Low Recognition
          </div>
          <div className="absolute bottom-10 right-12 text-xs font-semibold text-muted">
            High Recognition
          </div>

          <div className="relative h-full min-h-[500px] overflow-hidden rounded-xl border border-white/10 bg-[#071f22]/78">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(148,255,220,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,255,220,0.055)_1px,transparent_1px)] bg-[length:34px_34px]" />
            <div className="absolute left-0 top-0 h-[35%] w-1/2 bg-emerald-400/10" />
            <div className="absolute right-0 top-0 h-[35%] w-1/2 bg-blue-400/10" />
            <div className="absolute bottom-0 right-0 h-[65%] w-1/2 bg-gold/10" />
            <div className="absolute bottom-0 left-0 h-[65%] w-1/2 bg-rose-400/10" />
            <div className="absolute left-1/2 top-0 h-full w-px bg-white/20" />
            <div className="absolute left-0 top-[35%] h-px w-full bg-white/20" />

            <span className="absolute left-8 top-8 rounded-full bg-[#05201c]/80 px-3 py-1.5 text-xs font-semibold text-mint">
              Hidden Winners
            </span>
            <span className="absolute right-8 top-8 rounded-full bg-[#05201c]/80 px-3 py-1.5 text-xs font-semibold text-cyan-200">
              Future Leaders
            </span>
            <span className="absolute bottom-8 right-8 rounded-full bg-[#05201c]/80 px-3 py-1.5 text-xs font-semibold text-gold">
              Overrated Leaders
            </span>
            <span className="absolute bottom-8 left-8 rounded-full bg-[#05201c]/80 px-3 py-1.5 text-xs font-semibold text-rose-200">
              Value Traps
            </span>

            {plotted.map((point, index) => {
              const pointRecognition = point.recognitionScore ?? 0;
              const left = clampPercent(pointRecognition);
              const top = clampPercent(100 - point.transformationStrength);
              const pointQuadrant = quadrantLabel(point.transformationStrength, pointRecognition);
              const primary = point.companyId === result.companyId && index === 0;

              return (
                <div
                  key={`${point.companyId}-${point.generatedAt}-${index}`}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${left}%`, top: `${top}%` }}
                >
                  <div
                    className={`rounded-full border p-1 ${
                      primary ? "border-mint/50" : "border-white/20"
                    } ${glow(point.confidence)}`}
                  >
                    <div className="h-4 w-4 rounded-full bg-mint" />
                  </div>
                  <div className="mt-2 min-w-44 rounded-xl border border-white/10 bg-[#05201c]/92 p-3 text-xs text-foreground shadow-xl">
                    <p className="font-semibold">{point.companyName}</p>
                    <p className="mt-1 text-muted">
                      T: {point.transformationStrength} | R: {pointRecognition} | Gap: {point.recognitionGap ?? 0}
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-white/8 px-2 py-1 font-semibold text-mint">
                      {pointQuadrant}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
            Current quadrant
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-foreground">
            {currentQuadrant}
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted">{currentInfo.meaning}</p>
          <div className="mt-4 rounded-xl border border-mint/20 bg-mint/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mint">
              Investor implication
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {currentInfo.implication}
            </p>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            {result.companyName} is here because Transformation Strength is{" "}
            <span className="font-semibold text-foreground">{result.transformationStrength}</span>{" "}
            and Recognition Score is{" "}
            <span className="font-semibold text-foreground">{recognition}</span>.
          </p>
        </aside>
      </div>
    </section>
  );
}
