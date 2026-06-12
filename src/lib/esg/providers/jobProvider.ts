export type JobSignal = {
  title: string;
  url: string;
  publishedAt: string;
  source: "Google Jobs Search";
  snippet: string;
  signalScore: number;
};

const jobQueries: Record<string, string[]> = {
  "Sembcorp Industries": [
    "Sembcorp sustainability manager",
    "Sembcorp renewable energy engineer",
    "Sembcorp carbon management"
  ],
  Singtel: [
    "Singtel sustainability manager",
    "Singtel green data centre",
    "Singtel energy efficiency"
  ],
  "Keppel Ltd": [
    "Keppel sustainability manager",
    "Keppel energy transition",
    "Keppel carbon capture"
  ],
  "CapitaLand Investment": [
    "CapitaLand sustainability manager",
    "CapitaLand green building",
    "CapitaLand energy efficiency"
  ],
  "Wilmar International": [
    "Wilmar sustainability manager",
    "Wilmar supply chain traceability",
    "Wilmar responsible sourcing"
  ],
  "DBS Group Holdings": [
    "DBS sustainable finance",
    "DBS climate risk analyst",
    "DBS ESG analyst"
  ],
  OCBC: [
    "OCBC sustainable finance",
    "OCBC ESG analyst",
    "OCBC climate risk"
  ],
  UOB: [
    "UOB sustainable finance",
    "UOB ESG analyst",
    "UOB green lending"
  ]
};

function buildGoogleJobsUrl(query: string) {
  const params = new URLSearchParams({
    q: `${query} jobs Singapore`
  });

  return `https://www.google.com/search?${params.toString()}`;
}

export async function getJobSignals(companyName: string): Promise<JobSignal[]> {
  const queries = jobQueries[companyName];

  if (!queries) {
    return [];
  }

  return queries.slice(0, 3).map((query, index) => ({
    title: `Hiring intelligence query: ${query}`,
    url: buildGoogleJobsUrl(query),
    publishedAt: new Date().toISOString(),
    source: "Google Jobs Search",
    snippet:
      "Live job search prepared for ESG-related hiring and capability-building signals.",
    signalScore: Math.max(6, 10 - index)
  }));
}
