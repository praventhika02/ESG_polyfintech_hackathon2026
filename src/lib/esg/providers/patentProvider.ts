export type PatentSignal = {
  title: string;
  url: string;
  publishedAt: string;
  source: "Google Patents";
  snippet: string;
  signalScore: number;
};

const patentQueries: Record<string, string> = {
  "Sembcorp Industries": "Sembcorp renewable energy patent",
  Singtel: "Singtel energy efficiency network patent",
  "Keppel Ltd": "Keppel sustainable infrastructure patent",
  "CapitaLand Investment": "CapitaLand green building patent",
  "Wilmar International": "Wilmar sustainable palm oil traceability patent",
  "DBS Group Holdings": "DBS green finance patent",
  OCBC: "OCBC green finance patent",
  UOB: "UOB sustainable finance patent"
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
  const query = patentQueries[companyName];

  if (!query) {
    return [];
  }

  return [
    {
      title: `Live patent search: ${query}`,
      url: buildGooglePatentsUrl(query),
      publishedAt: new Date().toISOString(),
      source: "Google Patents",
      snippet:
        "Patent search prepared for ESG-related innovation signals. Opens live Google Patents results.",
      signalScore: 8
    }
  ];
}
