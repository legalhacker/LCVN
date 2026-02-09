-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('luat', 'nghi_dinh', 'thong_tu', 'quyet_dinh');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('active', 'amended', 'repealed');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('document', 'article', 'clause', 'point');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('amended_by', 'replaces', 'related_to', 'references', 'implements');

-- CreateTable
CREATE TABLE "legal_documents" (
    "id" UUID NOT NULL,
    "canonical_id" VARCHAR(100) NOT NULL,
    "title" TEXT NOT NULL,
    "document_number" VARCHAR(50) NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "issuing_body" TEXT NOT NULL,
    "issued_date" DATE NOT NULL,
    "effective_date" DATE NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" UUID NOT NULL,
    "canonical_id" VARCHAR(100) NOT NULL,
    "document_id" UUID NOT NULL,
    "article_number" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "chapter" VARCHAR(100),
    "section" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clauses" (
    "id" UUID NOT NULL,
    "canonical_id" VARCHAR(100) NOT NULL,
    "article_id" UUID NOT NULL,
    "clause_number" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clauses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points" (
    "id" UUID NOT NULL,
    "canonical_id" VARCHAR(100) NOT NULL,
    "clause_id" UUID NOT NULL,
    "point_letter" CHAR(1) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_relationships" (
    "id" UUID NOT NULL,
    "source_type" "EntityType" NOT NULL,
    "source_canonical_id" VARCHAR(100) NOT NULL,
    "target_type" "EntityType" NOT NULL,
    "target_canonical_id" VARCHAR(100) NOT NULL,
    "relationship_type" "RelationshipType" NOT NULL,
    "description" TEXT,
    "effective_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legal_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_metadata" (
    "id" UUID NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_canonical_id" VARCHAR(100) NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legal_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "legal_documents_canonical_id_key" ON "legal_documents"("canonical_id");

-- CreateIndex
CREATE UNIQUE INDEX "legal_documents_slug_key" ON "legal_documents"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "articles_canonical_id_key" ON "articles"("canonical_id");

-- CreateIndex
CREATE INDEX "articles_document_id_idx" ON "articles"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "articles_document_id_article_number_key" ON "articles"("document_id", "article_number");

-- CreateIndex
CREATE UNIQUE INDEX "clauses_canonical_id_key" ON "clauses"("canonical_id");

-- CreateIndex
CREATE INDEX "clauses_article_id_idx" ON "clauses"("article_id");

-- CreateIndex
CREATE UNIQUE INDEX "clauses_article_id_clause_number_key" ON "clauses"("article_id", "clause_number");

-- CreateIndex
CREATE UNIQUE INDEX "points_canonical_id_key" ON "points"("canonical_id");

-- CreateIndex
CREATE INDEX "points_clause_id_idx" ON "points"("clause_id");

-- CreateIndex
CREATE UNIQUE INDEX "points_clause_id_point_letter_key" ON "points"("clause_id", "point_letter");

-- CreateIndex
CREATE INDEX "legal_relationships_source_canonical_id_target_canonical_id_idx" ON "legal_relationships"("source_canonical_id", "target_canonical_id");

-- CreateIndex
CREATE INDEX "legal_relationships_target_canonical_id_idx" ON "legal_relationships"("target_canonical_id");

-- CreateIndex
CREATE INDEX "legal_metadata_entity_canonical_id_idx" ON "legal_metadata"("entity_canonical_id");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "legal_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clauses" ADD CONSTRAINT "clauses_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points" ADD CONSTRAINT "points_clause_id_fkey" FOREIGN KEY ("clause_id") REFERENCES "clauses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
