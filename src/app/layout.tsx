import {
  Suspense,
} from "react";

import type {
  Metadata,
} from "next";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import {
  Header,
} from "@/components";

import "./globals.css";

const geistSans =
  Geist({
    variable:
      "--font-inter",

    subsets: [
      "latin",
    ],

    display:
      "swap",
  });

const geistMono =
  Geist_Mono({
    variable:
      "--font-mono",

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
      "World Newspaper",

    template:
      "%s | World Newspaper",
  },

  description:
    "Notícias dos principais jornais da América do Sul e do mundo.",
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
      className={`${geistSans.variable} ${geistMono.variable}`}
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