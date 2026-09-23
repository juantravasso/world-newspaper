import "server-only";

import type {
  CountryCode,
  NewsCategory,
} from "@/domain/news/news.types";

import {
  prisma,
} from "@/server/database/prisma";

export type NewsSourceRecord = {
  id:
    string;

  countryCode:
    CountryCode;

  name:
    string;

  websiteUrl:
    string;

  feedUrl:
    string | null;

  feedCategory:
    NewsCategory | null;

  enabled:
    boolean;

  updatedAtISO:
    string;
};

export type NewsSourceInput = {
  id:
    string;

  countryCode:
    CountryCode;

  name:
    string;

  websiteUrl:
    string;

  feedUrl:
    string | null;

  feedCategory:
    NewsCategory | null;

  enabled:
    boolean;
};

export async function listNewsSources():
  Promise<NewsSourceRecord[]> {
  const sources =
    await prisma
      .newsSource
      .findMany({
        orderBy: [
          {
            countryCode:
              "asc",
          },
          {
            name:
              "asc",
          },
        ],
      });

  return sources.map(
    toNewsSourceRecord,
  );
}

export async function listEnabledSourcesByCountry(
  countryCode:
    CountryCode,
): Promise<NewsSourceRecord[]> {
  const sources =
    await prisma
      .newsSource
      .findMany({
        where: {
          countryCode,

          enabled:
            true,

          feedUrl: {
            not:
              null,
          },
        },

        orderBy: {
          name:
            "asc",
        },
      });

  return sources.map(
    toNewsSourceRecord,
  );
}

export async function listEnabledSourcesWithoutFeed():
  Promise<NewsSourceRecord[]> {
  const sources =
    await prisma
      .newsSource
      .findMany({
        where: {
          enabled:
            true,

          feedUrl:
            null,
        },

        orderBy: [
          {
            countryCode:
              "asc",
          },
          {
            name:
              "asc",
          },
        ],
      });

  return sources.map(
    toNewsSourceRecord,
  );
}

export async function createNewsSource(
  input:
    NewsSourceInput,
): Promise<NewsSourceRecord> {
  const created =
    await prisma
      .newsSource
      .create({
        data:
          input,
      });

  return toNewsSourceRecord(
    created,
  );
}

export type NewsSourceUpdateInput = {
  name?:
    string;

  websiteUrl?:
    string;

  feedUrl?:
    string | null;

  feedCategory?:
    NewsCategory | null;

  enabled?:
    boolean;
};

export async function updateNewsSource(
  id:
    string,

  input:
    NewsSourceUpdateInput,
): Promise<NewsSourceRecord> {
  const updated =
    await prisma
      .newsSource
      .update({
        where: {
          id,
        },

        data:
          input,
      });

  return toNewsSourceRecord(
    updated,
  );
}

export async function deleteNewsSource(
  id:
    string,
): Promise<void> {
  await prisma
    .newsSource
    .delete({
      where: {
        id,
      },
    });
}

export async function findNewsSourceById(
  id:
    string,
): Promise<NewsSourceRecord | null> {
  const source =
    await prisma
      .newsSource
      .findUnique({
        where: {
          id,
        },
      });

  return source
    ? toNewsSourceRecord(
        source,
      )
    : null;
}

function toNewsSourceRecord(
  source: {
    id:
      string;

    countryCode:
      string;

    name:
      string;

    websiteUrl:
      string;

    feedUrl:
      string | null;

    feedCategory:
      string | null;

    enabled:
      boolean;

    updatedAt:
      Date;
  },
): NewsSourceRecord {
  return {
    id:
      source.id,

    countryCode:
      source.countryCode as
        CountryCode,

    name:
      source.name,

    websiteUrl:
      source.websiteUrl,

    feedUrl:
      source.feedUrl,

    feedCategory:
      toKnownCategory(
        source.feedCategory,
      ),

    enabled:
      source.enabled,

    updatedAtISO:
      source.updatedAt
        .toISOString(),
  };
}

/**
 * Categorias antigas que saíram do produto (ex:
 * futebol) continuam salvas em fontes já
 * cadastradas, mas não devem mais forçar a
 * classificação de itens do feed.
 */
function toKnownCategory(
  value:
    string | null,
): NewsCategory | null {
  return value ===
    "politics" ||
    value ===
      "economy"
    ? value
    : null;
}
