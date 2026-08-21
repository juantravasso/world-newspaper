import {
  revalidateTag,
} from "next/cache";

import type {
  AdminNewsSourceInput,
  AdminNewsSourceItem,
} from "@/domain/admin/admin.types";

import type {
  CountryCode,
  NewsCategory,
} from "@/domain/news/news.types";

import {
  listCountryCatalog,
} from "@/server/countries/country-catalog";

import {
  validateFeedUrl,
} from "@/server/news/feed-validation";

import {
  createNewsSource,
  listNewsSources,
} from "@/server/news/news-source.repository";

import {
  WORLD_NEWS_CACHE_TAG,
} from "@/server/news/news-cache";

import {
  authorizeAdminRequest,
} from "@/server/security/admin-auth";

export async function GET(
  request:
    Request,
) {
  const authorization =
    authorizeAdminRequest(
      request,
    );

  if (
    !authorization.authorized
  ) {
    return Response.json(
      {
        ok:
          false,

        message:
          authorization.message,
      },
      {
        status:
          authorization.status,

        headers:
          getNoStoreHeaders(),
      },
    );
  }

  try {
    const [
      sources,
      countryNames,
    ] =
      await Promise.all([
        listNewsSources(),

        getCountryNameMap(),
      ]);

    const data:
      AdminNewsSourceItem[] =
      sources.map(
        (source) => ({
          id:
            source.id,

          countryCode:
            source.countryCode,

          countryName:
            countryNames.get(
              source.countryCode,
            ) ??
            source.countryCode,

          name:
            source.name,

          websiteUrl:
            source.websiteUrl,

          feedUrl:
            source.feedUrl,

          feedCategory:
            source.feedCategory,

          enabled:
            source.enabled,

          updatedAtISO:
            source.updatedAtISO,
        }),
      );

    return Response.json(
      {
        ok:
          true,

        data,

        countries:
          listCountryCatalog().map(
            (country) => ({
              code:
                country.code,

              name:
                country.name,
            }),
          ),
      },
      {
        headers:
          getNoStoreHeaders(),
      },
    );
  } catch (
    error
  ) {
    console.error(
      "[ADMIN SOURCES LIST ERROR]",
      error,
    );

    return Response.json(
      {
        ok:
          false,

        message:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar as fontes.",
      },
      {
        status:
          500,

        headers:
          getNoStoreHeaders(),
      },
    );
  }
}

export async function POST(
  request:
    Request,
) {
  const authorization =
    authorizeAdminRequest(
      request,
    );

  if (
    !authorization.authorized
  ) {
    return Response.json(
      {
        ok:
          false,

        message:
          authorization.message,
      },
      {
        status:
          authorization.status,

        headers:
          getNoStoreHeaders(),
      },
    );
  }

  try {
    const body =
      await request.json() as
        unknown;

    const input =
      normalizeInput(
        body,
      );

    if (
      !input
    ) {
      return Response.json(
        {
          ok:
            false,

          message:
            "Dados inválidos. Verifique o identificador, país, nome e site.",
        },
        {
          status:
            400,

          headers:
            getNoStoreHeaders(),
        },
      );
    }

    const validCountryCodes =
      new Set(
        listCountryCatalog().map(
          (country) =>
            country.code,
        ),
      );

    if (
      !validCountryCodes.has(
        input.countryCode as
          CountryCode,
      )
    ) {
      return Response.json(
        {
          ok:
            false,

          message:
            "País desconhecido. Só é possível adicionar fontes para países já cadastrados.",
        },
        {
          status:
            400,

          headers:
            getNoStoreHeaders(),
        },
      );
    }

    if (
      input.feedUrl
    ) {
      const validation =
        await validateFeedUrl(
          input.feedUrl,
        );

      if (
        !validation.valid
      ) {
        return Response.json(
          {
            ok:
              false,

            message:
              `A URL do feed não pôde ser validada: ${validation.message}`,
          },
          {
            status:
              422,

            headers:
              getNoStoreHeaders(),
          },
        );
      }
    }

    const created =
      await createNewsSource({
        id:
          input.id,

        countryCode:
          input.countryCode as
            CountryCode,

        name:
          input.name,

        websiteUrl:
          input.websiteUrl,

        feedUrl:
          input.feedUrl,

        feedCategory:
          input.feedCategory as
            | NewsCategory
            | null,

        enabled:
          input.enabled,
      });

    revalidateTag(
      WORLD_NEWS_CACHE_TAG,
      "max",
    );

    return Response.json(
      {
        ok:
          true,

        source:
          created,
      },
      {
        headers:
          getNoStoreHeaders(),
      },
    );
  } catch (
    error
  ) {
    console.error(
      "[ADMIN SOURCES CREATE ERROR]",
      error,
    );

    const message =
      isUniqueConstraintError(
        error,
      )
        ? "Já existe uma fonte com esse identificador."
        : error instanceof Error
          ? error.message
          : "Não foi possível criar a fonte.";

    return Response.json(
      {
        ok:
          false,

        message,
      },
      {
        status:
          isUniqueConstraintError(
            error,
          )
            ? 409
            : 500,

        headers:
          getNoStoreHeaders(),
      },
    );
  }
}

async function getCountryNameMap():
  Promise<
    Map<
      string,
      string
    >
  > {
  return new Map(
    listCountryCatalog().map(
      (country) =>
        [
          country.code,
          country.name,
        ] as const,
    ),
  );
}

function normalizeInput(
  value:
    unknown,
):
  | AdminNewsSourceInput
  | null {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return null;
  }

  const objectValue =
    value as
      Record<
        string,
        unknown
      >;

  const id =
    toTrimmedString(
      objectValue.id,
    );

  const countryCode =
    toTrimmedString(
      objectValue.countryCode,
    ).toUpperCase();

  const name =
    toTrimmedString(
      objectValue.name,
    );

  const websiteUrl =
    toTrimmedString(
      objectValue.websiteUrl,
    );

  if (
    !id ||
    !/^[a-z0-9-]+$/.test(
      id,
    ) ||
    !countryCode ||
    !name ||
    !websiteUrl
  ) {
    return null;
  }

  const feedUrlValue =
    toTrimmedString(
      objectValue.feedUrl,
    );

  const feedCategoryValue =
    objectValue.feedCategory;

  const feedCategory =
    feedCategoryValue ===
      "football" ||
    feedCategoryValue ===
      "politics" ||
    feedCategoryValue ===
      "economy"
      ? feedCategoryValue
      : null;

  const enabled =
    objectValue.enabled !==
    false;

  return {
    id,
    countryCode,
    name,
    websiteUrl,

    feedUrl:
      feedUrlValue ||
      null,

    feedCategory,
    enabled,
  };
}

function toTrimmedString(
  value:
    unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function isUniqueConstraintError(
  error:
    unknown,
): boolean {
  return (
    Boolean(
      error,
    ) &&
    typeof error ===
      "object" &&
    "code" in
      (
        error as
          Record<
            string,
            unknown
          >
      ) &&
    (
      error as {
        code?:
          unknown;
      }
    ).code ===
      "P2002"
  );
}

function getNoStoreHeaders():
  Record<
    string,
    string
  > {
  return {
    "Cache-Control":
      "no-store, max-age=0",

    "X-Robots-Tag":
      "noindex, nofollow",
  };
}
