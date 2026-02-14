import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/admin-auth";

export async function GET() {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const fields = await prisma.field.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { regulatoryChanges: true } } },
  });

  return NextResponse.json(fields);
}

export async function POST(req: Request) {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const body = await req.json();
  const field = await prisma.field.create({ data: body });

  return NextResponse.json(field, { status: 201 });
}
