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
import { useState } from "react";
import type { EvidenceSourceType, ExtractedSignal } from "@/types/esg";

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

const reliabilityTone = {
  High: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Medium: "bg-blue-100 text-blue-800 border-blue-200",
  Low: "bg-slate-100 text-slate-700 border-slate-200"
};

const groupOrder: EvidenceSourceType[] = ["Jobs", "Patents", "News", "Reports"];

const groupTitles: Partial<Record<EvidenceSourceType, string>> = {
  Jobs: "Hiring Signals",
  Patents: "Patent Signals",
  News: "News Signals",
  Reports: "Report Signals"
};

function conciseSummary(event: ExtractedSignal) {
  if (event.sourceType === "Jobs") {
    return "Monitors ESG-related hiring intent through live job search queries.";
  }

  if (event.sourceType === "Patents") {
    return "Tracks ESG innovation themes through live patent search queries.";
  }

  if (event.sourceType === "Reports") {
    return "Uploaded company disclosure included as supporting evidence.";
  }

  if (event.source === "Demo fallback") {
    return "Demo scenario used when live evidence is unavailable.";
  }

  return "Public news signal contributing to market recognition and transformation strength.";
}

function groupEvents(events: ExtractedSignal[]) {
  return groupOrder
    .map((sourceType) => ({
      sourceType,
      title: groupTitles[sourceType] ?? sourceType,
      events: events.filter((event) => event.sourceType === sourceType)
    }))
    .filter((group) => group.events.length > 0);
}

export function EvidenceTimeline({ events }: EvidenceTimelineProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const groups = groupEvents(events);

  return (
    <section id="evidence" className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
          Evidence used in this scan
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-[#17211e]">
          Live signals supporting the transformation and recognition assessment.
        </h2>
      </div>

      <div className="space-y-5">
        {groups.map((group, groupIndex) => {
          const Icon = sourceIcons[group.sourceType];
          const isExpanded = expandedGroups[group.sourceType] ?? false;
          const visibleEvents = isExpanded ? group.events : group.events.slice(0, 2);

          return (
            <motion.div
              key={group.sourceType}
              className="rounded-xl border border-white/65 bg-white/38 p-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: groupIndex * 0.06 }}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#143b34] text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#17211e]">
                      {group.title}
                    </h3>
                    <p className="text-sm text-[#65726e]">
                      {group.events.length} signal
                      {group.events.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                {visibleEvents.map((event, index) => (
                  <motion.div
                    key={`${event.sourceType}-${event.title}-${index}`}
                    className="rounded-xl border border-white/70 bg-white/50 p-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {event.url ? (
                          <a
                            href={event.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-start gap-2 font-semibold text-[#17211e] transition hover:text-emerald-800"
                          >
                            <span>{event.title}</span>
                            <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0" />
                          </a>
                        ) : (
                          <h4 className="font-semibold text-[#17211e]">
                            {event.title}
                          </h4>
                        )}
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#596662]">
                          {conciseSummary(event)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${reliabilityTone[event.sourceReliability]}`}
                      >
                        Reliability: {event.sourceReliability}
                      </span>
                      <span className="rounded-full border border-white/70 bg-white/58 px-2.5 py-1 text-xs font-medium text-[#596662]">
                        Signal score {event.signalScore}
                      </span>
                      <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                        {event.source}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {group.events.length > 2 ? (
                <button
                  type="button"
                  onClick={() =>
                    setExpandedGroups((current) => ({
                      ...current,
                      [group.sourceType]: !isExpanded
                    }))
                  }
                  className="mt-3 rounded-full border border-emerald-100 bg-white/58 px-3 py-1.5 text-sm font-semibold text-[#143b34] transition hover:bg-white/80"
                >
                  {isExpanded ? "Show less evidence" : "View more evidence"}
                </button>
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
