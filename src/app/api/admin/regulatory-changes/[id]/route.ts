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
  const change = await prisma.regulatoryChange.findUnique({
    where: { id },
    include: { fields: { include: { field: true } } },
  });

  if (!change) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(change);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const body = await req.json();
  const { fieldIds, ...data } = body;

  if (data.effectiveDate) data.effectiveDate = new Date(data.effectiveDate);

  const change = await prisma.regulatoryChange.update({
    where: { id },
    data: {
      ...data,
      fields: fieldIds
        ? {
            deleteMany: {},
            create: fieldIds.map((fieldId: string) => ({ fieldId })),
          }
        : undefined,
    },
    include: { fields: { include: { field: true } } },
  });

  return NextResponse.json(change);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status } = await requireAuth("admin");
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  await prisma.regulatoryChange.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
