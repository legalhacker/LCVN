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
  const { regulatoryChangeId, title, subtitle, position } = body;

  if (!regulatoryChangeId || !title) {
    return NextResponse.json(
      { error: "regulatoryChangeId and title are required" },
      { status: 400 }
    );
  }

  // Look up user by email to get the actual DB UUID
  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
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
