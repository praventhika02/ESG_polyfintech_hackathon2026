import type { NewsArticle } from "@/types/esg";

type GdeltArticle = {
  title?: string;
  url?: string;
  seendate?: string;
  domain?: string;
  sourceCountry?: string;
  sourcecountry?: string;
  language?: string;
};

type GdeltResponse = {
  articles?: GdeltArticle[];
};

type NewsApiArticle = {
  title?: string;
  description?: string;
  url?: string;
  publishedAt?: string;
  source?: {
    name?: string;
  };
};

type NewsApiResponse = {
  articles?: NewsApiArticle[];
};

const esgQueryTerms = [
  "sustainability",
  "renewable",
  "decarbonisation",
  "emissions",
  "governance",
  "climate",
  "green investment",
  "net zero",
  "transition"
];

function buildSearchQuery(companyName: string) {
  return `"${companyName}" AND (${esgQueryTerms.join(" OR ")})`;
}

function parseGdeltDate(seenDate?: string) {
  if (!seenDate) {
    return new Date().toISOString();
  }

  const compactDate = seenDate.replace(/\D/g, "");
  const year = compactDate.slice(0, 4);
  const month = compactDate.slice(4, 6);
  const day = compactDate.slice(6, 8);
  const hour = compactDate.slice(8, 10) || "00";
  const minute = compactDate.slice(10, 12) || "00";
  const second = compactDate.slice(12, 14) || "00";
  const parsed = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);

  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function dedupeArticles(articles: NewsArticle[]) {
  const seenUrls = new Set<string>();

  return articles.filter((article) => {
    if (!article.url || seenUrls.has(article.url)) {
      return false;
    }

    seenUrls.add(article.url);
    return true;
  });
}

export async function fetchGdeltNews(companyName: string): Promise<NewsArticle[]> {
  const params = new URLSearchParams({
    query: buildSearchQuery(companyName),
    mode: "ArtList",
    format: "json",
    maxrecords: "10",
    sort: "HybridRel"
  });
  const response = await fetch(
    `https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`,
    {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(18000)
    }
  );

  if (!response.ok) {
    throw new Error(`GDELT request failed with ${response.status}`);
  }

  const data = (await response.json()) as GdeltResponse;

  return dedupeArticles(
    (data.articles ?? [])
      .filter((article) => article.title && article.url)
      .map((article) => {
        const sourceCountry = article.sourceCountry ?? article.sourcecountry;

        return {
          title: article.title ?? "Untitled ESG article",
          summary: [
            article.domain ? `Source: ${article.domain}.` : "",
            sourceCountry ? `Country: ${sourceCountry}.` : "",
            "Matched live ESG query context: sustainability, climate, renewable, transition, emissions, governance."
          ]
            .filter(Boolean)
            .join(" "),
          url: article.url ?? "",
          publishedAt: parseGdeltDate(article.seendate),
          source: article.domain ?? "GDELT"
        };
      })
  );
}

export async function fetchNewsApiNews(
  companyName: string,
  apiKey: string
): Promise<NewsArticle[]> {
  const params = new URLSearchParams({
    q: buildSearchQuery(companyName),
    language: "en",
    pageSize: "10",
    sortBy: "relevancy",
    apiKey
  });
  const response = await fetch(
    `https://newsapi.org/v2/everything?${params.toString()}`,
    {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(18000)
    }
  );

  if (!response.ok) {
    throw new Error(`NewsAPI request failed with ${response.status}`);
  }

  const data = (await response.json()) as NewsApiResponse;

  return dedupeArticles(
    (data.articles ?? [])
      .filter((article) => article.title && article.url)
      .map((article) => ({
        title: article.title ?? "Untitled ESG article",
        summary: article.description ?? "Matched ESG news article.",
        url: article.url ?? "",
        publishedAt: article.publishedAt ?? new Date().toISOString(),
        source: article.source?.name ?? "NewsAPI"
      }))
  );
}

export async function fetchLiveEsgNews(companyName: string): Promise<NewsArticle[]> {
  try {
    const gdeltArticles = await fetchGdeltNews(companyName);

    if (gdeltArticles.length > 0) {
      return gdeltArticles;
    }
  } catch (error) {
    console.error("GDELT ESG news fetch failed", error);
  }

  const newsApiKey = process.env.NEWS_API_KEY;

  if (!newsApiKey) {
    return [];
  }

  try {
    return await fetchNewsApiNews(companyName, newsApiKey);
  } catch (error) {
    console.error("NewsAPI ESG news fetch failed", error);
    return [];
  }
}
