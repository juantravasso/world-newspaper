import {
  linkInternationalStories,
} from "@/server/stories/story.international-link";

import {
  authorizeInternalRequest,
} from "@/server/security/internal-request-auth";

export const maxDuration =
  300;

export function GET(
  request:
    Request,
) {
  return handleLinkRequest(
    request,
  );
}

export function POST(
  request:
    Request,
) {
  return handleLinkRequest(
    request,
  );
}

async function handleLinkRequest(
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

  const requestUrl =
    new URL(
      request.url,
    );

  /*
   * ?dryRun=true calcula os pares e devolve
   * as amostras sem gravar nada — é assim que
   * se valida o limiar de similaridade antes
   * de ligar o cron de verdade (ver plano).
   */
  const dryRun =
    requestUrl.searchParams.get(
      "dryRun",
    ) ===
    "true";

  try {
    const result =
      await linkInternationalStories(
        {
          dryRun,
        },
      );

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
      "[INTERNATIONAL LINK ERROR]",
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
