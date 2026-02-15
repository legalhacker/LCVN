import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/admin-auth";

const headlineInclude = {
  regulatoryChange: {
    select: { id: true, headline: true, slug: true, status: true },
  },
  createdBy: { select: { id: true, name: true, email: true } },
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const headline = await prisma.homepageHeadline.findUnique({
    where: { id },
    include: headlineInclude,
  });

  if (!headline) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(headline);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status, session } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const body = await req.json();
  const isAdmin = session!.user!.role === "admin";

  const existing = await prisma.homepageHeadline.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Build update data based on role
  const updateData: Record<string, unknown> = {};

  // Editors can update title, subtitle, position on own drafts
  if (!isAdmin) {
    const user = await prisma.user.findUnique({
      where: { email: session!.user!.email },
      select: { id: true },
    });
    if (existing.createdById !== user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (existing.status !== "draft") {
      return NextResponse.json(
        { error: "Editors can only edit draft headlines" },
        { status: 403 }
      );
    }
    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.position !== undefined) updateData.position = body.position;
  } else {
    // Admin can update everything
    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.pinned !== undefined) updateData.pinned = body.pinned;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.publishAt !== undefined) updateData.publishAt = body.publishAt ? new Date(body.publishAt) : null;
    if (body.archiveAt !== undefined) updateData.archiveAt = body.archiveAt ? new Date(body.archiveAt) : null;
  }

  const headline = await prisma.homepageHeadline.update({
    where: { id },
    data: updateData,
    include: headlineInclude,
  });

  return NextResponse.json(headline);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status } = await requireAuth("admin");
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  await prisma.homepageHeadline.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
