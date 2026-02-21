-- DropForeignKey
ALTER TABLE "regulatory_changes" DROP CONSTRAINT IF EXISTS "regulatory_changes_legal_document_id_fkey";

-- AlterTable
ALTER TABLE "regulatory_changes" DROP COLUMN IF EXISTS "legal_document_id";

-- DropTable
DROP TABLE IF EXISTS "points";

-- DropTable
DROP TABLE IF EXISTS "clauses";

-- DropTable
DROP TABLE IF EXISTS "articles";

-- DropTable
DROP TABLE IF EXISTS "legal_metadata";

-- DropTable
DROP TABLE IF EXISTS "legal_relationships";

-- DropTable
DROP TABLE IF EXISTS "legal_documents";

-- DropEnum
DROP TYPE IF EXISTS "DocumentType";

-- DropEnum
DROP TYPE IF EXISTS "DocumentStatus";

-- DropEnum
DROP TYPE IF EXISTS "EntityType";

-- DropEnum
DROP TYPE IF EXISTS "RelationshipType";
