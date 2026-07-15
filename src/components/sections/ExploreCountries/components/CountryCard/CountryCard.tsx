import {
  Box,
} from "@/components/Box";

import {
  CountryFlag,
} from "@/components/CountryFlag";

import {
  Text,
} from "@/components/Text";

import type {
  CountryCode,
  CountryWithLatestNews,
} from "@/domain/news/news.types";

export type CountryCardProps = {
  country: CountryWithLatestNews;

  isSelected: boolean;

  onSelect: (
    countryCode: CountryCode,
  ) => void;
};

export function CountryCard({
  country,
  isSelected,
  onSelect,
}: CountryCardProps) {
  return (
    <Box
      as="li"
      data-motion-item
      className="min-w-0"
    >
      <Box
        as="button"
        type="button"
        width="full"
        display="flex"
        align="center"
        gap="sm"
        border={
          isSelected
            ? "strong"
            : "default"
        }
        radius="control"
        paddingX="md"
        aria-pressed={isSelected}
        onClick={() =>
          onSelect(country.code)
        }
        className={[
          "h-16 min-w-0 text-left",
          "outline-none",
          "transition-all duration-200",
          "[transform-style:preserve-3d]",
          "focus-visible:ring-2",
          "focus-visible:ring-ring",
          "focus-visible:ring-offset-2",

          isSelected
            ? [
                "bg-primary-soft",
                "shadow-card",
              ].join(" ")
            : [
                "bg-card",
                "hover:[transform:perspective(800px)_rotateX(2deg)_rotateY(-2deg)_translateY(-2px)]",
                "hover:bg-surface-muted",
                "hover:shadow-card",
              ].join(" "),
        ].join(" ")}
      >
        <CountryFlag
          code={country.code}
          countryName={country.name}
          decorative
        />

        <Text
          as="span"
          preset="label"
          tone={
            isSelected
              ? "accent"
              : "default"
          }
          clamp={1}
        >
          {country.name}
        </Text>
      </Box>
    </Box>
  );
}
