import "server-only";

import type {
  AdminSyncRunTrigger,
} from "@/domain/admin/admin.types";

import type {
  NewsStory,
} from "@/domain/news/story.types";

import {
  completeSyncRun,
  failSyncRun,
  startSyncRun,
} from "@/server/monitoring/sync-run.repository";

import {
  collectWorldCountriesWithNews,
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

export type SynchronizeStoriesOptions = {
  trigger?:
    AdminSyncRunTrigger;

  requestId?:
    string;
};

export type SynchronizeStoriesResult = {
  syncRunId:
    string;

  startedAtISO:
    string;

  finishedAtISO:
    string;

  durationMs:
    number;

  countriesProcessed:
    number;

  storiesCollected:
    number;

  articlesCollected:
    number;

  storiesSaved:
    number;

  articlesSaved:
    number;

  maintenance: {
    retentionDays:
      number;

    storiesDeleted:
      number;

    cutoffISO:
      string;
  };
};

/**
 * Executa a sincronização das notícias.
 *
 * Quando já existe uma sincronização em andamento
 * nesta instância, novas chamadas reutilizam a
 * mesma Promise.
 */
export async function synchronizeStories(
  options:
    SynchronizeStoriesOptions = {},
): Promise<
  SynchronizeStoriesResult
> {
  if (
    synchronizationInProgress
  ) {
    return synchronizationInProgress;
  }

  synchronizationInProgress =
    performStorySynchronization(
      options,
    )
      .finally(
        () => {
          synchronizationInProgress =
            null;
        },
      );

  return synchronizationInProgress;
}

async function performStorySynchronization({
  trigger =
    "manual",
  requestId,
}: SynchronizeStoriesOptions):
  Promise<
    SynchronizeStoriesResult
  > {
  const startedAt =
    new Date();

  const syncRunId =
    await startSyncRun({
      trigger,
      requestId,
      startedAt,
    });

  try {
    const countries =
      await collectWorldCountriesWithNews();

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

        if (
          !existingStory
        ) {
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

    const result:
      SynchronizeStoriesResult = {
      syncRunId,

      startedAtISO:
        startedAt
          .toISOString(),

      finishedAtISO:
        finishedAt
          .toISOString(),

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
        persistenceResult
          .storiesSaved,

      articlesSaved:
        persistenceResult
          .articlesSaved,

      maintenance: {
        retentionDays,

        storiesDeleted:
          maintenanceResult
            .storiesDeleted,

        cutoffISO:
          maintenanceResult
            .cutoffISO,
      },
    };

    await completeSyncRun(
      syncRunId,
      {
        finishedAt,

        durationMs:
          result.durationMs,

        countriesProcessed:
          result
            .countriesProcessed,

        storiesCollected:
          result
            .storiesCollected,

        articlesCollected:
          result
            .articlesCollected,

        storiesSaved:
          result
            .storiesSaved,

        articlesSaved:
          result
            .articlesSaved,

        retentionDays:
          result
            .maintenance
            .retentionDays,

        storiesDeleted:
          result
            .maintenance
            .storiesDeleted,
      },
    );

    return result;
  } catch (
    error
  ) {
    const finishedAt =
      new Date();

    try {
      await failSyncRun(
        syncRunId,
        {
          finishedAt,

          durationMs:
            finishedAt.getTime() -
            startedAt.getTime(),

          errorMessage:
            getErrorMessage(
              error,
            ),
        },
      );
    } catch (
      monitoringError
    ) {
      console.error(
        "[SYNC MONITORING FAILURE]",
        monitoringError,
      );
    }

    throw error;
  }
}

function getStoryRetentionDays():
  number {
  const configuredValue =
    process.env
      .STORY_RETENTION_DAYS;

  if (
    !configuredValue
  ) {
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

function getErrorMessage(
  error:
    unknown,
): string {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return String(
    error,
  );
}
