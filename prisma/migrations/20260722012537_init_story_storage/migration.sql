-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('football', 'politics', 'economy');

-- CreateTable
CREATE TABLE "stories" (
    "id" VARCHAR(64) NOT NULL,
    "headline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "category" "NewsCategory" NOT NULL,
    "country_code" CHAR(2) NOT NULL,
    "image_url" TEXT,
    "published_at" TIMESTAMPTZ(3),
    "last_seen_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" VARCHAR(128) NOT NULL,
    "story_id" VARCHAR(64) NOT NULL,
    "source_id" VARCHAR(128) NOT NULL,
    "source_name" VARCHAR(255) NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "image_url" TEXT,
    "category" "NewsCategory" NOT NULL,
    "country_code" CHAR(2) NOT NULL,
    "language" VARCHAR(16) NOT NULL,
    "published_at" TIMESTAMPTZ(3),
    "last_seen_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stories_published_at_idx" ON "stories"("published_at");

-- CreateIndex
CREATE INDEX "stories_category_published_at_idx" ON "stories"("category", "published_at");

-- CreateIndex
CREATE INDEX "stories_country_code_published_at_idx" ON "stories"("country_code", "published_at");

-- CreateIndex
CREATE INDEX "stories_last_seen_at_idx" ON "stories"("last_seen_at");

-- CreateIndex
CREATE INDEX "articles_story_id_idx" ON "articles"("story_id");

-- CreateIndex
CREATE INDEX "articles_source_id_idx" ON "articles"("source_id");

-- CreateIndex
CREATE INDEX "articles_published_at_idx" ON "articles"("published_at");

-- CreateIndex
CREATE INDEX "articles_category_published_at_idx" ON "articles"("category", "published_at");

-- CreateIndex
CREATE INDEX "articles_country_code_published_at_idx" ON "articles"("country_code", "published_at");

-- CreateIndex
CREATE INDEX "articles_last_seen_at_idx" ON "articles"("last_seen_at");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
