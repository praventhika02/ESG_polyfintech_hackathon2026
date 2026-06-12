import { NextResponse } from "next/server";
import {
  buildGdeltUrl,
  fetchRawGdeltArticles
} from "@/lib/esg/providers/newsProvider";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() || "Sembcorp renewable energy";

  try {
    const result = await fetchRawGdeltArticles(query);
    const sampleArticles = result.articles.slice(0, 5).map((article) => ({
      title: article.title ?? "",
      url: article.url ?? "",
      domain: article.domain ?? "",
      seendate: article.seendate ?? ""
    }));

    return NextResponse.json({
      query,
      url: result.url,
      articleCount: result.articles.length,
      sampleArticles
    });
  } catch (error) {
    console.error("[GDELT Test] Request failed", error);

    return NextResponse.json(
      {
        query,
        url: buildGdeltUrl(query),
        articleCount: 0,
        sampleArticles: [],
        error: error instanceof Error ? error.message : "Unknown GDELT error"
      },
      { status: 200 }
    );
  }
}
