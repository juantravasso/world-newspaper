import americaSourcesJson from "@/data/news/america.sources.json";
import {
  createHash,
} from "node:crypto";

import type {
  CountryNewsCard,
  CountryWithLatestNews,
  NewsCategory,
} from "@/domain/news/news.types";

import {
  classifyNews,
} from "./classify-news";

import type {
  AmericaSourcesCatalog,
  CountryNewsSourceConfig,
  NewsFeedConfig,
  NewsSourceConfig,
} from "./news-source.types";

import {
  extractItemImage,
  parseSourceFeed,
} from "./rss/rss-parser";

const americaSources =
  americaSourcesJson as AmericaSourcesCatalog;

const MAX_NEWS_PER_COUNTRY = 18;

const COUNTRY_CONCURRENCY = 4;

const categoryLabels:
  Record<NewsCategory, string> = {
    football: "Futebol",
    politics: "Política",
    economy: "Economia",
  };

type ParsedFeedEntry =
  Awaited<
    ReturnType<typeof parseSourceFeed>
  >[number];

type ParsedFeedItem =
  ParsedFeedEntry["item"];

type NormalizedNews =
  CountryNewsCard & {
    publishedAtISO: string | null;
  };

/**
 * Carrega as notícias de todos os países
 * da América com limite de concorrência.
 */
export async function buildAmericaCountriesWithNews(
  category?: NewsCategory,
): Promise<CountryWithLatestNews[]> {
  return mapWithConcurrency(
    americaSources.countries,
    COUNTRY_CONCURRENCY,
    async (country) => {
      try {
        return await buildCountry(
          country,
          category,
        );
      } catch (error) {
        console.error(
          [
            "[COUNTRY RSS ERROR]",
            country.code,
            country.name,
            getErrorMessage(error),
          ].join(" "),
        );

        return createCountry(
          country,
          [],
        );
      }
    },
  );
}

/**
 * Carrega e processa todos os feeds
 * cadastrados para um país.
 */
async function buildCountry(
  country: CountryNewsSourceConfig,
  requestedCategory?: NewsCategory,
): Promise<CountryWithLatestNews> {
  const feedTasks =
    country.sources.flatMap(
      (source) =>
        source.feeds.map(
          (feed) =>
            loadFeedSafely(
              country,
              source,
              feed,
            ),
        ),
    );

  if (feedTasks.length === 0) {
    return createCountry(
      country,
      [],
    );
  }

  const feedResults =
    await Promise.all(feedTasks);

  const entries =
    feedResults.flat();

  const normalizedNews =
    entries.flatMap((entry) => {
      const news =
        normalizeItemSafely(
          country,
          entry,
        );

      if (!news) {
        return [];
      }

      if (
        requestedCategory &&
        news.category !==
          requestedCategory
      ) {
        return [];
      }

      return [news];
    });

  const news =
    deduplicateNews(normalizedNews)
      .sort(
        compareNewsByDateDescending,
      )
      .slice(
        0,
        MAX_NEWS_PER_COUNTRY,
      )
      .map(toCountryNewsCard);

  return createCountry(
    country,
    news,
  );
}

/**
 * Um feed com erro retorna uma lista vazia,
 * sem interromper os demais feeds.
 */
async function loadFeedSafely(
  country:
    CountryNewsSourceConfig,

  source:
    NewsSourceConfig,

  feed:
    NewsFeedConfig,
): Promise<ParsedFeedEntry[]> {
  try {
    const entries =
      await parseSourceFeed(
        source,
        feed,
      );

    if (
      process.env.NODE_ENV ===
      "development"
    ) {
      console.log(
        [
          "[RSS SUCCESS]",
          country.code,
          source.name,
          `${entries.length} itens`,
        ].join(" "),
      );
    }

    return entries;
  } catch (error) {
    console.error(
      [
        "[RSS FETCH ERROR]",
        country.code,
        source.name,
        feed.url,
        getErrorMessage(error),
      ].join(" "),
    );

    return [];
  }
}

/**
 * Um item RSS defeituoso não impede
 * os outros itens de serem processados.
 */
function normalizeItemSafely(
  country:
    CountryNewsSourceConfig,

  entry:
    ParsedFeedEntry,
): NormalizedNews | null {
  try {
    return normalizeItem(entry);
  } catch (error) {
    console.error(
      [
        "[RSS ITEM ERROR]",
        country.code,
        entry.source.name,
        toSafeString(
          entry.item.link,
        ) || "sem-link",
        getErrorMessage(error),
      ].join(" "),
    );

    return null;
  }
}

function normalizeItem(
  entry:
    ParsedFeedEntry,
): NormalizedNews | null {
  const {
    item,
    source,
    feed,
  } = entry;

  const title =
    toSafeString(
      item.title,
    ).trim();

  const rawHref =
    toSafeString(
      item.link,
    ).trim();

  if (!title || !rawHref) {
    return null;
  }

  const href =
    resolveUrl(
      rawHref,
      source.websiteUrl,
    );

  if (!href) {
    return null;
  }

  const excerpt =
    createExcerpt(item);

  const category =
    classifyNews({
      title,
      excerpt,
      link: href,

      feedCategories:
        getFeedCategories(item),

      configuredCategory:
        feed.category,
    });

  if (!category) {
    if (
      process.env.NODE_ENV ===
      "development"
    ) {
      console.log(
        [
          "[RSS UNCLASSIFIED]",
          source.name,
          title,
        ].join(" "),
      );
    }

    return null;
  }

  const publicationDate =
    getPublicationDate(item);

  const publishedAtISO =
    publicationDate
      ? publicationDate.toISOString()
      : null;

  const originalIdentifier =
  toSafeString(
    item.guid,
  ).trim() || href;

const newsId =
  createNewsId({
    sourceId:
      source.id,

    identifier:
      originalIdentifier,

    title,
  });

  const extractedImage =
    extractItemImage(item);

  const imageUrl =
    extractedImage
      ? resolveUrl(
          extractedImage,
          source.websiteUrl,
        )
      : undefined;

  return {
  id: newsId,

  title,
  excerpt,

  category,

  categoryLabel:
    categoryLabels[category],

  source:
    source.name,

  publishedAt:
    publicationDate
      ? formatRelativeTime(
          publicationDate,
        )
      : "data não informada",

  publishedAtISO,

  href,

  imageUrl,
};
}

function createExcerpt(
  item:
    ParsedFeedItem,
): string {
  const rawContent =
    toSafeString(
      item.contentSnippet ??
      item.content ??
      "",
    );

  return stripHtml(rawContent)
    .replace(
      /\s+/g,
      " ",
    )
    .trim()
    .slice(0, 280);
}

function getFeedCategories(
  item:
    ParsedFeedItem,
): string[] {
  const categories =
    item.categories;

  if (!categories) {
    return [];
  }

  if (
    Array.isArray(categories)
  ) {
    return categories
      .map(toSafeString)
      .map(
        (category) =>
          category.trim(),
      )
      .filter(Boolean);
  }

  const category =
    toSafeString(
      categories,
    ).trim();

  return category
    ? [category]
    : [];
}

function getPublicationDate(
  item:
    ParsedFeedItem,
): Date | null {
  const candidate =
    toSafeString(
      item.isoDate ??
      item.pubDate,
    ).trim();

  if (!candidate) {
    return null;
  }

  const date =
    new Date(candidate);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date;
}

function formatRelativeTime(
  publicationDate: Date,
): string {
  const difference =
    Date.now() -
    publicationDate.getTime();

  if (difference <= 0) {
    return "agora";
  }

  const minutes =
    Math.max(
      1,
      Math.floor(
        difference /
        60_000,
      ),
    );

  if (minutes < 60) {
    return `há ${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  if (hours < 24) {
    return `há ${hours} h`;
  }

  const days =
    Math.floor(
      hours / 24,
    );

  return `há ${days} d`;
}

/**
 * Remove notícias repetidas por URL
 * normalizada ou título normalizado.
 */
function deduplicateNews(
  news: NormalizedNews[],
): NormalizedNews[] {
  const unique =
    new Map<
      string,
      NormalizedNews
    >();

  for (const item of news) {
    const deduplicationKey = [
      item.source,
      normalizeUrl(
        item.href,
      ),
      normalizeTitle(
        item.title,
      ),
    ].join("|");

    if (
      unique.has(
        deduplicationKey,
      )
    ) {
      continue;
    }

    unique.set(
      deduplicationKey,
      item,
    );
  }

  return [
    ...unique.values(),
  ];
}

function compareNewsByDateDescending(
  first:
    NormalizedNews,

  second:
    NormalizedNews,
): number {
  const firstTimestamp =
    first.publishedAtISO
      ? new Date(
          first.publishedAtISO,
        ).getTime()
      : 0;

  const secondTimestamp =
    second.publishedAtISO
      ? new Date(
          second.publishedAtISO,
        ).getTime()
      : 0;

  return (
    secondTimestamp -
    firstTimestamp
  );
}

function toCountryNewsCard(
  news:
    NormalizedNews,
): CountryNewsCard {
  return {
    id: news.id,
    title: news.title,
    excerpt: news.excerpt,

    category:
      news.category,

    categoryLabel:
      news.categoryLabel,

    source:
      news.source,

    publishedAt:
      news.publishedAt,

    href:
      news.href,

    imageUrl:
      news.imageUrl,
  };
}

function createCountry(
  country:
    CountryNewsSourceConfig,

  news:
    CountryNewsCard[],
): CountryWithLatestNews {
  return {
    code:
      country.code,

    name:
      country.name,

    slug:
      country.slug,

    flag:
      country.flag,

    language:
      country.language,

    active: true,

    regions: [
      "america",
    ],

    news,
  };
}

function resolveUrl(
  value: string,
  baseUrl: string,
): string | undefined {
  try {
    return new URL(
      value,
      baseUrl,
    ).toString();
  } catch {
    return undefined;
  }
}

function normalizeUrl(
  value: string,
): string {
  try {
    const url =
      new URL(value);

    url.hash = "";

    const removableParameters = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "fbclid",
      "gclid",
    ];

    for (
      const parameter of
      removableParameters
    ) {
      url.searchParams.delete(
        parameter,
      );
    }

    return url
      .toString()
      .replace(
        /\/$/,
        "",
      );
  } catch {
    return value.trim();
  }
}

function normalizeTitle(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      " ",
    )
    .trim();
}

function stripHtml(
  value: string,
): string {
  return value.replace(
    /<[^>]*>/g,
    " ",
  );
}

/**
 * Alguns feeds retornam objetos XML
 * em campos que normalmente seriam strings.
 */
function toSafeString(
  value: unknown,
): string {
  if (
    typeof value ===
    "string"
  ) {
    return value;
  }

  if (
    typeof value ===
    "number"
  ) {
    return String(value);
  }

  if (
    Array.isArray(value)
  ) {
    return value
      .map(toSafeString)
      .filter(Boolean)
      .join(" ");
  }

  if (
    value &&
    typeof value ===
    "object" &&
    "_" in value
  ) {
    return toSafeString(
      (
        value as {
          _: unknown;
        }
      )._,
    );
  }

  return "";
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return String(error);
}

/**
 * Executa tarefas assíncronas sem iniciar
 * todos os países ao mesmo tempo.
 */
async function mapWithConcurrency<
  Input,
  Output,
>(
  items: Input[],
  concurrency: number,
  worker: (
    item: Input,
    index: number,
  ) => Promise<Output>,
): Promise<Output[]> {
  const results =
    new Array<Output>(
      items.length,
    );

  let nextIndex = 0;

  async function runWorker(): Promise<void> {
    while (
      nextIndex <
      items.length
    ) {
      const currentIndex =
        nextIndex;

      nextIndex += 1;

      results[currentIndex] =
        await worker(
          items[currentIndex],
          currentIndex,
        );
    }
  }

  const workerCount =
    Math.min(
      Math.max(
        concurrency,
        1,
      ),
      items.length,
    );

  await Promise.all(
    Array.from(
      {
        length:
          workerCount,
      },
      () =>
        runWorker(),
    ),
  );

  return results;
}

type CreateNewsIdInput = {
  sourceId: string;
  identifier: string;
  title: string;
};

function createNewsId({
  sourceId,
  identifier,
  title,
}: CreateNewsIdInput): string {
  const value = [
    sourceId,
    normalizeUrl(identifier),
    normalizeTitle(title),
  ].join("|");

  const hash =
    createHash("sha256")
      .update(value)
      .digest("hex")
      .slice(0, 20);

  return `${sourceId}:${hash}`;
}