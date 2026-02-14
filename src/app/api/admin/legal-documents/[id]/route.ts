import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/admin-auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const doc = await prisma.legalDocument.findUnique({ where: { id } });

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const body = await req.json();

  if (body.issuedDate) body.issuedDate = new Date(body.issuedDate);
  if (body.effectiveDate) body.effectiveDate = new Date(body.effectiveDate);

  const doc = await prisma.legalDocument.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(doc);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status } = await requireAuth("admin");
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  await prisma.legalDocument.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
