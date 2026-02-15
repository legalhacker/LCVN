-- CreateEnum
CREATE TYPE "HeadlineStatus" AS ENUM ('draft', 'scheduled', 'active', 'archived');

-- CreateTable
CREATE TABLE "homepage_headlines" (
    "id" UUID NOT NULL,
    "regulatory_change_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "status" "HeadlineStatus" NOT NULL DEFAULT 'draft',
    "publish_at" TIMESTAMP(3),
    "archive_at" TIMESTAMP(3),
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_headlines_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "homepage_headlines" ADD CONSTRAINT "homepage_headlines_regulatory_change_id_fkey" FOREIGN KEY ("regulatory_change_id") REFERENCES "regulatory_changes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_headlines" ADD CONSTRAINT "homepage_headlines_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
