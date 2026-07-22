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
            "no-store",
        },
      },
    );
  }

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
            "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "[STORY SYNCHRONIZATION ERROR]",
      error,
    );

    return Response.json(
      {
        ok:
          false,

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
            "no-store",
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