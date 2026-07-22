import {
  Suspense,
} from "react";

import {
  notFound,
} from "next/navigation";

import {
  StoryDetails,
} from "@/components/StoryDetails";

import {
  getStoryById,
} from "@/server/stories/get-story-by-id";

type StoryPageProps = {
  params:
    Promise<{
      storyId: string;
    }>;
};

export default function StoryPage({
  params,
}: StoryPageProps) {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10">
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

  const story =
    await getStoryById(
      storyId,
    );

  if (!story) {
    notFound();
  }

  return (
    <StoryDetails
      story={story}
    />
  );
}

function StoryLoading() {
  return (
    <div
      aria-label="Carregando notícia"
      className="animate-pulse space-y-5"
    >
      <div className="h-5 w-28 rounded bg-surface-strong" />

      <div className="h-10 w-4/5 rounded bg-surface-strong" />

      <div className="h-24 w-full rounded bg-surface-strong" />

      <div className="space-y-3 pt-5">
        <div className="h-32 w-full rounded bg-surface-strong" />
        <div className="h-32 w-full rounded bg-surface-strong" />
      </div>
    </div>
  );
}