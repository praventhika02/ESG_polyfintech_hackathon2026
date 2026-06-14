"use client";

import { motion } from "framer-motion";
import { CheckCircle2, FileSearch, ShieldAlert } from "lucide-react";
import type { ReportFinding, ReportVerification } from "@/types/esg";

type ReportFindingsPanelProps = {
  findings?: ReportFinding[];
  verifications?: ReportVerification[];
};

const confidenceTone = {
  Low: "border-amber-200 bg-amber-100 text-amber-800",
  Medium: "border-blue-200 bg-blue-100 text-blue-800",
  High: "border-emerald-200 bg-emerald-100 text-emerald-800"
};

export function ReportFindingsPanel({
  findings = [],
  verifications = []
}: ReportFindingsPanelProps) {
  const mismatches = verifications.filter((report) => report.status === "mismatch");
  const themes = Array.from(new Set(findings.flatMap((finding) => finding.themesDetected)));

  if (findings.length === 0 && mismatches.length === 0) return null;

  return (
    <motion.section
      className="glass-panel print-keep rounded-2xl p-5 sm:p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mb-5 flex gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#143b34] text-white">
          <FileSearch className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
            Report Findings
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-[#17211e]">
            Report impact on this scan.
          </h2>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/65 bg-white/48 p-4">
          <p className="text-sm font-semibold text-[#17211e]">Verified reports</p>
          <p className="mt-1 text-3xl font-semibold text-emerald-800">{findings.length}</p>
        </div>
        <div className="rounded-xl border border-white/65 bg-white/48 p-4">
          <p className="text-sm font-semibold text-[#17211e]">Mismatches</p>
          <p className="mt-1 text-3xl font-semibold text-rose-700">{mismatches.length}</p>
        </div>
        <div className="rounded-xl border border-white/65 bg-white/48 p-4">
          <p className="text-sm font-semibold text-[#17211e]">Confidence impact</p>
          <p className="mt-2 text-sm font-semibold text-[#596662]">
            {findings.length > 0
              ? "Verified disclosure evidence strengthened confidence."
              : "No report boost applied."}
          </p>
        </div>
      </div>

      {mismatches.length > 0 ? (
        <div className="mb-4 grid gap-3">
          {mismatches.map((report) => (
            <div
              key={report.fileName}
              className="rounded-xl border border-rose-100 bg-rose-50/80 p-3"
            >
              <div className="flex gap-2">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" />
                <div>
                  <p className="text-sm font-semibold text-rose-900">
                    Mismatch excluded from score: {report.fileName}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-rose-800">
                    {report.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="rounded-xl border border-white/65 bg-white/42 p-4">
        <p className="text-sm font-semibold text-[#17211e]">Themes detected</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {themes.length > 0 ? (
            themes.map((theme) => (
              <span
                key={theme}
                className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"
              >
                {theme}
              </span>
            ))
          ) : (
            <span className="text-sm text-[#596662]">No verified themes detected.</span>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {findings.map((finding) => (
          <div
            key={finding.fileName}
            className="rounded-xl border border-white/65 bg-white/48 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                  <h3 className="font-semibold text-[#17211e]">
                    {finding.fileName}
                  </h3>
                </div>
                <p className="mt-1 text-sm text-[#65726e]">Verified report</p>
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${confidenceTone[finding.reportConfidence]}`}
              >
                {finding.reportConfidence} confidence
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {finding.themesDetected.length > 0 ? (
                finding.themesDetected.map((theme) => (
                  <span
                    key={theme}
                    className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"
                  >
                    {theme}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  No explicit ESG theme in filename
                </span>
              )}
            </div>

            <p className="mt-3 text-sm font-semibold text-[#596662]">
              {finding.themesDetected.length > 0
                ? "Verified disclosure evidence included in score."
                : "Verified report included; no explicit ESG filename theme detected."}
            </p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
