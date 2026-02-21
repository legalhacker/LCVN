import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const searchParams = req.nextUrl.searchParams;
  const countOnly = searchParams.get("countOnly");

  if (countOnly === "true") {
    const activeCount = await prisma.homepageHeadline.count({
      where: { status: "active" },
    });
    return NextResponse.json({ activeCount });
  }

  const statusFilter = searchParams.get("status");
  const where = statusFilter ? { status: statusFilter as never } : {};

  const headlines = await prisma.homepageHeadline.findMany({
    where,
    include: {
      regulatoryChange: {
        select: { id: true, headline: true, slug: true, status: true },
      },
      createdBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: [{ pinned: "desc" }, { position: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(headlines);
}

export async function POST(req: Request) {
  const { error, status, session } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const body = await req.json();

  // Look up user by email to get the actual DB UUID
  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  // Mode A: all-in-one (document + change + headline)
  if (body.change) {
    const { title, subtitle, position, document, change, publishNow } = body;

    if (!title || !change.slug || !change.lawName || !change.changeType ||
        !change.legalBasis || !change.source || !change.effectiveDate ||
        !change.headline || !change.summary) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create legal document if provided
      let legalDocumentId: string | null = null;
      if (document && document.slug && document.title && document.content) {
        const doc = await tx.legalDocument.create({
          data: {
            slug: document.slug,
            title: document.title,
            content: document.content,
            fileType: document.fileType || null,
          },
        });
        legalDocumentId = doc.id;
      }

      // Create regulatory change
      const regulatoryChange = await tx.regulatoryChange.create({
        data: {
          slug: change.slug,
          lawName: change.lawName,
          changeType: change.changeType,
          legalBasis: change.legalBasis,
          source: change.source,
          effectiveDate: new Date(change.effectiveDate),
          headline: change.headline,
          summary: change.summary,
          practicalImpact: change.practicalImpact || [],
          affectedParties: change.affectedParties || [],
          analysisSummary: change.analysisSummary || null,
          comparisonBefore: change.comparisonBefore || null,
          comparisonAfter: change.comparisonAfter || null,
          timeline: change.timeline || null,
          context: change.context || null,
          status: "published",
          legalDocumentId,
          fields: change.fieldIds?.length
            ? {
                create: change.fieldIds.map((fieldId: string) => ({ fieldId })),
              }
            : undefined,
        },
      });

      // Create homepage headline
      const headline = await tx.homepageHeadline.create({
        data: {
          regulatoryChangeId: regulatoryChange.id,
          title,
          subtitle: subtitle || null,
          position: position ?? 0,
          status: publishNow ? "active" : "draft",
          createdById: user.id,
        },
        include: {
          regulatoryChange: {
            select: { id: true, headline: true, slug: true, status: true },
          },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });

      return headline;
    });

    return NextResponse.json(result, { status: 201 });
  }

  // Mode B: legacy (link to existing regulatory change)
  const { regulatoryChangeId, title, subtitle, position } = body;

  if (!regulatoryChangeId || !title) {
    return NextResponse.json(
      { error: "regulatoryChangeId and title are required" },
      { status: 400 }
    );
  }

  const headline = await prisma.homepageHeadline.create({
    data: {
      regulatoryChangeId,
      title,
      subtitle: subtitle || null,
      position: position ?? 0,
      status: "draft",
      createdById: user.id,
    },
    include: {
      regulatoryChange: {
        select: { id: true, headline: true, slug: true, status: true },
      },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(headline, { status: 201 });
}
