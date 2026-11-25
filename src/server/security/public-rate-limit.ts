import "server-only";

/*
 * Janela fixa em memória, por instância. Na Vercel
 * (fluid compute) a instância é reaproveitada entre
 * requisições, então segura rajadas de um mesmo IP,
 * mas não é um limite global entre instâncias — para
 * isso, regra de rate limit no Firewall da Vercel ou
 * um store compartilhado (Redis).
 */

type Bucket = {
  count:
    number;

  resetAt:
    number;
};

export type PublicRateLimitPolicy = {
  name:
    string;

  maxRequests:
    number;

  windowMs:
    number;
};

export type PublicRateLimitResult =
  | {
      allowed:
        true;
    }
  | {
      allowed:
        false;

      retryAfterSeconds:
        number;
    };

const MAX_TRACKED_KEYS =
  10_000;

const globalForPublicRateLimit =
  globalThis as unknown as {
    publicRateLimitBuckets:
      Map<
        string,
        Bucket
      > | undefined;
  };

const buckets =
  globalForPublicRateLimit
    .publicRateLimitBuckets ??
  new Map<
    string,
    Bucket
  >();

globalForPublicRateLimit
  .publicRateLimitBuckets =
  buckets;

export function checkPublicRateLimit(
  request:
    Request,

  policy:
    PublicRateLimitPolicy,
): PublicRateLimitResult {
  const now =
    Date.now();

  const key =
    `${policy.name}:${getClientAddress(
      request,
    )}`;

  const current =
    buckets.get(
      key,
    );

  if (
    !current ||
    current.resetAt <=
      now
  ) {
    if (
      buckets.size >=
      MAX_TRACKED_KEYS
    ) {
      evictExpired(
        now,
      );
    }

    buckets.set(
      key,
      {
        count:
          1,

        resetAt:
          now +
          policy.windowMs,
      },
    );

    return {
      allowed:
        true,
    };
  }

  if (
    current.count >=
    policy.maxRequests
  ) {
    return {
      allowed:
        false,

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

  current.count +=
    1;

  return {
    allowed:
      true,
  };
}

export function rateLimitedResponse(
  retryAfterSeconds:
    number,
): Response {
  return Response.json(
    {
      ok:
        false,

      message:
        "Muitas requisições. Tente novamente em instantes.",
    },
    {
      status:
        429,

      headers: {
        "Cache-Control":
          "no-store",

        "Retry-After":
          String(
            retryAfterSeconds,
          ),
      },
    },
  );
}

function evictExpired(
  now:
    number,
): void {
  for (
    const [
      key,
      bucket,
    ] of
    buckets
  ) {
    if (
      bucket.resetAt <=
      now
    ) {
      buckets.delete(
        key,
      );
    }
  }

  if (
    buckets.size >=
    MAX_TRACKED_KEYS
  ) {
    buckets.clear();
  }
}

function getClientAddress(
  request:
    Request,
): string {
  return (
    request.headers
      .get(
        "x-forwarded-for",
      )
      ?.split(
        ",",
      )[0]
      ?.trim() ||
    request.headers.get(
      "x-real-ip",
    ) ||
    "unknown"
  );
}
