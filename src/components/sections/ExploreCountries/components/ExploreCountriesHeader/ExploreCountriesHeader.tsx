import Link from "next/link";

import {
  Box,
} from "@/components/Box";

import {
  Text,
} from "@/components/Text";

import {
  CountriesCarouselControls,
} from "../CountriesCarouselControls";

export type ExploreCountriesHeaderProps = {
  title: string;

  currentPage: number;
  totalPages: number;

  canNavigate: boolean;
  showViewAll: boolean;

  onPrevious: () => void;
  onNext: () => void;
};

export function ExploreCountriesHeader({
  title,
  currentPage,
  totalPages,
  canNavigate,
  showViewAll,
  onPrevious,
  onNext,
}: ExploreCountriesHeaderProps) {
  return (
    <Box
      display="flex"
      direction="column"
      gap="md"
      className="
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      <Box
        display="flex"
        align="center"
        gap="md"
      >
        <Text
          id="explore-countries-title"
          preset="sectionTitle"
        >
          {title}
        </Text>

        {showViewAll && (
          <Link
            href="/paises"
            className="
              hidden shrink-0
              transition-opacity
              hover:opacity-70
              sm:block
            "
          >
            <Text
              as="span"
              preset="button"
              tone="accent"
            >
              Ver todos
            </Text>
          </Link>
        )}
      </Box>

      <CountriesCarouselControls
        currentPage={currentPage}
        totalPages={totalPages}
        disabled={!canNavigate}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </Box>
  );
}