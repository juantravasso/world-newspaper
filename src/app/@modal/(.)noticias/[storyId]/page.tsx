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
  getStoryReaderData,
} from "@/server/stories/story.reader";

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
    <Suspense
      fallback={
        <StoryModal>
          <StoryLoading />
        </StoryModal>
      }
    >
      <StoryModalShell
        params={params}
      />
    </Suspense>
  );
}

async function StoryModalShell({
  params,
}: StoryModalPageProps) {
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

  return (
    <StoryModal
      storyHref={`/noticias/${encodeURIComponent(
        storyId,
      )}`}
    >
      <StoryDetails
        data={data}
        variant="modal"
      />
    </StoryModal>
  );
}

function StoryLoading() {
  return (
    <div
      aria-label="Carregando notícia"
      className="
        animate-pulse
        space-y-5
      "
    >
      <div className="h-5 w-32 rounded bg-surface-strong" />

      <div className="h-14 w-4/5 rounded bg-surface-strong" />

      <div className="h-28 w-full rounded bg-surface-strong" />

      <div className="grid grid-cols-1 gap-5 pt-5 lg:grid-cols-2">
        <div className="h-52 rounded-card bg-surface-strong" />
        <div className="h-52 rounded-card bg-surface-strong" />
      </div>
    </div>
  );
}
