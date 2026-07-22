import type {
  ReactNode,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Box } from "@/components/Box";

export type RegionCarouselControlsProps = {
  children: ReactNode;

  disabled?: boolean;

  onPrevious: () => void;
  onNext: () => void;
};

export function RegionCarouselControls({
  children,
  disabled = false,
  onPrevious,
  onNext,
}: RegionCarouselControlsProps) {
  return (
    <Box
      display="flex"
      align="center"
      gap="xs"
      width="full"
    >
      <CarouselButton
        label="Selecionar Regione anterior"
        disabled={disabled}
        onClick={onPrevious}
      >
        <ChevronLeft
          className="size-5"
          aria-hidden="true"
        />
      </CarouselButton>

      <Box className="min-w-0 flex-1">
        {children}
      </Box>

      <CarouselButton
        label="Selecionar próximo Regione"
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
        "size-12 shrink-0",
        "outline-none",
        "transition-all duration-200",
        "focus-visible:ring-2",
        "focus-visible:ring-ring",
        "focus-visible:ring-offset-2",
        disabled
          ? "cursor-not-allowed opacity-50"
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