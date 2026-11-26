import "server-only";

const MAX_ATTEMPTS =
  5;

const WINDOW_MS =
  15 *
  60 *
  1_000;

type AttemptRecord = {
  failures:
    number;

  resetAt:
    number;
};

const globalForAdminLogin =
  globalThis as unknown as {
    adminLoginAttempts:
      Map<
        string,
        AttemptRecord
      > | undefined;
  };

const attempts =
  globalForAdminLogin
    .adminLoginAttempts ??
  new Map<
    string,
    AttemptRecord
  >();

if (
  process.env.NODE_ENV !==
  "production"
) {
  globalForAdminLogin
    .adminLoginAttempts =
    attempts;
}

export type AdminLoginRateLimitResult =
  | {
      allowed:
        true;

      key:
        string;
    }
  | {
      allowed:
        false;

      key:
        string;

      retryAfterSeconds:
        number;
    };

export function checkAdminLoginRateLimit(
  request:
    Request,
): AdminLoginRateLimitResult {
  const key =
    getRequestKey(
      request,
    );

  const now =
    Date.now();

  const current =
    attempts.get(
      key,
    );

  if (
    !current ||
    current.resetAt <=
      now
  ) {
    attempts.delete(
      key,
    );

    return {
      allowed:
        true,

      key,
    };
  }

  if (
    current.failures <
    MAX_ATTEMPTS
  ) {
    return {
      allowed:
        true,

      key,
    };
  }

  return {
    allowed:
      false,

    key,

    retryAfterSeconds:
      Math.max(
        1,
        Math.ceil(
          (
            current.resetAt -
            now
          ) /
            1_000,
        ),
      ),
  };
}

export function recordAdminLoginFailure(
  key:
    string,
): void {
  const now =
    Date.now();

  const current =
    attempts.get(
      key,
    );

  if (
    !current ||
    current.resetAt <=
      now
  ) {
    attempts.set(
      key,
      {
        failures:
          1,

        resetAt:
          now +
          WINDOW_MS,
      },
    );

    return;
  }

  attempts.set(
    key,
    {
      ...current,

      failures:
        current.failures +
        1,
    },
  );
}

export function clearAdminLoginFailures(
  key:
    string,
): void {
  attempts.delete(
    key,
  );
}

function getRequestKey(
  request:
    Request,
): string {
  const forwardedFor =
    request.headers.get(
      "x-forwarded-for",
    );

  const address =
    forwardedFor
      ?.split(
        ",",
      )[0]
      ?.trim() ??
    request.headers.get(
      "x-real-ip",
    ) ??
    "unknown";

  return address;
}
