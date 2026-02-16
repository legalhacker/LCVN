import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/admin-auth";

export async function PUT(req: Request) {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const body = await req.json();
  const { orderedIds } = body as { orderedIds: string[] };

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return NextResponse.json(
      { error: "orderedIds must be a non-empty array" },
      { status: 400 }
    );
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.homepageHeadline.update({
        where: { id },
        data: { position: index },
      })
    )
  );

  return NextResponse.json({ success: true });
}
