export type AdminSystemStatus =
  | "healthy"
  | "warning"
  | "critical";

export type AdminSyncRunStatus =
  | "running"
  | "success"
  | "failed";

export type AdminSyncRunTrigger =
  | "scheduled"
  | "admin"
  | "manual";

/**
 * `empty`: tem feed RSS cadastrado, mas nenhum
 * artigo dela está no banco (que guarda só o
 * período de retenção) — feed quebrado, bloqueio
 * ou classificação descartando tudo.
 * `no_feed`: cadastrada sem RSS — só entra pela
 * extração por IA.
 */
export type AdminSourceStatus =
  | "active"
  | "quiet"
  | "stale"
  | "empty"
  | "no_feed";

export type AdminSyncRunItem = {
  id:
    string;

  trigger:
    AdminSyncRunTrigger;

  status:
    AdminSyncRunStatus;

  requestId:
    string | null;

  startedAtISO:
    string;

  finishedAtISO:
    string | null;

  durationMs:
    number | null;

  countriesProcessed:
    number;

  storiesCollected:
    number;

  articlesCollected:
    number;

  storiesSaved:
    number;

  articlesSaved:
    number;

  retentionDays:
    number;

  storiesDeleted:
    number;

  errorMessage:
    string | null;
};

export type AdminSourceHealthItem = {
  sourceId:
    string;

  sourceName:
    string;

  countryCode:
    string;

  countryName:
    string;

  articles:
    number;

  newestPublishedAtISO:
    string | null;

  latestSeenAtISO:
    string | null;

  status:
    AdminSourceStatus;
};

export type AdminCategoryMetric = {
  category:
    "politics" |
    "economy";

  label:
    string;

  stories:
    number;
};

export type AdminCountryMetric = {
  countryCode:
    string;

  countryName:
    string;

  stories:
    number;
};

export type AdminNewsSourceItem = {
  id:
    string;

  countryCode:
    string;

  countryName:
    string;

  name:
    string;

  websiteUrl:
    string;

  feedUrl:
    string | null;

  feedCategory:
    "politics" |
    "economy" |
    null;

  enabled:
    boolean;

  updatedAtISO:
    string;
};

export type AdminNewsSourceInput = {
  id:
    string;

  countryCode:
    string;

  name:
    string;

  websiteUrl:
    string;

  feedUrl:
    string | null;

  feedCategory:
    "politics" |
    "economy" |
    null;

  enabled:
    boolean;
};

export type AdminDashboardData = {
  generatedAtISO:
    string;

  systemStatus:
    AdminSystemStatus;

  storage: {
    stories:
      number;

    articles:
      number;

    newestPublishedAtISO:
      string | null;

    oldestPublishedAtISO:
      string | null;

    latestSeenAtISO:
      string | null;
  };

  syncSummary: {
    latestRunAtISO:
      string | null;

    latestSuccessAtISO:
      string | null;

    runsLast24Hours:
      number;

    successfulRunsLast24Hours:
      number;

    failedRunsLast24Hours:
      number;

    successRateLast24Hours:
      number;

    averageDurationMs:
      number | null;
  };

  sourceSummary:
    Record<
      AdminSourceStatus,
      number
    >;

  recentRuns:
    AdminSyncRunItem[];

  sourceHealth:
    AdminSourceHealthItem[];

  categories:
    AdminCategoryMetric[];

  countries:
    AdminCountryMetric[];
};
