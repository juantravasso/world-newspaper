import {
  getAdminDashboardData,
} from "@/server/monitoring/sync-run.repository";

import {
  authorizeAdminRequest,
} from "@/server/security/admin-auth";

export const maxDuration =
  30;

export async function GET(
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

  try {
    const data =
      await getAdminDashboardData();

    return Response.json(
      {
        ok:
          true,

        data,
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
      "[ADMIN DASHBOARD ERROR]",
      error,
    );

    return Response.json(
      {
        ok:
          false,

        message:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o painel.",
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
