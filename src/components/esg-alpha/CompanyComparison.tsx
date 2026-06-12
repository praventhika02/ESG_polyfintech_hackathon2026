"use client";

import { motion } from "framer-motion";
import { BarChart3, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import type { MockCompany } from "@/lib/esg/mockCompanies";
import type { EsgScanResult } from "@/types/esg";

type CompanyComparisonProps = {
  companies: MockCompany[];
  onScanCompany: (company: MockCompany, reportFileNames?: string[]) => Promise<EsgScanResult>;
};

const decisionTone: Record<string, string> = {
  "Act Early": "border-emerald-200 bg-emerald-100 text-emerald-800",
  "Monitor Closely": "border-teal-200 bg-teal-100 text-teal-800",
  "Already Priced In": "border-amber-200 bg-amber-100 text-amber-800",
  "Wait for Confirmation": "border-violet-200 bg-violet-100 text-violet-800",
  "Avoid for Now": "border-rose-200 bg-rose-100 text-rose-800"
};

function investorDecision(classification: string) {
  if (classification === "Early Alpha Opportunity") return "Act Early";
  if (classification === "Emerging ESG Improver") return "Monitor Closely";
  if (classification === "Already Recognised") return "Already Priced In";
  if (classification === "Innovation Watchlist") return "Wait for Confirmation";
  return "Avoid for Now";
}

export function CompanyComparison({ companies, onScanCompany }: CompanyComparisonProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [results, setResults] = useState<EsgScanResult[]>([]);

  function toggleCompany(companyId: string) {
    setSelectedIds((current) => {
      if (current.includes(companyId)) {
        return current.filter((id) => id !== companyId);
      }

      if (current.length >= 3) return current;
      return [...current, companyId];
    });
  }

  async function runComparison() {
    const selectedCompanies = companies.filter((company) =>
      selectedIds.includes(company.id)
    );

    if (selectedCompanies.length === 0) return;

    setIsComparing(true);
    setResults([]);

    try {
      const comparisonResults = await Promise.all(
        selectedCompanies.map((company) => onScanCompany(company, []))
      );
      setResults(comparisonResults);
    } finally {
      setIsComparing(false);
    }
  }

  return (
    <section className="glass-panel no-print rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#143b34] text-white">
            <BarChart3 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
              Comparison Mode
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#17211e]">
              Compare ESG Alpha Gap across companies
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#596662]">
              Select up to 3 companies and run the same live scan route for a
              compact investor comparison.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={runComparison}
          disabled={selectedIds.length === 0 || isComparing}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#143b34] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f2f29] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isComparing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
          Run Comparison Scan
        </button>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {companies.map((company) => {
          const selected = selectedIds.includes(company.id);

          return (
            <button
              key={company.id}
              type="button"
              onClick={() => toggleCompany(company.id)}
              className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition ${
                selected
                  ? "border-emerald-400 bg-emerald-50 text-[#143b34]"
                  : "border-white/65 bg-white/48 text-[#42534d] hover:bg-white/70"
              }`}
            >
              <span>
                <span className="block text-sm font-semibold">{company.name}</span>
                <span className="block text-xs text-[#65726e]">{company.ticker}</span>
              </span>
              {selected ? <Check className="h-4 w-4 text-emerald-700" /> : null}
            </button>
          );
        })}
      </div>

      {results.length > 0 ? (
        <motion.div
          className="mt-5 overflow-x-auto rounded-xl border border-white/65 bg-white/48"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-white/70 text-xs uppercase tracking-[0.12em] text-emerald-900/60">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Transformation</th>
                <th className="px-4 py-3">Recognition</th>
                <th className="px-4 py-3">Gap</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Alpha Window</th>
                <th className="px-4 py-3">Verdict</th>
                <th className="px-4 py-3">Decision</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => {
                const decision = investorDecision(result.classification);

                return (
                  <tr key={result.companyId} className="border-b border-white/50 last:border-0">
                    <td className="px-4 py-3 font-semibold text-[#17211e]">{result.companyName}</td>
                    <td className="px-4 py-3">{result.transformationStrength}/100</td>
                    <td className="px-4 py-3">{result.recognitionScore ?? 0}/100</td>
                    <td className="px-4 py-3">{result.recognitionGap ?? 0}</td>
                    <td className="px-4 py-3">{result.confidence}/100</td>
                    <td className="px-4 py-3">{result.alphaWindowMonths} mo</td>
                    <td className="px-4 py-3">{result.classification}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${decisionTone[decision]}`}>
                        {decision}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      ) : null}
    </section>
  );
}
