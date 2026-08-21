"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  Globe2,
  LogOut,
  Newspaper,
  RefreshCw,
  RotateCcw,
  Server,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import type {
  AdminDashboardData,
  AdminSourceHealthItem,
  AdminSyncRunItem,
  AdminSystemStatus,
} from "@/domain/admin/admin.types";

type ViewState =
  | "checking"
  | "login"
  | "dashboard"
  | "error";

type DashboardPayload = {
  ok:
    boolean;

  data?:
    AdminDashboardData;

  message?:
    string;
};

export function AdminDashboard() {
  const [
    view,
    setView,
  ] =
    useState<
      ViewState
    >(
      "checking",
    );

  const [
    data,
    setData,
  ] =
    useState<
      AdminDashboardData | null
    >(
      null,
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
    refreshing,
    setRefreshing,
  ] =
    useState(
      false,
    );

  const [
    syncing,
    setSyncing,
  ] =
    useState(
      false,
    );

  const loadDashboard =
    useCallback(
      async ({
        showLoading =
          false,
      }: {
        showLoading?:
          boolean;
      } = {}):
        Promise<void> => {
        if (
          showLoading
        ) {
          setRefreshing(
            true,
          );
        }

        try {
          const response =
            await fetch(
              "/api/admin/dashboard",
              {
                method:
                  "GET",

                cache:
                  "no-store",

                headers: {
                  Accept:
                    "application/json",
                },
              },
            );

          const payload =
            await response
              .json() as
                DashboardPayload;

          if (
            response.status ===
            401
          ) {
            setView(
              "login",
            );

            setData(
              null,
            );

            setError(
              null,
            );

            return;
          }

          if (
            !response.ok ||
            !payload.ok ||
            !payload.data
          ) {
            throw new Error(
              payload.message ??
              "Não foi possível carregar o painel.",
            );
          }

          setData(
            payload.data,
          );

          setError(
            null,
          );

          setView(
            "dashboard",
          );
        } catch (
          requestError
        ) {
          setError(
            requestError instanceof
              Error
              ? requestError.message
              : "Não foi possível carregar o painel.",
          );

          setView(
            (
              currentView,
            ) =>
              currentView ===
              "dashboard"
                ? "dashboard"
                : "error",
          );
        } finally {
          if (
            showLoading
          ) {
            setRefreshing(
              false,
            );
          }
        }
      },
      [],
    );

  useEffect(
    () => {
      const initialTimer =
        window.setTimeout(
          () => {
            void loadDashboard();
          },
          0,
        );

      const refreshTimer =
        window.setInterval(
          () => {
            void loadDashboard();
          },
          60_000,
        );

      return () => {
        window.clearTimeout(
          initialTimer,
        );

        window.clearInterval(
          refreshTimer,
        );
      };
    },
    [
      loadDashboard,
    ],
  );

  async function handleLogin(
    credentials: {
      username:
        string;

      password:
        string;
    },
  ): Promise<void> {
    setError(
      null,
    );

    const response =
      await fetch(
        "/api/admin/session",
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body:
            JSON.stringify(
              credentials,
            ),
        },
      );

    const payload =
      await response
        .json() as {
          ok:
            boolean;

          message?:
            string;
        };

    if (
      !response.ok ||
      !payload.ok
    ) {
      throw new Error(
        payload.message ??
        "Não foi possível entrar.",
      );
    }

    await loadDashboard({
      showLoading:
        true,
    });
  }

  async function handleLogout():
    Promise<void> {
    await fetch(
      "/api/admin/session",
      {
        method:
          "DELETE",
      },
    );

    setData(
      null,
    );

    setError(
      null,
    );

    setView(
      "login",
    );
  }

  async function handleSynchronization():
    Promise<void> {
    setSyncing(
      true,
    );

    setError(
      null,
    );

    try {
      const response =
        await fetch(
          "/api/admin/sync",
          {
            method:
              "POST",

            headers: {
              Accept:
                "application/json",
            },
          },
        );

      const payload =
        await response
          .json() as
            DashboardPayload;

      if (
        response.status ===
        401
      ) {
        setView(
          "login",
        );

        setData(
          null,
        );

        return;
      }

      if (
        !response.ok ||
        !payload.ok ||
        !payload.data
      ) {
        throw new Error(
          payload.message ??
          "A sincronização falhou.",
        );
      }

      setData(
        payload.data,
      );
    } catch (
      syncError
    ) {
      setError(
        syncError instanceof
          Error
          ? syncError.message
          : "A sincronização falhou.",
      );
    } finally {
      setSyncing(
        false,
      );
    }
  }

  if (
    view ===
    "checking"
  ) {
    return (
      <AdminLoading />
    );
  }

  if (
    view ===
    "login"
  ) {
    return (
      <AdminLogin
        error={
          error
        }
        onLogin={
          handleLogin
        }
      />
    );
  }

  if (
    view ===
      "error" ||
    !data
  ) {
    return (
      <AdminError
        message={
          error ??
          "Não foi possível carregar o painel."
        }
        onRetry={
          () =>
            void loadDashboard({
              showLoading:
                true,
            })
        }
        refreshing={
          refreshing
        }
      />
    );
  }

  return (
    <div
      className="
        mx-auto w-full
        max-w-[96rem]
      "
    >
      <AdminHeader
        data={data}
        refreshing={
          refreshing
        }
        syncing={
          syncing
        }
        onRefresh={
          () =>
            void loadDashboard({
              showLoading:
                true,
            })
        }
        onSync={
          () =>
            void handleSynchronization()
        }
        onLogout={
          () =>
            void handleLogout()
        }
      />

      {error && (
        <div
          role="alert"
          className="
            mt-5 flex items-start
            gap-3 rounded-card
            border border-red-200
            bg-red-50 p-4
            text-red-900
          "
        >
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 shrink-0"
            size={20}
          />

          <div>
            <p className="font-semibold">
              A última operação apresentou
              um problema
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        </div>
      )}

      <SystemStatusBanner
        status={
          data.systemStatus
        }
        latestSuccessAtISO={
          data.syncSummary
            .latestSuccessAtISO
        }
      />

      <MetricsGrid
        data={data}
      />

      <div
        className="
          mt-8 grid
          grid-cols-1 gap-6
          xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]
        "
      >
        <RecentRunsTable
          runs={
            data.recentRuns
          }
        />

        <DistributionPanel
          data={data}
        />
      </div>

      <SourceHealthTable
        sources={
          data.sourceHealth
        }
        summary={
          data.sourceSummary
        }
      />

      <footer
        className="
          mt-8 border-t
          border-border pt-5
          text-sm
          text-muted-foreground
        "
      >
        Painel atualizado em{" "}
        {formatDateTime(
          data.generatedAtISO,
        )}
        . Atualização automática a cada
        60 segundos.
      </footer>
    </div>
  );
}

type AdminHeaderProps = {
  data:
    AdminDashboardData;

  refreshing:
    boolean;

  syncing:
    boolean;

  onRefresh:
    () => void;

  onSync:
    () => void;

  onLogout:
    () => void;
};

function AdminHeader({
  data,
  refreshing,
  syncing,
  onRefresh,
  onSync,
  onLogout,
}: AdminHeaderProps) {
  return (
    <header
      className="
        flex flex-col gap-5
        rounded-card border
        border-border bg-card
        p-6 shadow-sm
        lg:flex-row
        lg:items-center
        lg:justify-between
      "
    >
      <div>
        <div
          className="
            flex items-center
            gap-3
          "
        >
          <span
            className="
              inline-flex h-11 w-11
              items-center justify-center
              rounded-full
              bg-primary-soft
              text-primary
            "
          >
            <ShieldCheck
              aria-hidden="true"
              size={23}
            />
          </span>

          <div>
            <p
              className="
                text-xs font-bold
                uppercase
                tracking-[0.16em]
                text-primary
              "
            >
              Área interna
            </p>

            <h1
              className="
                mt-1 text-3xl
                font-black
                tracking-tight
                text-foreground
              "
            >
              Administração
            </h1>
          </div>
        </div>

        <p
          className="
            mt-4 max-w-3xl
            text-sm leading-6
            text-muted-foreground
          "
        >
          Acompanhe banco, sincronizações,
          retenção e atividade das fontes
          que alimentam o World Newspaper.
        </p>

        <p
          className="
            mt-2 text-xs
            text-muted-foreground
          "
        >
          Última execução:{" "}
          {data.syncSummary
            .latestRunAtISO
            ? formatRelativeDate(
                data.syncSummary
                  .latestRunAtISO,
              )
            : "nenhuma registrada"}
        </p>
      </div>

      <div
        className="
          flex flex-wrap gap-2
        "
      >
        <ActionButton
          onClick={
            onRefresh
          }
          disabled={
            refreshing ||
            syncing
          }
          icon={
            <RefreshCw
              aria-hidden="true"
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
          }
        >
          Atualizar
        </ActionButton>

        <ActionButton
          onClick={
            onSync
          }
          disabled={
            syncing ||
            refreshing
          }
          primary
          icon={
            <RotateCcw
              aria-hidden="true"
              size={17}
              className={
                syncing
                  ? "animate-spin"
                  : ""
              }
            />
          }
        >
          {syncing
            ? "Sincronizando..."
            : "Sincronizar agora"}
        </ActionButton>

        <ActionButton
          onClick={
            onLogout
          }
          disabled={
            syncing
          }
          icon={
            <LogOut
              aria-hidden="true"
              size={17}
            />
          }
        >
          Sair
        </ActionButton>
      </div>
    </header>
  );
}

type ActionButtonProps = {
  children:
    ReactNode;

  icon:
    ReactNode;

  onClick:
    () => void;

  disabled?:
    boolean;

  primary?:
    boolean;
};

function ActionButton({
  children,
  icon,
  onClick,
  disabled =
    false,
  primary =
    false,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      disabled={
        disabled
      }
      className={[
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-button border px-4 text-sm font-semibold outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-45",
        primary
          ? "border-primary bg-primary text-white hover:opacity-85"
          : "border-border bg-background text-foreground hover:border-primary hover:text-primary",
      ].join(
        " ",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

type SystemStatusBannerProps = {
  status:
    AdminSystemStatus;

  latestSuccessAtISO:
    string | null;
};

function SystemStatusBanner({
  status,
  latestSuccessAtISO,
}: SystemStatusBannerProps) {
  const configuration =
    getSystemStatusConfiguration(
      status,
    );

  return (
    <section
      className={[
        "mt-6 flex flex-col gap-4 rounded-card border p-5 sm:flex-row sm:items-center sm:justify-between",
        configuration.className,
      ].join(
        " ",
      )}
    >
      <div
        className="
          flex items-start gap-3
        "
      >
        {configuration.icon}

        <div>
          <h2 className="font-bold">
            {
              configuration.title
            }
          </h2>

          <p className="mt-1 text-sm">
            {
              configuration.description
            }
          </p>
        </div>
      </div>

      <div
        className="
          text-sm font-semibold
        "
      >
        Último sucesso:{" "}
        {latestSuccessAtISO
          ? formatRelativeDate(
              latestSuccessAtISO,
            )
          : "não registrado"}
      </div>
    </section>
  );
}

function MetricsGrid({
  data,
}: {
  data:
    AdminDashboardData;
}) {
  const metrics = [
    {
      label:
        "Stories no banco",

      value:
        formatNumber(
          data.storage.stories,
        ),

      detail:
        `Publicação mais recente: ${
          data.storage
            .newestPublishedAtISO
            ? formatRelativeDate(
                data.storage
                  .newestPublishedAtISO,
              )
            : "não informada"
        }`,

      icon:
        <Newspaper
          aria-hidden="true"
          size={22}
        />,
    },

    {
      label:
        "Artigos no banco",

      value:
        formatNumber(
          data.storage.articles,
        ),

      detail:
        `Último item observado: ${
          data.storage
            .latestSeenAtISO
            ? formatRelativeDate(
                data.storage
                  .latestSeenAtISO,
              )
            : "não informado"
        }`,

      icon:
        <Database
          aria-hidden="true"
          size={22}
        />,
    },

    {
      label:
        "Sucesso em 24 h",

      value:
        `${data.syncSummary.successRateLast24Hours}%`,

      detail:
        `${data.syncSummary.successfulRunsLast24Hours} sucesso(s) e ${data.syncSummary.failedRunsLast24Hours} falha(s)`,

      icon:
        <Activity
          aria-hidden="true"
          size={22}
        />,
    },

    {
      label:
        "Tempo médio",

      value:
        data.syncSummary
          .averageDurationMs
          ? formatDuration(
              data.syncSummary
                .averageDurationMs,
            )
          : "—",

      detail:
        `${data.syncSummary.runsLast24Hours} execução(ões) nas últimas 24 h`,

      icon:
        <Clock3
          aria-hidden="true"
          size={22}
        />,
    },
  ];

  return (
    <section
      aria-label="Métricas principais"
      className="
        mt-6 grid grid-cols-1
        gap-4 sm:grid-cols-2
        xl:grid-cols-4
      "
    >
      {metrics.map(
        (metric) => (
          <article
            key={
              metric.label
            }
            className="
              rounded-card border
              border-border bg-card
              p-5 shadow-sm
            "
          >
            <div
              className="
                flex items-center
                justify-between gap-4
              "
            >
              <p
                className="
                  text-sm font-semibold
                  text-muted-foreground
                "
              >
                {metric.label}
              </p>

              <span
                className="
                  inline-flex h-10 w-10
                  items-center justify-center
                  rounded-full
                  bg-primary-soft
                  text-primary
                "
              >
                {metric.icon}
              </span>
            </div>

            <p
              className="
                mt-4 text-3xl
                font-black
                tracking-tight
                text-foreground
              "
            >
              {metric.value}
            </p>

            <p
              className="
                mt-2 text-xs
                leading-5
                text-muted-foreground
              "
            >
              {metric.detail}
            </p>
          </article>
        ),
      )}
    </section>
  );
}

function RecentRunsTable({
  runs,
}: {
  runs:
    AdminSyncRunItem[];
}) {
  return (
    <section
      className="
        min-w-0 overflow-hidden
        rounded-card border
        border-border bg-card
        shadow-sm
      "
    >
      <div
        className="
          flex items-center
          justify-between gap-4
          border-b border-border
          p-5
        "
      >
        <div>
          <h2
            className="
              text-xl font-black
              text-foreground
            "
          >
            Sincronizações recentes
          </h2>

          <p
            className="
              mt-1 text-sm
              text-muted-foreground
            "
          >
            Histórico das últimas 20
            execuções.
          </p>
        </div>

        <Server
          aria-hidden="true"
          className="text-primary"
          size={22}
        />
      </div>

      {runs.length ===
      0 ? (
        <EmptyPanel
          message="Nenhuma sincronização foi registrada depois da migration."
        />
      ) : (
        <div className="overflow-x-auto">
          <table
            className="
              w-full min-w-[58rem]
              border-collapse
              text-left text-sm
            "
          >
            <thead
              className="
                bg-surface-strong
                text-xs uppercase
                tracking-wide
                text-muted-foreground
              "
            >
              <tr>
                <th className="px-5 py-3">
                  Status
                </th>

                <th className="px-5 py-3">
                  Início
                </th>

                <th className="px-5 py-3">
                  Origem
                </th>

                <th className="px-5 py-3">
                  Duração
                </th>

                <th className="px-5 py-3">
                  Países
                </th>

                <th className="px-5 py-3">
                  Stories
                </th>

                <th className="px-5 py-3">
                  Artigos
                </th>

                <th className="px-5 py-3">
                  Limpeza
                </th>
              </tr>
            </thead>

            <tbody>
              {runs.map(
                (run) => (
                  <tr
                    key={
                      run.id
                    }
                    className="
                      border-t
                      border-border
                      align-top
                    "
                  >
                    <td className="px-5 py-4">
                      <RunStatusBadge
                        run={run}
                      />

                      {run.errorMessage && (
                        <p
                          className="
                            mt-2 max-w-xs
                            text-xs leading-5
                            text-red-700
                          "
                        >
                          {
                            run.errorMessage
                          }
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold">
                        {formatDateTime(
                          run.startedAtISO,
                        )}
                      </p>

                      <p
                        className="
                          mt-1 text-xs
                          text-muted-foreground
                        "
                      >
                        {formatRelativeDate(
                          run.startedAtISO,
                        )}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {formatTrigger(
                        run.trigger,
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {run.durationMs
                        ? formatDuration(
                            run.durationMs,
                          )
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      {
                        run.countriesProcessed
                      }
                    </td>

                    <td className="px-5 py-4">
                      <p>
                        {run.storiesSaved}{" "}
                        salvas
                      </p>

                      <p
                        className="
                          mt-1 text-xs
                          text-muted-foreground
                        "
                      >
                        {
                          run.storiesCollected
                        }{" "}
                        coletadas
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p>
                        {run.articlesSaved}{" "}
                        salvos
                      </p>

                      <p
                        className="
                          mt-1 text-xs
                          text-muted-foreground
                        "
                      >
                        {
                          run.articlesCollected
                        }{" "}
                        coletados
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {
                        run.storiesDeleted
                      }{" "}
                      removidas
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function DistributionPanel({
  data,
}: {
  data:
    AdminDashboardData;
}) {
  const maximumCountryStories =
    Math.max(
      1,
      ...data.countries.map(
        (country) =>
          country.stories,
      ),
    );

  return (
    <section
      className="
        rounded-card border
        border-border bg-card
        p-5 shadow-sm
      "
    >
      <div
        className="
          flex items-center
          justify-between gap-4
        "
      >
        <div>
          <h2
            className="
              text-xl font-black
              text-foreground
            "
          >
            Distribuição editorial
          </h2>

          <p
            className="
              mt-1 text-sm
              text-muted-foreground
            "
          >
            Stories por categoria e país.
          </p>
        </div>

        <Globe2
          aria-hidden="true"
          className="text-primary"
          size={22}
        />
      </div>

      <div
        className="
          mt-6 grid grid-cols-3
          gap-3
        "
      >
        {data.categories.map(
          (category) => (
            <div
              key={
                category.category
              }
              className="
                rounded-card-small
                border border-border
                bg-background p-3
                text-center
              "
            >
              <p
                className="
                  text-xs font-semibold
                  text-muted-foreground
                "
              >
                {category.label}
              </p>

              <p
                className="
                  mt-2 text-2xl
                  font-black
                  text-foreground
                "
              >
                {category.stories}
              </p>
            </div>
          ),
        )}
      </div>

      <div className="mt-7 space-y-4">
        {data.countries.map(
          (country) => (
            <div
              key={
                country.countryCode
              }
            >
              <div
                className="
                  flex items-center
                  justify-between gap-3
                  text-sm
                "
              >
                <span className="font-semibold">
                  {country.countryName}
                </span>

                <span
                  className="
                    text-muted-foreground
                  "
                >
                  {country.stories}
                </span>
              </div>

              <div
                className="
                  mt-2 h-2
                  overflow-hidden
                  rounded-full
                  bg-surface-strong
                "
              >
                <div
                  className="
                    h-full rounded-full
                    bg-primary
                  "
                  style={{
                    width:
                      `${Math.max(
                        4,
                        Math.round(
                          (
                            country.stories /
                            maximumCountryStories
                          ) *
                            100,
                        ),
                      )}%`,
                  }}
                />
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}

type SourceHealthTableProps = {
  sources:
    AdminSourceHealthItem[];

  summary:
    AdminDashboardData[
      "sourceSummary"
    ];
};

function SourceHealthTable({
  sources,
  summary,
}: SourceHealthTableProps) {
  const [
    filter,
    setFilter,
  ] =
    useState<
      "all" |
      AdminSourceHealthItem[
        "status"
      ]
    >(
      "all",
    );

  const filteredSources =
    useMemo(
      () =>
        filter ===
        "all"
          ? sources
          : sources.filter(
              (source) =>
                source.status ===
                filter,
            ),
      [
        filter,
        sources,
      ],
    );

  return (
    <section
      className="
        mt-8 overflow-hidden
        rounded-card border
        border-border bg-card
        shadow-sm
      "
    >
      <div
        className="
          flex flex-col gap-4
          border-b border-border
          p-5 lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div>
          <h2
            className="
              text-xl font-black
              text-foreground
            "
          >
            Saúde das fontes
          </h2>

          <p
            className="
              mt-1 max-w-3xl
              text-sm
              text-muted-foreground
            "
          >
            A situação é calculada pela última
            vez em que artigos da fonte foram
            observados: ativa até 6 h, silenciosa
            até 48 h e desatualizada depois disso.
          </p>
        </div>

        <div
          className="
            flex flex-wrap gap-2
          "
        >
          <SourceFilterButton
            active={
              filter ===
              "all"
            }
            onClick={
              () =>
                setFilter(
                  "all",
                )
            }
          >
            Todas ({sources.length})
          </SourceFilterButton>

          <SourceFilterButton
            active={
              filter ===
              "stale"
            }
            onClick={
              () =>
                setFilter(
                  "stale",
                )
            }
          >
            Desatualizadas ({summary.stale})
          </SourceFilterButton>

          <SourceFilterButton
            active={
              filter ===
              "quiet"
            }
            onClick={
              () =>
                setFilter(
                  "quiet",
                )
            }
          >
            Silenciosas ({summary.quiet})
          </SourceFilterButton>

          <SourceFilterButton
            active={
              filter ===
              "active"
            }
            onClick={
              () =>
                setFilter(
                  "active",
                )
            }
          >
            Ativas ({summary.active})
          </SourceFilterButton>
        </div>
      </div>

      {filteredSources.length ===
      0 ? (
        <EmptyPanel
          message="Nenhuma fonte corresponde ao filtro selecionado."
        />
      ) : (
        <div className="overflow-x-auto">
          <table
            className="
              w-full min-w-[54rem]
              border-collapse
              text-left text-sm
            "
          >
            <thead
              className="
                bg-surface-strong
                text-xs uppercase
                tracking-wide
                text-muted-foreground
              "
            >
              <tr>
                <th className="px-5 py-3">
                  Situação
                </th>

                <th className="px-5 py-3">
                  Fonte
                </th>

                <th className="px-5 py-3">
                  País
                </th>

                <th className="px-5 py-3">
                  Artigos
                </th>

                <th className="px-5 py-3">
                  Última observação
                </th>

                <th className="px-5 py-3">
                  Publicação mais recente
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredSources.map(
                (source) => (
                  <tr
                    key={`${source.sourceId}:${source.countryCode}`}
                    className="
                      border-t
                      border-border
                    "
                  >
                    <td className="px-5 py-4">
                      <SourceStatusBadge
                        status={
                          source.status
                        }
                      />
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold">
                        {
                          source.sourceName
                        }
                      </p>

                      <p
                        className="
                          mt-1 text-xs
                          text-muted-foreground
                        "
                      >
                        {
                          source.sourceId
                        }
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {
                        source.countryName
                      }
                    </td>

                    <td className="px-5 py-4">
                      {formatNumber(
                        source.articles,
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {source.latestSeenAtISO
                        ? formatRelativeDate(
                            source.latestSeenAtISO,
                          )
                        : "não registrada"}
                    </td>

                    <td className="px-5 py-4">
                      {source.newestPublishedAtISO
                        ? formatDateTime(
                            source.newestPublishedAtISO,
                          )
                        : "não informada"}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

type SourceFilterButtonProps = {
  active:
    boolean;

  onClick:
    () => void;

  children:
    ReactNode;
};

function SourceFilterButton({
  active,
  onClick,
  children,
}: SourceFilterButtonProps) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={[
        "min-h-9 rounded-pill border px-3 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary text-white"
          : "border-border bg-background text-foreground hover:border-primary hover:text-primary",
      ].join(
        " ",
      )}
    >
      {children}
    </button>
  );
}

function RunStatusBadge({
  run,
}: {
  run:
    AdminSyncRunItem;
}) {
  const configuration =
    run.status ===
    "success"
      ? {
          label:
            "Sucesso",

          className:
            "border-emerald-200 bg-emerald-50 text-emerald-800",

          icon:
            <CheckCircle2
              aria-hidden="true"
              size={15}
            />,
        }
      : run.status ===
          "failed"
        ? {
            label:
              "Falhou",

            className:
              "border-red-200 bg-red-50 text-red-800",

            icon:
              <XCircle
                aria-hidden="true"
                size={15}
              />,
          }
        : {
            label:
              "Em execução",

            className:
              "border-amber-200 bg-amber-50 text-amber-800",

            icon:
              <Clock3
                aria-hidden="true"
                size={15}
              />,
          };

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-bold",
        configuration.className,
      ].join(
        " ",
      )}
    >
      {configuration.icon}
      {configuration.label}
    </span>
  );
}

function SourceStatusBadge({
  status,
}: {
  status:
    AdminSourceHealthItem[
      "status"
    ];
}) {
  const configuration =
    status ===
    "active"
      ? {
          label:
            "Ativa",

          className:
            "border-emerald-200 bg-emerald-50 text-emerald-800",
        }
      : status ===
          "quiet"
        ? {
            label:
              "Silenciosa",

            className:
              "border-amber-200 bg-amber-50 text-amber-800",
          }
        : {
            label:
              "Desatualizada",

            className:
              "border-red-200 bg-red-50 text-red-800",
          };

  return (
    <span
      className={[
        "inline-flex rounded-pill border px-2.5 py-1 text-xs font-bold",
        configuration.className,
      ].join(
        " ",
      )}
    >
      {
        configuration.label
      }
    </span>
  );
}

type AdminLoginProps = {
  error:
    string | null;

  onLogin:
    (
      credentials: {
        username:
          string;

        password:
          string;
      },
    ) =>
      Promise<void>;
};

function AdminLogin({
  error,
  onLogin,
}: AdminLoginProps) {
  const [
    submitting,
    setSubmitting,
  ] =
    useState(
      false,
    );

  const [
    localError,
    setLocalError,
  ] =
    useState<
      string | null
    >(
      error,
    );

  async function handleSubmit(
    event:
      FormEvent<
        HTMLFormElement
      >,
  ): Promise<void> {
    event.preventDefault();

    const formData =
      new FormData(
        event.currentTarget,
      );

    const username =
      String(
        formData.get(
          "username",
        ) ??
        "",
      );

    const password =
      String(
        formData.get(
          "password",
        ) ??
        "",
      );

    setSubmitting(
      true,
    );

    setLocalError(
      null,
    );

    try {
      await onLogin({
        username,
        password,
      });
    } catch (
      loginError
    ) {
      setLocalError(
        loginError instanceof
          Error
          ? loginError.message
          : "Não foi possível entrar.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  return (
    <div
      className="
        mx-auto flex min-h-[80vh]
        w-full max-w-lg
        items-center
      "
    >
      <section
        className="
          w-full rounded-card
          border border-border
          bg-card p-7
          shadow-xl
          sm:p-9
        "
      >
        <span
          className="
            inline-flex h-12 w-12
            items-center justify-center
            rounded-full
            bg-primary-soft
            text-primary
          "
        >
          <ShieldCheck
            aria-hidden="true"
            size={25}
          />
        </span>

        <p
          className="
            mt-6 text-xs font-bold
            uppercase
            tracking-[0.16em]
            text-primary
          "
        >
          Acesso restrito
        </p>

        <h1
          className="
            mt-2 text-3xl
            font-black
            tracking-tight
            text-foreground
          "
        >
          Painel administrativo
        </h1>

        <p
          className="
            mt-3 text-sm
            leading-6
            text-muted-foreground
          "
        >
          Entre com as credenciais
          configuradas nas variáveis de
          ambiente do projeto.
        </p>

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-7 space-y-5"
        >
          <label className="block">
            <span
              className="
                text-sm font-semibold
                text-foreground
              "
            >
              Usuário
            </span>

            <input
              name="username"
              type="text"
              autoComplete="username"
              required
              className="
                mt-2 min-h-12 w-full
                rounded-control border
                border-border
                bg-background px-4
                text-foreground
                outline-none
                focus-visible:ring-2
                focus-visible:ring-ring
              "
            />
          </label>

          <label className="block">
            <span
              className="
                text-sm font-semibold
                text-foreground
              "
            >
              Senha
            </span>

            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="
                mt-2 min-h-12 w-full
                rounded-control border
                border-border
                bg-background px-4
                text-foreground
                outline-none
                focus-visible:ring-2
                focus-visible:ring-ring
              "
            />
          </label>

          {localError && (
            <div
              role="alert"
              className="
                rounded-card-small
                border border-red-200
                bg-red-50 p-3
                text-sm text-red-800
              "
            >
              {localError}
            </div>
          )}

          <button
            type="submit"
            disabled={
              submitting
            }
            className="
              inline-flex min-h-12
              w-full items-center
              justify-center gap-2
              rounded-button
              bg-primary px-5
              font-semibold
              text-white
              outline-none
              transition-opacity
              hover:opacity-85
              disabled:cursor-not-allowed
              disabled:opacity-50
              focus-visible:ring-2
              focus-visible:ring-ring
            "
          >
            {submitting && (
              <RefreshCw
                aria-hidden="true"
                className="animate-spin"
                size={18}
              />
            )}

            {submitting
              ? "Entrando..."
              : "Entrar"}
          </button>
        </form>
      </section>
    </div>
  );
}

function AdminLoading() {
  return (
    <div
      className="
        mx-auto w-full
        max-w-[96rem]
        animate-pulse
        space-y-6
      "
      aria-label="Carregando painel administrativo"
    >
      <div
        className="
          h-40 rounded-card
          bg-surface-strong
        "
      />

      <div
        className="
          grid grid-cols-1
          gap-4 sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <div className="h-40 rounded-card bg-surface-strong" />
        <div className="h-40 rounded-card bg-surface-strong" />
        <div className="h-40 rounded-card bg-surface-strong" />
        <div className="h-40 rounded-card bg-surface-strong" />
      </div>

      <div className="h-96 rounded-card bg-surface-strong" />
    </div>
  );
}

type AdminErrorProps = {
  message:
    string;

  onRetry:
    () => void;

  refreshing:
    boolean;
};

function AdminError({
  message,
  onRetry,
  refreshing,
}: AdminErrorProps) {
  return (
    <div
      className="
        mx-auto flex min-h-[70vh]
        w-full max-w-2xl
        items-center
      "
    >
      <section
        className="
          w-full rounded-card
          border border-border
          bg-card p-8
          text-center shadow-lg
        "
      >
        <AlertTriangle
          aria-hidden="true"
          className="mx-auto text-amber-600"
          size={38}
        />

        <h1
          className="
            mt-5 text-2xl
            font-black
            text-foreground
          "
        >
          O painel não pôde ser carregado
        </h1>

        <p
          className="
            mx-auto mt-3 max-w-xl
            text-sm leading-6
            text-muted-foreground
          "
        >
          {message}
        </p>

        <button
          type="button"
          onClick={
            onRetry
          }
          disabled={
            refreshing
          }
          className="
            mt-6 inline-flex
            min-h-11 items-center
            justify-center gap-2
            rounded-button
            bg-primary px-5
            text-sm font-semibold
            text-white
            outline-none
            transition-opacity
            hover:opacity-85
            disabled:opacity-50
            focus-visible:ring-2
            focus-visible:ring-ring
          "
        >
          <RefreshCw
            aria-hidden="true"
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Tentar novamente
        </button>
      </section>
    </div>
  );
}

function EmptyPanel({
  message,
}: {
  message:
    string;
}) {
  return (
    <div
      className="
        p-8 text-center
        text-sm
        text-muted-foreground
      "
    >
      {message}
    </div>
  );
}

function getSystemStatusConfiguration(
  status:
    AdminSystemStatus,
) {
  if (
    status ===
    "healthy"
  ) {
    return {
      title:
        "Sistema saudável",

      description:
        "O banco possui conteúdo e a sincronização recente foi concluída com sucesso.",

      className:
        "border-emerald-200 bg-emerald-50 text-emerald-900",

      icon:
        <CheckCircle2
          aria-hidden="true"
          className="mt-0.5 shrink-0"
          size={22}
        />,
    };
  }

  if (
    status ===
    "warning"
  ) {
    return {
      title:
        "Sistema requer atenção",

      description:
        "O portal está disponível, mas ainda não há uma sincronização recente suficiente para considerar a operação normal.",

      className:
        "border-amber-200 bg-amber-50 text-amber-900",

      icon:
        <AlertTriangle
          aria-hidden="true"
          className="mt-0.5 shrink-0"
          size={22}
        />,
    };
  }

  return {
    title:
      "Situação crítica",

    description:
      "O conteúdo está vazio, muito desatualizado ou a execução mais recente falhou.",

    className:
      "border-red-200 bg-red-50 text-red-900",

    icon:
      <XCircle
        aria-hidden="true"
        className="mt-0.5 shrink-0"
        size={22}
      />,
  };
}

function formatTrigger(
  trigger:
    AdminSyncRunItem[
      "trigger"
    ],
): string {
  if (
    trigger ===
    "scheduled"
  ) {
    return "Agendada";
  }

  if (
    trigger ===
    "admin"
  ) {
    return "Painel";
  }

  return "Manual";
}

function formatDateTime(
  value:
    string,
): string {
  return new Intl
    .DateTimeFormat(
      "pt-BR",
      {
        dateStyle:
          "short",

        timeStyle:
          "medium",
      },
    )
    .format(
      new Date(
        value,
      ),
    );
}

function formatRelativeDate(
  value:
    string,
): string {
  const difference =
    Date.now() -
    new Date(
      value,
    ).getTime();

  if (
    !Number.isFinite(
      difference,
    )
  ) {
    return "data inválida";
  }

  if (
    difference <
    60_000
  ) {
    return "agora";
  }

  const minutes =
    Math.floor(
      difference /
      60_000,
    );

  if (
    minutes <
    60
  ) {
    return `há ${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes /
      60,
    );

  if (
    hours <
    24
  ) {
    return `há ${hours} h`;
  }

  const days =
    Math.floor(
      hours /
      24,
    );

  return `há ${days} d`;
}

function formatDuration(
  durationMs:
    number,
): string {
  if (
    durationMs <
    1_000
  ) {
    return `${durationMs} ms`;
  }

  const seconds =
    Math.round(
      durationMs /
      1_000,
    );

  if (
    seconds <
    60
  ) {
    return `${seconds} s`;
  }

  const minutes =
    Math.floor(
      seconds /
      60,
    );

  const remainingSeconds =
    seconds %
    60;

  return `${minutes} min ${remainingSeconds} s`;
}

function formatNumber(
  value:
    number,
): string {
  return new Intl
    .NumberFormat(
      "pt-BR",
    )
    .format(
      value,
    );
}
