import {
  revalidateTag,
} from "next/cache";

import {
  WORLD_NEWS_CACHE_TAG,
} from "@/server/news/news-cache";

import {
  authorizeInternalRequest,
} from "@/server/security/internal-request-auth";

import {
  getStoryStorageStats,
} from "@/server/stories/story.persistence";

import {
  synchronizeStories,
} from "@/server/stories/story.sync";

export const maxDuration =
  300;

export function GET(
  request:
    Request,
) {
  return handleSynchronizationRequest(
    request,
  );
}

export function POST(
  request:
    Request,
) {
  return handleSynchronizationRequest(
    request,
  );
}

async function handleSynchronizationRequest(
  request:
    Request,
) {
  const authorization =
    authorizeInternalRequest(
      request,
    );

  if (
    !authorization.authorized
  ) {
    return Response.json(
      {
        ok:
          false,

        message:
          authorization.message,
      },
      {
        status:
          authorization.status,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",

          "X-Robots-Tag":
            "noindex, nofollow",
        },
      },
    );
  }

  const requestId =
    crypto.randomUUID();

  try {
    const synchronization =
      await synchronizeStories();

    revalidateTag(
      WORLD_NEWS_CACHE_TAG,
      "max",
    );

    const storage =
      await getStoryStorageStats();

    return Response.json(
      {
        ok:
          true,

        requestId,

        synchronization,

        storage,

        cache: {
          tag:
            WORLD_NEWS_CACHE_TAG,

          revalidated:
            true,
        },
      },
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",

          "X-Robots-Tag":
            "noindex, nofollow",

          "X-Sync-Request-Id":
            requestId,
        },
      },
    );
  } catch (error) {
    console.error(
      `[STORY SYNCHRONIZATION ERROR] requestId=${requestId}`,
      error,
    );

    return Response.json(
      {
        ok:
          false,

        requestId,

        message:
          getErrorMessage(
            error,
          ),
      },
      {
        status:
          500,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",

          "X-Robots-Tag":
            "noindex, nofollow",

          "X-Sync-Request-Id":
            requestId,
        },
      },
    );
  }
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
