-- CreateTable
CREATE TABLE "news_sources" (
    "id" VARCHAR(64) NOT NULL,
    "country_code" CHAR(2) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "website_url" TEXT NOT NULL,
    "feed_url" TEXT,
    "feed_category" "NewsCategory",
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "news_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "news_sources_country_code_idx" ON "news_sources"("country_code");
