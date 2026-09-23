import "server-only";

const REQUEST_TIMEOUT_MS =
  10_000;

const MIN_LINK_TEXT_LENGTH =
  20;

const MAX_LINK_TEXT_LENGTH =
  200;

const MAX_LINKS =
  150;

const ANCHOR_PATTERN =
  /<a\s+[^>]*href=["']([^"'#][^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;

export type HomepageLink = {
  text:
    string;

  url:
    string;
};

/**
 * Baixa a home de um site sem RSS e extrai os
 * links de manchete (texto + URL absoluta),
 * na ordem em que aparecem no HTML — homepages
 * de jornal normalmente colocam as notícias
 * principais no topo.
 *
 * Filtra pra mesma origem (evita anúncios/redes
 * sociais) e descarta texto curto demais pra ser
 * uma manchete (menu, "Login", ícones). Nunca
 * lança — retorna lista vazia em qualquer falha.
 */
export async function scrapeHomepageLinks(
  websiteUrl:
    string,
): Promise<HomepageLink[]> {
  try {
    const response =
      await fetch(
        websiteUrl,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; WorldNewspaperBot/1.0)",
          },

          signal:
            AbortSignal.timeout(
              REQUEST_TIMEOUT_MS,
            ),
        },
      );

    if (
      !response.ok
    ) {
      return [];
    }

    const html =
      await response.text();

    return extractLinks(
      html,
      websiteUrl,
    );
  } catch (
    error
  ) {
    console.warn(
      "[HOMEPAGE SCRAPE] falha ao baixar",
      websiteUrl,
      error instanceof
        Error
        ? error.message
        : error,
    );

    return [];
  }
}

function extractLinks(
  html:
    string,

  websiteUrl:
    string,
): HomepageLink[] {
  const origin =
    safeOrigin(
      websiteUrl,
    );

  const seen =
    new Set<string>();

  const links:
    HomepageLink[] =
    [];

  for (
    const match of
    html.matchAll(
      ANCHOR_PATTERN,
    )
  ) {
    if (
      links.length >=
      MAX_LINKS
    ) {
      break;
    }

    const rawHref =
      match[1] ??
      "";

    const rawText =
      stripTags(
        match[2] ??
        "",
      );

    if (
      rawText.length <
        MIN_LINK_TEXT_LENGTH ||
      rawText.length >
        MAX_LINK_TEXT_LENGTH
    ) {
      continue;
    }

    const resolvedUrl =
      resolveUrl(
        rawHref,
        websiteUrl,
      );

    if (
      !resolvedUrl ||
      !origin ||
      safeOrigin(
        resolvedUrl,
      ) !==
        origin
    ) {
      continue;
    }

    if (
      seen.has(
        resolvedUrl,
      )
    ) {
      continue;
    }

    seen.add(
      resolvedUrl,
    );

    links.push(
      {
        text:
          rawText,

        url:
          resolvedUrl,
      },
    );
  }

  return links;
}

function stripTags(
  value:
    string,
): string {
  return value
    .replace(
      /<[^>]*>/g,
      " ",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

function resolveUrl(
  value:
    string,

  baseUrl:
    string,
): string | null {
  try {
    return new URL(
      value,
      baseUrl,
    ).toString();
  } catch {
    return null;
  }
}

function safeOrigin(
  value:
    string,
): string | null {
  try {
    return new URL(
      value,
    ).origin;
  } catch {
    return null;
  }
}
