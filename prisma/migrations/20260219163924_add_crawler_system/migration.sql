-- CreateEnum
CREATE TYPE "CrawledDocumentType" AS ENUM ('law', 'amendment', 'draft', 'policy_direction');

-- CreateEnum
CREATE TYPE "CrawlReviewStatus" AS ENUM ('pending', 'reviewed', 'published', 'rejected');

-- CreateTable
CREATE TABLE "crawled_items" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "source_url" TEXT NOT NULL,
    "source_name" VARCHAR(100) NOT NULL,
    "publish_date" TIMESTAMP(3),
    "document_type" "CrawledDocumentType" NOT NULL DEFAULT 'law',
    "is_draft" BOOLEAN NOT NULL DEFAULT false,
    "legal_fields" TEXT[],
    "affected_subjects" TEXT[],
    "consultation_start_date" TIMESTAMP(3),
    "consultation_end_date" TIMESTAMP(3),
    "drafting_authority" VARCHAR(255),
    "expected_approval_time" VARCHAR(255),
    "review_status" "CrawlReviewStatus" NOT NULL DEFAULT 'pending',
    "edited_title" TEXT,
    "edited_summary" TEXT,
    "admin_notes" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "raw_html" TEXT,
    "crawled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crawled_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "crawled_items_source_url_key" ON "crawled_items"("source_url");

-- CreateIndex
CREATE INDEX "crawled_items_review_status_idx" ON "crawled_items"("review_status");

-- CreateIndex
CREATE INDEX "crawled_items_source_name_idx" ON "crawled_items"("source_name");

-- CreateIndex
CREATE INDEX "crawled_items_crawled_at_idx" ON "crawled_items"("crawled_at");
