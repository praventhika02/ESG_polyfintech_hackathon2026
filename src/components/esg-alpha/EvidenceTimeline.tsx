"use client";

import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  ExternalLink,
  FileText,
  FlaskConical,
  Newspaper,
  Radio,
  Sparkles
} from "lucide-react";
import type { ExtractedSignal } from "@/types/esg";

type EvidenceTimelineProps = {
  events: ExtractedSignal[];
};

const sourceIcons = {
  Jobs: BriefcaseBusiness,
  News: Newspaper,
  Reports: FileText,
  Recognition: Radio,
  Filings: FileText,
  Policy: Sparkles,
  Patents: FlaskConical
};

const impactTone = {
  Positive: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Neutral: "bg-slate-100 text-slate-700 border-slate-200",
  Negative: "bg-rose-100 text-rose-800 border-rose-200"
};

const reliabilityTone = {
  High: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Medium: "bg-blue-100 text-blue-800 border-blue-200",
  Low: "bg-slate-100 text-slate-700 border-slate-200"
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
                {event.url ? (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-start gap-2 text-base font-semibold text-[#17211e] transition hover:text-emerald-800"
                  >
                    <span>{event.title}</span>
                    <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0" />
                  </a>
                ) : (
                  <h3 className="text-base font-semibold text-[#17211e]">
                    {event.title}
                  </h3>
                )}
                <p className="mt-1 text-sm leading-6 text-[#596662]">
                  {event.summary}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${impactTone[event.impact]}`}
                  >
                    {event.impact}
                  </span>
                  <span className="rounded-full border border-white/70 bg-white/58 px-2.5 py-1 text-xs font-medium text-[#596662]">
                    Signal score {event.signalScore}
                  </span>
                  {event.sourceType === "Patents" ? (
                    <span className="rounded-full border border-indigo-200 bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-800">
                      Live search
                    </span>
                  ) : null}
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${reliabilityTone[event.sourceReliability]}`}
                  >
                    Reliability: {event.sourceReliability}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
