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
            Verified PDF disclosure signals used in the scan.
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#596662]">
            This MVP extracts ESG themes from verified PDF filenames and
            disclosure cues. Full document text parsing can be connected as the
            next module.
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
                    {report.fileName}
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

      <div className="grid gap-3 lg:grid-cols-2">
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

            <div className="mt-4 space-y-2">
              {finding.keyPhrases.slice(0, 3).map((phrase) => (
                <p key={phrase} className="text-sm leading-6 text-[#596662]">
                  {phrase}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
