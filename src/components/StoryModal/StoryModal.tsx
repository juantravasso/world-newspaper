"use client";

import {
  useEffect,
  type ReactNode,
} from "react";

import {
  useRouter,
} from "next/navigation";

type StoryModalProps = {
  children: ReactNode;
};

export function StoryModal({
  children,
}: StoryModalProps) {
  const router =
    useRouter();

  useEffect(
    () => {
      function handleKeyDown(
        event: KeyboardEvent,
      ) {
        if (
          event.key ===
          "Escape"
        ) {
          router.back();
        }
      }

      document.addEventListener(
        "keydown",
        handleKeyDown,
      );

      return () => {
        document.removeEventListener(
          "keydown",
          handleKeyDown,
        );
      };
    },
    [router],
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Detalhes da notícia"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onMouseDown={() =>
        router.back()
      }
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-card bg-background p-6 shadow-2xl"
        onMouseDown={(
          event,
        ) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          onClick={() =>
            router.back()
          }
          className="mb-5 rounded-md border px-4 py-2"
        >
          Fechar
        </button>

        {children}
      </div>
    </div>
  );
}