"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { CompanyId, MockCompany } from "@/lib/esg/mockCompanies";

type CompanySelectorProps = {
  companies: MockCompany[];
  selectedCompanyId: CompanyId;
  onSelect: (companyId: CompanyId) => void;
};

export function CompanySelector({
  companies,
  selectedCompanyId,
  onSelect
}: CompanySelectorProps) {
  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/60">
            Coverage universe
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-[#17211e]">
            Select a listed company
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-[#596662]">
          ASEAN and Singapore names selected for the ESG & AI category demo.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {companies.map((company, index) => {
          const Icon = company.icon;
          const isSelected = company.id === selectedCompanyId;

          return (
            <motion.button
              key={company.id}
              type="button"
              onClick={() => onSelect(company.id)}
              className={`group relative min-h-40 overflow-hidden rounded-xl border p-4 text-left transition duration-300 ${
                isSelected
                  ? "border-emerald-500/70 bg-emerald-50/80 shadow-[0_16px_44px_rgba(16,120,96,0.18)]"
                  : "border-white/65 bg-white/42 hover:border-emerald-500/40 hover:bg-white/64"
              }`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.045, duration: 0.42 }}
              whileHover={{ y: -3 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-900/10 bg-white/70 text-emerald-800">
                  <Icon className="h-5 w-5" />
                </div>
                {isSelected ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="h-4 w-4" />
                  </span>
                ) : null}
              </div>
              <div className="mt-5">
                <h3 className="text-base font-semibold text-[#17211e]">
                  {company.name}
                </h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-[#61706a]">
                  {company.ticker} / {company.sector}
                </p>
                <p className="mt-4 text-sm leading-5 text-[#50605a]">
                  Signal theme: {company.signalTheme}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
