import {
  revalidateTag,
} from "next/cache";

import type {
  NewsCategory,
} from "@/domain/news/news.types";

import {
  WORLD_NEWS_CACHE_TAG,
} from "@/server/news/news-cache";

import {
  validateFeedUrl,
} from "@/server/news/feed-validation";

import {
  deleteNewsSource,
  findNewsSourceById,
  updateNewsSource,
} from "@/server/news/news-source.repository";

import type {
  NewsSourceUpdateInput,
} from "@/server/news/news-source.repository";

import {
  authorizeAdminRequest,
} from "@/server/security/admin-auth";

type RouteParams = {
  params:
    Promise<{
      id:
        string;
    }>;
};

export async function PATCH(
  request:
    Request,

  { params }:
    RouteParams,
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

  const { id } =
    await params;

  try {
    const existing =
      await findNewsSourceById(
        id,
      );

    if (
      !existing
    ) {
      return Response.json(
        {
          ok:
            false,

          message:
            "Fonte não encontrada.",
        },
        {
          status:
            404,

          headers:
            getNoStoreHeaders(),
        },
      );
    }

    const body =
      await request.json() as
        unknown;

    const input =
      normalizeUpdateInput(
        body,
      );

    if (
      input.feedUrl !==
        undefined &&
      input.feedUrl !==
        null &&
      input.feedUrl !==
        existing.feedUrl
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

    const updated =
      await updateNewsSource(
        id,
        input,
      );

    revalidateTag(
      WORLD_NEWS_CACHE_TAG,
      "max",
    );

    return Response.json(
      {
        ok:
          true,

        source:
          updated,
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
      "[ADMIN SOURCE UPDATE ERROR]",
      error,
    );

    return Response.json(
      {
        ok:
          false,

        message:
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar a fonte.",
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

export async function DELETE(
  request:
    Request,

  { params }:
    RouteParams,
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

  const { id } =
    await params;

  try {
    await deleteNewsSource(
      id,
    );

    revalidateTag(
      WORLD_NEWS_CACHE_TAG,
      "max",
    );

    return Response.json(
      {
        ok:
          true,
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
      "[ADMIN SOURCE DELETE ERROR]",
      error,
    );

    return Response.json(
      {
        ok:
          false,

        message:
          error instanceof Error
            ? error.message
            : "Não foi possível remover a fonte.",
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

function normalizeUpdateInput(
  value:
    unknown,
): NewsSourceUpdateInput {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return {};
  }

  const objectValue =
    value as
      Record<
        string,
        unknown
      >;

  const input:
    NewsSourceUpdateInput =
    {};

  if (
    typeof objectValue.name ===
      "string" &&
    objectValue.name.trim()
  ) {
    input.name =
      objectValue.name.trim();
  }

  if (
    typeof objectValue.websiteUrl ===
      "string" &&
    objectValue.websiteUrl.trim()
  ) {
    input.websiteUrl =
      objectValue.websiteUrl.trim();
  }

  if (
    "feedUrl" in
    objectValue
  ) {
    const feedUrlValue =
      objectValue.feedUrl;

    input.feedUrl =
      typeof feedUrlValue ===
        "string" &&
      feedUrlValue.trim()
        ? feedUrlValue.trim()
        : null;
  }

  if (
    "feedCategory" in
    objectValue
  ) {
    const feedCategoryValue =
      objectValue.feedCategory;

    input.feedCategory =
      feedCategoryValue ===
        "football" ||
      feedCategoryValue ===
        "politics" ||
      feedCategoryValue ===
        "economy"
        ? (
            feedCategoryValue as
              NewsCategory
          )
        : null;
  }

  if (
    typeof objectValue.enabled ===
    "boolean"
  ) {
    input.enabled =
      objectValue.enabled;
  }

  return input;
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
