"use client";

import { motion } from "framer-motion";
import { Activity, BrainCircuit, Radar } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.62),rgba(225,241,236,0.46))] px-6 py-8 shadow-[0_28px_90px_rgba(35,46,42,0.12)] sm:px-9 sm:py-10">
      <div className="absolute inset-0 terminal-grid opacity-80" />
      <motion.div
        aria-hidden="true"
        className="absolute right-8 top-8 h-44 w-44 rounded-full border border-emerald-400/25"
        animate={{ scale: [1, 1.08, 1], opacity: [0.44, 0.78, 0.44] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute right-20 top-20 h-20 w-20 rounded-full border border-amber-400/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 grid gap-9 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/55 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-emerald-900/70">
            <Radar className="h-3.5 w-3.5 text-emerald-700" />
            PolyFinTech100 ESG & AI Prototype
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-normal text-[#17211e] sm:text-6xl lg:text-7xl">
            ESG Alpha Gap™
          </h1>
          <p className="mt-5 max-w-2xl text-xl font-medium text-[#285047] sm:text-2xl">
            Discover ESG transformation before the market prices it in.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#4c5b56] sm:text-lg">
            An AI-powered investment intelligence platform that detects early ESG
            transformation signals, measures market recognition lag, and identifies
            the investor action window.
          </p>
        </motion.div>

        <motion.div
          className="glass-panel rounded-2xl p-4"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12, ease: "easeOut" }}
        >
          <div className="rounded-xl border border-emerald-900/10 bg-[#10231f]/90 p-5 text-white shadow-inner">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-100">
                <BrainCircuit className="h-4 w-4 text-emerald-300" />
                AI analyst terminal
              </div>
              <span className="rounded-full bg-emerald-300/15 px-2.5 py-1 text-xs text-emerald-100">
                Live-ready
              </span>
            </div>
            <div className="space-y-3 font-mono text-xs text-emerald-50/80">
              {[
                "initialising multi-source ESG signal graph",
                "scanning jobs, reports, filings, recognition lag",
                "estimating alpha window and conviction score"
              ].map((line, index) => (
                <motion.div
                  key={line}
                  className="flex items-center gap-3 rounded-lg bg-white/[0.045] px-3 py-2"
                  initial={{ opacity: 0.45 }}
                  animate={{ opacity: [0.45, 1, 0.45] }}
                  transition={{
                    duration: 2.4,
                    delay: index * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Activity className="h-3.5 w-3.5 text-amber-200" />
                  <span>{line}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
