import {
  getStoryStorageStats,
} from "@/server/stories/story.persistence";

export const maxDuration =
  30;

export async function GET() {
  const checkedAtISO =
    new Date()
      .toISOString();

  try {
    const storage =
      await getStoryStorageStats();

    return Response.json(
      {
        ok:
          true,

        status:
          "healthy",

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
          200,

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
