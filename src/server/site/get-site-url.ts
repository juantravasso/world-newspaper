import "server-only";

const LOCAL_SITE_URL =
  "http://localhost:3000";

export function getSiteUrl():
  URL {
  const configuredUrl =
    process.env
      .NEXT_PUBLIC_SITE_URL ??
    process.env
      .VERCEL_PROJECT_PRODUCTION_URL ??
    process.env
      .VERCEL_URL;

  if (!configuredUrl) {
    return new URL(
      LOCAL_SITE_URL,
    );
  }

  const normalizedUrl =
    configuredUrl.startsWith(
      "http://",
    ) ||
    configuredUrl.startsWith(
      "https://",
    )
      ? configuredUrl
      : `https://${configuredUrl}`;

  try {
    return new URL(
      normalizedUrl,
    );
  } catch {
    return new URL(
      LOCAL_SITE_URL,
    );
  }
}

export function getStoryUrl(
  storyId:
    string,
): URL {
  return new URL(
    `/noticias/${encodeURIComponent(
      storyId,
    )}`,
    getSiteUrl(),
  );
}
