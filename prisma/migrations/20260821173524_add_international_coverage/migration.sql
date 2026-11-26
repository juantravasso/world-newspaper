-- CreateTable
CREATE TABLE "story_embeddings" (
    "story_id" VARCHAR(64) NOT NULL,
    "embedding" DOUBLE PRECISION[],
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_embeddings_pkey" PRIMARY KEY ("story_id")
);

-- CreateTable
CREATE TABLE "story_international_links" (
    "id" VARCHAR(32) NOT NULL,
    "story_id" VARCHAR(64) NOT NULL,
    "related_story_id" VARCHAR(64) NOT NULL,
    "similarity" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_international_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_translations" (
    "story_id" VARCHAR(64) NOT NULL,
    "language" VARCHAR(8) NOT NULL,
    "headline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "source_updated_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_translations_pkey" PRIMARY KEY ("story_id","language")
);

-- CreateIndex
CREATE INDEX "story_international_links_story_id_idx" ON "story_international_links"("story_id");

-- CreateIndex
CREATE UNIQUE INDEX "story_international_links_story_id_related_story_id_key" ON "story_international_links"("story_id", "related_story_id");

-- AddForeignKey
ALTER TABLE "story_embeddings" ADD CONSTRAINT "story_embeddings_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_international_links" ADD CONSTRAINT "story_international_links_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_international_links" ADD CONSTRAINT "story_international_links_related_story_id_fkey" FOREIGN KEY ("related_story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_translations" ADD CONSTRAINT "story_translations_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
