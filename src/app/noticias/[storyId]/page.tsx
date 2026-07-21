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
  params: Promise<{
    storyId: string;
  }>;
};

export default async function StoryPage({
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
    <main className="mx-auto w-full max-w-4xl px-5 py-10">
      <StoryDetails
        story={story}
      />
    </main>
  );
}