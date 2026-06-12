"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Target } from "lucide-react";
import type { EsgScanResult } from "@/types/esg";

type InvestorActionCardProps = {
  result: EsgScanResult;
};

export function InvestorActionCard({ result }: InvestorActionCardProps) {
  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          className="rounded-xl bg-[#143b34] p-5 text-white"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
        >
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/12">
            <Target className="h-5 w-5 text-amber-200" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/80">
            Investor action
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight">
            {result.classification}
          </h2>
          <p className="mt-4 text-sm leading-6 text-emerald-50/78">
            {result.investorAction}
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-emerald-50">
            {result.alphaWindowMonths}-month window
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </motion.div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
            Why now
          </p>
          <div className="mt-4 space-y-3">
            {result.whyNow.map((reason, index) => (
              <motion.div
                key={reason}
                className="flex gap-3 rounded-xl border border-white/65 bg-white/48 p-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <p className="text-sm leading-6 text-[#465651]">{reason}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
