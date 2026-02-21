-- AlterTable
ALTER TABLE "regulatory_changes" ADD COLUMN     "legal_document_id" UUID;

-- CreateTable
CREATE TABLE "legal_documents" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "file_type" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "legal_documents_slug_key" ON "legal_documents"("slug");

-- AddForeignKey
ALTER TABLE "regulatory_changes" ADD CONSTRAINT "regulatory_changes_legal_document_id_fkey" FOREIGN KEY ("legal_document_id") REFERENCES "legal_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
