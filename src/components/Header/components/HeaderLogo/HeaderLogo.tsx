import Link from "next/link";

import { Box } from "@/components/Box";
import { Text } from "@/components/Text";

export function HeaderLogo() {
  return (
    <Link
      href="/"
      aria-label="Página inicial do World Newspaper"
      className="shrink-0"
    >
      <Box preset="stack">
        <Box
          display="flex"
          align="baseline"
          className="whitespace-nowrap"
        >
          <Text
            as="span"
            preset="articleTitle"
            tone="brand"
            className="
              font-extrabold uppercase
              leading-none tracking-[-0.04em]
            "
          >
            World
          </Text>

          <Text
            as="span"
            preset="articleTitle"
            tone="accent"
            className="
              ml-1 font-extrabold
              leading-none tracking-[-0.04em]
            "
          >
            Newspaper
          </Text>
        </Box>

        <Text
          as="span"
          preset="caption"
          tone="muted"
          className="
            mt-1 hidden leading-none
            sm:block
          "
        >
          Notícias do mundo em um só lugar
        </Text>
      </Box>
    </Link>
  );
}