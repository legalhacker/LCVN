import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/admin-auth";
import { CrawlReviewStatus, CrawledDocumentType } from "@prisma/client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const item = await prisma.crawledItem.findUnique({ where: { id } });

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const existing = await prisma.crawledItem.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const updateData: Record<string, unknown> = {};

  if (body.title !== undefined) updateData.title = body.title;
  if (body.summary !== undefined) updateData.summary = body.summary;
  if (body.sourceUrl !== undefined) updateData.sourceUrl = body.sourceUrl;
  if (body.sourceName !== undefined) updateData.sourceName = body.sourceName;
  if (body.editedTitle !== undefined) updateData.editedTitle = body.editedTitle;
  if (body.editedSummary !== undefined) updateData.editedSummary = body.editedSummary;
  if (body.adminNotes !== undefined) updateData.adminNotes = body.adminNotes;
  if (body.isDraft !== undefined) updateData.isDraft = body.isDraft;
  if (body.legalFields !== undefined) updateData.legalFields = body.legalFields;
  if (body.affectedSubjects !== undefined) updateData.affectedSubjects = body.affectedSubjects;
  if (body.draftingAuthority !== undefined) updateData.draftingAuthority = body.draftingAuthority;
  if (body.expectedApprovalTime !== undefined) updateData.expectedApprovalTime = body.expectedApprovalTime;

  if (body.publishDate !== undefined) {
    updateData.publishDate = body.publishDate ? new Date(body.publishDate) : null;
  }
  if (body.consultationStartDate !== undefined) {
    updateData.consultationStartDate = body.consultationStartDate ? new Date(body.consultationStartDate) : null;
  }
  if (body.consultationEndDate !== undefined) {
    updateData.consultationEndDate = body.consultationEndDate ? new Date(body.consultationEndDate) : null;
  }

  if (body.documentType !== undefined) {
    const validTypes = Object.values(CrawledDocumentType);
    if (validTypes.includes(body.documentType)) {
      updateData.documentType = body.documentType;
    }
  }

  if (body.reviewStatus !== undefined) {
    const validStatuses = Object.values(CrawlReviewStatus);
    if (validStatuses.includes(body.reviewStatus)) {
      updateData.reviewStatus = body.reviewStatus;
      // Auto-set reviewedAt when status changes from pending
      if (body.reviewStatus !== "pending" && existing.reviewStatus === "pending") {
        updateData.reviewedAt = new Date();
      }
    }
  }

  const item = await prisma.crawledItem.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(item);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status } = await requireAuth("admin");
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  await prisma.crawledItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
