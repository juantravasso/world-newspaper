import {
  authorizeInternalRequest,
} from "@/server/security/internal-request-auth";

import {
  getStoryStorageStats,
} from "@/server/stories/story.persistence";

export async function GET(
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
    const storage =
      await getStoryStorageStats();

    return Response.json(
      {
        ok:
          true,

        storage,

        checkedAtISO:
          new Date()
            .toISOString(),
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
      "[STORY STATUS ERROR]",
      error,
    );

    return Response.json(
      {
        ok:
          false,

        message:
          error instanceof Error
            ? error.message
            : String(
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