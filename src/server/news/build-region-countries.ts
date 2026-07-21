import {
  createHash,
} from "node:crypto";

import type {
  CountryRegionId,
} from "@/domain/geography";

import type {
  CountryNewsCard,
  CountryWithLatestNews,
  NewsCategory,
} from "@/domain/news/news.types";

import type {
  NewsArticle,
  NewsStory,
} from "@/domain/news/story.types";

import {
  clusterArticles,
} from "@/server/stories/cluster-articles";

import {
  classifyNews,
} from "./classify-news";

import type {
  CountryNewsSourceConfig,
  NewsFeedConfig,
  NewsSourceConfig,
  NewsSourcesCatalog,
} from "./news-source.types";

import {
  extractItemImage,
  extractItemLink,
  parseSourceFeed,
} from "./rss/rss-parser";

const MAX_NEWS_PER_COUNTRY =
  18;

const COUNTRY_CONCURRENCY =
  4;

const categoryLabels:
  Record<NewsCategory, string> = {
    football: "Futebol",
    politics: "Política",
    economy: "Economia",
  };

type ParsedFeedEntry =
  Awaited<
    ReturnType<
      typeof parseSourceFeed
    >
  >[number];

type ParsedFeedItem =
  ParsedFeedEntry["item"];

type NormalizedNews =
  CountryNewsCard & {
    publishedAtISO:
      | string
      | null;
  };

export type BuildCountriesOptions = {
  category?: NewsCategory;

  /**
   * Usado quando o catálogo ainda não
   * possui regions em cada país.
   */
  defaultRegions:
    CountryRegionId[];
};

export async function buildCountriesFromCatalog(
  catalog:
    NewsSourcesCatalog,

  {
    category,
    defaultRegions,
  }: BuildCountriesOptions,
): Promise<
  CountryWithLatestNews[]
> {
  return mapWithConcurrency(
    catalog.countries,
    COUNTRY_CONCURRENCY,
    async (country) => {
      try {
        return await buildCountry(
          country,
          category,
          defaultRegions,
        );
      } catch (error) {
        console.warn(
          [
            "[COUNTRY RSS WARNING]",
            country.code,
            country.name,
            getErrorMessage(error),
          ].join(" "),
        );

        return createCountry(
          country,
          [],
          [],
          defaultRegions,
        );
      }
    },
  );
}

async function buildCountry(
  country:
    CountryNewsSourceConfig,

  requestedCategory:
    | NewsCategory
    | undefined,

  defaultRegions:
    CountryRegionId[],
): Promise<
  CountryWithLatestNews
> {
  const feedTasks =
    country.sources.flatMap(
      (source) =>
        source.feeds
          .filter(
            (feed) =>
              feed.enabled !==
              false,
          )
          .map(
            (feed) =>
              loadFeedSafely(
                country,
                source,
                feed,
              ),
          ),
    );

  if (
    feedTasks.length === 0
  ) {
    return createCountry(
      country,
      [],
      [],
      defaultRegions,
    );
  }

  const feedResults =
    await Promise.all(
      feedTasks,
    );

  const normalizedNews =
    feedResults
      .flat()
      .flatMap(
        (entry) => {
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
        },
      );

  const news =
    deduplicateNews(
      normalizedNews,
    )
      .sort(
        compareNewsByDateDescending,
      )
      .slice(
        0,
        MAX_NEWS_PER_COUNTRY,
      )
      .map(
        toCountryNewsCard,
      );

  const articles:
    NewsArticle[] =
    news.map(
      (newsItem) => ({
        id:
          newsItem.id,

        sourceId:
          newsItem.sourceId,

        sourceName:
          newsItem.source,

        title:
          newsItem.title,

        excerpt:
          newsItem.excerpt,

        url:
          newsItem.href,

        imageUrl:
          newsItem.imageUrl,

        category:
          newsItem.category,

        countryCode:
          country.code,

        language:
          country.language,

        publishedAtISO:
          newsItem.publishedAtISO,
      }),
    );

  const stories:
    NewsStory[] =
    clusterArticles(
      articles,
    );

  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    const multiSourceStories =
      stories.filter(
        (story) =>
          story.articles.length > 1,
      );

    console.info(
      `[STORY CLUSTER] ${country.code}`,
      {
        articles:
          articles.length,

        stories:
          stories.length,

        multiSourceStories:
          multiSourceStories.map(
            (story) => ({
              id:
                story.id,

              headline:
                story.headline,

              sources:
                story.articles.map(
                  (article) =>
                    article.sourceName,
                ),
            }),
          ),
      },
    );
  }

  return createCountry(
    country,
    news,
    stories,
    defaultRegions,
  );
}

async function loadFeedSafely(
  country:
    CountryNewsSourceConfig,

  source:
    NewsSourceConfig,

  feed:
    NewsFeedConfig,
): Promise<
  ParsedFeedEntry[]
> {
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
      console.info(
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
    console.warn(
      [
        "[RSS FETCH WARNING]",
        country.code,
        source.name,
        feed.url,
        getErrorMessage(error),
      ].join(" "),
    );

    return [];
  }
}

function normalizeItemSafely(
  country:
    CountryNewsSourceConfig,

  entry:
    ParsedFeedEntry,
): NormalizedNews | null {
  try {
    return normalizeItem(
      entry,
    );
  } catch (error) {
    console.warn(
      [
        "[RSS ITEM WARNING]",
        country.code,
        entry.source.name,
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

  const href =
    extractItemLink(
      item,
      source.websiteUrl,
    );

  if (
    !title ||
    !href
  ) {
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
        getFeedCategories(
          item,
        ),

      configuredCategory:
        feed.category,
    });

  if (!category) {
    return null;
  }

  const publicationDate =
    getPublicationDate(item);

  const publishedAtISO =
    publicationDate
      ? publicationDate
          .toISOString()
      : null;

  const identifier =
    toSafeString(
      item.guid,
    ).trim() || href;

  const id =
    createNewsId({
      sourceId:
        source.id,

      identifier,
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
    id,

    title,
    excerpt,

    category,
    categoryLabel:
      categoryLabels[category],

    sourceId:
      source.id,

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

  return stripHtml(
    rawContent,
  )
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
    Array.isArray(
      categories,
    )
  ) {
    return categories
      .map(
        toSafeString,
      )
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
    new Date(
      candidate,
    );

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date;
}

function formatRelativeTime(
  publicationDate: Date,
): string {
  const difference =
    Date.now() -
    publicationDate
      .getTime();

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

  return `há ${Math.floor(
    hours / 24,
  )} d`;
}

function deduplicateNews(
  news:
    NormalizedNews[],
): NormalizedNews[] {
  const unique =
    new Map<
      string,
      NormalizedNews
    >();

  for (const item of news) {
    const key = [
      item.source,
      normalizeUrl(
        item.href,
      ),
      normalizeTitle(
        item.title,
      ),
    ].join("|");

    if (!unique.has(key)) {
      unique.set(
        key,
        item,
      );
    }
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
    id:
      news.id,

    title:
      news.title,

    excerpt:
      news.excerpt,

    category:
      news.category,

    categoryLabel:
      news.categoryLabel,

    sourceId:
      news.sourceId,

    source:
      news.source,

    publishedAt:
      news.publishedAt,

    publishedAtISO:
      news.publishedAtISO,

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

  stories:
    NewsStory[],

  defaultRegions:
    CountryRegionId[],
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

    regions:
      country.regions ??
      defaultRegions,

    news,
    stories,
  };
}

function createNewsId({
  sourceId,
  identifier,
  title,
}: {
  sourceId: string;
  identifier: string;
  title: string;
}): string {
  const value = [
    sourceId,
    normalizeUrl(
      identifier,
    ),
    normalizeTitle(
      title,
    ),
  ].join("|");

  const hash =
    createHash(
      "sha256",
    )
      .update(value)
      .digest("hex")
      .slice(0, 20);

  return `${sourceId}:${hash}`;
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

    for (
      const parameter of
      [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "utm_term",
        "fbclid",
        "gclid",
      ]
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
    Array.isArray(
      value,
    )
  ) {
    return value
      .map(
        toSafeString,
      )
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
  return error instanceof Error
    ? error.message
    : String(error);
}

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

  async function runWorker():
    Promise<void> {
    while (
      nextIndex <
      items.length
    ) {
      const currentIndex =
        nextIndex;

      nextIndex += 1;

      results[
        currentIndex
      ] = await worker(
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