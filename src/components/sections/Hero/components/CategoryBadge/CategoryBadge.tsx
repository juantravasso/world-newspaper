import type { ReactNode } from "react";

import { Box } from "@/components/Box";
import { Text } from "@/components/Text";
import type { NewsCategory } from "@/domain/news/news.types";

export type CategoryBadgeProps = {
  category: NewsCategory;
  children: ReactNode;
};

const categoryStyles: Record<NewsCategory, string> = {
  football:
    "bg-football-soft text-football-foreground",

  politics:
    "bg-politics-soft text-politics-foreground",

  economy:
    "bg-economy-soft text-economy-foreground",
};

export function CategoryBadge({
  category,
  children,
}: CategoryBadgeProps) {
  return (
    <Box
      as="span"
      radius="pill"
      paddingX="sm"
      paddingY="xs"
      className={categoryStyles[category]}
    >
      <Text
        as="span"
        preset="categoryLabel"
        tone="inherit"
      >
        {children}
      </Text>
    </Box>
  );
}