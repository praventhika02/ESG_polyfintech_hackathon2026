"use client";

import { motion } from "framer-motion";
import {
  DatabaseZap,
  FileText,
  FlaskConical,
  BriefcaseBusiness,
  Newspaper,
  Search
} from "lucide-react";
import { TimeDisplay } from "@/components/esg-alpha/TimeDisplay";
import type { DataMode, ProviderUsed } from "@/types/esg";

type SignalSourcePanelProps = {
  providerUsed?: ProviderUsed;
  dataMode: DataMode;
  articlesFound?: number;
  patentSignalsFound?: number;
  jobSignalsFound?: number;
  reportSignalIncluded?: boolean;
  reportSignalsFound?: number;
  verifiedReportsFound?: number;
  mismatchedReportsFound?: number;
  queryUsed?: string;
  generatedAt: string;
};

const providerDisplay: Record<ProviderUsed, string> = {
  mixed_live: "Mixed live sources",
  google_news_rss: "Google News RSS",
  gdelt: "GDELT",
  patents_only: "Patent intelligence only",
  jobs_only: "Hiring intelligence only",
  report_only: "Uploaded report only",
  fallback: "Demo scenario"
};

const modeDisplay = {
  live: {
    label: "Live scan",
    tone: "border-teal-200 bg-teal-100 text-teal-800"
  },
  partial_live: {
    label: "Partial live scan",
    tone: "border-blue-200 bg-blue-100 text-blue-800"
  },
  fallback: {
    label: "Demo fallback",
    tone: "border-amber-200 bg-amber-100 text-amber-800"
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: 0.08 + index * 0.06 }
  })
};

function sourceStatus(active: boolean, activeLabel = "Active", inactiveLabel = "Unavailable") {
  return {
    label: active ? activeLabel : inactiveLabel,
    tone: active
      ? "border-emerald-200 bg-emerald-100 text-emerald-800"
      : "border-slate-200 bg-slate-100 text-slate-600"
  };
}

function sourceMix({
  articlesFound,
  patentSignalsFound,
  jobSignalsFound,
  reportSignalsFound
}: {
  articlesFound: number;
  patentSignalsFound: number;
  jobSignalsFound: number;
  reportSignalsFound: number;
}) {
  const segments = [
    {
      key: "News",
      value: articlesFound,
      className: "bg-gradient-to-r from-emerald-500 to-teal-500"
    },
    {
      key: "Patents",
      value: patentSignalsFound,
      className: "bg-gradient-to-r from-blue-500 to-cyan-500"
    },
    {
      key: "Jobs",
      value: jobSignalsFound,
      className: "bg-gradient-to-r from-violet-500 to-blue-500"
    },
    {
      key: "Report",
      value: reportSignalsFound,
      className: "bg-gradient-to-r from-amber-400 to-yellow-500"
    }
  ].filter((segment) => segment.value > 0);

  if (segments.length === 0) {
    return [
      {
        key: "Fallback",
        value: 1,
        className: "bg-slate-300"
      }
    ];
  }

  return segments;
}

export function SignalSourcePanel({
  providerUsed = "fallback",
  dataMode,
  articlesFound = 0,
  patentSignalsFound = 0,
  jobSignalsFound = 0,
  reportSignalIncluded = false,
  reportSignalsFound,
  verifiedReportsFound,
  mismatchedReportsFound = 0,
  queryUsed,
  generatedAt
}: SignalSourcePanelProps) {
  const reportCount = verifiedReportsFound ?? reportSignalsFound ?? (reportSignalIncluded ? 1 : 0);
  const mode = modeDisplay[dataMode];
  const newsStatus = sourceStatus(articlesFound > 0);
  const patentStatus = sourceStatus(patentSignalsFound > 0);
  const jobStatus = sourceStatus(jobSignalsFound > 0);
  const reportStatus = sourceStatus(
    reportCount > 0,
    mismatchedReportsFound > 0 ? "Verified + mismatch" : "Verified",
    mismatchedReportsFound > 0 ? "Mismatch" : "Optional"
  );
  const sources = [
    {
      title: "News Intelligence",
      count: articlesFound,
      label: "Live ESG news articles",
      icon: Newspaper,
      status: newsStatus,
      accent: "text-emerald-700"
    },
    {
      title: "Patent Intelligence",
      count: patentSignalsFound,
      label: "Patent innovation queries",
      icon: FlaskConical,
      status: patentStatus,
      accent: "text-blue-700"
    },
    {
      title: "Hiring Intelligence",
      count: jobSignalsFound,
      label: "ESG hiring queries",
      icon: BriefcaseBusiness,
      status: jobStatus,
      accent: "text-violet-700"
    },
    {
      title: "Report Signal",
      count: reportCount,
      label:
        mismatchedReportsFound > 0
          ? `${mismatchedReportsFound} mismatched`
          : "Verified report signals",
      icon: FileText,
      status: reportStatus,
      accent: "text-amber-700"
    }
  ];
  const mixSegments = sourceMix({
    articlesFound,
    patentSignalsFound,
    jobSignalsFound,
    reportSignalsFound: reportCount
  });
  const mixTotal = mixSegments.reduce((total, segment) => total + segment.value, 0);

  return (
    <motion.section
      className="glass-panel rounded-2xl p-5 sm:p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
            Signal Source Intelligence
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-[#17211e]">
            Live evidence layers used to estimate the alpha window.
          </h2>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${mode.tone}`}
        >
          <DatabaseZap className="h-4 w-4" />
          {mode.label}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {sources.map((source, index) => {
          const Icon = source.icon;

          return (
            <motion.div
              key={source.title}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="rounded-xl border border-white/65 bg-white/48 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70">
                  <Icon className={`h-5 w-5 ${source.accent}`} />
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${source.status.tone}`}
                >
                  {source.status.label}
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold text-[#42534d]">
                {source.title}
              </p>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-3xl font-semibold text-[#17211e]">
                  {source.count}
                </span>
                <span className="pb-1 text-sm text-[#65726e]">
                  {source.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-white/65 bg-white/40 p-4">
        <div className="mb-3 flex flex-col gap-2 text-sm text-[#42534d] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/70 bg-white/60 px-3 py-1.5 font-medium">
              Evidence provider: {providerDisplay[providerUsed]}
            </span>
            <span className="rounded-full border border-white/70 bg-white/60 px-3 py-1.5 font-medium">
              Scan mode: {mode.label.replace(" scan", "")}
            </span>
          </div>
          <span className="font-medium text-[#596662]">
            Generated at <TimeDisplay value={generatedAt} />
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-200/80">
          <div className="flex h-full w-full">
            {mixSegments.map((segment) => (
              <div
                key={segment.key}
                className={segment.className}
                style={{ width: `${(segment.value / mixTotal) * 100}%` }}
                title={segment.key}
              />
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-100 bg-white/64 px-3 py-1.5 text-sm font-medium text-[#42534d]">
            <Search className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
            <span className="shrink-0">Query:</span>
            <span className="truncate">{queryUsed ?? "No live query used"}</span>
          </span>
        </div>

        {process.env.NODE_ENV === "development" ? (
          <details className="mt-4 text-xs text-[#596662]">
            <summary className="cursor-pointer font-semibold text-[#42534d]">
              Developer details
            </summary>
            <div className="mt-2 grid gap-2 rounded-xl bg-white/45 p-3 font-mono sm:grid-cols-2 lg:grid-cols-3">
              <span>providerUsed: {providerUsed}</span>
              <span>dataMode: {dataMode}</span>
              <span>articlesFound: {articlesFound}</span>
              <span>patentSignalsFound: {patentSignalsFound}</span>
              <span>jobSignalsFound: {jobSignalsFound}</span>
              <span>
                reportSignalIncluded: {reportSignalIncluded ? "true" : "false"}
              </span>
              <span>reportSignalsFound: {reportCount}</span>
              <span>mismatchedReportsFound: {mismatchedReportsFound}</span>
              <span className="truncate">queryUsed: {queryUsed ?? "n/a"}</span>
            </div>
          </details>
        ) : null}
      </div>
    </motion.section>
  );
}
