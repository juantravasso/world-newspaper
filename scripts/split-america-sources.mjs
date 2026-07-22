import {
  readFile,
  writeFile,
} from "node:fs/promises";

import path from "node:path";

const newsDirectory =
  path.join(
    process.cwd(),
    "src",
    "data",
    "news",
  );

const sourcePath =
  path.join(
    newsDirectory,
    "america.sources.json",
  );

const rawContent =
  await readFile(
    sourcePath,
    "utf8",
  );

const catalog =
  JSON.parse(
    rawContent.replace(
      /^\uFEFF/,
      "",
    ),
  );

const regions = [
  {
    filename:
      "north-america.sources.json",

    codes:
      new Set([
        "CA",
        "US",
        "MX",
      ]),
  },

  {
    filename:
      "central-america.sources.json",

    codes:
      new Set([
        "BZ",
        "CR",
        "SV",
        "GT",
        "HN",
        "NI",
        "PA",
      ]),
  },

  {
    filename:
      "south-america.sources.json",

    codes:
      new Set([
        "AR",
        "BO",
        "BR",
        "CL",
        "CO",
        "EC",
        "GY",
        "PY",
        "PE",
        "SR",
        "UY",
        "VE",
      ]),
  },
];

const assignedCodes =
  new Set(
    regions.flatMap(
      (region) =>
        [...region.codes],
    ),
  );

const unclassifiedCountries =
  catalog.countries.filter(
    (country) =>
      !assignedCodes.has(
        country.code,
      ),
  );

if (
  unclassifiedCountries.length >
  0
) {
  throw new Error(
    [
      "Existem países sem região:",
      unclassifiedCountries
        .map(
          (country) =>
            country.code,
        )
        .join(", "),
    ].join(" "),
  );
}

for (
  const region of
  regions
) {
  const countries =
    catalog.countries.filter(
      (country) =>
        region.codes.has(
          country.code,
        ),
    );

  const outputPath =
    path.join(
      newsDirectory,
      region.filename,
    );

  await writeFile(
    outputPath,
    `${JSON.stringify(
      {
        countries,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log(
    [
      "Criado:",
      region.filename,
      `(${countries.length} países)`,
    ].join(" "),
  );
}

console.log(
  "Catálogos americanos separados com sucesso.",
);