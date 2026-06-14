"use client";

import { ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import type { EvidenceSourceType, ExtractedSignal } from "@/types/esg";

type EvidenceBrowserProps = {
  events: ExtractedSignal[];
};

const filters: Array<"All" | EvidenceSourceType> = [
  "All",
  "News",
  "Jobs",
  "Patents",
  "Reports"
];

function explanation(event: ExtractedSignal) {
  if (event.sourceType === "Patents") return "Monitors ESG innovation themes.";
  if (event.sourceType === "Jobs") return "Monitors ESG hiring intent.";
  if (event.sourceType === "Reports") return "Verified disclosure evidence.";
  if (event.source === "Demo fallback") return "Demo scenario fallback evidence.";
  return "Public signal used for recognition and transformation scoring.";
}

export function EvidenceBrowser({ events }: EvidenceBrowserProps) {
  const [filter, setFilter] = useState<"All" | EvidenceSourceType>("All");
  const [visibleCount, setVisibleCount] = useState(6);
  const filtered = useMemo(
    () =>
      filter === "All"
        ? events
        : events.filter((event) => event.sourceType === filter),
    [events, filter]
  );
  const visible = filtered.slice(0, visibleCount);

  function countFor(sourceType: "All" | EvidenceSourceType) {
    if (sourceType === "All") return events.length;
    return events.filter((event) => event.sourceType === sourceType).length;
  }

  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
            Evidence Browser
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            Signals used in this scan.
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setFilter(item);
                setVisibleCount(6);
              }}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                filter === item
                  ? "border-mint/40 bg-mint/15 text-mint"
                  : "border-white/10 bg-white/5 text-muted hover:bg-white/10"
              }`}
            >
              {item} {countFor(item)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((event, index) => (
          <article
            key={`${event.sourceType}-${event.title}-${index}`}
            className="rounded-xl border border-white/10 bg-white/[0.045] p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="rounded-full border border-mint/20 bg-mint/10 px-2.5 py-1 text-xs font-semibold text-mint">
                {event.sourceType}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-muted">
                {event.sourceReliability}
              </span>
            </div>
            {event.url ? (
              <a
                href={event.url}
                target="_blank"
                rel="noreferrer"
                className="line-clamp-2 inline-flex gap-2 text-sm font-semibold leading-6 text-foreground hover:text-mint"
              >
                {event.title}
                <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0" />
              </a>
            ) : (
              <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-foreground">
                {event.title}
              </h3>
            )}
            <p className="mt-2 text-sm leading-6 text-muted">{explanation(event)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-muted">
                {event.impact}
              </span>
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-muted">
                Score {event.signalScore}
              </span>
            </div>
          </article>
        ))}
      </div>

      {visibleCount < filtered.length ? (
        <button
          type="button"
          onClick={() => setVisibleCount((count) => count + 6)}
          className="mt-5 rounded-xl border border-mint/20 bg-mint/10 px-4 py-2 text-sm font-semibold text-mint transition hover:bg-mint/15"
        >
          Load more evidence
        </button>
      ) : null}
    </section>
  );
}
