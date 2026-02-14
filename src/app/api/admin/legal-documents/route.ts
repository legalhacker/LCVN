import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/admin-auth";

export async function GET() {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const docs = await prisma.legalDocument.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const body = await req.json();
  const doc = await prisma.legalDocument.create({
    data: {
      ...body,
      issuedDate: new Date(body.issuedDate),
      effectiveDate: new Date(body.effectiveDate),
    },
  });

  return NextResponse.json(doc, { status: 201 });
}
