"use client";

import {
  useState,
} from "react";

import {
  Check,
  Copy,
  MessageCircle,
  Share2,
} from "lucide-react";

export type ShareActionsProps = {
  title:
    string;

  summary:
    string;
};

export function ShareActions({
  title,
  summary,
}: ShareActionsProps) {
  const [
    status,
    setStatus,
  ] = useState<
    "idle" |
    "copied" |
    "error"
  >(
    "idle",
  );

  async function handleNativeShare():
    Promise<void> {
    const url =
      window.location.href;

    if (
      navigator.share
    ) {
      try {
        await navigator.share({
          title,
          text:
            summary,
          url,
        });

        return;
      } catch (
        error
      ) {
        if (
          error instanceof
            DOMException &&
          error.name ===
            "AbortError"
        ) {
          return;
        }
      }
    }

    await copyCurrentUrl();
  }

  async function copyCurrentUrl():
    Promise<void> {
    try {
      await navigator
        .clipboard
        .writeText(
          window.location.href,
        );

      setStatus(
        "copied",
      );

      window.setTimeout(
        () => {
          setStatus(
            "idle",
          );
        },
        2_000,
      );
    } catch {
      setStatus(
        "error",
      );
    }
  }

  function shareOnWhatsApp():
    void {
    const message =
      [
        title,
        window.location.href,
      ].join(
        "\n\n",
      );

    const shareUrl =
      `https://wa.me/?text=${encodeURIComponent(
        message,
      )}`;

    window.open(
      shareUrl,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div
      className="
        flex flex-wrap
        items-center gap-2
      "
    >
      <button
        type="button"
        onClick={
          handleNativeShare
        }
        className="
          inline-flex min-h-10
          items-center gap-2
          rounded-button
          bg-primary px-4
          text-sm font-semibold
          text-white
          outline-none
          transition-opacity
          hover:opacity-85
          focus-visible:ring-2
          focus-visible:ring-ring
          focus-visible:ring-offset-2
        "
      >
        <Share2
          aria-hidden="true"
          size={17}
        />

        Compartilhar
      </button>

      <button
        type="button"
        onClick={
          copyCurrentUrl
        }
        className="
          inline-flex min-h-10
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
        "
      >
        {status ===
        "copied" ? (
          <Check
            aria-hidden="true"
            size={17}
          />
        ) : (
          <Copy
            aria-hidden="true"
            size={17}
          />
        )}

        {status ===
        "copied"
          ? "Link copiado"
          : "Copiar link"}
      </button>

      <button
        type="button"
        onClick={
          shareOnWhatsApp
        }
        className="
          inline-flex min-h-10
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
        "
      >
        <MessageCircle
          aria-hidden="true"
          size={17}
        />

        WhatsApp
      </button>

      <span
        aria-live="polite"
        className="sr-only"
      >
        {status ===
        "copied"
          ? "Link copiado para a área de transferência."
          : status ===
              "error"
            ? "Não foi possível copiar o link."
            : ""}
      </span>
    </div>
  );
}
