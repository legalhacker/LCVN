import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/admin-auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const body = await req.json();

  const field = await prisma.field.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(field);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status } = await requireAuth("admin");
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  await prisma.field.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
