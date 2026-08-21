import {
  revalidateTag,
} from "next/cache";

import {
  getAdminDashboardData,
} from "@/server/monitoring/sync-run.repository";

import {
  WORLD_NEWS_CACHE_TAG,
} from "@/server/news/news-cache";

import {
  authorizeAdminRequest,
} from "@/server/security/admin-auth";

import {
  synchronizeStories,
} from "@/server/stories/story.sync";

export const maxDuration =
  300;

export async function POST(
  request:
    Request,
) {
  const authorization =
    authorizeAdminRequest(
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

        headers:
          getNoStoreHeaders(),
      },
    );
  }

  const requestId =
    crypto.randomUUID();

  try {
    const synchronization =
      await synchronizeStories({
        trigger:
          "admin",

        requestId,
      });

    revalidateTag(
      WORLD_NEWS_CACHE_TAG,
      "max",
    );

    const data =
      await getAdminDashboardData();

    return Response.json(
      {
        ok:
          true,

        requestId,

        synchronization,

        data,
      },
      {
        headers: {
          ...getNoStoreHeaders(),

          "X-Sync-Request-Id":
            requestId,
        },
      },
    );
  } catch (
    error
  ) {
    console.error(
      `[ADMIN SYNCHRONIZATION ERROR] requestId=${requestId}`,
      error,
    );

    return Response.json(
      {
        ok:
          false,

        requestId,

        message:
          error instanceof Error
            ? error.message
            : "A sincronização falhou.",
      },
      {
        status:
          500,

        headers: {
          ...getNoStoreHeaders(),

          "X-Sync-Request-Id":
            requestId,
        },
      },
    );
  }
}

function getNoStoreHeaders():
  Record<
    string,
    string
  > {
  return {
    "Cache-Control":
      "no-store, max-age=0",

    "X-Robots-Tag":
      "noindex, nofollow",
  };
}
