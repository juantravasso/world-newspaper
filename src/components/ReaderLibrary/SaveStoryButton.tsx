"use client";

import {
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

import {
  useReaderLibrary,
} from "./useReaderLibrary";

export type SaveStoryButtonProps = {
  storyId:
    string;

  compact?:
    boolean;
};

export function SaveStoryButton({
  storyId,
  compact =
    false,
}: SaveStoryButtonProps) {
  const {
    hydrated,
    isSaved,
    toggleSaved,
  } =
    useReaderLibrary();

  const saved =
    hydrated &&
    isSaved(
      storyId,
    );

  return (
    <button
      type="button"
      onClick={
        () =>
          toggleSaved(
            storyId,
          )
      }
      aria-pressed={
        saved
      }
      aria-label={
        saved
          ? "Remover dos salvos"
          : "Salvar notícia"
      }
      title={
        saved
          ? "Remover dos salvos"
          : "Salvar notícia"
      }
      className={[
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-button border px-4 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        saved
          ? "border-primary bg-primary-soft text-primary"
          : "border-border bg-card text-foreground hover:border-primary hover:text-primary",
        compact
          ? "h-10 w-10 px-0"
          : "",
      ].join(
        " ",
      )}
    >
      {saved ? (
        <BookmarkCheck
          aria-hidden="true"
          size={18}
        />
      ) : (
        <Bookmark
          aria-hidden="true"
          size={18}
        />
      )}

      {!compact && (
        <span>
          {saved
            ? "Salva"
            : "Salvar"}
        </span>
      )}
    </button>
  );
}
