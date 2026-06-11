"use client";

import { motion } from "framer-motion";
import { BriefcaseBusiness, FileText, Newspaper, Radio, Sparkles } from "lucide-react";
import type { EvidenceEvent } from "@/lib/esg/mockResults";

type EvidenceTimelineProps = {
  events: EvidenceEvent[];
};

const sourceIcons = {
  Jobs: BriefcaseBusiness,
  News: Newspaper,
  Report: FileText,
  Recognition: Radio,
  Filings: FileText,
  Policy: Sparkles
};

export function EvidenceTimeline({ events }: EvidenceTimelineProps) {
  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
          Evidence Timeline
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-[#17211e]">
          Why the signal is appearing now
        </h2>
      </div>

      <div className="space-y-3">
        {events.map((event, index) => {
          const Icon = sourceIcons[event.sourceType];

          return (
            <motion.div
              key={`${event.date}-${event.title}`}
              className="relative grid gap-3 rounded-xl border border-white/65 bg-white/46 p-4 sm:grid-cols-[8rem_1fr]"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.38, delay: index * 0.08 }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#143b34] text-white">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#17211e]">
                    {event.date}
                  </p>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-800/70">
                    {event.sourceType}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#17211e]">
                  {event.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#596662]">
                  {event.impact}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
