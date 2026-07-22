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
  StoryModal,
} from "@/components/StoryModal";

import {
  getStoryById,
} from "@/server/stories/get-story-by-id";

type StoryModalPageProps = {
  params:
    Promise<{
      storyId:
        string;
    }>;
};

export default function StoryModalPage({
  params,
}: StoryModalPageProps) {
  return (
    <StoryModal>
      <Suspense
        fallback={
          <StoryLoading />
        }
      >
        <StoryModalContent
          params={params}
        />
      </Suspense>
    </StoryModal>
  );
}

async function StoryModalContent({
  params,
}: StoryModalPageProps) {
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
      className="
        animate-pulse
        space-y-4
      "
    >
      <div className="h-4 w-24 rounded bg-surface-strong" />

      <div className="h-10 w-4/5 rounded bg-surface-strong" />

      <div className="h-20 w-full rounded bg-surface-strong" />

      <p className="text-sm text-muted-foreground">
        Carregando notícia…
      </p>
    </div>
  );
}