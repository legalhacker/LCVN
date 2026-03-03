-- ============================================================================
-- Phase 1: Replace ArticleRelationType enum with standardized LCG values
--          and add createdBy field to ArticleRelation
-- ============================================================================

-- Drop the table first (it is new and empty — no data loss)
DROP TABLE IF EXISTS "ArticleRelation";

-- Drop the old enum
DROP TYPE IF EXISTS "ArticleRelationType";

-- Create new standardized enum
CREATE TYPE "ArticleRelationType" AS ENUM (
  'guides',
  'amends',
  'repeals',
  'replaces',
  'references',
  'implements',
  'conflicts_with',
  'interpreted_by'
);

-- Recreate ArticleRelation with createdBy field
CREATE TABLE "ArticleRelation" (
    "id"            TEXT NOT NULL,
    "fromArticleId" TEXT NOT NULL,
    "toArticleId"   TEXT NOT NULL,
    "relationType"  "ArticleRelationType" NOT NULL,
    "note"          TEXT,
    "created_by"    TEXT,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleRelation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ArticleRelation_fromArticleId_toArticleId_relationType_key"
    ON "ArticleRelation"("fromArticleId", "toArticleId", "relationType");

CREATE INDEX "ArticleRelation_fromArticleId_idx" ON "ArticleRelation"("fromArticleId");
CREATE INDEX "ArticleRelation_toArticleId_idx"   ON "ArticleRelation"("toArticleId");

ALTER TABLE "ArticleRelation"
    ADD CONSTRAINT "ArticleRelation_fromArticleId_fkey"
    FOREIGN KEY ("fromArticleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ArticleRelation"
    ADD CONSTRAINT "ArticleRelation_toArticleId_fkey"
    FOREIGN KEY ("toArticleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- Phase 2: ArticleAnnotation model
-- ============================================================================

CREATE TYPE "ArticleAnnotationType" AS ENUM (
  'practice_note',
  'case_summary',
  'interpretation',
  'warning',
  'update_note'
);

CREATE TYPE "ArticleAnnotationVisibility" AS ENUM ('public', 'internal');

CREATE TABLE "article_annotations" (
    "id"          TEXT NOT NULL,
    "node_id"     TEXT NOT NULL,
    "type"        "ArticleAnnotationType" NOT NULL,
    "title"       TEXT NOT NULL,
    "content"     TEXT NOT NULL,
    "tags"        TEXT[] NOT NULL DEFAULT '{}',
    "visibility"  "ArticleAnnotationVisibility" NOT NULL DEFAULT 'public',
    "created_by"  TEXT NOT NULL,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_annotations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "article_annotations_node_id_idx" ON "article_annotations"("node_id");
CREATE INDEX "article_annotations_type_idx"    ON "article_annotations"("type");
