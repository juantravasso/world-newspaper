import {
  getStoryStorageStats,
} from "@/server/stories/story.persistence";

export const maxDuration =
  30;

const MAX_COLLECTION_AGE_MINUTES =
  120;

export async function GET(
  request: Request,
) {
  const checkedAtISO =
    new Date()
      .toISOString();

  /*
   * Sem `?freshness=1`, "saudável" = banco
   * conectado: o workflow de sincronização checa
   * este endpoint antes de coletar, e falhar por
   * coleta atrasada impediria justamente a coleta
   * que resolve o atraso.
   */
  const enforceFreshness =
    new URL(
      request.url,
    ).searchParams.get(
      "freshness",
    ) ===
    "1";

  try {
    const storage =
      await getStoryStorageStats();

    const collectionAgeMinutes =
      storage.latestSeenAtISO
        ? Math.round(
            (
              Date.now() -
              new Date(
                storage.latestSeenAtISO,
              ).getTime()
            ) /
              60_000,
          )
        : null;

    /*
     * A coleta roda a cada 30 min, mas o agendador
     * do GitHub atrasa — 2 h evita alarme falso e
     * ainda pega uma coleta parada no mesmo dia.
     */
    const collectionStale =
      collectionAgeMinutes ===
        null ||
      collectionAgeMinutes >
        MAX_COLLECTION_AGE_MINUTES;

    const failing =
      enforceFreshness &&
      collectionStale;

    return Response.json(
      {
        ok:
          !failing,

        status:
          collectionStale
            ? "stale"
            : "healthy",

        collection: {
          ageMinutes:
            collectionAgeMinutes,

          maxAgeMinutes:
            MAX_COLLECTION_AGE_MINUTES,
        },

        services: {
          application:
            "available",

          database:
            "connected",
        },

        content: {
          stories:
            storage.stories,

          articles:
            storage.articles,

          newestPublishedAtISO:
            storage.newestPublishedAtISO,

          latestSeenAtISO:
            storage.latestSeenAtISO,
        },

        checkedAtISO,
      },
      {
        status:
          failing
            ? 503
            : 200,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",

          "X-Robots-Tag":
            "noindex, nofollow",
        },
      },
    );
  } catch (error) {
    console.error(
      "[PUBLIC HEALTH CHECK ERROR]",
      error,
    );

    return Response.json(
      {
        ok:
          false,

        status:
          "unhealthy",

        services: {
          application:
            "available",

          database:
            "unavailable",
        },

        checkedAtISO,
      },
      {
        status:
          503,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",

          "X-Robots-Tag":
            "noindex, nofollow",
        },
      },
    );
  }
}
