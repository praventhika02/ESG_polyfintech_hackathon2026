"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Check, Trash2 } from "lucide-react";
import { MomentumMatrix } from "@/components/esg-alpha/MomentumMatrix";
import type { EsgScanResult } from "@/types/esg";

type SavedAnalysis = {
  id: string;
  savedAt: string;
  result: EsgScanResult;
};

const savedAnalysisKey = "esg-alpha-gap-saved-analyses";

function decisionLabel(classification: string) {
  if (classification === "Early Alpha Opportunity") return "Act Early";
  if (classification === "Emerging ESG Improver") return "Monitor Closely";
  if (classification === "Already Recognised") return "Already Priced In";
  if (classification === "Innovation Watchlist") return "Wait for Confirmation";
  return "Avoid for Now";
}

export function SavedComparisonPanel() {
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(savedAnalysisKey);
      if (saved) {
        setSavedAnalyses(JSON.parse(saved) as SavedAnalysis[]);
      }
    } catch (error) {
      console.error("[UI] Failed to load saved comparison analyses", error);
    }
  }, []);

  const selectedResults = useMemo(
    () =>
      savedAnalyses
        .filter((saved) => selectedIds.includes(saved.id))
        .map((saved) => saved.result),
    [savedAnalyses, selectedIds]
  );

  function toggleSaved(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 4) return current;
      return [...current, id];
    });
  }

  function deleteSaved(id: string) {
    const target = savedAnalyses.find((saved) => saved.id === id);
    if (!target) return;

    const shouldDelete = window.confirm(
      `Delete the saved analysis for ${target.result.companyName}?`
    );

    if (!shouldDelete) return;

    const nextSaved = savedAnalyses.filter((saved) => saved.id !== id);
    setSavedAnalyses(nextSaved);
    setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
    window.localStorage.setItem(savedAnalysisKey, JSON.stringify(nextSaved));
  }

  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="mb-5 flex gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#143b34] text-white">
          <BarChart3 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
            Saved Comparison
          </p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">
            Compare locally saved ESG Alpha Gap analyses.
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Scan companies, save the results, then compare 2 to 4 saved analyses.
          </p>
        </div>
      </div>

      {savedAnalyses.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.045] p-5 text-sm font-medium text-muted">
          No saved analyses yet. Save a scan from the Decision view to build a comparison set.
        </div>
      ) : (
        <>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {savedAnalyses.map((saved) => {
              const selected = selectedIds.includes(saved.id);

              return (
                <div
                  key={saved.id}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition ${
                    selected
                      ? "border-mint/40 bg-mint/15 text-mint"
                      : "border-white/10 bg-white/[0.045] text-muted hover:bg-white/[0.075]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSaved(saved.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block text-sm font-semibold">
                      {saved.result.companyName}
                    </span>
                    <span className="block text-xs text-muted">
                      {decisionLabel(saved.result.classification)}
                    </span>
                    <span className="mt-2 block text-[11px] font-semibold text-mint">
                      Saved {new Date(saved.savedAt).toLocaleDateString()}
                    </span>
                  </button>
                  <div className="flex items-center gap-2">
                    {selected ? <Check className="h-4 w-4 text-mint" /> : null}
                    <button
                      type="button"
                      onClick={() => deleteSaved(saved.id)}
                      className="rounded-lg border border-rose-300/20 bg-rose-400/10 p-2 text-rose-200 transition hover:bg-rose-400/15"
                      aria-label={`Delete saved analysis for ${saved.result.companyName}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {savedAnalyses.length < 2 ? (
            <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.045] p-4 text-sm font-medium text-muted">
              Save at least two analyses to compare.
            </p>
          ) : selectedResults.length >= 2 ? (
            <div className="mt-5 grid gap-5">
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.045]">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="border-b border-white/10 text-xs uppercase tracking-[0.12em] text-muted">
                    <tr>
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Decision</th>
                      <th className="px-4 py-3">Transformation</th>
                      <th className="px-4 py-3">Recognition</th>
                      <th className="px-4 py-3">Gap</th>
                      <th className="px-4 py-3">Confidence</th>
                      <th className="px-4 py-3">Alpha Window</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedResults.map((result) => (
                      <tr key={`${result.companyId}-${result.generatedAt}`} className="border-b border-white/10 last:border-0">
                        <td className="px-4 py-3 font-semibold text-foreground">{result.companyName}</td>
                        <td className="px-4 py-3">{decisionLabel(result.classification)}</td>
                        <td className="px-4 py-3">{result.transformationStrength}</td>
                        <td className="px-4 py-3">{result.recognitionScore ?? 0}</td>
                        <td className="px-4 py-3">{result.recognitionGap ?? 0}</td>
                        <td className="px-4 py-3">{result.confidence}</td>
                        <td className="px-4 py-3">{result.alphaWindowMonths} mo</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <MomentumMatrix
                result={selectedResults[0]}
                comparisonResults={selectedResults.slice(1)}
              />
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.045] p-4 text-sm font-medium text-muted">
              Select at least two saved analyses to compare.
            </p>
          )}
        </>
      )}
    </section>
  );
}
