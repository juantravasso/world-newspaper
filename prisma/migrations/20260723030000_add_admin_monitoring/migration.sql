-- CreateEnum
CREATE TYPE "SyncRunStatus" AS ENUM ('running', 'success', 'failed');

-- CreateEnum
CREATE TYPE "SyncRunTrigger" AS ENUM ('scheduled', 'admin', 'manual');

-- CreateTable
CREATE TABLE "sync_runs" (
    "id" VARCHAR(32) NOT NULL,
    "trigger" "SyncRunTrigger" NOT NULL,
    "status" "SyncRunStatus" NOT NULL DEFAULT 'running',
    "request_id" VARCHAR(64),
    "started_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ(3),
    "duration_ms" INTEGER,
    "countries_processed" INTEGER NOT NULL DEFAULT 0,
    "stories_collected" INTEGER NOT NULL DEFAULT 0,
    "articles_collected" INTEGER NOT NULL DEFAULT 0,
    "stories_saved" INTEGER NOT NULL DEFAULT 0,
    "articles_saved" INTEGER NOT NULL DEFAULT 0,
    "retention_days" INTEGER NOT NULL DEFAULT 0,
    "stories_deleted" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sync_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sync_runs_started_at_idx" ON "sync_runs"("started_at");

-- CreateIndex
CREATE INDEX "sync_runs_status_started_at_idx" ON "sync_runs"("status", "started_at");

-- CreateIndex
CREATE INDEX "sync_runs_trigger_started_at_idx" ON "sync_runs"("trigger", "started_at");
