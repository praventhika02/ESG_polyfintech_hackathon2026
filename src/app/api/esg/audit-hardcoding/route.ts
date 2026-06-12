import { NextResponse } from "next/server";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

type Finding = {
  file: string;
  pattern: string;
  line: number;
  excerpt: string;
};

const root = process.cwd();

const explicitTerms = [
  ["recognition", "Bias"].join(""),
  ["expected", " outcome"].join(""),
  ["expected", "Classification"].join(""),
  ["company", "Bias"].join(""),
  ["demo", " realism"].join("")
];

const companyNames = [
  "DBS",
  "OCBC",
  "UOB",
  "Singtel",
  "Keppel",
  "CapitaLand",
  "Wilmar",
  "Sembcorp"
];

async function fileExists(filePath: string) {
  try {
    await readFile(filePath, "utf8");
    return true;
  } catch {
    return false;
  }
}

async function providerFiles() {
  const providerDir = path.join(root, "src", "lib", "esg", "providers");
  try {
    const names = await readdir(providerDir);
    return names
      .filter((name) => name.endsWith(".ts") || name.endsWith(".tsx"))
      .map((name) => path.join(providerDir, name));
  } catch {
    return [];
  }
}

function scanLines(file: string, content: string, scoringSensitive: boolean) {
  const findings: Finding[] = [];
  const lines = content.split(/\r?\n/);

  lines.forEach((lineText, index) => {
    const lower = lineText.toLowerCase();

    explicitTerms.forEach((term) => {
      if (lower.includes(term.toLowerCase())) {
        findings.push({
          file,
          pattern: term,
          line: index + 1,
          excerpt: lineText.trim()
        });
      }
    });

    if (!scoringSensitive) return;

    const mentionsCompany = companyNames.some((name) =>
      lower.includes(name.toLowerCase())
    );
    const mentionsScoringOutcome =
      /\b(score|classification|verdict|alphaWindow|confidence|recognitionScore|transformationStrength)\b/i.test(
        lineText
      );
    const looksConditional = /\b(if|switch|case)\b/i.test(lineText);

    if (mentionsCompany && mentionsScoringOutcome && looksConditional) {
      findings.push({
        file,
        pattern: "company-specific scoring condition",
        line: index + 1,
        excerpt: lineText.trim()
      });
    }
  });

  return findings;
}

export async function GET() {
  const fixedFiles = [
    path.join(root, "src", "lib", "esg", "scoring.ts"),
    path.join(root, "src", "app", "api", "esg", "scan", "route.ts"),
    path.join(root, "src", "lib", "esg", "mockCompanies.ts")
  ];
  const files = [...fixedFiles, ...(await providerFiles())];
  const findings: Finding[] = [];

  for (const filePath of files) {
    if (!(await fileExists(filePath))) continue;

    const content = await readFile(filePath, "utf8");
    const relative = path.relative(root, filePath).replaceAll("\\", "/");
    const scoringSensitive =
      relative.endsWith("src/lib/esg/scoring.ts") ||
      relative.endsWith("src/app/api/esg/scan/route.ts");

    findings.push(...scanLines(relative, content, scoringSensitive));
  }

  return NextResponse.json({
    passed: findings.length === 0,
    findings
  });
}
