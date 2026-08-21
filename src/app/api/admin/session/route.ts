import {
  authorizeAdminRequest,
  clearAdminSessionCookie,
  createAdminSessionCookie,
  createAdminSessionToken,
  verifyAdminCredentials,
} from "@/server/security/admin-auth";

import {
  checkAdminLoginRateLimit,
  clearAdminLoginFailures,
  recordAdminLoginFailure,
} from "@/server/security/admin-login-rate-limit";

export async function GET(
  request:
    Request,
) {
  const authorization =
    authorizeAdminRequest(
      request,
    );

  return Response.json(
    {
      authenticated:
        authorization.authorized,
    },
    {
      status:
        authorization.authorized
          ? 200
          : authorization.status,

      headers:
        getNoStoreHeaders(),
    },
  );
}

export async function POST(
  request:
    Request,
) {
  const rateLimit =
    checkAdminLoginRateLimit(
      request,
    );

  if (
    !rateLimit.allowed
  ) {
    return Response.json(
      {
        ok:
          false,

        message:
          "Muitas tentativas de login. Aguarde alguns minutos.",
      },
      {
        status:
          429,

        headers: {
          ...getNoStoreHeaders(),

          "Retry-After":
            String(
              rateLimit.retryAfterSeconds,
            ),
        },
      },
    );
  }

  try {
    const body =
      await request.json() as
        unknown;

    const credentials =
      normalizeCredentials(
        body,
      );

    if (
      !credentials
    ) {
      return Response.json(
        {
          ok:
            false,

          message:
            "Informe usuário e senha.",
        },
        {
          status:
            400,

          headers:
            getNoStoreHeaders(),
        },
      );
    }

    if (
      !verifyAdminCredentials(
        credentials.username,
        credentials.password,
      )
    ) {
      recordAdminLoginFailure(
        rateLimit.key,
      );

      return Response.json(
        {
          ok:
            false,

          message:
            "Usuário ou senha inválidos.",
        },
        {
          status:
            401,

          headers:
            getNoStoreHeaders(),
        },
      );
    }

    clearAdminLoginFailures(
      rateLimit.key,
    );

    const token =
      createAdminSessionToken();

    return Response.json(
      {
        ok:
          true,
      },
      {
        headers: {
          ...getNoStoreHeaders(),

          "Set-Cookie":
            createAdminSessionCookie(
              token,
            ),
        },
      },
    );
  } catch (
    error
  ) {
    console.error(
      "[ADMIN LOGIN ERROR]",
      error,
    );

    return Response.json(
      {
        ok:
          false,

        message:
          error instanceof Error
            ? error.message
            : "Não foi possível autenticar.",
      },
      {
        status:
          503,

        headers:
          getNoStoreHeaders(),
      },
    );
  }
}

export async function DELETE() {
  return Response.json(
    {
      ok:
        true,
    },
    {
      headers: {
        ...getNoStoreHeaders(),

        "Set-Cookie":
          clearAdminSessionCookie(),
      },
    },
  );
}

function normalizeCredentials(
  value:
    unknown,
): {
  username:
    string;

  password:
    string;
} | null {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return null;
  }

  const objectValue =
    value as
      Record<
        string,
        unknown
      >;

  const username =
    objectValue.username;

  const password =
    objectValue.password;

  if (
    typeof username !==
      "string" ||
    typeof password !==
      "string" ||
    !username.trim() ||
    !password
  ) {
    return null;
  }

  return {
    username:
      username.trim(),

    password,
  };
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
