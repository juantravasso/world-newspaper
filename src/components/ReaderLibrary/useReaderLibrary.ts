"use client";

import {
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";

import type {
  CountryCode,
  NewsCategory,
} from "@/domain/news/news.types";

import type {
  ReaderLibraryState,
} from "@/domain/reader/reader-library.types";

import {
  addHistoryEntry,
  getServerReaderLibrarySnapshot,
  parseReaderLibrarySnapshot,
  readReaderLibrary,
  readReaderLibrarySnapshot,
  subscribeToReaderLibrary,
  toggleFavoriteCategory,
  toggleFavoriteCountry,
  toggleSavedStory,
  writeReaderLibrary,
} from "./reader-library.storage";

export function useReaderLibrary() {
  const serializedState =
    useSyncExternalStore(
      subscribeToReaderLibrary,
      readReaderLibrarySnapshot,
      getServerReaderLibrarySnapshot,
    );

  const hydrated =
    useSyncExternalStore(
      subscribeToHydration,
      getHydratedSnapshot,
      getServerHydratedSnapshot,
    );

  const state =
    useMemo(
      () =>
        parseReaderLibrarySnapshot(
          serializedState,
        ),
      [
        serializedState,
      ],
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

        writeReaderLibrary(
          createNextState(
            currentState,
          ),
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

function subscribeToHydration():
  () => void {
  return () => {};
}

function getHydratedSnapshot():
  boolean {
  return true;
}

function getServerHydratedSnapshot():
  boolean {
  return false;
}