import {
  NextResponse,
} from "next/server";

import type {
  NewsCategory,
} from "@/domain/news/news.types";

import {
  buildAmericaCountriesWithNews,
} from "@/server/news/build-america-countries";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

const categories =
  new Set<NewsCategory>([
    "football",
    "politics",
    "economy",
  ]);

export async function GET(
  request: Request,
) {
  try {
    const url =
      new URL(request.url);

    const categoryParam =
      url.searchParams.get(
        "category",
      );

    const category =
      categoryParam &&
      categories.has(
        categoryParam as NewsCategory,
      )
        ? (
            categoryParam as
              NewsCategory
          )
        : undefined;

    const countries =
      await buildAmericaCountriesWithNews(
        category,
      );

    return NextResponse.json({
      success: true,

      generatedAt:
        new Date().toISOString(),

      category:
        category ?? null,

      countries,
    });
  } catch (error) {
    const errorDetails =
      getErrorDetails(error);

    console.error(
      "[AMERICA NEWS API ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "Não foi possível carregar as notícias das Américas.",

        details:
          process.env.NODE_ENV ===
          "development"
            ? errorDetails
            : undefined,
      },
      {
        status: 500,
      },
    );
  }
}

function getErrorDetails(
  error: unknown,
) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
  };
}