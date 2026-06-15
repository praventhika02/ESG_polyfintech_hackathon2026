"use client";

import { AlertTriangle, Eye, Lightbulb, Radar, SignalHigh } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EsgScanResult } from "@/types/esg";

type InsightsViewProps = {
  result: EsgScanResult;
};

type Insight = {
  title: string;
  body: string;
  chip: string;
  icon: LucideIcon;
};

function strongestSignal(result: EsgScanResult): Insight {
  const breakdown = result.scoreBreakdown;
  const candidates = [
    { label: "News transformation", value: breakdown?.transformation.newsScore ?? 0, max: 40 },
    { label: "Verified reports", value: breakdown?.transformation.reportScore ?? 0, max: 15 },
    { label: "Hiring signals", value: breakdown?.transformation.hiringScore ?? 0, max: 10 },
    { label: "Patent signals", value: breakdown?.transformation.patentScore ?? 0, max: 10 }
  ];
  const strongest = [...candidates].sort((a, b) => b.value - a.value)[0];

  return {
    title: "Strongest Signal",
    body:
      strongest.label === "Verified reports"
        ? "Verified report evidence strengthens confidence."
        : `${strongest.label} is the strongest transformation contributor.`,
    chip: `${strongest.value}/${strongest.max}`,
    icon: SignalHigh
  };
}

function weakestSignal(result: EsgScanResult): Insight {
  const breakdown = result.scoreBreakdown;
  const candidates = [
    { label: "News transformation", value: breakdown?.transformation.newsScore ?? 0, max: 40 },
    { label: "Verified reports", value: breakdown?.transformation.reportScore ?? 0, max: 15 },
    { label: "Hiring signals", value: breakdown?.transformation.hiringScore ?? 0, max: 10 },
    { label: "Patent signals", value: breakdown?.transformation.patentScore ?? 0, max: 10 }
  ];
  const weakest = [...candidates].sort((a, b) => a.value - b.value)[0];

  return {
    title: "Weakest Signal",
    body:
      weakest.label === "Verified reports" && weakest.value === 0
        ? "No verified report evidence was included, limiting confidence."
        : `${weakest.label} contributes least to the current signal.`,
    chip: `${weakest.value}/${weakest.max}`,
    icon: Eye
  };
}

function contrarianInsight(result: EsgScanResult): Insight {
  const gap = result.recognitionGap ?? 0;
  const body =
    gap > 20
      ? "Transformation appears ahead of market recognition, suggesting possible hidden momentum."
      : gap >= 0
        ? "The signal is positive, but recognition is already catching up."
        : "Market recognition appears ahead of transformation, so the ESG story may be crowded.";

  return {
    title: "Contrarian Insight",
    body,
    chip: `Gap ${gap}`,
    icon: Lightbulb
  };
}

function keyRisk(result: EsgScanResult): Insight {
  const events = result.evidenceTimeline;
  const lowOrMedium = events.filter((event) => event.sourceReliability !== "High").length;
  const reports = result.verifiedReportsFound ?? result.reportSignalsFound ?? 0;
  const gap = result.recognitionGap ?? 0;
  const body =
    lowOrMedium > events.length / 2
      ? "Evidence quality risk: many signals come from medium or low reliability sources."
      : reports === 0
        ? "Disclosure risk: no verified company report confirmed the external signals."
        : (result.articlesFound ?? 0) >= 7 && gap < 0
          ? "Crowding risk: public visibility may be ahead of actual transformation."
          : "Main risk is whether external signals convert into durable disclosure evidence.";

  return {
    title: "Key Risk",
    body,
    chip: reports === 0 ? "No report" : `${lowOrMedium} medium/low`,
    icon: AlertTriangle
  };
}

function monitorNext(result: EsgScanResult): Insight {
  const reports = result.verifiedReportsFound ?? result.reportSignalsFound ?? 0;
  const gap = result.recognitionGap ?? 0;
  const body =
    reports === 0
      ? "Upload or wait for the next verified sustainability report."
      : gap < 10
        ? "Track whether transformation rises faster than recognition."
        : (result.patentSignalsFound ?? 0) > 0 || (result.jobSignalsFound ?? 0) > 0
          ? "Monitor whether hiring and innovation signals become official disclosures."
          : "Watch whether recognition converts into financial performance.";

  return {
    title: "What to Monitor Next",
    body,
    chip: `${result.alphaWindowMonths} mo`,
    icon: Radar
  };
}

export function InsightsView({ result }: InsightsViewProps) {
  const insights = [
    strongestSignal(result),
    weakestSignal(result),
    contrarianInsight(result),
    keyRisk(result),
    monitorNext(result)
  ];

  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
          AI Signal Insights
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">
          What the scan found beneath the headline score.
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {insights.map((insight) => {
          const Icon = insight.icon;

          return (
            <article
              key={insight.title}
              className="rounded-xl border border-white/10 bg-white/[0.045] p-4 transition hover:-translate-y-0.5 hover:bg-white/[0.075]"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint/10 text-mint">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-muted">
                  {insight.chip}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{insight.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
