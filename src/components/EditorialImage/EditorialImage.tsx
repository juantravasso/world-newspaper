"use client";

import type {
  ReactNode,
} from "react";

import {
  useState,
} from "react";

import Image from "next/image";

import {
  cn,
} from "@/components/lib/utils";

export type EditorialImageProps = {
  src?: string;
  alt: string;
  sizes: string;

  fallback: ReactNode;
  children?: ReactNode;

  priority?: boolean;
  className?: string;
  imageClassName?: string;
};

export function EditorialImage({
  src,
  alt,
  sizes,
  fallback,
  children,
  priority = false,
  className,
  imageClassName,
}: EditorialImageProps) {
  const [
    loadedSrc,
    setLoadedSrc,
  ] = useState<string | null>(
    null,
  );

  const [
    errorSrc,
    setErrorSrc,
  ] = useState<string | null>(
    null,
  );

  const currentSrc =
    src ?? null;

  const isLoaded =
    currentSrc !== null &&
    loadedSrc === currentSrc;

  const hasError =
    currentSrc !== null &&
    errorSrc === currentSrc;

  const showFallback =
    currentSrc === null ||
    hasError;

  function handleLoad(): void {
    if (!currentSrc) {
      return;
    }

    setLoadedSrc(currentSrc);
  }

  function handleError(): void {
    if (!currentSrc) {
      return;
    }

    setErrorSrc(currentSrc);
  }

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-surface-strong",
        className,
      )}
    >
      {showFallback ? (
        fallback
      ) : (
        <>
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-0 z-0",
              "bg-[linear-gradient(110deg,var(--color-surface-strong)_25%,var(--color-card)_45%,var(--color-surface-strong)_65%)]",
              "bg-[length:200%_100%]",
              "animate-[image-shimmer_1.4s_ease-in-out_infinite]",
              "transition-opacity duration-300",

              isLoaded
                ? "pointer-events-none opacity-0"
                : "opacity-100",
            )}
          />

          <Image
            key={currentSrc}
            src={currentSrc}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "z-10 object-cover",
              "transition-[opacity,transform]",
              "duration-500 ease-out",

              isLoaded
                ? "scale-100 opacity-100"
                : "scale-[1.025] opacity-0",

              imageClassName,
            )}
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute inset-x-0
              bottom-0 z-20 h-1/2
              bg-gradient-to-t
              from-brand/[30%]
              to-transparent
            "
          />
        </>
      )}

      <div className="relative z-30">
        {children}
      </div>
    </div>
  );
}