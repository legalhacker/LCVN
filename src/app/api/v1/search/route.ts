import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildSourceUrl } from "@/lib/legal-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q");
  const type = searchParams.get("type"); // article, clause, point

  if (!q || q.trim().length < 2) {
    return NextResponse.json(
      { error: "Query parameter 'q' must be at least 2 characters" },
      { status: 400 },
    );
  }

  const results: Array<{
    canonical_id: string;
    entity_type: string;
    title: string;
    content: string;
    canonical_url: string;
    document_title: string;
  }> = [];

  if (!type || type === "article") {
    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { document: true },
      take: 20,
    });

    for (const a of articles) {
      results.push({
        canonical_id: a.canonicalId,
        entity_type: "article",
        title: a.title
          ? `Điều ${a.articleNumber}. ${a.title}`
          : `Điều ${a.articleNumber}`,
        content: a.content.substring(0, 200),
        canonical_url: buildSourceUrl({
          docSlug: a.document.slug,
          year: a.document.year,
          articleNumber: a.articleNumber,
        }),
        document_title: a.document.title,
      });
    }
  }

  if (!type || type === "clause") {
    const clauses = await prisma.clause.findMany({
      where: {
        content: { contains: q, mode: "insensitive" },
      },
      include: { article: { include: { document: true } } },
      take: 20,
    });

    for (const c of clauses) {
      results.push({
        canonical_id: c.canonicalId,
        entity_type: "clause",
        title: `Khoản ${c.clauseNumber}, Điều ${c.article.articleNumber}`,
        content: c.content.substring(0, 200),
        canonical_url: buildSourceUrl({
          docSlug: c.article.document.slug,
          year: c.article.document.year,
          articleNumber: c.article.articleNumber,
          clauseNumber: c.clauseNumber,
        }),
        document_title: c.article.document.title,
      });
    }
  }

  if (!type || type === "point") {
    const points = await prisma.point.findMany({
      where: {
        content: { contains: q, mode: "insensitive" },
      },
      include: {
        clause: { include: { article: { include: { document: true } } } },
      },
      take: 20,
    });

    for (const p of points) {
      results.push({
        canonical_id: p.canonicalId,
        entity_type: "point",
        title: `Điểm ${p.pointLetter}, Khoản ${p.clause.clauseNumber}, Điều ${p.clause.article.articleNumber}`,
        content: p.content.substring(0, 200),
        canonical_url: buildSourceUrl({
          docSlug: p.clause.article.document.slug,
          year: p.clause.article.document.year,
          articleNumber: p.clause.article.articleNumber,
          clauseNumber: p.clause.clauseNumber,
          pointLetter: p.pointLetter,
        }),
        document_title: p.clause.article.document.title,
      });
    }
  }

  return NextResponse.json({
    query: q,
    total: results.length,
    results,
  });
}
