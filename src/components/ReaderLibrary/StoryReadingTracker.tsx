"use client";

import {
  useEffect,
} from "react";

import {
  useReaderLibrary,
} from "./useReaderLibrary";

export type StoryReadingTrackerProps = {
  storyId:
    string;
};

export function StoryReadingTracker({
  storyId,
}: StoryReadingTrackerProps) {
  const {
    hydrated,
    recordRead,
  } =
    useReaderLibrary();

  useEffect(
    () => {
      if (
        !hydrated
      ) {
        return;
      }

      recordRead(
        storyId,
      );
    },
    [
      hydrated,
      recordRead,
      storyId,
    ],
  );

  return null;
}
