import fs from "node:fs/promises";
import path from "node:path";

import Parser from "rss-parser";

const ROOT =
  process.cwd();

const catalogPath =
  path.join(
    ROOT,
    "src",
    "data",
    "news",
    "america.sources.json",
  );

const outputPath =
  path.join(
    ROOT,
    "rss-audit-america.json",
  );

const parser =
  new Parser({
    timeout: 8_000,

    headers: {
      "User-Agent":
        "WorldNewspaper/0.1 RSS Audit",
    },
  });

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
      source.feeds.map(
        (feed) => feed.url,
      ),
    );

  try {
    const homepage =
      await fetchText(
        source.websiteUrl,
      );

    for (
      const discovered of
      discoverFeedLinks(
        homepage,
        source.websiteUrl,
      )
    ) {
      candidates.add(
        discovered,
      );
    }
  } catch {
    // Continua para os caminhos comuns.
  }

  for (
    const commonPath of
    [
      "/feed",
      "/feed/",
      "/rss",
      "/rss.xml",
      "/feed.xml",
      "/atom.xml",
    ]
  ) {
    candidates.add(
      new URL(
        commonPath,
        source.websiteUrl,
      ).toString(),
    );
  }

  const validFeeds = [];

  for (
    const candidate of
    [...candidates].slice(
      0,
      10,
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
        parsed.items.length > 0
      ) {
        validFeeds.push({
          url: candidate,

          title:
            parsed.title ??
            null,

          items:
            parsed.items.length,
        });
      }
    } catch {
      // Candidato inválido.
    }
  }

  console.log(
    `${source.countryCode} ${source.name}: ${validFeeds.length}`,
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
      validFeeds,
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
          "text/html, application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5",

        "User-Agent":
          "Mozilla/5.0 (compatible; WorldNewspaperRSSAudit/0.1)",
      },

      signal:
        AbortSignal.timeout(
          8_000,
        ),
    });

  if (!response.ok) {
    throw new Error(
      `${response.status} ${url}`,
    );
  }

  const text =
    await response.text();

  if (
    Buffer.byteLength(
      text,
      "utf8",
    ) >
    2_000_000
  ) {
    throw new Error(
      `Response too large: ${url}`,
    );
  }

  return text;
}

function discoverFeedLinks(
  html,
  baseUrl,
) {
  const links =
    html.match(
      /<link\b[^>]*>/gi,
    ) ?? [];

  const feeds = [];

  for (const link of links) {
    const rel =
      getAttribute(
        link,
        "rel",
      );

    const type =
      getAttribute(
        link,
        "type",
      );

    const href =
      getAttribute(
        link,
        "href",
      );

    if (
      !href ||
      !rel
        ?.toLowerCase()
        .includes(
          "alternate",
        ) ||
      !type
        ?.toLowerCase()
        .match(
          /application\/(rss|atom)\+xml/,
        )
    ) {
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
        nextIndex++;

      results[currentIndex] =
        await worker(
          values[currentIndex],
        );
    }
  }

  await Promise.all(
    Array.from(
      {
        length:
          Math.min(
            concurrency,
            values.length,
          ),
      },
      run,
    ),
  );

  return results;
}
