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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
              Secure document verification
            </p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">
              Upload ESG disclosure PDFs
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Verified company reports can strengthen confidence.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-mint/20 bg-mint/10 px-4 py-2 text-sm font-semibold text-mint shadow-sm transition hover:bg-mint/15">
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
                    className="inline-flex max-w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-sm font-medium text-foreground"
                    title={fileName}
                  >
                    <span className="max-w-52 truncate">{fileName}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badgeTone(verificationFor(fileName)?.status)}`}
                    >
                      {verificationFor(fileName)?.status === "verified"
                        ? "Verified for selected company"
                        : verificationFor(fileName)?.status === "mismatch"
                        ? "Mismatch - excluded"
                        : "Needs review"}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(fileName)}
                      className="rounded-full p-0.5 text-muted transition hover:bg-white/10 hover:text-mint"
                      aria-label={`Remove ${fileName}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                  {verificationFor(fileName)?.status === "mismatch" ? (
                    <span className="max-w-md rounded-xl border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-xs leading-5 text-rose-200">
                      Cross-company report mismatch excluded from scoring for {selectedCompanyName}.
                    </span>
                  ) : null}
                </span>
              ))}
              {fileNames.length > 1 ? (
                <button
                  type="button"
                  onClick={() => onFileNamesChange([])}
                  className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-sm font-semibold text-gold transition hover:bg-gold/15"
                >
                  Clear all
                </button>
              ) : null}
            </div>
          ) : (
            <span className="text-sm text-muted">No reports selected</span>
          )}
        </div>
      </div>
    </section>
  );
}
