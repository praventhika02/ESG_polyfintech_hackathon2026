"use client";

import { FileText, Upload, X } from "lucide-react";
import type { ReportVerification } from "@/types/esg";

type AnnualReportUploadProps = {
  fileNames: string[];
  reportVerifications?: ReportVerification[];
  onFileNamesChange: (fileNames: string[]) => void;
  selectedCompanyName: string;
};

export function AnnualReportUpload({
  fileNames,
  reportVerifications = [],
  onFileNamesChange,
  selectedCompanyName
}: AnnualReportUploadProps) {
  function addFiles(files: FileList | null) {
    if (!files) {
      return;
    }

    const nextNames = Array.from(files).map((file) => file.name);
    onFileNamesChange(Array.from(new Set([...fileNames, ...nextNames])));
  }

  function removeFile(fileName: string) {
    onFileNamesChange(fileNames.filter((name) => name !== fileName));
  }

  function verificationFor(fileName: string) {
    return reportVerifications.find((report) => report.fileName === fileName);
  }

  function badgeTone(status?: string) {
    if (status === "verified") {
      return "border-emerald-200 bg-emerald-100 text-emerald-800";
    }

    if (status === "mismatch") {
      return "border-rose-200 bg-rose-100 text-rose-800";
    }

    return "border-amber-200 bg-amber-100 text-amber-800";
  }

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
              Upload sustainability / annual report PDFs
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#596662]">
              Upload a company report to strengthen transformation evidence.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-900/10 bg-white/58 px-4 py-2 text-sm font-semibold text-[#143b34] shadow-sm transition hover:border-emerald-500/40 hover:bg-white/76">
            <Upload className="h-4 w-4" />
            Choose PDFs
            <input
              type="file"
              multiple
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
          {fileNames.length > 0 ? (
            <div className="flex max-w-xl flex-wrap items-center gap-2">
              {fileNames.map((fileName) => (
                <span key={fileName} className="flex max-w-full flex-col gap-1">
                  <span
                    className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/70 bg-white/58 px-3 py-1.5 text-sm font-medium text-[#42534d]"
                    title={fileName}
                  >
                    <span className="max-w-52 truncate">{fileName}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badgeTone(verificationFor(fileName)?.status)}`}
                    >
                      {verificationFor(fileName)?.status === "verified"
                        ? "Verified"
                        : verificationFor(fileName)?.status === "mismatch"
                        ? "Mismatch"
                        : "Needs review"}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(fileName)}
                      className="rounded-full p-0.5 text-[#697772] transition hover:bg-white/80 hover:text-[#143b34]"
                      aria-label={`Remove ${fileName}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                  {verificationFor(fileName)?.status === "mismatch" ? (
                    <span className="max-w-md rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-800">
                      Selected company is {selectedCompanyName}, but this file
                      does not appear to match company aliases. Please upload
                      the correct company report.
                    </span>
                  ) : null}
                </span>
              ))}
              {fileNames.length > 1 ? (
                <button
                  type="button"
                  onClick={() => onFileNamesChange([])}
                  className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
                >
                  Clear all
                </button>
              ) : null}
            </div>
          ) : (
            <span className="text-sm text-[#697772]">No reports selected</span>
          )}
        </div>
      </div>
    </section>
  );
}
