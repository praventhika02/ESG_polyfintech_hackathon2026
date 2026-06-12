import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="glass-panel max-w-xl rounded-2xl p-6 text-center sm:p-8">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <Compass className="h-6 w-6" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
          ESG Alpha Gap
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[#17211e]">
          This signal path does not exist
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#596662]">
          Return to the main ESG Alpha Gap scan experience.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#143b34] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(20,59,52,0.2)] transition hover:bg-[#0f2f2a]"
        >
          Back to scanner
        </Link>
      </section>
    </main>
  );
}
