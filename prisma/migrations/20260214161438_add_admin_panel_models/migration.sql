-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'editor');

-- CreateEnum
CREATE TYPE "ChangeType" AS ENUM ('amendment', 'addition', 'first_codification');

-- CreateEnum
CREATE TYPE "ChangeStatus" AS ENUM ('draft', 'published');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" VARCHAR(255),
    "role" "UserRole" NOT NULL DEFAULT 'editor',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fields" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regulatory_changes" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "law_name" TEXT NOT NULL,
    "change_type" "ChangeType" NOT NULL,
    "legal_basis" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "effective_date" DATE NOT NULL,
    "headline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "practical_impact" TEXT[],
    "affected_parties" TEXT[],
    "analysis_summary" TEXT,
    "comparison_before" TEXT,
    "comparison_after" TEXT,
    "timeline" TEXT,
    "context" TEXT,
    "status" "ChangeStatus" NOT NULL DEFAULT 'draft',
    "legal_document_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regulatory_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regulatory_change_fields" (
    "regulatory_change_id" UUID NOT NULL,
    "field_id" UUID NOT NULL,

    CONSTRAINT "regulatory_change_fields_pkey" PRIMARY KEY ("regulatory_change_id","field_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "fields_slug_key" ON "fields"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "regulatory_changes_slug_key" ON "regulatory_changes"("slug");

-- AddForeignKey
ALTER TABLE "regulatory_changes" ADD CONSTRAINT "regulatory_changes_legal_document_id_fkey" FOREIGN KEY ("legal_document_id") REFERENCES "legal_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_change_fields" ADD CONSTRAINT "regulatory_change_fields_regulatory_change_id_fkey" FOREIGN KEY ("regulatory_change_id") REFERENCES "regulatory_changes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_change_fields" ADD CONSTRAINT "regulatory_change_fields_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;
