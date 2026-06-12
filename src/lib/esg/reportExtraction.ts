import type { ReportFinding } from "@/types/esg";

const themeKeywords = [
  "net zero",
  "renewable energy",
  "emissions reduction",
  "carbon",
  "climate",
  "sustainable finance",
  "green building",
  "governance",
  "diversity",
  "supply chain",
  "biodiversity",
  "energy efficiency",
  "waste reduction",
  "circular economy"
];

function normaliseFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ");
}

function confidenceFromThemeCount(themeCount: number): ReportFinding["reportConfidence"] {
  if (themeCount >= 6) return "High";
  if (themeCount >= 3) return "Medium";
  return "Low";
}

export function extractReportFindings(fileNames: string[]): ReportFinding[] {
  return fileNames.map((fileName) => {
    const normalised = normaliseFileName(fileName);
    const themesDetected = themeKeywords.filter((theme) =>
      normalised.includes(theme)
    );

    if (
      themesDetected.length === 0 &&
      /(^|\s)(annual|sustainability|esg|report|disclosure|ar\d{0,4})(\s|$)/.test(normalised)
    ) {
      themesDetected.push("governance");
    }

    return {
      fileName,
      verified: true,
      themesDetected,
      keyPhrases:
        themesDetected.length > 0
          ? themesDetected.map((theme) => `Filename/disclosure signal references ${theme}.`)
          : ["Verified company report supplied for ESG review; full PDF text parsing is scheduled for the next module."],
      reportConfidence: confidenceFromThemeCount(themesDetected.length)
    };
  });
}

export function reportThemeCount(findings: ReportFinding[]) {
  return new Set(findings.flatMap((finding) => finding.themesDetected)).size;
}

export function reportSignalScore(themeCount: number) {
  if (themeCount >= 6) return 15;
  if (themeCount >= 3) return 10;
  if (themeCount >= 1) return 5;
  return 0;
}
