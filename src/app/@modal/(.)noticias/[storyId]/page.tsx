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
  params: Promise<{
    storyId: string;
  }>;
};

export default async function StoryModalPage({
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
    <StoryModal>
      <StoryDetails
        story={story}
      />
    </StoryModal>
  );
}