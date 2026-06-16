"use client";

import { Download } from "lucide-react";
import { buildInvestmentSummary } from "@/components/esg-alpha/AiInvestmentSummary";
import type { EsgScanResult } from "@/types/esg";

type ExportReportActionsProps = {
  result: EsgScanResult;
};

function decisionLabel(classification: string) {
  if (classification === "Early Alpha Opportunity") return "Act Early";
  if (classification === "Emerging ESG Improver") return "Monitor Closely";
  if (classification === "Already Recognised") return "Already Priced In";
  if (classification === "Overrated ESG Story") return "Be Cautious";
  if (classification === "Innovation Watchlist") return "Wait for Confirmation";
  return "Avoid for Now";
}

function topEvidence(result: EsgScanResult) {
  return result.evidenceTimeline
    .slice(0, 5)
    .map(
      (event) =>
        `<li><strong>${event.sourceType}:</strong> ${event.title} <span>(${event.sourceReliability}, score ${event.signalScore})</span></li>`
    )
    .join("");
}

function exportDecisionReport(result: EsgScanResult) {
  const generatedAt = new Date(result.generatedAt).toLocaleString();
  const decision = decisionLabel(result.classification);
  const summary = buildInvestmentSummary(result);
  const html = `<!doctype html>
  <html>
    <head>
      <title>ESG Alpha Report - ${result.companyName}</title>
      <style>
        body { font-family: Arial, sans-serif; color: #17211e; padding: 32px; line-height: 1.5; }
        h1 { margin: 0 0 8px; font-size: 30px; }
        h2 { margin-top: 28px; font-size: 18px; color: #073b32; }
        .meta { color: #596662; margin-bottom: 24px; }
        .decision { background: #073b32; color: white; border-radius: 16px; padding: 22px; margin: 20px 0; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .metric { border: 1px solid #d9e2de; border-radius: 12px; padding: 12px; }
        .metric strong { display: block; font-size: 22px; margin-top: 4px; }
        li { margin-bottom: 8px; }
        .disclaimer { margin-top: 30px; padding: 12px; background: #f1f5f2; border-radius: 12px; font-size: 12px; color: #596662; }
      </style>
    </head>
    <body>
      <h1>ESG Alpha Gap Report: ${result.companyName}</h1>
      <p class="meta">Generated at ${generatedAt}</p>
      <section class="decision">
        <p>Decision</p>
        <h1>${decision}</h1>
        <p>${result.classification}</p>
      </section>
      <section class="grid">
        <div class="metric">Transformation<strong>${result.transformationStrength}/100</strong></div>
        <div class="metric">Recognition<strong>${result.recognitionScore ?? 0}/100</strong></div>
        <div class="metric">Recognition Gap<strong>${result.recognitionGap ?? 0}</strong></div>
        <div class="metric">Confidence<strong>${result.confidence}/100</strong></div>
        <div class="metric">Alpha Window<strong>${result.alphaWindowMonths} months</strong></div>
      </section>
      <h2>AI Investment Brief</h2>
      <p>${summary}</p>
      <h2>Next Steps</h2>
      <ul>
        <li>Validate the recognition gap against valuation and peer context.</li>
        <li>Review high-reliability evidence and verified report themes.</li>
        <li>Re-scan after new disclosures, major news, or hiring/patent changes.</li>
      </ul>
      <h2>Top Evidence</h2>
      <ul>${topEvidence(result)}</ul>
      <p class="disclaimer">This supports due diligence and is not investment advice. Verdicts are generated from live evidence layers and verified uploaded documents. No company-specific scoring bias is applied.</p>
      <script>window.print();</script>
    </body>
  </html>`;
  const reportWindow = window.open("", "_blank");
  reportWindow?.document.write(html);
  reportWindow?.document.close();
}

export function ExportReportActions({ result }: ExportReportActionsProps) {
  return (
    <div className="no-print flex justify-end">
      <button
        type="button"
        onClick={() => exportDecisionReport(result)}
        className="inline-flex items-center gap-2 rounded-xl bg-[#143b34] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f2f29]"
      >
        <Download className="h-4 w-4" />
        Download Report
      </button>
    </div>
  );
}
