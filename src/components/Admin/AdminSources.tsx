"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";

import type { AdminNewsSourceInput, AdminNewsSourceItem } from "@/domain/admin/admin.types";

type CountryOption = {
  code: string;
  name: string;
};

type SourcesPayload = {
  ok: boolean;
  data?: AdminNewsSourceItem[];
  countries?: CountryOption[];
  message?: string;
};

type FormState = {
  id: string;
  countryCode: string;
  name: string;
  websiteUrl: string;
  feedUrl: string;
  feedCategory: "" | "football" | "politics" | "economy";
  enabled: boolean;
};

const EMPTY_FORM: FormState = {
  id: "",
  countryCode: "",
  name: "",
  websiteUrl: "",
  feedUrl: "",
  feedCategory: "",
  enabled: true,
};

const categoryLabels: Record<string, string> = {
  football: "Futebol",
  politics: "Política",
  economy: "Economia",
};

export function AdminSources() {
  const [sources, setSources] = useState<AdminNewsSourceItem[] | null>(null);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [textFilter, setTextFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/sources", {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      const payload = (await response.json()) as SourcesPayload;

      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.message ?? "Não foi possível carregar as fontes.");
      }

      setSources(payload.data);
      setCountries(payload.countries ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Não foi possível carregar as fontes.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  const filteredSources = useMemo(() => {
    if (!sources) return [];

    const normalizedText = textFilter.trim().toLowerCase();

    return sources.filter((source) => {
      if (countryFilter !== "all" && source.countryCode !== countryFilter) {
        return false;
      }

      if (!normalizedText) return true;

      return (
        source.name.toLowerCase().includes(normalizedText) ||
        source.id.toLowerCase().includes(normalizedText) ||
        source.websiteUrl.toLowerCase().includes(normalizedText)
      );
    });
  }, [sources, countryFilter, textFilter]);

  function openCreateForm() {
    setFormMode("create");
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(source: AdminNewsSourceItem) {
    setFormMode("edit");
    setForm({
      id: source.id,
      countryCode: source.countryCode,
      name: source.name,
      websiteUrl: source.websiteUrl,
      feedUrl: source.feedUrl ?? "",
      feedCategory: source.feedCategory ?? "",
      enabled: source.enabled,
    });
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      if (formMode === "create") {
        const input: AdminNewsSourceInput = {
          id: form.id.trim(),
          countryCode: form.countryCode,
          name: form.name.trim(),
          websiteUrl: form.websiteUrl.trim(),
          feedUrl: form.feedUrl.trim() || null,
          feedCategory: form.feedCategory || null,
          enabled: form.enabled,
        };

        const response = await fetch("/api/admin/sources", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(input),
        });

        const payload = (await response.json()) as { ok: boolean; message?: string };

        if (!response.ok || !payload.ok) {
          throw new Error(payload.message ?? "Não foi possível criar a fonte.");
        }
      } else {
        const response = await fetch(`/api/admin/sources/${encodeURIComponent(form.id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            websiteUrl: form.websiteUrl.trim(),
            feedUrl: form.feedUrl.trim() || null,
            feedCategory: form.feedCategory || null,
            enabled: form.enabled,
          }),
        });

        const payload = (await response.json()) as { ok: boolean; message?: string };

        if (!response.ok || !payload.ok) {
          throw new Error(payload.message ?? "Não foi possível salvar a fonte.");
        }
      }

      setFormOpen(false);
      await load();
    } catch (submitError) {
      setFormError(
        submitError instanceof Error ? submitError.message : "Não foi possível salvar a fonte.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleEnabled(source: AdminNewsSourceItem) {
    setPendingId(source.id);

    try {
      const response = await fetch(`/api/admin/sources/${encodeURIComponent(source.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ enabled: !source.enabled }),
      });

      const payload = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Não foi possível atualizar a fonte.");
      }

      await load();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error ? toggleError.message : "Não foi possível atualizar a fonte.",
      );
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(source: AdminNewsSourceItem) {
    if (
      !window.confirm(
        `Remover "${source.name}" (${source.countryName}) do catálogo? Essa ação não pode ser desfeita.`,
      )
    ) {
      return;
    }

    setPendingId(source.id);

    try {
      const response = await fetch(`/api/admin/sources/${encodeURIComponent(source.id)}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Não foi possível remover a fonte.");
      }

      await load();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Não foi possível remover a fonte.",
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[96rem]">
      <header className="flex flex-col gap-4 rounded-card border border-border bg-card p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Fontes de notícias
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Adicione, edite ou desative veículos por país. Ao salvar uma URL de feed nova, o
            servidor busca a URL e confirma que é um RSS/Atom válido antes de gravar.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-button border border-border bg-background px-4 text-sm font-semibold text-foreground outline-none transition-opacity hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-45"
          >
            <RefreshCw aria-hidden="true" size={17} className={loading ? "animate-spin" : ""} />
            Atualizar
          </button>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-button border border-primary bg-primary px-4 text-sm font-semibold text-white outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus aria-hidden="true" size={17} />
            Adicionar fonte
          </button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-card border border-red-200 bg-red-50 p-4 text-red-900"
        >
          <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0" size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={countryFilter}
          onChange={(event) => setCountryFilter(event.target.value)}
          className="min-h-11 rounded-control border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">Todos os países ({sources?.length ?? 0})</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>

        <input
          type="search"
          value={textFilter}
          onChange={(event) => setTextFilter(event.target.value)}
          placeholder="Buscar por nome, id ou site..."
          className="min-h-11 flex-1 rounded-control border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-card border border-border bg-card shadow-sm">
        {loading && !sources ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando fontes…</div>
        ) : filteredSources.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nenhuma fonte corresponde ao filtro selecionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[64rem] border-collapse text-left text-sm">
              <thead className="bg-surface-strong text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">País</th>
                  <th className="px-5 py-3">Fonte</th>
                  <th className="px-5 py-3">Feed</th>
                  <th className="px-5 py-3">Categoria fixa</th>
                  <th className="px-5 py-3">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredSources.map((source) => (
                  <tr key={source.id} className="border-t border-border align-top">
                    <td className="px-5 py-4">
                      {source.enabled ? (
                        source.feedUrl ? (
                          <span className="inline-flex items-center gap-1.5 rounded-pill border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                            <CheckCircle2 aria-hidden="true" size={14} />
                            Ativa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-pill border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
                            <AlertTriangle aria-hidden="true" size={14} />
                            Sem feed
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface-strong px-2.5 py-1 text-xs font-bold text-muted-foreground">
                          <XCircle aria-hidden="true" size={14} />
                          Desativada
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold">{source.countryName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{source.countryCode}</p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold">{source.name}</p>
                      <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
                        {source.id}
                      </p>
                      <a
                        href={source.websiteUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="mt-1 block max-w-xs truncate text-xs text-primary hover:underline"
                      >
                        {source.websiteUrl}
                      </a>
                    </td>

                    <td className="px-5 py-4">
                      {source.feedUrl ? (
                        <a
                          href={source.feedUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="block max-w-xs truncate text-xs text-primary hover:underline"
                        >
                          {source.feedUrl}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">não configurado</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs">
                      {source.feedCategory ? categoryLabels[source.feedCategory] : "automática"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(source)}
                          disabled={pendingId === source.id}
                          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-button border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none transition-colors hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-45"
                        >
                          <Pencil aria-hidden="true" size={14} />
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleToggleEnabled(source)}
                          disabled={pendingId === source.id}
                          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-button border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none transition-colors hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-45"
                        >
                          {pendingId === source.id ? (
                            <Loader2 aria-hidden="true" size={14} className="animate-spin" />
                          ) : source.enabled ? (
                            "Desativar"
                          ) : (
                            "Ativar"
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(source)}
                          disabled={pendingId === source.id}
                          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-button border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-800 outline-none transition-colors hover:border-red-400 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-45"
                        >
                          <Trash2 aria-hidden="true" size={14} />
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-lg rounded-card border border-border bg-card p-6 shadow-xl">
            <h2 className="text-xl font-black text-foreground">
              {formMode === "create" ? "Adicionar fonte" : "Editar fonte"}
            </h2>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {formMode === "create" && (
                <>
                  <label className="block">
                    <span className="text-sm font-semibold text-foreground">
                      Identificador (id)
                    </span>
                    <input
                      required
                      value={form.id}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, id: event.target.value }))
                      }
                      placeholder="ex: pt-publico"
                      pattern="[a-z0-9-]+"
                      className="mt-1.5 min-h-11 w-full rounded-control border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Só letras minúsculas, números e hífen. Não pode ser alterado depois.
                    </span>
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-foreground">País</span>
                    <select
                      required
                      value={form.countryCode}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, countryCode: event.target.value }))
                      }
                      className="mt-1.5 min-h-11 w-full rounded-control border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="" disabled>
                        Selecione um país
                      </option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}

              <label className="block">
                <span className="text-sm font-semibold text-foreground">Nome do veículo</span>
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className="mt-1.5 min-h-11 w-full rounded-control border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-foreground">Site</span>
                <input
                  required
                  type="url"
                  value={form.websiteUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, websiteUrl: event.target.value }))
                  }
                  placeholder="https://..."
                  className="mt-1.5 min-h-11 w-full rounded-control border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-foreground">URL do feed RSS</span>
                <input
                  type="url"
                  value={form.feedUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, feedUrl: event.target.value }))
                  }
                  placeholder="https://.../feed"
                  className="mt-1.5 min-h-11 w-full rounded-control border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <span className="mt-1 block text-xs text-muted-foreground">
                  Deixe em branco para manter a fonte sem coleta por enquanto. Se preencher, será
                  testada antes de salvar.
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-foreground">
                  Categoria fixa (opcional)
                </span>
                <select
                  value={form.feedCategory}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      feedCategory: event.target.value as FormState["feedCategory"],
                    }))
                  }
                  className="mt-1.5 min-h-11 w-full rounded-control border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Classificar automaticamente</option>
                  <option value="football">Futebol</option>
                  <option value="politics">Política</option>
                  <option value="economy">Economia</option>
                </select>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Use quando o feed já é de uma seção específica (ex: só esportes).
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, enabled: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm font-semibold text-foreground">Fonte ativa</span>
              </label>

              {formError && (
                <div
                  role="alert"
                  className="rounded-card-small border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                >
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  disabled={submitting}
                  className="inline-flex min-h-11 items-center justify-center rounded-button border border-border bg-background px-4 text-sm font-semibold text-foreground outline-none hover:border-primary hover:text-primary disabled:opacity-45"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-button bg-primary px-4 text-sm font-semibold text-white outline-none transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting && (
                    <Loader2 aria-hidden="true" size={16} className="animate-spin" />
                  )}
                  {submitting
                    ? "Validando feed..."
                    : formMode === "create"
                      ? "Adicionar"
                      : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
