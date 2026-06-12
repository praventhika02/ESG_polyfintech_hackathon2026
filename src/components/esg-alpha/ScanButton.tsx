"use client";

import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

type ScanButtonProps = {
  isScanning: boolean;
  onRunScan: () => void;
};

export function ScanButton({ isScanning, onRunScan }: ScanButtonProps) {
  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
      <motion.button
        type="button"
        onClick={onRunScan}
        disabled={isScanning}
        className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#143b34] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(20,59,52,0.25)] transition hover:bg-[#0f2f2a] disabled:cursor-not-allowed disabled:opacity-80"
        whileHover={isScanning ? undefined : { y: -2 }}
        whileTap={isScanning ? undefined : { scale: 0.98 }}
      >
        {isScanning ? (
          <Loader2 className="h-5 w-5 animate-spin text-emerald-200" />
        ) : (
          <Sparkles className="h-5 w-5 text-amber-200" />
        )}
        {isScanning ? "Running ESG Alpha Scan" : "Run Live ESG Alpha Scan"}
      </motion.button>
      <p className="max-w-2xl text-sm leading-6 text-[#596662]">
        Live scan uses real ESG news signals with fallback protection for demo
        reliability. Additional sources such as reports, patents, and jobs are
        modularly connected.
      </p>
    </div>
  );
}
