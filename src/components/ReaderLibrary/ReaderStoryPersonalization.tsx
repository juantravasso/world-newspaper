"use client";

import {
  SaveStoryButton,
} from "./SaveStoryButton";

import {
  StoryReadingTracker,
} from "./StoryReadingTracker";

export type ReaderStoryPersonalizationProps = {
  storyId:
    string;
};

export function ReaderStoryPersonalization({
  storyId,
}: ReaderStoryPersonalizationProps) {
  return (
    <>
      <StoryReadingTracker
        storyId={
          storyId
        }
      />

      <div
        className="
          mb-5 flex
          justify-end
        "
      >
        <SaveStoryButton
          storyId={
            storyId
          }
        />
      </div>
    </>
  );
}
