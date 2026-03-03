-- CreateEnum
CREATE TYPE "ArticleRelationType" AS ENUM ('AMENDS', 'SUPPLEMENTS', 'IMPLEMENTS', 'REPLACES', 'REFERENCES');

-- CreateTable
CREATE TABLE "ArticleRelation" (
    "id" TEXT NOT NULL,
    "fromArticleId" TEXT NOT NULL,
    "toArticleId" TEXT NOT NULL,
    "relationType" "ArticleRelationType" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArticleRelation_fromArticleId_toArticleId_relationType_key" ON "ArticleRelation"("fromArticleId", "toArticleId", "relationType");

-- CreateIndex
CREATE INDEX "ArticleRelation_fromArticleId_idx" ON "ArticleRelation"("fromArticleId");

-- CreateIndex
CREATE INDEX "ArticleRelation_toArticleId_idx" ON "ArticleRelation"("toArticleId");

-- AddForeignKey
ALTER TABLE "ArticleRelation" ADD CONSTRAINT "ArticleRelation_fromArticleId_fkey" FOREIGN KEY ("fromArticleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleRelation" ADD CONSTRAINT "ArticleRelation_toArticleId_fkey" FOREIGN KEY ("toArticleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
