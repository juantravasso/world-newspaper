import {
  Suspense,
} from "react";

import type {
  Metadata,
} from "next";

import {
  notFound,
} from "next/navigation";

import {
  ReaderStoryPersonalization,
} from "@/components/ReaderLibrary/ReaderStoryPersonalization";

import {
  StoryDetails,
} from "@/components/StoryDetails";

import {
  getStoryUrl,
} from "@/server/site/get-site-url";

import {
  getStoryReaderData,
} from "@/server/stories/story.reader";

type StoryPageProps = {
  params:
    Promise<{
      storyId:
        string;
    }>;
};

export async function generateMetadata({
  params,
}: StoryPageProps): Promise<
  Metadata
> {
  const {
    storyId,
  } = await params;

  const data =
    await getStoryReaderData(
      storyId,
    );

  if (!data) {
    return {
      title:
        "Notícia não encontrada",

      robots: {
        index:
          false,

        follow:
          false,
      },
    };
  }

  const {
    story,
    country,
  } = data;

  const storyUrl =
    getStoryUrl(
      story.id,
    );

  const imageUrl =
    story.imageUrl ??
    story.articles.find(
      (article) =>
        article.imageUrl,
    )
      ?.imageUrl;

  const title =
    country
      ? `${story.headline} | ${country.name}`
      : story.headline;

  return {
    title,

    description:
      story.summary,

    alternates: {
      canonical:
        storyUrl,
    },

    openGraph: {
      type:
        "article",

      title,

      description:
        story.summary,

      url:
        storyUrl,

      siteName:
        "World Newspaper",

      locale:
        "pt_BR",

      ...(story.publishedAtISO
        ? {
            publishedTime:
              story.publishedAtISO,
          }
        : {}),

      ...(imageUrl
        ? {
            images: [
              {
                url:
                  imageUrl,

                alt:
                  story.headline,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card:
        imageUrl
          ? "summary_large_image"
          : "summary",

      title,

      description:
        story.summary,

      ...(imageUrl
        ? {
            images: [
              imageUrl,
            ],
          }
        : {}),
    },
  };
}

export default function StoryPage({
  params,
}: StoryPageProps) {
  return (
    <main
      className="
        mx-auto w-full
        max-w-[80rem]
        px-4 py-8
        sm:px-8
        lg:px-10 lg:py-12
      "
    >
      <Suspense
        fallback={
          <StoryLoading />
        }
      >
        <StoryContent
          params={params}
        />
      </Suspense>
    </main>
  );
}

async function StoryContent({
  params,
}: StoryPageProps) {
  const {
    storyId,
  } = await params;

  const data =
    await getStoryReaderData(
      storyId,
    );

  if (!data) {
    notFound();
  }

  const storyUrl =
    getStoryUrl(
      data.story.id,
    );

  const jsonLd =
    createNewsArticleJsonLd(
      data,
      storyUrl,
    );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              jsonLd,
            ).replace(
              /</g,
              "\\u003c",
            ),
        }}
      />

      <ReaderStoryPersonalization
        storyId={
          data.story.id
        }
      />

      <StoryDetails
        data={data}
      />
    </>
  );
}

function StoryLoading() {
  return (
    <div
      aria-label="Carregando notícia"
      className="animate-pulse space-y-6"
    >
      <div className="h-5 w-40 rounded bg-surface-strong" />

      <div className="h-[34rem] rounded-card bg-surface-strong" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="h-64 rounded-card bg-surface-strong" />
        <div className="h-64 rounded-card bg-surface-strong" />
      </div>
    </div>
  );
}

type ReaderData =
  NonNullable<
    Awaited<
      ReturnType<
        typeof getStoryReaderData
      >
    >
  >;

function createNewsArticleJsonLd(
  data:
    ReaderData,

  storyUrl:
    URL,
) {
  const {
    story,
    country,
  } = data;

  const imageUrl =
    story.imageUrl ??
    story.articles.find(
      (article) =>
        article.imageUrl,
    )
      ?.imageUrl;

  const sourceNames = [
    ...new Set(
      story.articles.map(
        (article) =>
          article.sourceName,
      ),
    ),
  ];

  return {
    "@context":
      "https://schema.org",

    "@type":
      "NewsArticle",

    headline:
      story.headline,

    description:
      story.summary,

    mainEntityOfPage:
      storyUrl.toString(),

    articleSection:
      story.categoryLabel,

    isAccessibleForFree:
      true,

    ...(story.publishedAtISO
      ? {
          datePublished:
            story.publishedAtISO,
        }
      : {}),

    ...(imageUrl
      ? {
          image: [
            imageUrl,
          ],
        }
      : {}),

    ...(country
      ? {
          contentLocation: {
            "@type":
              "Country",

            name:
              country.name,
          },
        }
      : {}),

    author:
      sourceNames.map(
        (name) => ({
          "@type":
            "Organization",

          name,
        }),
      ),

    publisher: {
      "@type":
        "Organization",

      name:
        "World Newspaper",
    },
  };
}
