import type { ExtractedSignal, NewsArticle } from "@/types/esg";

const positiveKeywords = [
  "renewable",
  "solar",
  "wind",
  "decarbonisation",
  "decarbonization",
  "net zero",
  "climate",
  "sustainability",
  "sustainable",
  "green",
  "transition",
  "emissions",
  "carbon",
  "circular economy",
  "energy efficiency",
  "clean energy",
  "biodiversity",
  "governance",
  "esg"
];

const negativeKeywords = [
  "pollution",
  "fine",
  "lawsuit",
  "labour violation",
  "labor violation",
  "corruption",
  "investigation",
  "emissions scandal",
  "deforestation",
  "greenwashing",
  "safety breach",
  "strike"
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function countKeywordMatches(text: string, keywords: string[]) {
  const normalisedText = text.toLowerCase();

  return keywords.reduce((total, keyword) => {
    const escapedKeyword = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = normalisedText.match(new RegExp(`\\b${escapedKeyword}\\b`, "g"));

    return total + (matches?.length ?? 0);
  }, 0);
}

function formatArticleDate(publishedAt: string) {
  const parsedDate = new Date(publishedAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Live";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric"
  }).format(parsedDate);
}

export function extractSignalsFromArticles(articles: NewsArticle[]): ExtractedSignal[] {
  return articles.map((article) => {
    const searchableText = `${article.title} ${article.snippet}`;
    const positiveKeywordCount = countKeywordMatches(searchableText, positiveKeywords);
    const negativeKeywordCount = countKeywordMatches(searchableText, negativeKeywords);
    const rawSignalScore = positiveKeywordCount * 8 - negativeKeywordCount * 10;
    const signalScore =
      positiveKeywordCount + negativeKeywordCount === 0
        ? 2
        : clamp(rawSignalScore, -30, 30);
    const impact =
      signalScore > 5 ? "Positive" : signalScore < -5 ? "Negative" : "Neutral";

    return {
      date: formatArticleDate(article.publishedAt),
      sourceType: "News",
      title: article.title,
      summary: article.snippet,
      url: article.url,
      impact,
      signalScore,
      positiveKeywordCount,
      negativeKeywordCount,
      source: article.source
    };
  });
}
