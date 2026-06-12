import type { NewsArticle } from "@/types/esg";

type GdeltArticle = {
  title?: string;
  url?: string;
  seendate?: string;
  domain?: string;
  sourceCountry?: string;
  sourcecountry?: string;
  language?: string;
  snippet?: string;
  socialimage?: string;
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

export type LiveNewsResult = {
  articles: NewsArticle[];
  articlesFound: number;
  queryUsed: string;
};

const companyAliases: Record<string, string> = {
  "DBS Group Holdings": "DBS",
  OCBC: "OCBC Bank",
  UOB: "UOB Bank",
  Singtel: "Singtel",
  "Keppel Ltd": "Keppel",
  "CapitaLand Investment": "CapitaLand",
  "Wilmar International": "Wilmar",
  "Sembcorp Industries": "Sembcorp"
};

function buildGdeltQueries(companyName: string) {
  const alias = companyAliases[companyName];
  const quotedCompany = `"${companyName}"`;
  const queries = [
    `${quotedCompany} sustainability`,
    `${quotedCompany} ESG`,
    `${quotedCompany} renewable`,
    quotedCompany
  ];

  if (alias && alias !== companyName) {
    queries.push(alias);
  }

  return queries;
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

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function fetchJsonWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`GDELT request failed with ${response.status}`);
    }

    return (await response.json()) as GdeltResponse;
  } finally {
    clearTimeout(timeout);
  }
}

function mapGdeltArticles(data: GdeltResponse) {
  return dedupeArticles(
    (data.articles ?? [])
      .filter((article) => article.title && article.url)
      .map((article) => {
        const sourceCountry = article.sourceCountry ?? article.sourcecountry;
        const source = article.domain ?? "GDELT";
        const snippet = [
          article.snippet,
          `Live GDELT article from ${source}.`,
          sourceCountry ? `Country: ${sourceCountry}.` : "",
          article.language ? `Language: ${article.language}.` : ""
        ]
          .filter(Boolean)
          .join(" ");

        return {
          title: article.title ?? "Untitled ESG article",
          snippet,
          url: article.url ?? "",
          publishedAt: parseGdeltDate(article.seendate),
          source
        };
      })
  );
}

export async function fetchGdeltNews(
  companyName: string
): Promise<LiveNewsResult> {
  const queries = buildGdeltQueries(companyName);

  for (const [index, query] of queries.entries()) {
    console.log("[GDELT] Trying query:", query);

    try {
      const params = new URLSearchParams({
        query,
        mode: "ArtList",
        format: "json",
        maxrecords: "20",
        sort: "HybridRel"
      });
      const data = await fetchJsonWithTimeout(
        `https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`,
        8000
      );
      const articles = mapGdeltArticles(data);

      console.log("[GDELT] Articles found:", articles.length);

      if (articles.length > 0) {
        return {
          articles,
          articlesFound: articles.length,
          queryUsed: query
        };
      }
    } catch (error) {
      console.error("[GDELT] Query failed:", query, error);
    }

    if (index < queries.length - 1) {
      await wait(5200);
    }
  }

  return {
    articles: [],
    articlesFound: 0,
    queryUsed: queries.at(-1) ?? companyName
  };
}

function buildNewsApiQuery(companyName: string) {
  return `"${companyName}" sustainability OR ESG OR renewable OR climate`;
}

export async function fetchNewsApiNews(
  companyName: string,
  apiKey: string
): Promise<NewsArticle[]> {
  const params = new URLSearchParams({
    q: buildNewsApiQuery(companyName),
    language: "en",
    pageSize: "10",
    sortBy: "relevancy",
    apiKey
  });
  const response = await fetch(
    `https://newsapi.org/v2/everything?${params.toString()}`,
    {
      cache: "no-store",
      signal: AbortSignal.timeout(8000)
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
        snippet: article.description ?? "Matched ESG news article.",
        url: article.url ?? "",
        publishedAt: article.publishedAt ?? new Date().toISOString(),
        source: article.source?.name ?? "NewsAPI"
      }))
  );
}

export async function fetchLiveEsgNews(
  companyName: string
): Promise<LiveNewsResult> {
  const gdeltResult = await fetchGdeltNews(companyName);

  if (gdeltResult.articles.length > 0) {
    return gdeltResult;
  }

  const newsApiKey = process.env.NEWS_API_KEY;

  if (!newsApiKey) {
    return gdeltResult;
  }

  try {
    const newsApiArticles = await fetchNewsApiNews(companyName, newsApiKey);

    return {
      articles: newsApiArticles,
      articlesFound: newsApiArticles.length,
      queryUsed:
        newsApiArticles.length > 0
          ? `NewsAPI: ${buildNewsApiQuery(companyName)}`
          : gdeltResult.queryUsed
    };
  } catch (error) {
    console.error("NewsAPI ESG news fetch failed", error);
    return gdeltResult;
  }
}
