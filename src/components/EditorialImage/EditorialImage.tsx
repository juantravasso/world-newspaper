"use client";

import type {
  ReactNode,
} from "react";

import {
  useState,
} from "react";

import Image from "next/image";

import { cn } from "@/components/lib/utils";

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
    isLoaded,
    setIsLoaded,
  ] = useState(false);

  const [
    hasError,
    setHasError,
  ] = useState(false);

  const showFallback =
    !src || hasError;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-strong",
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
              "absolute inset-0",
              "bg-[linear-gradient(110deg,var(--color-surface-strong)_25%,var(--color-card)_45%,var(--color-surface-strong)_65%)]",
              "bg-[length:200%_100%]",
              "animate-[image-shimmer_1.4s_ease-in-out_infinite]",
              "transition-opacity duration-300",
              isLoaded
                ? "opacity-0"
                : "opacity-100",
            )}
          />

          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            onLoad={() =>
              setIsLoaded(true)
            }
            onError={() =>
              setHasError(true)
            }
            className={cn(
              "object-cover",
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
              pointer-events-none absolute inset-x-0 bottom-0
              h-1/2
              bg-gradient-to-t from-brand/30 to-transparent
            "
          />
        </>
      )}

      {children}
    </div>
  );
}
