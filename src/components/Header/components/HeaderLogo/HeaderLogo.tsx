import Link from "next/link";

import { Box } from "@/components/Box";
import { Text } from "@/components/Text";

export function HeaderLogo() {
  return (
    <Link
      href="/"
      aria-label="Página inicial do Paralelo"
      className="shrink-0"
    >
      <Box preset="stack">
        <Box
          display="flex"
          align="center"
          gap="sm"
          className="whitespace-nowrap"
        >
          {/* Duas linhas de latitude: o "paralelo" do nome. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="h-5 w-5 text-primary"
          >
            <circle
              cx="10"
              cy="10"
              r="8.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M2.6 7.5h14.8M2.6 12.5h14.8"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>

          <Text
            as="span"
            preset="articleTitle"
            tone="brand"
            className="
              font-serif font-semibold
              leading-none tracking-[-0.01em]
            "
          >
            Paralelo
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
          O mundo pelas fontes de cada país
        </Text>
      </Box>
    </Link>
  );
}
