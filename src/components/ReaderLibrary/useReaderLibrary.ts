"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  CountryCode,
  NewsCategory,
} from "@/domain/news/news.types";

import type {
  ReaderLibraryState,
} from "@/domain/reader/reader-library.types";

import {
  EMPTY_READER_LIBRARY,
  addHistoryEntry,
  readReaderLibrary,
  subscribeToReaderLibrary,
  toggleFavoriteCategory,
  toggleFavoriteCountry,
  toggleSavedStory,
  writeReaderLibrary,
} from "./reader-library.storage";

export function useReaderLibrary() {
  const [
    state,
    setState,
  ] =
    useState<
      ReaderLibraryState
    >(
      EMPTY_READER_LIBRARY,
    );

  const [
    hydrated,
    setHydrated,
  ] =
    useState(
      false,
    );

  useEffect(
    () => {
      function refresh():
        void {
        setState(
          readReaderLibrary(),
        );
      }

      refresh();
      setHydrated(
        true,
      );

      return subscribeToReaderLibrary(
        refresh,
      );
    },
    [],
  );

  const updateState =
    useCallback(
      (
        createNextState:
          (
            currentState:
              ReaderLibraryState,
          ) =>
            ReaderLibraryState,
      ) => {
        const currentState =
          readReaderLibrary();

        const nextState =
          writeReaderLibrary(
            createNextState(
              currentState,
            ),
          );

        setState(
          nextState,
        );
      },
      [],
    );

  const toggleSaved =
    useCallback(
      (
        storyId:
          string,
      ) => {
        updateState(
          (
            currentState,
          ) =>
            toggleSavedStory(
              currentState,
              storyId,
            ),
        );
      },
      [
        updateState,
      ],
    );

  const recordRead =
    useCallback(
      (
        storyId:
          string,
      ) => {
        updateState(
          (
            currentState,
          ) =>
            addHistoryEntry(
              currentState,
              storyId,
            ),
        );
      },
      [
        updateState,
      ],
    );

  const toggleCategory =
    useCallback(
      (
        category:
          NewsCategory,
      ) => {
        updateState(
          (
            currentState,
          ) =>
            toggleFavoriteCategory(
              currentState,
              category,
            ),
        );
      },
      [
        updateState,
      ],
    );

  const toggleCountry =
    useCallback(
      (
        countryCode:
          CountryCode,
      ) => {
        updateState(
          (
            currentState,
          ) =>
            toggleFavoriteCountry(
              currentState,
              countryCode,
            ),
        );
      },
      [
        updateState,
      ],
    );

  const clearSaved =
    useCallback(
      () => {
        updateState(
          (
            currentState,
          ) => ({
            ...currentState,
            savedStoryIds:
              [],
          }),
        );
      },
      [
        updateState,
      ],
    );

  const clearHistory =
    useCallback(
      () => {
        updateState(
          (
            currentState,
          ) => ({
            ...currentState,
            history:
              [],
          }),
        );
      },
      [
        updateState,
      ],
    );

  return {
    state,
    hydrated,

    isSaved:
      (
        storyId:
          string,
      ) =>
        state.savedStoryIds.includes(
          storyId,
        ),

    toggleSaved,
    recordRead,
    toggleCategory,
    toggleCountry,
    clearSaved,
    clearHistory,
  };
}
