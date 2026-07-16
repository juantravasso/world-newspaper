import fs from "node:fs/promises";
import path from "node:path";

import Parser from "rss-parser";

const region =
  process.argv[2];

const allowedRegions =
  new Set([
    "america",
    "europe",
    "africa",
    "asia",
    "oceania",
    "middle-east",
  ]);

if (
  !region ||
  !allowedRegions.has(region)
) {
  console.error(
    "Uso: node scripts/audit-region-rss.mjs <america|europe|africa|asia|oceania|middle-east>",
  );

  process.exit(1);
}

const root =
  process.cwd();

const catalogPath =
  path.join(
    root,
    "src",
    "data",
    "news",
    `${region}.sources.json`,
  );

const outputPath =
  path.join(
    root,
    `rss-audit-${region}.json`,
  );

const parser =
  new Parser({
    timeout: 12_000,

    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; WorldNewspaperRSSAudit/0.2)",
    },
  });

const rejectedPatterns = [
  /comments?/i,
  /web-stories/i,
  /\/author\//i,
  /\/tag\//i,
  /\/search\//i,
  /podcast/i,
  /newsletter/i,
];

const catalog =
  JSON.parse(
    await fs.readFile(
      catalogPath,
      "utf8",
    ),
  );

const sources =
  catalog.countries.flatMap(
    (country) =>
      country.sources.map(
        (source) => ({
          ...source,

          countryCode:
            country.code,

          countryName:
            country.name,
        }),
      ),
  );

const results =
  await mapWithConcurrency(
    sources,
    5,
    auditSource,
  );

await fs.writeFile(
  outputPath,
  JSON.stringify(
    {
      generatedAt:
        new Date()
          .toISOString(),

      region,

      results,
    },
    null,
    2,
  ),
);

const found =
  results.filter(
    (result) =>
      result.feeds.length > 0,
  ).length;

console.log(
  `Feeds encontrados para ${found}/${results.length} fontes.`,
);

console.log(
  `Relatório salvo em ${outputPath}`,
);

async function auditSource(
  source,
) {
  const candidates =
    new Set(
      (source.feeds ?? [])
        .filter(
          (feed) =>
            feed.enabled !== false,
        )
        .map(
          (feed) =>
            feed.url,
        ),
    );

  try {
    const homepage =
      await fetchText(
        source.websiteUrl,
      );

    const discoveredFeeds =
      discoverFeedLinks(
        homepage,
        source.websiteUrl,
      );

    for (
      const discoveredFeed of
      discoveredFeeds
    ) {
      candidates.add(
        discoveredFeed,
      );
    }
  } catch (error) {
    console.warn(
      [
        "[HOMEPAGE WARNING]",
        source.countryCode,
        source.name,
        getErrorMessage(error),
      ].join(" "),
    );
  }

  const commonPaths = [
    "/feed",
    "/feed/",
    "/rss",
    "/rss/",
    "/rss.xml",
    "/feed.xml",
    "/atom.xml",
  ];

  for (
    const commonPath of
    commonPaths
  ) {
    try {
      candidates.add(
        new URL(
          commonPath,
          source.websiteUrl,
        ).toString(),
      );
    } catch {
      // Ignora URL-base inválida.
    }
  }

  const validFeeds = [];

  for (
    const candidate of
    [...candidates].slice(
      0,
      12,
    )
  ) {
    try {
      const xml =
        await fetchText(
          candidate,
        );

      const parsed =
        await parser.parseString(
          xml,
        );

      if (
        isRejectedFeed(
          candidate,
          parsed.title ?? "",
        )
      ) {
        continue;
      }

      const articleLinks =
        parsed.items
          .map(
            (item) =>
              typeof item.link ===
              "string"
                ? item.link.trim()
                : "",
          )
          .filter(Boolean);

      const uniqueLinks =
        new Set(
          articleLinks,
        );

      if (
        parsed.items.length < 3 ||
        uniqueLinks.size < 3
      ) {
        continue;
      }

      validFeeds.push({
        url: candidate,

        title:
          parsed.title ?? null,

        items:
          parsed.items.length,

        uniqueLinks:
          uniqueLinks.size,
      });
    } catch {
      // O candidato não é um feed válido.
    }
  }

  const deduplicatedFeeds =
    deduplicateFeeds(
      validFeeds,
    );

  console.log(
    `${source.countryCode} ${source.name}: ${deduplicatedFeeds.length}`,
  );

  return {
    countryCode:
      source.countryCode,

    countryName:
      source.countryName,

    sourceId:
      source.id,

    sourceName:
      source.name,

    websiteUrl:
      source.websiteUrl,

    feeds:
      deduplicatedFeeds,
  };
}

async function fetchText(
  url,
) {
  const response =
    await fetch(url, {
      redirect: "follow",

      headers: {
        Accept:
          [
            "text/html",
            "application/rss+xml",
            "application/atom+xml",
            "application/xml",
            "text/xml;q=0.9",
            "*/*;q=0.5",
          ].join(", "),

        "User-Agent":
          "Mozilla/5.0 (compatible; WorldNewspaperRSSAudit/0.2)",
      },

      signal:
        AbortSignal.timeout(
          12_000,
        ),
    });

  if (!response.ok) {
    throw new Error(
      `${response.status} ${url}`,
    );
  }

  const text =
    await response.text();

  const responseSize =
    Buffer.byteLength(
      text,
      "utf8",
    );

  if (
    responseSize >
    2_000_000
  ) {
    throw new Error(
      `Resposta muito grande: ${url}`,
    );
  }

  return text;
}

function isRejectedFeed(
  url,
  title,
) {
  const value =
    `${url} ${title}`;

  return rejectedPatterns.some(
    (pattern) =>
      pattern.test(value),
  );
}

function discoverFeedLinks(
  html,
  baseUrl,
) {
  const linkTags =
    html.match(
      /<link\b[^>]*>/gi,
    ) ?? [];

  const feeds = [];

  for (
    const linkTag of
    linkTags
  ) {
    const rel =
      getAttribute(
        linkTag,
        "rel",
      );

    const type =
      getAttribute(
        linkTag,
        "type",
      );

    const href =
      getAttribute(
        linkTag,
        "href",
      );

    if (
      !href ||
      !rel
        ?.toLowerCase()
        .includes(
          "alternate",
        )
    ) {
      continue;
    }

    const normalizedType =
      type?.toLowerCase() ?? "";

    const isFeedType =
      normalizedType.includes(
        "application/rss+xml",
      ) ||
      normalizedType.includes(
        "application/atom+xml",
      ) ||
      normalizedType.includes(
        "application/xml",
      ) ||
      normalizedType.includes(
        "text/xml",
      );

    if (!isFeedType) {
      continue;
    }

    try {
      feeds.push(
        new URL(
          href,
          baseUrl,
        ).toString(),
      );
    } catch {
      // Ignora href inválido.
    }
  }

  return feeds;
}

function getAttribute(
  tag,
  name,
) {
  const pattern =
    new RegExp(
      `${name}\\s*=\\s*["']([^"']+)["']`,
      "i",
    );

  return tag.match(
    pattern,
  )?.[1];
}

function deduplicateFeeds(
  feeds,
) {
  const uniqueFeeds =
    new Map();

  for (const feed of feeds) {
    const signature = [
      feed.title ?? "",
      feed.items,
      feed.uniqueLinks,
    ].join("|");

    if (
      !uniqueFeeds.has(
        signature,
      )
    ) {
      uniqueFeeds.set(
        signature,
        feed,
      );
    }
  }

  return [
    ...uniqueFeeds.values(),
  ];
}

function getErrorMessage(
  error,
) {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return String(error);
}

async function mapWithConcurrency(
  values,
  concurrency,
  worker,
) {
  const results =
    new Array(
      values.length,
    );

  let nextIndex = 0;

  async function run() {
    while (
      nextIndex <
      values.length
    ) {
      const currentIndex =
        nextIndex;

      nextIndex += 1;

      results[currentIndex] =
        await worker(
          values[currentIndex],
        );
    }
  }

  const workerCount =
    Math.min(
      concurrency,
      values.length,
    );

  await Promise.all(
    Array.from(
      {
        length:
          workerCount,
      },
      () => run(),
    ),
  );

  return results;
}