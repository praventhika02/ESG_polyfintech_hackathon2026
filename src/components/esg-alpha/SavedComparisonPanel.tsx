"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Check } from "lucide-react";
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

  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="mb-5 flex gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#143b34] text-white">
          <BarChart3 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
            Saved Comparison
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[#17211e]">
            Compare locally saved ESG Alpha Gap analyses.
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#596662]">
            Scan companies, save the results, then compare 2 to 4 saved analyses.
          </p>
        </div>
      </div>

      {savedAnalyses.length < 2 ? (
        <div className="rounded-xl border border-white/65 bg-white/48 p-5 text-sm font-medium text-[#596662]">
          Save at least two scans to compare ESG Alpha Gap results.
        </div>
      ) : (
        <>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {savedAnalyses.map((saved) => {
              const selected = selectedIds.includes(saved.id);

              return (
                <button
                  key={saved.id}
                  type="button"
                  onClick={() => toggleSaved(saved.id)}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition ${
                    selected
                      ? "border-emerald-400 bg-emerald-50 text-[#143b34]"
                      : "border-white/65 bg-white/48 text-[#42534d] hover:bg-white/70"
                  }`}
                >
                  <span>
                    <span className="block text-sm font-semibold">
                      {saved.result.companyName}
                    </span>
                    <span className="block text-xs text-[#65726e]">
                      {decisionLabel(saved.result.classification)}
                    </span>
                  </span>
                  {selected ? <Check className="h-4 w-4 text-emerald-700" /> : null}
                </button>
              );
            })}
          </div>

          {selectedResults.length >= 2 ? (
            <div className="mt-5 grid gap-5">
              <div className="overflow-x-auto rounded-xl border border-white/65 bg-white/48">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="border-b border-white/70 text-xs uppercase tracking-[0.12em] text-emerald-900/60">
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
                      <tr key={`${result.companyId}-${result.generatedAt}`} className="border-b border-white/50 last:border-0">
                        <td className="px-4 py-3 font-semibold text-[#17211e]">{result.companyName}</td>
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
            <p className="mt-4 rounded-xl border border-white/65 bg-white/48 p-4 text-sm font-medium text-[#596662]">
              Select at least two saved analyses to compare.
            </p>
          )}
        </>
      )}
    </section>
  );
}
