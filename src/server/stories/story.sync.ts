import type {
  NewsStory,
} from "@/domain/news/story.types";

import {
  buildWorldCountriesWithNews,
} from "@/server/news/build-world-countries";

import {
  deleteStoriesNotSeenSince,
  saveStories,
} from "@/server/stories/story.persistence";

const DEFAULT_STORY_RETENTION_DAYS =
  14;

const MAX_STORY_RETENTION_DAYS =
  365;

const MILLISECONDS_PER_DAY =
  24 *
  60 *
  60 *
  1_000;

let synchronizationInProgress:
  Promise<SynchronizeStoriesResult> | null =
  null;

export type SynchronizeStoriesResult = {
  startedAtISO: string;
  finishedAtISO: string;
  durationMs: number;

  countriesProcessed: number;
  storiesCollected: number;
  articlesCollected: number;

  storiesSaved: number;
  articlesSaved: number;

  maintenance: {
    retentionDays: number;
    storiesDeleted: number;
    cutoffISO: string;
  };
};

/**
 * Executa a sincronização das notícias.
 *
 * Quando já existe uma sincronização em andamento
 * nesta instância, novas chamadas reutilizam a
 * mesma Promise.
 */
export async function synchronizeStories():
  Promise<SynchronizeStoriesResult> {
  if (
    synchronizationInProgress
  ) {
    return synchronizationInProgress;
  }

  synchronizationInProgress =
    performStorySynchronization()
      .finally(
        () => {
          synchronizationInProgress =
            null;
        },
      );

  return synchronizationInProgress;
}

async function performStorySynchronization():
  Promise<SynchronizeStoriesResult> {
  const startedAt =
    new Date();

  const countries =
    await buildWorldCountriesWithNews();

  const storiesById =
    new Map<
      string,
      NewsStory
    >();

  for (
    const country of
    countries
  ) {
    for (
      const story of
      country.stories
    ) {
      const existingStory =
        storiesById.get(
          story.id,
        );

      if (!existingStory) {
        storiesById.set(
          story.id,
          story,
        );

        continue;
      }

      const articlesById =
        new Map(
          [
            ...existingStory.articles,
            ...story.articles,
          ].map(
            (article) => [
              article.id,
              article,
            ],
          ),
        );

      storiesById.set(
        story.id,
        {
          ...existingStory,

          articles: [
            ...articlesById.values(),
          ],
        },
      );
    }
  }

  const stories = [
    ...storiesById.values(),
  ];

  const articleIds =
    new Set(
      stories.flatMap(
        (story) =>
          story.articles.map(
            (article) =>
              article.id,
          ),
      ),
    );

  const persistenceResult =
    await saveStories(
      stories,
    );

  const retentionDays =
    getStoryRetentionDays();

  const cutoff =
    new Date(
      startedAt.getTime() -
      retentionDays *
        MILLISECONDS_PER_DAY,
    );

  const maintenanceResult =
    await deleteStoriesNotSeenSince(
      cutoff,
    );

  const finishedAt =
    new Date();

  return {
    startedAtISO:
      startedAt.toISOString(),

    finishedAtISO:
      finishedAt.toISOString(),

    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),

    countriesProcessed:
      countries.length,

    storiesCollected:
      stories.length,

    articlesCollected:
      articleIds.size,

    storiesSaved:
      persistenceResult.storiesSaved,

    articlesSaved:
      persistenceResult.articlesSaved,

    maintenance: {
      retentionDays,

      storiesDeleted:
        maintenanceResult.storiesDeleted,

      cutoffISO:
        maintenanceResult.cutoffISO,
    },
  };
}

function getStoryRetentionDays():
  number {
  const configuredValue =
    process.env
      .STORY_RETENTION_DAYS;

  if (!configuredValue) {
    return DEFAULT_STORY_RETENTION_DAYS;
  }

  const parsedValue =
    Number(
      configuredValue,
    );

  if (
    !Number.isInteger(
      parsedValue,
    ) ||
    parsedValue <
      1
  ) {
    return DEFAULT_STORY_RETENTION_DAYS;
  }

  return Math.min(
    parsedValue,
    MAX_STORY_RETENTION_DAYS,
  );
}