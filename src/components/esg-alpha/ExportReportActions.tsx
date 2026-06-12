"use client";

import { Download } from "lucide-react";

export function ExportReportActions() {
  return (
    <div className="no-print flex justify-end">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-xl bg-[#143b34] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f2f29]"
      >
        <Download className="h-4 w-4" />
        Export ESG Alpha Report
      </button>
    </div>
  );
}
