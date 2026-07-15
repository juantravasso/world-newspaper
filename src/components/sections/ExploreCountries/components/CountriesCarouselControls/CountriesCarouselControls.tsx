import type {
  ReactNode,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Box,
} from "@/components/Box";

import {
  Text,
} from "@/components/Text";

export type CountriesCarouselControlsProps = {
  currentPage: number;
  totalPages: number;

  disabled?: boolean;

  onPrevious: () => void;
  onNext: () => void;
};

export function CountriesCarouselControls({
  currentPage,
  totalPages,
  disabled = false,
  onPrevious,
  onNext,
}: CountriesCarouselControlsProps) {
  return (
    <Box
      display="flex"
      align="center"
      gap="sm"
      className="shrink-0"
    >
      <CarouselButton
        label="Mostrar países anteriores"
        disabled={disabled}
        onClick={onPrevious}
      >
        <ChevronLeft
          className="size-5"
          aria-hidden="true"
        />
      </CarouselButton>

      <Text
        as="span"
        preset="metadata"
        tone="muted"
        className="
          min-w-10 text-center
        "
        aria-live="polite"
      >
        {currentPage + 1} /{" "}
        {Math.max(
          totalPages,
          1,
        )}
      </Text>

      <CarouselButton
        label="Mostrar próximos países"
        disabled={disabled}
        onClick={onNext}
      >
        <ChevronRight
          className="size-5"
          aria-hidden="true"
        />
      </CarouselButton>
    </Box>
  );
}

type CarouselButtonProps = {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
};

function CarouselButton({
  label,
  disabled,
  onClick,
  children,
}: CarouselButtonProps) {
  return (
    <Box
      as="button"
      type="button"
      display="flex"
      align="center"
      justify="center"
      background="surfaceMuted"
      border="default"
      radius="pill"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={[
        "size-11 shrink-0",
        "outline-none",
        "transition-all duration-200",
        "focus-visible:ring-2",
        "focus-visible:ring-ring",
        "focus-visible:ring-offset-2",

        disabled
          ? "cursor-not-allowed opacity-40"
          : [
              "hover:border-border-strong",
              "hover:bg-primary-soft",
              "hover:text-primary",
              "active:scale-95",
            ].join(" "),
      ].join(" ")}
    >
      {children}
    </Box>
  );
}