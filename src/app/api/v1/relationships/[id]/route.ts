import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id: canonicalId } = await context.params;

  const relationships = await prisma.legalRelationship.findMany({
    where: {
      OR: [
        { sourceCanonicalId: canonicalId },
        { targetCanonicalId: canonicalId },
      ],
    },
  });

  return NextResponse.json({
    canonical_id: canonicalId,
    relationships: relationships.map((r) => ({
      id: r.id,
      sourceType: r.sourceType,
      sourceCanonicalId: r.sourceCanonicalId,
      targetType: r.targetType,
      targetCanonicalId: r.targetCanonicalId,
      relationshipType: r.relationshipType,
      description: r.description,
      effectiveDate: r.effectiveDate?.toISOString().split("T")[0] ?? null,
    })),
  });
}
