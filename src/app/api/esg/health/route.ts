import { NextResponse } from "next/server";
import { demoCompanies } from "@/lib/esg/mockCompanies";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    modules: {
      newsProvider: "enabled",
      patentProvider: "enabled",
      jobProvider: "enabled",
      reportUpload: "enabled",
      fallbackProtection: "enabled"
    },
    demoCompanies: demoCompanies.length
  });
}
