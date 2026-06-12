import type { ReportVerification } from "@/types/esg";

const companyAliases: Record<string, string[]> = {
  "DBS Group Holdings": ["dbs", "dbs group", "dbs bank"],
  OCBC: ["ocbc", "oversea-chinese banking", "oversea chinese banking"],
  UOB: ["uob", "united overseas bank"],
  Singtel: ["singtel", "singapore telecommunications"],
  "Keppel Ltd": ["keppel"],
  "CapitaLand Investment": ["capitaland", "capitaland investment"],
  "Wilmar International": ["wilmar"],
  "Sembcorp Industries": ["sembcorp"]
};

function normalise(value: string) {
  return value.toLowerCase().replace(/[_-]+/g, " ");
}

export function verifyReportFileName(
  fileName: string,
  companyName: string
): ReportVerification {
  const aliases = companyAliases[companyName] ?? [companyName.toLowerCase()];
  const lowerFileName = normalise(fileName);
  const matchedAlias = aliases.find((alias) => lowerFileName.includes(alias));

  if (matchedAlias) {
    return {
      fileName,
      status: "verified",
      detectedCompanyHint: matchedAlias,
      message: "Report filename matches the selected company."
    };
  }

  return {
    fileName,
    status: "mismatch",
    detectedCompanyHint: null,
    message: `Selected company is ${companyName}, but this file does not appear to match ${aliases[0].toUpperCase()} aliases. Please upload the correct company report.`
  };
}

export function verifyReportFileNames(
  fileNames: string[],
  companyName: string
) {
  return fileNames.map((fileName) => verifyReportFileName(fileName, companyName));
}
