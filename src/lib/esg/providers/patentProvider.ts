export type PatentSignal = {
  title: string;
  url: string;
  publishedAt: string;
  source: "Google Patents";
  snippet: string;
  signalScore: number;
};

const patentQueries: Record<string, string[]> = {
  "Sembcorp Industries": [
    "Sembcorp renewable energy patent",
    "Sembcorp solar energy patent",
    "Sembcorp battery storage patent",
    "Sembcorp green hydrogen patent"
  ],
  Singtel: [
    "Singtel energy efficient network patent",
    "Singtel green data centre patent",
    "Singtel smart grid patent",
    "Singtel carbon reduction software patent"
  ],
  "Keppel Ltd": [
    "Keppel sustainable infrastructure patent",
    "Keppel floating solar patent",
    "Keppel energy transition patent",
    "Keppel carbon capture patent"
  ],
  "CapitaLand Investment": [
    "CapitaLand green building patent",
    "CapitaLand energy efficient building patent",
    "CapitaLand smart building sustainability patent",
    "CapitaLand low carbon real estate patent"
  ],
  "Wilmar International": [
    "Wilmar sustainable palm oil patent",
    "Wilmar supply chain traceability patent",
    "Wilmar waste valorisation patent",
    "Wilmar biofuel patent"
  ],
  "DBS Group Holdings": [
    "DBS green finance patent",
    "DBS sustainable finance patent",
    "DBS climate risk analytics patent",
    "DBS carbon accounting patent"
  ],
  OCBC: [
    "OCBC green finance patent",
    "OCBC sustainability-linked loan patent",
    "OCBC climate risk analytics patent",
    "OCBC carbon tracking patent"
  ],
  UOB: [
    "UOB sustainable finance patent",
    "UOB green lending patent",
    "UOB climate risk analytics patent",
    "UOB ASEAN decarbonisation patent"
  ]
};

function buildGooglePatentsUrl(query: string) {
  const params = new URLSearchParams({
    q: `(${query})`
  });

  return `https://patents.google.com/?${params.toString()}`;
}

export async function getPatentSignals(
  companyName: string
): Promise<PatentSignal[]> {
  const queries = patentQueries[companyName];

  if (!queries) {
    return [];
  }

  return queries.slice(0, 3).map((query, index) => ({
      title: `Patent intelligence query: ${query}`,
      url: buildGooglePatentsUrl(query),
      publishedAt: new Date().toISOString(),
      source: "Google Patents",
      snippet:
        "Live Google Patents search prepared for ESG-related innovation evidence.",
      signalScore: Math.max(6, 10 - index)
  }));
}
