"use client";

import { motion } from "framer-motion";
import { DatabaseZap, Gauge, Hourglass, LineChart, ShieldCheck } from "lucide-react";
import type { MockCompany } from "@/lib/esg/mockCompanies";
import type { EsgScanResult } from "@/types/esg";

type ResultSummaryProps = {
  company: MockCompany;
  result: EsgScanResult;
};

const recognitionTone = {
  Low: "bg-sky-100 text-sky-800 border-sky-200",
  Medium: "bg-amber-100 text-amber-800 border-amber-200",
  High: "bg-emerald-100 text-emerald-800 border-emerald-200"
};

const dataModeCopy = {
  live: {
    label: "Live data scan",
    tone: "border-teal-200 bg-teal-100 text-teal-800",
    message: "Gap score generated from live ESG signals."
  },
  partial_live: {
    label: "Partial live scan",
    tone: "border-blue-200 bg-blue-100 text-blue-800",
    message:
      "Gap score generated from available live patent/report signals; news coverage was unavailable."
  },
  fallback: {
    label: "Demo fallback",
    tone: "border-amber-200 bg-amber-100 text-amber-800",
    message: "Using demo fallback data because live signals are unavailable."
  }
};

export function ResultSummary({ company, result }: ResultSummaryProps) {
  const mode = dataModeCopy[result.dataMode];
  const metrics = [
    {
      label: "Transformation Strength",
      value: result.transformationStrength,
      suffix: "/100",
      icon: Gauge,
      bar: "from-emerald-500 to-teal-500"
    },
    {
      label: "Confidence",
      value: result.confidence,
      suffix: "/100",
      icon: ShieldCheck,
      bar: "from-blue-500 to-teal-500"
    },
    {
      label: "Alpha Window",
      value: result.alphaWindowMonths,
      suffix: " months",
      icon: Hourglass,
      bar: "from-amber-500 to-emerald-500"
    }
  ];

  return (
    <motion.section
      className="glass-panel rounded-2xl p-5 sm:p-6"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
            Alpha Window Insight
          </p>
          <h2 className="mt-1 text-3xl font-semibold text-[#17211e]">
            {company.name}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#143b34] px-3 py-1.5 text-sm font-medium text-white">
              {result.classification}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${
                mode.tone
              }`}
            >
              <DatabaseZap className="h-3.5 w-3.5" />
              {mode.label}
            </span>
            <span
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${recognitionTone[result.marketRecognition]}`}
            >
              Recognition: {result.marketRecognition}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/50 px-4 py-3 text-sm font-medium text-[#38524b]">
          <LineChart className="h-4 w-4 text-emerald-700" />
          {mode.message}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const width =
            metric.label === "Alpha Window"
              ? Math.min(100, Math.round((metric.value / 12) * 100))
              : metric.value;

          return (
            <motion.div
              key={metric.label}
              className="rounded-xl border border-white/65 bg-white/48 p-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.07 }}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#143b34] text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-3xl font-semibold text-[#17211e]">
                  {metric.value}
                  <span className="text-base font-medium text-[#65726e]">
                    {metric.suffix}
                  </span>
                </span>
              </div>
              <p className="text-sm font-medium text-[#4c5b56]">
                {metric.label}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#d4ded9]">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${metric.bar}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.8, delay: 0.15 + index * 0.08 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
