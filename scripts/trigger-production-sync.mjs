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
  `[production-sync] Triggering synchronization at ${baseUrl}`,
);

const response =
  await fetch(
    `${baseUrl}/api/internal/stories/sync`,
    {
      method:
        "POST",

      headers: {
        Accept:
          "application/json",

        Authorization:
          `Bearer ${cronSecret}`,
      },

      signal:
        AbortSignal.timeout(
          360_000,
        ),
    },
  );

const responseText =
  await response.text();

let payload;

try {
  payload =
    JSON.parse(
      responseText,
    );
} catch {
  throw new Error(
    `Synchronization returned invalid JSON: ${responseText.slice(
      0,
      500,
    )}`,
  );
}

if (
  !response.ok ||
  payload.ok !==
    true
) {
  throw new Error(
    `Synchronization failed with HTTP ${response.status}: ${JSON.stringify(
      payload,
    )}`,
  );
}

console.log(
  JSON.stringify(
    payload,
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
