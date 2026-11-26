-- Extensions
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Normalização única usada na escrita (search_text) e na consulta (termo
-- buscado): minúsculas, sem acento, só [a-z0-9] separados por espaço.
-- unaccent com dicionário explícito é estável, por isso pode ser IMMUTABLE.
CREATE OR REPLACE FUNCTION story_search_normalize(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
STRICT
AS $$
  SELECT btrim(
    regexp_replace(
      lower(public.unaccent('public.unaccent'::regdictionary, value)),
      '[^a-z0-9]+',
      ' ',
      'g'
    )
  );
$$;

-- Texto pesquisável de uma story: manchete e resumo originais, tradução PT,
-- rótulo da categoria e título/trecho/veículo de cada matéria.
CREATE OR REPLACE FUNCTION story_search_document(target_story_id varchar)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT story_search_normalize(
    concat_ws(
      ' ',
      s.headline,
      s.summary,
      CASE s.category
        WHEN 'politics' THEN 'politica politics'
        WHEN 'economy' THEN 'economia economy'
        ELSE s.category::text
      END,
      (
        SELECT concat_ws(' ', t.headline, t.summary)
        FROM story_translations t
        WHERE t.story_id = s.id
          AND t.language = 'pt'
      ),
      (
        SELECT string_agg(concat_ws(' ', a.title, a.excerpt, a.source_name), ' ')
        FROM articles a
        WHERE a.story_id = s.id
      )
    )
  )
  FROM stories s
  WHERE s.id = target_story_id;
$$;

-- AlterTable
ALTER TABLE "stories" ADD COLUMN "search_text" TEXT NOT NULL DEFAULT '';

-- Backfill
UPDATE "stories" SET "search_text" = COALESCE(story_search_document("id"), '');

-- CreateIndex
CREATE INDEX "stories_search_text_trgm_idx" ON "stories" USING GIN ("search_text" gin_trgm_ops);
