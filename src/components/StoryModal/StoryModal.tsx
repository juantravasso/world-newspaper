"use client";

import {
  useEffect,
  useRef,
  type ReactNode,
} from "react";

import {
  Maximize2,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

type StoryModalProps = {
  children:
    ReactNode;

  storyHref?:
    string;
};

export function StoryModal({
  children,
  storyHref,
}: StoryModalProps) {
  const router =
    useRouter();

  const closeButtonRef =
    useRef<
      HTMLButtonElement | null
    >(
      null,
    );

  useEffect(
    () => {
      const previousOverflow =
        document.body
          .style
          .overflow;

      document.body
        .style
        .overflow =
        "hidden";

      closeButtonRef
        .current
        ?.focus();

      function handleKeyDown(
        event:
          KeyboardEvent,
      ): void {
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
        document.body
          .style
          .overflow =
          previousOverflow;

        document.removeEventListener(
          "keydown",
          handleKeyDown,
        );
      };
    },
    [
      router,
    ],
  );

  return (
    <div
      role="presentation"
      className="
        fixed inset-0 z-50
        flex items-center
        justify-center
        bg-black/70 p-3
        backdrop-blur-sm
        sm:p-6
      "
      onMouseDown={
        () =>
          router.back()
      }
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Leitura rápida da notícia"
        className="
          max-h-[94vh] w-full
          max-w-6xl overflow-y-auto
          rounded-card border
          border-border bg-background
          shadow-2xl
        "
        onMouseDown={
          (
            event,
          ) =>
            event.stopPropagation()
        }
      >
        <header
          className="
            sticky top-0 z-40
            flex min-h-16
            items-center
            justify-between gap-4
            border-b border-border
            bg-background/95
            px-4 backdrop-blur
            sm:px-6
          "
        >
          <div>
            <p
              className="
                text-xs font-bold
                uppercase tracking-[0.14em]
                text-primary
              "
            >
              Leitura rápida
            </p>

            <p
              className="
                mt-1 text-sm
                text-muted-foreground
              "
            >
              Compare as fontes sem sair
              da página atual.
            </p>
          </div>

          <div
            className="
              flex shrink-0
              items-center gap-2
            "
          >
            {storyHref && (
              <a
                href={
                  storyHref
                }
                className="
                  hidden min-h-10
                  items-center gap-2
                  rounded-button border
                  border-border bg-card
                  px-4 text-sm
                  font-semibold
                  outline-none
                  transition-colors
                  hover:border-primary
                  hover:text-primary
                  focus-visible:ring-2
                  focus-visible:ring-ring
                  sm:inline-flex
                "
              >
                <Maximize2
                  aria-hidden="true"
                  size={17}
                />

                Página completa
              </a>
            )}

            <button
              ref={
                closeButtonRef
              }
              type="button"
              onClick={
                () =>
                  router.back()
              }
              aria-label="Fechar notícia"
              className="
                inline-flex h-10 w-10
                items-center
                justify-center
                rounded-full border
                border-border bg-card
                outline-none
                transition-colors
                hover:border-primary
                hover:text-primary
                focus-visible:ring-2
                focus-visible:ring-ring
              "
            >
              <X
                aria-hidden="true"
                size={20}
              />
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </section>
    </div>
  );
}
