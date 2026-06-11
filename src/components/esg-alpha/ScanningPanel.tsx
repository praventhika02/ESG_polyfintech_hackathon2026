"use client";

import { motion } from "framer-motion";
import { ScanLine } from "lucide-react";
import type { MockCompany } from "@/lib/esg/mockCompanies";

type ScanningPanelProps = {
  company: MockCompany;
};

const scanSteps = [
  "Parsing transition language",
  "Cross-checking evidence sources",
  "Measuring recognition lag",
  "Estimating alpha window"
];

export function ScanningPanel({ company }: ScanningPanelProps) {
  return (
    <motion.section
      className="glass-panel overflow-hidden rounded-2xl p-5 sm:p-6"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
    >
      <div className="relative rounded-xl border border-emerald-900/10 bg-[#10231f] p-5 text-white">
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-emerald-300/22 to-transparent"
          animate={{ y: [0, 210, 0] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-emerald-100">
              <ScanLine className="h-4 w-4 text-emerald-300" />
              Live ESG Alpha Scan
            </div>
            <h2 className="text-2xl font-semibold">{company.name}</h2>
            <p className="mt-2 text-sm text-emerald-50/70">
              Signal theme: {company.signalTheme}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {scanSteps.map((step, index) => (
              <motion.div
                key={step}
                className="rounded-lg border border-white/10 bg-white/[0.055] px-4 py-3 font-mono text-xs text-emerald-50/80"
                animate={{ opacity: [0.45, 1, 0.45] }}
                transition={{
                  duration: 1.15,
                  delay: index * 0.18,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {step}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
