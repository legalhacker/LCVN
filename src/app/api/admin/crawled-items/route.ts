import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/admin-auth";
import { CrawlReviewStatus, CrawledDocumentType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const searchParams = req.nextUrl.searchParams;
  const countOnly = searchParams.get("countOnly");

  if (countOnly === "true") {
    const pendingCount = await prisma.crawledItem.count({
      where: { reviewStatus: "pending" },
    });
    return NextResponse.json({ pendingCount });
  }

  const statusFilter = searchParams.get("status");
  const sourceFilter = searchParams.get("source");

  const where: Record<string, unknown> = {};
  if (statusFilter && Object.values(CrawlReviewStatus).includes(statusFilter as CrawlReviewStatus)) {
    where.reviewStatus = statusFilter;
  }
  if (sourceFilter) {
    where.sourceName = sourceFilter;
  }

  const items = await prisma.crawledItem.findMany({
    where,
    orderBy: { crawledAt: "desc" },
    select: {
      id: true,
      title: true,
      summary: true,
      sourceUrl: true,
      sourceName: true,
      publishDate: true,
      documentType: true,
      isDraft: true,
      legalFields: true,
      reviewStatus: true,
      editedTitle: true,
      crawledAt: true,
      reviewedAt: true,
    },
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const body = await req.json();
  const { title, summary, sourceUrl, sourceName, documentType, isDraft } = body;

  if (!title || !sourceUrl || !sourceName) {
    return NextResponse.json(
      { error: "title, sourceUrl, and sourceName are required" },
      { status: 400 }
    );
  }

  const validTypes = Object.values(CrawledDocumentType);
  const docType = validTypes.includes(documentType) ? documentType : "law";

  const item = await prisma.crawledItem.create({
    data: {
      title,
      summary: summary || null,
      sourceUrl,
      sourceName,
      documentType: docType,
      isDraft: isDraft ?? false,
      legalFields: body.legalFields || [],
      affectedSubjects: body.affectedSubjects || [],
      publishDate: body.publishDate ? new Date(body.publishDate) : null,
      consultationStartDate: body.consultationStartDate ? new Date(body.consultationStartDate) : null,
      consultationEndDate: body.consultationEndDate ? new Date(body.consultationEndDate) : null,
      draftingAuthority: body.draftingAuthority || null,
      expectedApprovalTime: body.expectedApprovalTime || null,
      adminNotes: body.adminNotes || null,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
