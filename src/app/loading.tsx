import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="glass-panel rounded-2xl p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#143b34] text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <p className="text-sm font-medium text-[#596662]">
          Loading ESG Alpha Gap...
        </p>
      </section>
    </main>
  );
}
