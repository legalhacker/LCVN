import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildDocumentJsonLd } from "@/lib/jsonld";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const canonicalId = searchParams.get("canonicalId");

  // Single document by canonical ID
  if (canonicalId) {
    const doc = await prisma.legalDocument.findUnique({
      where: { canonicalId },
      include: {
        articles: {
          select: { canonicalId: true, articleNumber: true, title: true },
          orderBy: { articleNumber: "asc" },
        },
      },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const docMeta = {
      canonicalId: doc.canonicalId,
      title: doc.title,
      documentNumber: doc.documentNumber,
      documentType: doc.documentType,
      issuingBody: doc.issuingBody,
      issuedDate: doc.issuedDate.toISOString().split("T")[0],
      effectiveDate: doc.effectiveDate.toISOString().split("T")[0],
      slug: doc.slug,
      year: doc.year,
      status: doc.status,
    };

    const metadata = await prisma.legalMetadata.findMany({
      where: { entityCanonicalId: canonicalId },
    });

    const relationships = await prisma.legalRelationship.findMany({
      where: {
        OR: [
          { sourceCanonicalId: canonicalId },
          { targetCanonicalId: canonicalId },
        ],
      },
    });

    return NextResponse.json({
      data: {
        ...docMeta,
        articles: doc.articles,
      },
      canonical_id: doc.canonicalId,
      canonical_url: `/doc/${doc.slug}/${doc.year}`,
      metadata: metadata.map((m) => ({ key: m.key, value: m.value })),
      relationships,
      json_ld: buildDocumentJsonLd(docMeta),
    });
  }

  // List all documents
  const documents = await prisma.legalDocument.findMany({
    orderBy: { year: "desc" },
    select: {
      canonicalId: true,
      title: true,
      documentNumber: true,
      documentType: true,
      issuingBody: true,
      issuedDate: true,
      effectiveDate: true,
      slug: true,
      year: true,
      status: true,
    },
  });

  return NextResponse.json({
    data: documents.map((d) => ({
      ...d,
      issuedDate: d.issuedDate.toISOString().split("T")[0],
      effectiveDate: d.effectiveDate.toISOString().split("T")[0],
    })),
  });
}
