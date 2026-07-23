"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import Link from "next/link";

import {
  Bookmark,
  Clock3,
  Compass,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import {
  Box,
} from "@/components/Box";

import {
  CountryFlag,
} from "@/components/CountryFlag";

import {
  EditorialImage,
} from "@/components/EditorialImage";

import {
  Text,
} from "@/components/Text";

import type {
  CountryCode,
  NewsCategory,
} from "@/domain/news/news.types";

import type {
  ReaderLibraryCountryOption,
  ReaderLibraryResponse,
  ReaderLibraryStoryItem,
} from "@/domain/reader/reader-library.types";

import {
  SaveStoryButton,
} from "./SaveStoryButton";

import {
  useReaderLibrary,
} from "./useReaderLibrary";

export type ReaderLibraryPageProps = {
  countries:
    ReaderLibraryCountryOption[];
};

type LibraryTab =
  | "saved"
  | "history"
  | "recommendations";

const categoryLabels:
  Record<
    NewsCategory,
    string
  > = {
  football:
    "Futebol",

  politics:
    "Política",

  economy:
    "Economia",
};

const emptyData:
  ReaderLibraryResponse = {
  saved:
    [],

  history:
    [],

  recommendations:
    [],
};

export function ReaderLibraryPage({
  countries,
}: ReaderLibraryPageProps) {
  const {
    state,
    hydrated,
    toggleCategory,
    toggleCountry,
    clearSaved,
    clearHistory,
  } =
    useReaderLibrary();

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<
      LibraryTab
    >(
      "recommendations",
    );

  const [
    data,
    setData,
  ] =
    useState<
      ReaderLibraryResponse
    >(
      emptyData,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    selectedCountryCode,
    setSelectedCountryCode,
  ] =
    useState(
      "",
    );

  const historyStoryIds =
    useMemo(
      () =>
        state.history.map(
          (entry) =>
            entry.storyId,
        ),
      [
        state.history,
      ],
    );

  useEffect(
    () => {
      if (
        !hydrated
      ) {
        return;
      }

      const controller =
        new AbortController();

      async function loadLibrary():
        Promise<void> {
        setLoading(
          true,
        );

        setError(
          null,
        );

        try {
          const response =
            await fetch(
              "/api/reader-library",
              {
                method:
                  "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify({
                    savedStoryIds:
                      state.savedStoryIds,

                    historyStoryIds,

                    favoriteCategories:
                      state.favoriteCategories,

                    favoriteCountryCodes:
                      state.favoriteCountryCodes,
                  }),

                signal:
                  controller.signal,
              },
            );

          const payload =
            await response.json() as {
              ok:
                boolean;

              data?:
                ReaderLibraryResponse;

              message?:
                string;
            };

          if (
            !response.ok ||
            !payload.ok ||
            !payload.data
          ) {
            throw new Error(
              payload.message ??
              "Não foi possível carregar sua seleção.",
            );
          }

          setData(
            payload.data,
          );
        } catch (
          requestError
        ) {
          if (
            requestError instanceof
              DOMException &&
            requestError.name ===
              "AbortError"
          ) {
            return;
          }

          setError(
            requestError instanceof
              Error
              ? requestError.message
              : "Não foi possível carregar sua seleção.",
          );
        } finally {
          if (
            !controller.signal
              .aborted
          ) {
            setLoading(
              false,
            );
          }
        }
      }

      loadLibrary();

      return () => {
        controller.abort();
      };
    },
    [
      hydrated,
      historyStoryIds,
      state.favoriteCategories,
      state.favoriteCountryCodes,
      state.savedStoryIds,
    ],
  );

  const selectedItems =
    activeTab ===
    "saved"
      ? data.saved
      : activeTab ===
          "history"
        ? data.history
        : data.recommendations;

  const favoriteCountries =
    countries.filter(
      (country) =>
        state.favoriteCountryCodes.includes(
          country.code,
        ),
    );

  function addSelectedCountry():
    void {
    if (
      !selectedCountryCode
    ) {
      return;
    }

    toggleCountry(
      selectedCountryCode as
        CountryCode,
    );

    setSelectedCountryCode(
      "",
    );
  }

  return (
    <>
      <Box
        as="section"
        aria-labelledby="reader-library-title"
        background="card"
        border="default"
        radius="card"
        padding="xl"
      >
        <Text
          id="reader-library-title"
          preset="pageTitle"
          wrap="balance"
        >
          Minha seleção
        </Text>

        <Text
          preset="bodyLarge"
          tone="muted"
          className="mt-2 max-w-3xl"
        >
          Salve stories, retome leituras
          recentes e personalize as
          recomendações por categoria e país.
        </Text>

        <Box
          className="
            mt-7 grid grid-cols-1
            gap-4 sm:grid-cols-3
          "
        >
          <LibraryStat
            label="Notícias salvas"
            value={
              state.savedStoryIds.length
            }
            icon={
              <Bookmark
                aria-hidden="true"
                size={20}
              />
            }
          />

          <LibraryStat
            label="Histórico recente"
            value={
              state.history.length
            }
            icon={
              <Clock3
                aria-hidden="true"
                size={20}
              />
            }
          />

          <LibraryStat
            label="Preferências"
            value={
              state.favoriteCategories.length +
              state.favoriteCountryCodes.length
            }
            icon={
              <SlidersHorizontal
                aria-hidden="true"
                size={20}
              />
            }
          />
        </Box>
      </Box>

      <Box
        as="section"
        aria-labelledby="reader-preferences-title"
        background="card"
        border="default"
        radius="card"
        padding="xl"
        className="mt-8"
      >
        <Text
          id="reader-preferences-title"
          preset="sectionTitle"
        >
          Ajuste suas preferências
        </Text>

        <Text
          tone="muted"
          className="mt-2 max-w-3xl"
        >
          Essas escolhas ficam somente neste
          navegador e ajudam a ordenar a aba
          “Para você”.
        </Text>

        <Box
          className="
            mt-6 grid grid-cols-1
            gap-8 lg:grid-cols-2
          "
        >
          <Box>
            <Text preset="label">
              Categorias favoritas
            </Text>

            <Box
              display="flex"
              gap="sm"
              className="mt-3 flex-wrap"
            >
              {(
                Object.keys(
                  categoryLabels,
                ) as
                  NewsCategory[]
              ).map(
                (category) => {
                  const selected =
                    state.favoriteCategories.includes(
                      category,
                    );

                  return (
                    <button
                      key={
                        category
                      }
                      type="button"
                      onClick={
                        () =>
                          toggleCategory(
                            category,
                          )
                      }
                      aria-pressed={
                        selected
                      }
                      className={[
                        "min-h-10 rounded-pill border px-4 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                        selected
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-background hover:border-primary hover:text-primary",
                      ].join(
                        " ",
                      )}
                    >
                      {
                        categoryLabels[
                          category
                        ]
                      }
                    </button>
                  );
                },
              )}
            </Box>
          </Box>

          <Box>
            <Text preset="label">
              Países favoritos
            </Text>

            <Box
              display="flex"
              gap="sm"
              className="
                mt-3 flex-col
                sm:flex-row
              "
            >
              <select
                value={
                  selectedCountryCode
                }
                onChange={
                  (
                    event,
                  ) =>
                    setSelectedCountryCode(
                      event.target.value,
                    )
                }
                className="
                  min-h-11 min-w-0
                  flex-1 rounded-control
                  border border-border
                  bg-background px-4
                  text-sm outline-none
                  focus-visible:ring-2
                  focus-visible:ring-ring
                "
              >
                <option value="">
                  Escolha um país
                </option>

                {countries
                  .filter(
                    (country) =>
                      !state.favoriteCountryCodes.includes(
                        country.code,
                      ),
                  )
                  .map(
                    (country) => (
                      <option
                        key={
                          country.code
                        }
                        value={
                          country.code
                        }
                      >
                        {
                          country.name
                        }
                      </option>
                    ),
                  )}
              </select>

              <button
                type="button"
                onClick={
                  addSelectedCountry
                }
                disabled={
                  !selectedCountryCode
                }
                className="
                  min-h-11 rounded-button
                  bg-primary px-5
                  text-sm font-semibold
                  text-white outline-none
                  transition-opacity
                  hover:opacity-85
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  focus-visible:ring-2
                  focus-visible:ring-ring
                "
              >
                Adicionar
              </button>
            </Box>

            {favoriteCountries.length >
            0 ? (
              <Box
                display="flex"
                gap="xs"
                className="mt-4 flex-wrap"
              >
                {favoriteCountries.map(
                  (country) => (
                    <button
                      key={
                        country.code
                      }
                      type="button"
                      onClick={
                        () =>
                          toggleCountry(
                            country.code,
                          )
                      }
                      className="
                        inline-flex min-h-9
                        items-center gap-2
                        rounded-pill border
                        border-primary
                        bg-primary-soft
                        px-3 text-sm
                        font-semibold
                        text-primary
                        outline-none
                        transition-opacity
                        hover:opacity-75
                        focus-visible:ring-2
                        focus-visible:ring-ring
                      "
                      title={`Remover ${country.name}`}
                    >
                      <CountryFlag
                        code={
                          country.code
                        }
                        countryName={
                          country.name
                        }
                        className="h-4 w-6"
                      />

                      {
                        country.name
                      }

                      <span
                        aria-hidden="true"
                      >
                        ×
                      </span>
                    </button>
                  ),
                )}
              </Box>
            ) : (
              <Text
                preset="bodySmall"
                tone="subtle"
                className="mt-3"
              >
                Nenhum país selecionado.
              </Text>
            )}
          </Box>
        </Box>
      </Box>

      <Box
        as="section"
        aria-labelledby="reader-library-content-title"
        className="mt-10"
      >
        <Box
          display="flex"
          align="end"
          justify="between"
          gap="md"
          className="flex-wrap"
        >
          <Box>
            <Text
              id="reader-library-content-title"
              preset="sectionTitle"
            >
              Sua central de leitura
            </Text>

            <Text
              tone="muted"
              className="mt-1"
            >
              Organize o que pretende ler e
              reencontre o que já abriu.
            </Text>
          </Box>

          <Box
            display="flex"
            gap="xs"
            className="flex-wrap"
          >
            <TabButton
              active={
                activeTab ===
                "recommendations"
              }
              onClick={
                () =>
                  setActiveTab(
                    "recommendations",
                  )
              }
              icon={
                <Compass
                  aria-hidden="true"
                  size={17}
                />
              }
            >
              Para você
            </TabButton>

            <TabButton
              active={
                activeTab ===
                "saved"
              }
              onClick={
                () =>
                  setActiveTab(
                    "saved",
                  )
              }
              icon={
                <Bookmark
                  aria-hidden="true"
                  size={17}
                />
              }
            >
              Salvas
            </TabButton>

            <TabButton
              active={
                activeTab ===
                "history"
              }
              onClick={
                () =>
                  setActiveTab(
                    "history",
                  )
              }
              icon={
                <Clock3
                  aria-hidden="true"
                  size={17}
                />
              }
            >
              Histórico
            </TabButton>
          </Box>
        </Box>

        {(activeTab ===
          "saved" &&
          state.savedStoryIds.length >
            0) ||
        (activeTab ===
          "history" &&
          state.history.length >
            0) ? (
          <Box
            display="flex"
            justify="end"
            className="mt-4"
          >
            <button
              type="button"
              onClick={
                activeTab ===
                "saved"
                  ? clearSaved
                  : clearHistory
              }
              className="
                inline-flex min-h-10
                items-center gap-2
                rounded-button border
                border-border bg-card
                px-4 text-sm
                font-semibold
                text-muted-foreground
                outline-none
                transition-colors
                hover:border-danger
                hover:text-danger
                focus-visible:ring-2
                focus-visible:ring-ring
              "
            >
              <Trash2
                aria-hidden="true"
                size={17}
              />

              {activeTab ===
              "saved"
                ? "Limpar salvas"
                : "Limpar histórico"}
            </button>
          </Box>
        ) : null}

        {!hydrated ||
        loading ? (
          <LibraryLoading />
        ) : error ? (
          <LibraryError
            message={
              error
            }
          />
        ) : selectedItems.length >
          0 ? (
          <Box
            as="ul"
            className="
              mt-6 grid grid-cols-1
              gap-5 md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {selectedItems.map(
              (item) => (
                <Box
                  as="li"
                  key={
                    item.story.id
                  }
                  className="min-w-0"
                >
                  <ReaderLibraryCard
                    item={item}
                  />
                </Box>
              ),
            )}
          </Box>
        ) : (
          <LibraryEmptyState
            tab={
              activeTab
            }
          />
        )}
      </Box>
    </>
  );
}

type LibraryStatProps = {
  label:
    string;

  value:
    number;

  icon:
    ReactNode;
};

function LibraryStat({
  label,
  value,
  icon,
}: LibraryStatProps) {
  return (
    <Box
      background="surfaceMuted"
      border="default"
      radius="card"
      padding="lg"
    >
      <Box
        display="flex"
        align="center"
        justify="between"
        gap="md"
      >
        <Box>
          <Text
            preset="metadata"
            tone="subtle"
          >
            {label}
          </Text>

          <Text
            preset="sectionTitle"
            className="mt-1"
          >
            {value}
          </Text>
        </Box>

        <span
          className="
            inline-flex h-11 w-11
            items-center justify-center
            rounded-full
            bg-primary-soft
            text-primary
          "
        >
          {icon}
        </span>
      </Box>
    </Box>
  );
}

type TabButtonProps = {
  active:
    boolean;

  onClick:
    () => void;

  icon:
    ReactNode;

  children:
    ReactNode;
};

function TabButton({
  active,
  onClick,
  icon,
  children,
}: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      aria-pressed={
        active
      }
      className={[
        "inline-flex min-h-10 items-center gap-2 rounded-pill border px-4 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary text-white"
          : "border-border bg-card hover:border-primary hover:text-primary",
      ].join(
        " ",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

type ReaderLibraryCardProps = {
  item:
    ReaderLibraryStoryItem;
};

function ReaderLibraryCard({
  item,
}: ReaderLibraryCardProps) {
  return (
    <article
      className="
        relative h-full overflow-hidden
        rounded-card border
        border-border bg-card
      "
    >
      <Link
        href={`/noticias/${encodeURIComponent(
          item.story.id,
        )}`}
        prefetch={false}
        className="
          group block h-full
          outline-none
          focus-visible:ring-2
          focus-visible:ring-ring
        "
      >
        <EditorialImage
          src={
            item.story.imageUrl
          }
          alt={
            item.story.headline
          }
          sizes="
            (min-width: 1280px) 33vw,
            (min-width: 768px) 50vw,
            100vw
          "
          className="aspect-video w-full"
          fallback={
            <div
              className="
                flex h-full items-center
                justify-center
                bg-surface-strong
                px-6 text-center
                text-sm font-semibold
                text-muted-foreground
              "
            >
              {
                item.story
                  .categoryLabel
              }
            </div>
          }
        />

        <Box padding="lg">
          <Box
            display="flex"
            align="center"
            justify="between"
            gap="sm"
          >
            <Text
              as="span"
              preset="categoryLabel"
              tone="accent"
            >
              {
                item.story
                  .categoryLabel
              }
            </Text>

            {item.country && (
              <Box
                display="flex"
                align="center"
                gap="xs"
                className="min-w-0"
              >
                <CountryFlag
                  code={
                    item.country.code
                  }
                  countryName={
                    item.country.name
                  }
                  className="h-4 w-6"
                />

                <Text
                  as="span"
                  preset="metadata"
                  tone="subtle"
                  clamp={1}
                >
                  {
                    item.country.name
                  }
                </Text>
              </Box>
            )}
          </Box>

          <Text
            preset="cardTitle"
            clamp={3}
            className="
              mt-3 transition-colors
              group-hover:text-primary
            "
          >
            {
              item.story.headline
            }
          </Text>

          <Text
            preset="bodySmall"
            tone="muted"
            clamp={3}
            className="mt-3"
          >
            {
              item.story.summary
            }
          </Text>

          <Text
            preset="metadata"
            tone="subtle"
            className="mt-5"
          >
            {item.sourceCount ===
            1
              ? "1 fonte"
              : `${item.sourceCount} fontes`}
            {" · "}
            {
              item.publishedAtLabel
            }
          </Text>
        </Box>
      </Link>

      <div
        className="
          absolute right-3 top-3
          z-30
        "
      >
        <SaveStoryButton
          storyId={
            item.story.id
          }
          compact
        />
      </div>
    </article>
  );
}

function LibraryLoading() {
  return (
    <div
      aria-label="Carregando sua seleção"
      className="
        mt-6 grid grid-cols-1
        gap-5 md:grid-cols-2
        xl:grid-cols-3
      "
    >
      <div className="h-80 animate-pulse rounded-card bg-surface-strong" />
      <div className="h-80 animate-pulse rounded-card bg-surface-strong" />
      <div className="h-80 animate-pulse rounded-card bg-surface-strong" />
    </div>
  );
}

type LibraryErrorProps = {
  message:
    string;
};

function LibraryError({
  message,
}: LibraryErrorProps) {
  return (
    <Box
      background="surfaceMuted"
      border="default"
      radius="card"
      padding="xl"
      className="mt-6 text-center"
    >
      <Text preset="sectionTitle">
        Não foi possível carregar
      </Text>

      <Text
        tone="muted"
        className="mt-2"
      >
        {message}
      </Text>
    </Box>
  );
}

type LibraryEmptyStateProps = {
  tab:
    LibraryTab;
};

function LibraryEmptyState({
  tab,
}: LibraryEmptyStateProps) {
  const content =
    tab ===
    "saved"
      ? {
          title:
            "Nenhuma notícia salva",

          description:
            "Abra uma story e use o botão Salvar para encontrá-la aqui depois.",
        }
      : tab ===
          "history"
        ? {
            title:
              "Seu histórico está vazio",

            description:
              "As stories abertas no modal ou na página completa aparecerão aqui.",
          }
        : {
            title:
              "Ainda não há recomendações",

            description:
              "Escolha categorias ou países favoritos e sincronize novas notícias.",
          };

  return (
    <Box
      background="surfaceMuted"
      border="default"
      radius="card"
      padding="xl"
      className="mt-6 text-center"
    >
      <Text preset="sectionTitle">
        {content.title}
      </Text>

      <Text
        tone="muted"
        className="mx-auto mt-2 max-w-xl"
      >
        {content.description}
      </Text>

      <Link
        href="/noticias"
        className="
          mt-6 inline-flex min-h-11
          items-center justify-center
          rounded-button bg-primary
          px-5 text-sm font-semibold
          text-white outline-none
          transition-opacity
          hover:opacity-85
          focus-visible:ring-2
          focus-visible:ring-ring
        "
      >
        Explorar notícias
      </Link>
    </Box>
  );
}
