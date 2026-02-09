import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildArticleJsonLd } from "@/lib/jsonld";
import { buildSourceUrl } from "@/lib/legal-utils";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id: canonicalId } = await context.params;

  const article = await prisma.article.findUnique({
    where: { canonicalId },
    include: {
      document: true,
      clauses: {
        include: { points: { orderBy: { pointLetter: "asc" } } },
        orderBy: { clauseNumber: "asc" },
      },
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const doc = article.document;
  const docMeta = {
    canonicalId: doc.canonicalId,
    title: doc.title,
    documentNumber: doc.documentNumber,
    documentType: doc.documentType,
    issuingBody: doc.issuingBody,
    issuedDate: doc.issuedDate.toISOString().split("T")[0],
    effectiveDate: doc.effectiveDate.toISOString().split("T")[0],
    slug: doc.slug,
    year: doc.year,
    status: doc.status,
  };

  const articleData = {
    id: article.id,
    canonicalId: article.canonicalId,
    articleNumber: article.articleNumber,
    title: article.title,
    content: article.content,
    chapter: article.chapter,
    section: article.section,
    document: docMeta,
    clauses: article.clauses.map((c) => ({
      id: c.id,
      canonicalId: c.canonicalId,
      clauseNumber: c.clauseNumber,
      content: c.content,
      points: c.points.map((p) => ({
        id: p.id,
        canonicalId: p.canonicalId,
        pointLetter: p.pointLetter,
        content: p.content,
      })),
    })),
  };

  const [metadata, relationships] = await Promise.all([
    prisma.legalMetadata.findMany({
      where: { entityCanonicalId: canonicalId },
    }),
    prisma.legalRelationship.findMany({
      where: {
        OR: [
          { sourceCanonicalId: canonicalId },
          { targetCanonicalId: canonicalId },
        ],
      },
    }),
  ]);

  const sourceUrl = buildSourceUrl({
    docSlug: doc.slug,
    year: doc.year,
    articleNumber: article.articleNumber,
  });

  return NextResponse.json({
    data: articleData,
    canonical_id: article.canonicalId,
    canonical_url: sourceUrl,
    metadata: metadata.map((m) => ({ key: m.key, value: m.value })),
    relationships,
    json_ld: buildArticleJsonLd(articleData),
  });
}
