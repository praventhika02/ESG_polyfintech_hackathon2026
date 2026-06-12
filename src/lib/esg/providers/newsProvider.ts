import type { NewsArticle, ProviderUsed, SourceReliability } from "@/types/esg";

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
  providerUsed: ProviderUsed;
};

const primaryCompanyQueries: Record<string, string> = {
  "DBS Group Holdings": "DBS Singapore sustainability",
  OCBC: "OCBC sustainability",
  UOB: "UOB Singapore sustainability",
  Singtel: "Singtel sustainability",
  "Keppel Ltd": "Keppel sustainability",
  "CapitaLand Investment": "CapitaLand sustainability",
  "Wilmar International": "Wilmar sustainability",
  "Sembcorp Industries": "Sembcorp renewable energy"
};

const companyAliases: Record<string, string> = {
  "DBS Group Holdings": "DBS",
  OCBC: "OCBC",
  UOB: "UOB",
  Singtel: "Singtel",
  "Keppel Ltd": "Keppel",
  "CapitaLand Investment": "CapitaLand",
  "Wilmar International": "Wilmar",
  "Sembcorp Industries": "Sembcorp"
};

function buildGdeltQueries(companyName: string) {
  const alias = companyAliases[companyName] ?? companyName;
  const primaryQuery = primaryCompanyQueries[companyName] ?? `${alias} sustainability`;
  const queries = [primaryQuery, `${alias} ESG`, alias];

  return queries.slice(0, 3);
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

function getSourceReliability(source: string): SourceReliability {
  const normalisedSource = source.toLowerCase();

  if (
    normalisedSource.includes("business times") ||
    normalisedSource.includes("reuters") ||
    normalisedSource.includes("bloomberg") ||
    normalisedSource.includes("annual report") ||
    normalisedSource.includes("sgx") ||
    normalisedSource.includes("exchange") ||
    normalisedSource.includes("sembcorp") ||
    normalisedSource.includes("singtel") ||
    normalisedSource.includes("dbs") ||
    normalisedSource.includes("ocbc") ||
    normalisedSource.includes("uob") ||
    normalisedSource.includes("keppel") ||
    normalisedSource.includes("capitaland") ||
    normalisedSource.includes("wilmar")
  ) {
    return "High";
  }

  if (
    normalisedSource.includes("sustainability") ||
    normalisedSource.includes("green") ||
    normalisedSource.includes("energy") ||
    normalisedSource.includes("industry") ||
    normalisedSource.includes("magazine") ||
    normalisedSource.includes("trade")
  ) {
    return "Medium";
  }

  return "Low";
}

async function fetchJsonWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 ESG-Alpha-Gap-Hackathon",
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`GDELT request failed with ${response.status}`);
    }

    return (await response.json()) as GdeltResponse;
  } finally {
    clearTimeout(timeout);
  }
}

export function buildGdeltUrl(query: string) {
  const params = new URLSearchParams({
    query,
    mode: "ArtList",
    format: "json",
    maxrecords: "10",
    sort: "HybridRel"
  });

  return `https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`;
}

export async function fetchRawGdeltArticles(query: string) {
  const url = buildGdeltUrl(query);
  const data = await fetchJsonWithTimeout(url, 10000);

  return {
    url,
    articles: data.articles ?? []
  };
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
          source,
          sourceReliability: getSourceReliability(source)
        };
      })
  );
}

export async function fetchGdeltNews(
  companyName: string
): Promise<LiveNewsResult> {
  const queries = buildGdeltQueries(companyName);

  for (const query of queries) {
    console.log("[GDELT] Trying query:", query);

    try {
      const data = await fetchJsonWithTimeout(buildGdeltUrl(query), 2500);
      const articles = mapGdeltArticles(data);

      console.log("[GDELT] Articles found:", articles.length);

      if (articles.length > 0) {
        return {
          articles,
          articlesFound: articles.length,
          queryUsed: query,
          providerUsed: "gdelt"
        };
      }
    } catch (error) {
      console.error("[GDELT] Query failed:", query, error);
    }
  }

  return {
    articles: [],
    articlesFound: 0,
    queryUsed: queries.at(-1) ?? companyName,
    providerUsed: "fallback"
  };
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function textBetween(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));

  return match ? decodeXmlEntities(match[1].trim()) : "";
}

function stripHtml(value: string) {
  return decodeXmlEntities(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanRssText(value: string, source: string) {
  const withoutTrailingSource = value
    .replace(/â/g, "'")
    .replace(/â/g, "'")
    .replace(/â/g, "-")
    .replace(/â/g, "-")
    .replace(new RegExp(`\\s*-\\s*${source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i"), "")
    .replace(new RegExp(`\\s+${source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i"), "");

  return withoutTrailingSource.replace(/\s+/g, " ").trim();
}

function buildGoogleNewsRssUrl(query: string) {
  const params = new URLSearchParams({
    q: query,
    hl: "en-SG",
    gl: "SG",
    ceid: "SG:en"
  });

  return `https://news.google.com/rss/search?${params.toString()}`;
}

function parseGoogleNewsRss(xml: string): NewsArticle[] {
  const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];

  return dedupeArticles(
    itemMatches
      .map((match) => {
        const item = match[1];
        const url = textBetween(item, "link");
        const pubDate = textBetween(item, "pubDate");
        const source = stripHtml(textBetween(item, "source")) || "Google News RSS";
        const rawTitle = stripHtml(textBetween(item, "title"));
        const rawDescription = stripHtml(textBetween(item, "description"));
        const title = cleanRssText(rawTitle, source);
        const description =
          cleanRssText(rawDescription, source) ||
          `Google News RSS article from ${source}.`;

        return {
          title: title || rawTitle,
          snippet: description,
          url,
          publishedAt: pubDate
            ? safeDateToIso(pubDate)
            : new Date().toISOString(),
          source,
          sourceReliability: getSourceReliability(source)
        };
      })
      .filter((article) => article.title && article.url)
  );
}

function safeDateToIso(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export async function fetchGoogleNewsRss(
  query: string
): Promise<LiveNewsResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch(buildGoogleNewsRssUrl(query), {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 ESG-Alpha-Gap-Hackathon",
        Accept: "application/rss+xml, application/xml, text/xml"
      }
    });

    if (!response.ok) {
      throw new Error(`Google News RSS request failed with ${response.status}`);
    }

    const articles = parseGoogleNewsRss(await response.text()).slice(0, 10);

    return {
      articles,
      articlesFound: articles.length,
      queryUsed: query,
      providerUsed: articles.length > 0 ? "google_news_rss" : "fallback"
    };
  } finally {
    clearTimeout(timeout);
  }
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
      signal: AbortSignal.timeout(3500)
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
        source: article.source?.name ?? "NewsAPI",
        sourceReliability: getSourceReliability(article.source?.name ?? "NewsAPI")
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

  const rssQuery =
    primaryCompanyQueries[companyName] ??
    `${companyAliases[companyName] ?? companyName} sustainability`;

  try {
    const rssResult = await fetchGoogleNewsRss(rssQuery);

    if (rssResult.articles.length > 0) {
      return rssResult;
    }
  } catch (error) {
    console.error("Google News RSS fetch failed", error);
  }

  return gdeltResult;
}
