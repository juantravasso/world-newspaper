import {
  translateStoriesToPortuguese,
} from "@/server/stories/story.translate-portuguese";

import {
  authorizeInternalRequest,
} from "@/server/security/internal-request-auth";

export const maxDuration =
  300;

export function GET(
  request:
    Request,
) {
  return handleTranslateRequest(
    request,
  );
}

export function POST(
  request:
    Request,
) {
  return handleTranslateRequest(
    request,
  );
}

async function handleTranslateRequest(
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

        headers:
          getNoStoreHeaders(),
      },
    );
  }

  try {
    const result =
      await translateStoriesToPortuguese();

    return Response.json(
      {
        ok:
          true,

        result,
      },
      {
        headers:
          getNoStoreHeaders(),
      },
    );
  } catch (
    error
  ) {
    console.error(
      "[TRANSLATE PORTUGUESE ERROR]",
      error,
    );

    return Response.json(
      {
        ok:
          false,

        message:
          error instanceof
            Error
            ? error.message
            : String(
                error,
              ),
      },
      {
        status:
          500,

        headers:
          getNoStoreHeaders(),
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
