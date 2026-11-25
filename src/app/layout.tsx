import {
  Suspense,
} from "react";

import type {
  Metadata,
} from "next";

import {
  IBM_Plex_Mono,
  Instrument_Sans,
  Newsreader,
} from "next/font/google";

import {
  Header,
} from "@/components";

import "./globals.css";

const uiFont =
  Instrument_Sans({
    variable:
      "--font-ui",

    subsets: [
      "latin",
    ],

    display:
      "swap",
  });

const editorialFont =
  Newsreader({
    variable:
      "--font-editorial",

    subsets: [
      "latin",
    ],

    display:
      "swap",
  });

const dataFont =
  IBM_Plex_Mono({
    variable:
      "--font-data",

    weight: [
      "400",
      "500",
    ],

    subsets: [
      "latin",
    ],

    display:
      "swap",
  });

export const metadata:
  Metadata = {
  title: {
    default:
      "Paralelo — o mundo pelas fontes de cada país",

    template:
      "%s | Paralelo",
  },

  description:
    "Acompanhe o que acontece no mundo pelas fontes locais de cada país, com manchetes traduzidas para o português e link para a matéria original.",
};

type RootLayoutProps =
  Readonly<{
    children:
      React.ReactNode;

    modal:
      React.ReactNode;
  }>;

export default function RootLayout({
  children,
  modal,
}: RootLayoutProps) {
  return (
    <html
      lang="pt-BR"
      className={`${uiFont.variable} ${editorialFont.variable} ${dataFont.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        <Suspense
          fallback={
            <div
              aria-hidden="true"
              className="
                min-h-20
                border-b
                bg-card
                lg:min-h-24
              "
            />
          }
        >
          <Header />
        </Suspense>

        {children}
        {modal}
      </body>
    </html>
  );
}