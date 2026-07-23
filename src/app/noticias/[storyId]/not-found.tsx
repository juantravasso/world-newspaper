import Link from "next/link";

import {
  Box,
} from "@/components/Box";

import {
  Text,
} from "@/components/Text";

export default function StoryNotFound() {
  return (
    <main
      className="
        mx-auto flex min-h-[65vh]
        w-full max-w-3xl
        items-center px-4 py-12
        sm:px-8
      "
    >
      <Box
        background="card"
        border="default"
        radius="card"
        padding="2xl"
        width="full"
        className="text-center"
      >
        <Text
          preset="eyebrow"
          tone="accent"
          align="center"
        >
          Notícia indisponível
        </Text>

        <Text
          preset="pageTitle"
          align="center"
          className="mt-3"
        >
          Esta story não foi encontrada
        </Text>

        <Text
          tone="muted"
          align="center"
          className="mx-auto mt-3 max-w-xl"
        >
          Ela pode ter sido removida durante
          a manutenção das notícias antigas
          ou o endereço pode estar incorreto.
        </Text>

        <Box
          display="flex"
          justify="center"
          gap="sm"
          className="mt-7 flex-wrap"
        >
          <Link
            href="/noticias"
            className="
              inline-flex min-h-11
              items-center justify-center
              rounded-button
              bg-primary px-5
              text-sm font-semibold
              text-white
              outline-none
              transition-opacity
              hover:opacity-85
              focus-visible:ring-2
              focus-visible:ring-ring
            "
          >
            Ver últimas notícias
          </Link>

          <Link
            href="/buscar"
            className="
              inline-flex min-h-11
              items-center justify-center
              rounded-button border
              border-border bg-card
              px-5 text-sm
              font-semibold
              outline-none
              transition-colors
              hover:border-primary
              hover:text-primary
              focus-visible:ring-2
              focus-visible:ring-ring
            "
          >
            Fazer uma busca
          </Link>
        </Box>
      </Box>
    </main>
  );
}
