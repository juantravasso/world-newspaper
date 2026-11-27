import "server-only";

import type {
  AdminDashboardData,
  AdminSourceHealthItem,
  AdminSyncRunItem,
  AdminSyncRunStatus,
  AdminSyncRunTrigger,
} from "@/domain/admin/admin.types";

import {
  listCountryCatalog,
} from "@/server/countries/country-catalog";

import {
  prisma,
} from "@/server/database/prisma";

import {
  getStoryStorageStats,
} from "@/server/stories/story.persistence";

const ABANDONED_RUN_MINUTES =
  15;

const SYNC_HISTORY_DAYS =
  90;

const SOURCE_ACTIVE_HOURS =
  6;

const SOURCE_QUIET_HOURS =
  48;

const MILLISECONDS_PER_HOUR =
  60 *
  60 *
  1_000;

const MILLISECONDS_PER_DAY =
  24 *
  MILLISECONDS_PER_HOUR;

const categoryLabels = {
  politics:
    "Política",

  economy:
    "Economia",
} as const;

type SyncRunRecord = {
  id:
    string;

  trigger:
    AdminSyncRunTrigger;

  status:
    AdminSyncRunStatus;

  requestId:
    string | null;

  startedAt:
    Date;

  finishedAt:
    Date | null;

  durationMs:
    number | null;

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

  retentionDays:
    number;

  storiesDeleted:
    number;

  errorMessage:
    string | null;
};

export type SyncRunCompletionInput = {
  finishedAt:
    Date;

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

  retentionDays:
    number;

  storiesDeleted:
    number;
};

export async function startSyncRun({
  trigger,
  requestId,
  startedAt,
}: {
  trigger:
    AdminSyncRunTrigger;

  requestId?:
    string;

  startedAt:
    Date;
}): Promise<
  string
> {
  await markAbandonedRuns();

  const run =
    await prisma
      .syncRun
      .create({
        data: {
          trigger,

          requestId:
            requestId ??
            null,

          startedAt,
        },

        select: {
          id:
            true,
        },
      });

  return run.id;
}

export async function completeSyncRun(
  syncRunId:
    string,

  input:
    SyncRunCompletionInput,
): Promise<void> {
  await prisma
    .syncRun
    .update({
      where: {
        id:
          syncRunId,
      },

      data: {
        status:
          "success",

        finishedAt:
          input.finishedAt,

        durationMs:
          input.durationMs,

        countriesProcessed:
          input.countriesProcessed,

        storiesCollected:
          input.storiesCollected,

        articlesCollected:
          input.articlesCollected,

        storiesSaved:
          input.storiesSaved,

        articlesSaved:
          input.articlesSaved,

        retentionDays:
          input.retentionDays,

        storiesDeleted:
          input.storiesDeleted,

        errorMessage:
          null,
      },
    });

  await deleteOldSyncRuns();
}

export async function failSyncRun(
  syncRunId:
    string,

  {
    finishedAt,
    durationMs,
    errorMessage,
  }: {
    finishedAt:
      Date;

    durationMs:
      number;

    errorMessage:
      string;
  },
): Promise<void> {
  await prisma
    .syncRun
    .update({
      where: {
        id:
          syncRunId,
      },

      data: {
        status:
          "failed",

        finishedAt,

        durationMs,

        errorMessage:
          errorMessage.slice(
            0,
            10_000,
          ),
      },
    });

  await deleteOldSyncRuns();
}

export async function getAdminDashboardData():
  Promise<
    AdminDashboardData
  > {
  const generatedAt =
    new Date();

  const last24Hours =
    new Date(
      generatedAt.getTime() -
      MILLISECONDS_PER_DAY,
    );

  const [
    storage,
    recentRuns,
    latestSuccessfulRun,
    runsLast24Hours,
    sourceGroups,
    categoryGroups,
    countryGroups,
    registeredSources,
  ] =
    await Promise.all([
      getStoryStorageStats(),

      prisma
        .syncRun
        .findMany({
          orderBy: {
            startedAt:
              "desc",
          },

          take:
            20,
        }),

      prisma
        .syncRun
        .findFirst({
          where: {
            status:
              "success",
          },

          orderBy: {
            finishedAt:
              "desc",
          },
        }),

      prisma
        .syncRun
        .findMany({
          where: {
            startedAt: {
              gte:
                last24Hours,
            },
          },

          orderBy: {
            startedAt:
              "desc",
          },
        }),

      prisma
        .article
        .groupBy({
          by: [
            "sourceId",
          ],

          _count: {
            _all:
              true,
          },

          _max: {
            publishedAt:
              true,

            lastSeenAt:
              true,
          },
        }),

      prisma
        .story
        .groupBy({
          by: [
            "category",
          ],

          _count: {
            _all:
              true,
          },
        }),

      prisma
        .story
        .groupBy({
          by: [
            "countryCode",
          ],

          _count: {
            _all:
              true,
          },
        }),

      prisma
        .newsSource
        .findMany({
          where: {
            enabled:
              true,
          },

          select: {
            id:
              true,

            name:
              true,

            countryCode:
              true,

            feedUrl:
              true,
          },
        }),
    ]);

  const countryNames =
    new Map<
      string,
      string
    >(
      listCountryCatalog()
        .map(
          (country) =>
            [
              country.code,
              country.name,
            ] as const,
        ),
    );

  const articleStatsBySource =
    new Map(
      sourceGroups.map(
        (group) =>
          [
            group.sourceId,
            group,
          ] as const,
      ),
    );

  /*
   * A lista parte das fontes cadastradas, não dos
   * artigos — senão fonte que nunca trouxe nada
   * simplesmente não aparece.
   */
  const sourceHealth =
    registeredSources
      .map(
        (
          source,
        ): AdminSourceHealthItem => {
          const stats =
            articleStatsBySource.get(
              source.id,
            );

          const latestSeenAt =
            stats?._max
              .lastSeenAt ??
            null;

          return {
            sourceId:
              source.id,

            sourceName:
              source.name,

            countryCode:
              source.countryCode,

            countryName:
              countryNames.get(
                source.countryCode,
              ) ??
              source.countryCode,

            articles:
              stats?._count
                ._all ??
              0,

            newestPublishedAtISO:
              stats?._max
                .publishedAt
                ?.toISOString() ??
              null,

            latestSeenAtISO:
              latestSeenAt
                ?.toISOString() ??
              null,

            status:
              !source.feedUrl &&
              !latestSeenAt
                ? "no_feed"
                : getSourceStatus(
                    latestSeenAt,
                    generatedAt,
                  ),
          };
        },
      )
      .sort(
        (
          first,
          second,
        ) =>
          getSourceStatusWeight(
            first.status,
          ) -
            getSourceStatusWeight(
              second.status,
            ) ||
          getTimestamp(
            second.latestSeenAtISO,
          ) -
            getTimestamp(
              first.latestSeenAtISO,
            ),
      );

  const successfulRuns =
    runsLast24Hours.filter(
      (run) =>
        run.status ===
        "success",
    );

  const failedRuns =
    runsLast24Hours.filter(
      (run) =>
        run.status ===
        "failed",
    );

  const durations =
    successfulRuns
      .map(
        (run) =>
          run.durationMs,
      )
      .filter(
        (
          duration,
        ): duration is number =>
          duration !==
          null,
      );

  const averageDurationMs =
    durations.length >
    0
      ? Math.round(
          durations.reduce(
            (
              total,
              duration,
            ) =>
              total +
              duration,
            0,
          ) /
            durations.length,
        )
      : null;

  const sourceSummary:
    AdminDashboardData[
      "sourceSummary"
    ] = {
    active:
      0,

    quiet:
      0,

    stale:
      0,

    empty:
      0,

    no_feed:
      0,
  };

  for (
    const source of
    sourceHealth
  ) {
    sourceSummary[
      source.status
    ] +=
      1;
  }

  const latestRun =
    recentRuns[0] ??
    null;

  return {
    generatedAtISO:
      generatedAt
        .toISOString(),

    systemStatus:
      getSystemStatus({
        now:
          generatedAt,

        latestRunStatus:
          latestRun
            ?.status ??
          null,

        latestSuccessAt:
          latestSuccessfulRun
            ?.finishedAt ??
          null,

        stories:
          storage.stories,
      }),

    storage,

    syncSummary: {
      latestRunAtISO:
        latestRun
          ?.startedAt
          .toISOString() ??
        null,

      latestSuccessAtISO:
        latestSuccessfulRun
          ?.finishedAt
          ?.toISOString() ??
        null,

      runsLast24Hours:
        runsLast24Hours.length,

      successfulRunsLast24Hours:
        successfulRuns.length,

      failedRunsLast24Hours:
        failedRuns.length,

      successRateLast24Hours:
        runsLast24Hours.length >
        0
          ? Math.round(
              (
                successfulRuns.length /
                runsLast24Hours.length
              ) *
                100,
            )
          : 0,

      averageDurationMs,
    },

    sourceSummary,

    recentRuns:
      recentRuns.map(
        toAdminSyncRunItem,
      ),

    sourceHealth,

    categories:
      (
        [
          "politics",
          "economy",
        ] as const
      ).map(
        (category) => ({
          category,

          label:
            categoryLabels[
              category
            ],

          stories:
            categoryGroups
              .find(
                (group) =>
                  group.category ===
                  category,
              )
              ?._count
              ._all ??
            0,
        }),
      ),

    countries:
      countryGroups
        .map(
          (group) => ({
            countryCode:
              group.countryCode,

            countryName:
              countryNames.get(
                group.countryCode,
              ) ??
              group.countryCode,

            stories:
              group._count
                ._all,
          }),
        )
        .sort(
          (
            first,
            second,
          ) =>
            second.stories -
            first.stories,
        )
        .slice(
          0,
          15,
        ),
  };
}

function toAdminSyncRunItem(
  run:
    SyncRunRecord,
): AdminSyncRunItem {
  return {
    id:
      run.id,

    trigger:
      run.trigger,

    status:
      run.status,

    requestId:
      run.requestId,

    startedAtISO:
      run.startedAt
        .toISOString(),

    finishedAtISO:
      run.finishedAt
        ?.toISOString() ??
      null,

    durationMs:
      run.durationMs,

    countriesProcessed:
      run.countriesProcessed,

    storiesCollected:
      run.storiesCollected,

    articlesCollected:
      run.articlesCollected,

    storiesSaved:
      run.storiesSaved,

    articlesSaved:
      run.articlesSaved,

    retentionDays:
      run.retentionDays,

    storiesDeleted:
      run.storiesDeleted,

    errorMessage:
      run.errorMessage,
  };
}

async function markAbandonedRuns():
  Promise<void> {
  const cutoff =
    new Date(
      Date.now() -
      ABANDONED_RUN_MINUTES *
        60 *
        1_000,
    );

  await prisma
    .syncRun
    .updateMany({
      where: {
        status:
          "running",

        startedAt: {
          lt:
            cutoff,
        },
      },

      data: {
        status:
          "failed",

        finishedAt:
          new Date(),

        errorMessage:
          "Execução interrompida antes da conclusão.",
      },
    });
}

async function deleteOldSyncRuns():
  Promise<void> {
  const cutoff =
    new Date(
      Date.now() -
      SYNC_HISTORY_DAYS *
        MILLISECONDS_PER_DAY,
    );

  await prisma
    .syncRun
    .deleteMany({
      where: {
        startedAt: {
          lt:
            cutoff,
        },
      },
    });
}

function getSystemStatus({
  now,
  latestRunStatus,
  latestSuccessAt,
  stories,
}: {
  now:
    Date;

  latestRunStatus:
    string | null;

  latestSuccessAt:
    Date | null;

  stories:
    number;
}):
  AdminDashboardData[
    "systemStatus"
  ] {
  if (
    stories ===
    0
  ) {
    return "critical";
  }

  if (
    !latestSuccessAt
  ) {
    return "warning";
  }

  const ageInHours =
    (
      now.getTime() -
      latestSuccessAt.getTime()
    ) /
    MILLISECONDS_PER_HOUR;

  if (
    latestRunStatus ===
      "failed" &&
    ageInHours >
      1
  ) {
    return "critical";
  }

  if (
    ageInHours <=
    1.5
  ) {
    return "healthy";
  }

  if (
    ageInHours <=
    6
  ) {
    return "warning";
  }

  return "critical";
}

function getSourceStatus(
  latestSeenAt:
    Date | null,

  now:
    Date,
):
  AdminSourceHealthItem[
    "status"
  ] {
  if (!latestSeenAt) {
    return "empty";
  }

  const ageInHours =
    (
      now.getTime() -
      latestSeenAt.getTime()
    ) /
    MILLISECONDS_PER_HOUR;

  if (
    ageInHours <=
    SOURCE_ACTIVE_HOURS
  ) {
    return "active";
  }

  if (
    ageInHours <=
    SOURCE_QUIET_HOURS
  ) {
    return "quiet";
  }

  return "stale";
}

function getSourceStatusWeight(
  status:
    AdminSourceHealthItem[
      "status"
    ],
): number {
  return sourceStatusWeights[
    status
  ];
}

/*
 * Ordem da tabela: primeiro o que parou de
 * funcionar (exige ação), depois o que nunca
 * funcionou, por último o que está bem.
 */
const sourceStatusWeights:
  Record<
    AdminSourceHealthItem["status"],
    number
  > = {
  stale:
    0,

  empty:
    1,

  quiet:
    2,

  no_feed:
    3,

  active:
    4,
};

function getTimestamp(
  value:
    string | null,
): number {
  if (!value) {
    return 0;
  }

  const timestamp =
    new Date(
      value,
    ).getTime();

  return Number.isNaN(
    timestamp,
  )
    ? 0
    : timestamp;
}
