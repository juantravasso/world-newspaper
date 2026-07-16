import Parser from "rss-parser";

import type {
  NewsFeedConfig,
  NewsSourceConfig,
} from "../news-source.types";

type MediaNode = {
  $?: {
    url?: string;
  };

  url?: string;
};

type CustomItem = {
  mediaContent?:
    | MediaNode
    | MediaNode[];

  mediaThumbnail?:
    | MediaNode
    | MediaNode[];

  contentEncoded?: string;

  enclosure?: {
    url?: string;
    type?: string;
  };
};

const MAX_FEED_BYTES =
  2_000_000;

const parser =
  new Parser<
    Record<string, never>,
    CustomItem
  >({
    customFields: {
      item: [
        [
          "media:content",
          "mediaContent",
          {
            keepArray: true,
          },
        ],

        [
          "media:thumbnail",
          "mediaThumbnail",
          {
            keepArray: true,
          },
        ],

        [
          "content:encoded",
          "contentEncoded",
        ],
      ],
    },
  });

export type ParsedSourceItem = {
  source:
    NewsSourceConfig;

  feed:
    NewsFeedConfig;

  item:
    Awaited<
      ReturnType<
        typeof parser.parseString
      >
    >["items"][number];
};

export async function parseSourceFeed(
  source: NewsSourceConfig,
  feed:
    NewsFeedConfig,
): Promise<ParsedSourceItem[]> {
  const response =
    await fetch(feed.url, {
      headers: {
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5",

        "User-Agent":
          "WorldNewspaper/0.1 RSS Aggregator",
      },

      next: {
        revalidate: 900,
      },

      signal:
        AbortSignal.timeout(
          15_000,
        ),
    });

  if (!response.ok) {
    throw new Error(
      `Feed ${source.id} returned ${response.status}`,
    );
  }

  const contentLength =
    Number(
      response.headers.get(
        "content-length",
      ) ?? 0,
    );

  if (
    contentLength >
    MAX_FEED_BYTES
  ) {
    throw new Error(
      `Feed ${source.id} is too large`,
    );
  }

  const xml =
    await response.text();

  if (
    Buffer.byteLength(
      xml,
      "utf8",
    ) >
    MAX_FEED_BYTES
  ) {
    throw new Error(
      `Feed ${source.id} is too large`,
    );
  }

  const parsed =
    await parser.parseString(xml);

  return parsed.items.map(
    (item) => ({
      source,
      feed,
      item,
    }),
  );
}

export function extractItemImage(
  item:
    ParsedSourceItem["item"],
): string | undefined {
  const mediaContent =
    toMediaArray(
      item.mediaContent,
    );

  const mediaThumbnail =
    toMediaArray(
      item.mediaThumbnail,
    );

  const mediaUrl =
    [
      ...mediaContent,
      ...mediaThumbnail,
    ]
      .map(
        (media) =>
          media.$?.url ??
          media.url,
      )
      .find(Boolean);

  if (mediaUrl) {
    return mediaUrl;
  }

  if (
    item.enclosure?.url &&
    item.enclosure.type?.startsWith(
      "image/",
    )
  ) {
    return item.enclosure.url;
  }

  const html =
    item.contentEncoded ??
    item.content ??
    "";

  return extractImageFromHtml(
    html,
  );
}

function toMediaArray(
  value:
    | MediaNode
    | MediaNode[]
    | undefined,
): MediaNode[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value)
    ? value
    : [value];
}

function extractImageFromHtml(
  html: string,
): string | undefined {
  const match =
    html.match(
      /<img[^>]+src=["']([^"']+)["']/i,
    );

  return match?.[1];
}

export function extractItemLink(
  item:
    ParsedSourceItem["item"],

  websiteUrl: string,
): string | undefined {
  const candidates = [
    item.link,
    item.guid,

    extractFirstLinkFromHtml(
      item.contentEncoded,
    ),

    extractFirstLinkFromHtml(
      item.content,
    ),
  ];

  for (const candidate of candidates) {
    if (
      typeof candidate !==
      "string"
    ) {
      continue;
    }

    try {
      const url =
        new URL(
          candidate.trim(),
          websiteUrl,
        );

      if (
        isLikelyArticleUrl(
          url,
          websiteUrl,
        )
      ) {
        return url.toString();
      }
    } catch {
      // Tenta o próximo candidato.
    }
  }

  return undefined;
}

function extractFirstLinkFromHtml(
  html?: string,
): string | undefined {
  if (!html) {
    return undefined;
  }

  return html.match(
    /<a[^>]+href=["']([^"']+)["']/i,
  )?.[1];
}

function isLikelyArticleUrl(
  url: URL,
  websiteUrl: string,
): boolean {
  const website =
    new URL(websiteUrl);

  const urlHostname =
    url.hostname.replace(
      /^www\./,
      "",
    );

  const websiteHostname =
    website.hostname.replace(
      /^www\./,
      "",
    );

  if (
    urlHostname !==
    websiteHostname
  ) {
    return false;
  }

  const pathParts =
    url.pathname
      .split("/")
      .filter(Boolean);

  if (
    pathParts.length < 2
  ) {
    return false;
  }

  const invalidPaths = [
    "/feed",
    "/rss",
    "/g/seccion/articulo/",
  ];

  return !invalidPaths.some(
    (invalidPath) =>
      url.pathname ===
      invalidPath,
  );
}
