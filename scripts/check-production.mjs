const siteUrl =
  getRequiredEnvironmentVariable(
    "PRODUCTION_SITE_URL",
  );

const cronSecret =
  getRequiredEnvironmentVariable(
    "CRON_SECRET",
  );

const baseUrl =
  normalizeSiteUrl(
    siteUrl,
  );

console.log(
  `[production-check] Checking ${baseUrl}`,
);

const health =
  await requestJson(
    `${baseUrl}/api/health`,
  );

assert(
  health.ok ===
    true,
  "Public health endpoint is not healthy.",
);

const status =
  await requestJson(
    `${baseUrl}/api/internal/stories/status`,
    {
      headers: {
        Authorization:
          `Bearer ${cronSecret}`,
      },
    },
  );

assert(
  status.ok ===
    true,
  "Protected story status endpoint failed.",
);

console.log(
  JSON.stringify(
    {
      ok:
        true,

      site:
        baseUrl,

      database:
        health.services
          ?.database ??
        "unknown",

      stories:
        status.storage
          ?.stories ??
        null,

      articles:
        status.storage
          ?.articles ??
        null,

      latestSeenAtISO:
        status.storage
          ?.latestSeenAtISO ??
        null,

      checkedAtISO:
        new Date()
          .toISOString(),
    },
    null,
    2,
  ),
);

function getRequiredEnvironmentVariable(
  variableName,
) {
  const value =
    process.env[
      variableName
    ]
      ?.trim();

  if (!value) {
    throw new Error(
      `Missing environment variable: ${variableName}`,
    );
  }

  return value;
}

function normalizeSiteUrl(
  value,
) {
  const url =
    new URL(
      value,
    );

  if (
    url.protocol !==
      "https:" &&
    url.hostname !==
      "localhost"
  ) {
    throw new Error(
      "PRODUCTION_SITE_URL must use HTTPS.",
    );
  }

  return url
    .toString()
    .replace(
      /\/$/,
      "",
    );
}

async function requestJson(
  url,
  init = {},
) {
  const response =
    await fetch(
      url,
      {
        ...init,

        headers: {
          Accept:
            "application/json",

          ...init.headers,
        },

        signal:
          AbortSignal.timeout(
            60_000,
          ),
      },
    );

  const text =
    await response.text();

  let payload;

  try {
    payload =
      JSON.parse(
        text,
      );
  } catch {
    throw new Error(
      `Invalid JSON from ${url}: ${text.slice(
        0,
        300,
      )}`,
    );
  }

  if (
    !response.ok
  ) {
    throw new Error(
      `Request failed with HTTP ${response.status}: ${JSON.stringify(
        payload,
      )}`,
    );
  }

  return payload;
}

function assert(
  condition,
  message,
) {
  if (!condition) {
    throw new Error(
      message,
    );
  }
}
