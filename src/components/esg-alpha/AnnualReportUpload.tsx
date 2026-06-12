"use client";

import { FileText, Upload } from "lucide-react";

type AnnualReportUploadProps = {
  fileName: string | null;
  onFileNameChange: (fileName: string | null) => void;
};

export function AnnualReportUpload({
  fileName,
  onFileNameChange
}: AnnualReportUploadProps) {
  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#143b34] text-white">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
              Optional report signal
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#17211e]">
              Upload sustainability / annual report PDF
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#596662]">
              Upload a company report to strengthen transformation evidence.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-900/10 bg-white/58 px-4 py-2 text-sm font-semibold text-[#143b34] shadow-sm transition hover:border-emerald-500/40 hover:bg-white/76">
            <Upload className="h-4 w-4" />
            Choose PDF
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={(event) => {
                onFileNameChange(event.target.files?.[0]?.name ?? null);
              }}
            />
          </label>
          {fileName ? (
            <button
              type="button"
              onClick={() => onFileNameChange(null)}
              className="min-h-12 rounded-xl border border-white/70 bg-white/42 px-4 py-2 text-left text-sm font-medium text-[#596662] transition hover:bg-white/70"
              title={fileName}
            >
              {fileName}
            </button>
          ) : (
            <span className="text-sm text-[#697772]">No report selected</span>
          )}
        </div>
      </div>
    </section>
  );
}
