"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="glass-panel max-w-xl rounded-2xl p-6 text-center sm:p-8">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
          ESG Alpha Gap
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[#17211e]">
          The analyst terminal hit a temporary issue
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#596662]">
          Retry the experience. If it persists, the scan service may be warming
          up or a live data provider may be unavailable.
        </p>
        {process.env.NODE_ENV === "development" ? (
          <p className="mt-4 rounded-xl border border-white/70 bg-white/50 px-3 py-2 font-mono text-xs text-[#596662]">
            {error.message}
          </p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#143b34] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(20,59,52,0.2)] transition hover:bg-[#0f2f2a]"
        >
          <RotateCcw className="h-4 w-4" />
          Retry
        </button>
      </section>
    </main>
  );
}
