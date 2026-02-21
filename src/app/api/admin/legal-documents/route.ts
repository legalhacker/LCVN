import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/admin-auth";

export async function GET() {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const docs = await prisma.legalDocument.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      fileType: true,
      createdAt: true,
      _count: { select: { regulatoryChanges: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const body = await req.json();
  const { slug, title, content, fileType } = body;

  if (!slug || !title || !content) {
    return NextResponse.json(
      { error: "slug, title, and content are required" },
      { status: 400 }
    );
  }

  const doc = await prisma.legalDocument.create({
    data: { slug, title, content, fileType: fileType || null },
  });

  return NextResponse.json(doc, { status: 201 });
}
