import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/admin-auth";

export async function GET() {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const changes = await prisma.regulatoryChange.findMany({
    include: { fields: { include: { field: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(changes);
}

export async function POST(req: Request) {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const body = await req.json();
  const { fieldIds, ...data } = body;

  const change = await prisma.regulatoryChange.create({
    data: {
      ...data,
      effectiveDate: new Date(data.effectiveDate),
      fields: fieldIds?.length
        ? { create: fieldIds.map((fieldId: string) => ({ fieldId })) }
        : undefined,
    },
    include: { fields: { include: { field: true } } },
  });

  return NextResponse.json(change, { status: 201 });
}
