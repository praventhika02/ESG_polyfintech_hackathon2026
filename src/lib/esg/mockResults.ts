import type { CompanyId } from "./mockCompanies";

export type MarketRecognition = "Low" | "Medium" | "High";

export type Classification =
  | "Early Alpha Opportunity"
  | "Emerging ESG Improver"
  | "Already Recognised"
  | "Watchlist";

export type EvidenceEvent = {
  date: string;
  sourceType: "Jobs" | "News" | "Report" | "Recognition" | "Filings" | "Policy";
  title: string;
  impact: string;
};

export type MockResult = {
  companyId: CompanyId;
  transformationStrength: number;
  marketRecognition: MarketRecognition;
  confidence: number;
  alphaWindowMonths: number;
  classification: Classification;
  investorAction: string;
  whyNow: string[];
  evidenceTimeline: EvidenceEvent[];
};

export const mockResults: Record<CompanyId, MockResult> = {
  dbs: {
    companyId: "dbs",
    transformationStrength: 82,
    marketRecognition: "High",
    confidence: 88,
    alphaWindowMonths: 4,
    classification: "Already Recognised",
    investorAction:
      "Transformation indicators are strong, but market attention is already elevated. Monitor for valuation discipline and new transition-finance catalysts.",
    whyNow: [
      "Sustainable finance language is more measurable across recent disclosures.",
      "Hiring patterns point to climate risk analytics and transition banking capacity.",
      "Investor coverage already reflects the bank's regional ESG leadership."
    ],
    evidenceTimeline: [
      {
        date: "Jan 2026",
        sourceType: "Report",
        title: "Transition finance metrics expanded",
        impact: "Disclosure specificity improved across financed-emissions categories."
      },
      {
        date: "Feb 2026",
        sourceType: "Jobs",
        title: "Climate analytics roles detected",
        impact: "Operational investment supports stronger ESG execution."
      },
      {
        date: "Apr 2026",
        sourceType: "News",
        title: "Regional green finance mandate referenced",
        impact: "Public catalyst reinforces existing market recognition."
      },
      {
        date: "Jun 2026",
        sourceType: "Recognition",
        title: "Analyst coverage remains broad",
        impact: "Alpha window is compressed by high visibility."
      }
    ]
  },
  ocbc: {
    companyId: "ocbc",
    transformationStrength: 76,
    marketRecognition: "Medium",
    confidence: 84,
    alphaWindowMonths: 7,
    classification: "Emerging ESG Improver",
    investorAction:
      "Signals suggest improving ESG execution with partial recognition. Watch for proof points that convert sustainable lending ambition into measurable outcomes.",
    whyNow: [
      "Green lending references are becoming more outcome-oriented.",
      "Internal capability signals show deeper climate and data governance hiring.",
      "Coverage intensity is moderate relative to the quality of recent signals."
    ],
    evidenceTimeline: [
      {
        date: "Jan 2026",
        sourceType: "Jobs",
        title: "ESG risk data roles increased",
        impact: "Capability build-out improves confidence in execution."
      },
      {
        date: "Mar 2026",
        sourceType: "Report",
        title: "Financed-emissions targets clarified",
        impact: "More specific targets raise transformation strength."
      },
      {
        date: "May 2026",
        sourceType: "Policy",
        title: "Client transition framework updated",
        impact: "Policy signal supports sustainable lending strategy."
      },
      {
        date: "Jun 2026",
        sourceType: "Recognition",
        title: "Recognition remains selective",
        impact: "Moderate market attention leaves room for rerating."
      }
    ]
  },
  uob: {
    companyId: "uob",
    transformationStrength: 79,
    marketRecognition: "Medium",
    confidence: 86,
    alphaWindowMonths: 8,
    classification: "Emerging ESG Improver",
    investorAction:
      "ASEAN transition-finance signals are strengthening faster than broad recognition. A measured accumulation thesis may be forming.",
    whyNow: [
      "ASEAN sustainability lending themes are appearing across multiple channels.",
      "Disclosure language is shifting from aspiration to sector-specific plans.",
      "Market recognition is present but not saturated."
    ],
    evidenceTimeline: [
      {
        date: "Feb 2026",
        sourceType: "News",
        title: "ASEAN transition finance activity surfaced",
        impact: "Regional catalyst aligns with bank strategy."
      },
      {
        date: "Mar 2026",
        sourceType: "Jobs",
        title: "Sustainable banking hiring detected",
        impact: "Talent signal supports execution durability."
      },
      {
        date: "Apr 2026",
        sourceType: "Report",
        title: "Sector transition plans referenced",
        impact: "Specificity strengthens transformation score."
      },
      {
        date: "Jun 2026",
        sourceType: "Recognition",
        title: "Coverage remains balanced",
        impact: "Market lag suggests an actionable window."
      }
    ]
  },
  singtel: {
    companyId: "singtel",
    transformationStrength: 73,
    marketRecognition: "Low",
    confidence: 80,
    alphaWindowMonths: 10,
    classification: "Watchlist",
    investorAction:
      "Early operating signals are constructive, but confidence needs broader confirmation. Track network efficiency and data-centre decarbonisation disclosures.",
    whyNow: [
      "Energy efficiency signals are appearing around network operations.",
      "Digital infrastructure decarbonisation language is becoming more explicit.",
      "Market recognition appears limited relative to operating leverage."
    ],
    evidenceTimeline: [
      {
        date: "Jan 2026",
        sourceType: "Jobs",
        title: "Network energy optimisation roles detected",
        impact: "Operational ESG improvement may be underway."
      },
      {
        date: "Mar 2026",
        sourceType: "Report",
        title: "Scope 2 reduction language strengthened",
        impact: "Disclosure quality improved, but detail remains developing."
      },
      {
        date: "May 2026",
        sourceType: "News",
        title: "Data-centre efficiency references increased",
        impact: "Potential catalyst for future recognition."
      },
      {
        date: "Jun 2026",
        sourceType: "Recognition",
        title: "ESG coverage remains light",
        impact: "Low recognition keeps the watchlist attractive."
      }
    ]
  },
  keppel: {
    companyId: "keppel",
    transformationStrength: 85,
    marketRecognition: "Medium",
    confidence: 89,
    alphaWindowMonths: 8,
    classification: "Early Alpha Opportunity",
    investorAction:
      "Sustainable infrastructure signals are accelerating while recognition remains incomplete. This supports a near-term alpha window for ESG-aware investors.",
    whyNow: [
      "Clean infrastructure references are increasing across strategic updates.",
      "Capital recycling signals suggest stronger alignment with sustainability themes.",
      "Market coverage has not fully priced the speed of portfolio transition."
    ],
    evidenceTimeline: [
      {
        date: "Feb 2026",
        sourceType: "News",
        title: "Sustainable infrastructure pipeline highlighted",
        impact: "Growth catalyst lifts transformation strength."
      },
      {
        date: "Mar 2026",
        sourceType: "Filings",
        title: "Portfolio transition language tightened",
        impact: "Evidence supports strategic repositioning."
      },
      {
        date: "Apr 2026",
        sourceType: "Jobs",
        title: "Low-carbon asset management roles detected",
        impact: "Capability signal improves confidence."
      },
      {
        date: "Jun 2026",
        sourceType: "Recognition",
        title: "Recognition remains medium",
        impact: "Gap remains actionable."
      }
    ]
  },
  capitaland: {
    companyId: "capitaland",
    transformationStrength: 78,
    marketRecognition: "Medium",
    confidence: 83,
    alphaWindowMonths: 6,
    classification: "Emerging ESG Improver",
    investorAction:
      "Low-carbon real estate signals are credible, with a moderate window if execution metrics keep improving.",
    whyNow: [
      "Green building performance language is becoming more quantified.",
      "Asset-level decarbonisation initiatives are surfacing more often.",
      "Recognition is meaningful but not yet universal."
    ],
    evidenceTimeline: [
      {
        date: "Jan 2026",
        sourceType: "Report",
        title: "Building efficiency targets expanded",
        impact: "More measurable commitments lift confidence."
      },
      {
        date: "Mar 2026",
        sourceType: "News",
        title: "Green retrofit programme mentioned",
        impact: "Operational catalyst supports transformation."
      },
      {
        date: "May 2026",
        sourceType: "Jobs",
        title: "Sustainable asset roles detected",
        impact: "Hiring signal reinforces implementation."
      },
      {
        date: "Jun 2026",
        sourceType: "Recognition",
        title: "Recognition remains moderate",
        impact: "Selective market attention preserves some upside."
      }
    ]
  },
  wilmar: {
    companyId: "wilmar",
    transformationStrength: 70,
    marketRecognition: "Low",
    confidence: 76,
    alphaWindowMonths: 11,
    classification: "Watchlist",
    investorAction:
      "Supply-chain ESG signals are improving from a lower base. Maintain watchlist status until independent evidence strengthens.",
    whyNow: [
      "Traceability and supplier governance signals are increasing.",
      "Language around deforestation risk is more specific than prior periods.",
      "Low recognition creates upside only if confidence improves."
    ],
    evidenceTimeline: [
      {
        date: "Feb 2026",
        sourceType: "Policy",
        title: "Supplier monitoring language expanded",
        impact: "Governance signal improved from a lower base."
      },
      {
        date: "Mar 2026",
        sourceType: "Report",
        title: "Traceability metrics referenced",
        impact: "More specific reporting raises transformation score."
      },
      {
        date: "May 2026",
        sourceType: "News",
        title: "Sustainable sourcing update detected",
        impact: "Potential catalyst requires confirmation."
      },
      {
        date: "Jun 2026",
        sourceType: "Recognition",
        title: "Recognition remains low",
        impact: "Large gap, but signal confidence is still developing."
      }
    ]
  },
  sembcorp: {
    companyId: "sembcorp",
    transformationStrength: 88,
    marketRecognition: "Medium",
    confidence: 91,
    alphaWindowMonths: 9,
    classification: "Early Alpha Opportunity",
    investorAction:
      "Strong ESG transformation signals are visible, but recognition appears incomplete. This may indicate an early-entry window.",
    whyNow: [
      "Sustainability-related hiring signals are increasing.",
      "Recent renewable energy expansion news detected.",
      "ESG language has become more specific and target-driven."
    ],
    evidenceTimeline: [
      {
        date: "Jan 2026",
        sourceType: "Jobs",
        title: "Sustainability and renewable operations roles detected",
        impact: "Hiring momentum supports execution confidence."
      },
      {
        date: "Mar 2026",
        sourceType: "News",
        title: "Renewable energy project expansion mentioned",
        impact: "Growth catalyst strengthens transformation score."
      },
      {
        date: "Apr 2026",
        sourceType: "Report",
        title: "Stronger decarbonisation target language detected",
        impact: "Target specificity raises multi-source confidence."
      },
      {
        date: "Jun 2026",
        sourceType: "Recognition",
        title: "Market coverage remains moderate",
        impact: "Recognition gap leaves a 9-month alpha window."
      }
    ]
  }
};
