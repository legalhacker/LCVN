import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseReadingSlug } from "@/lib/slug-parser";
import { buildDocumentJsonLd } from "@/lib/jsonld";
import DocumentOverview from "@/components/reading/DocumentOverview";
import JsonLdScript from "@/components/source/JsonLdScript";
import Breadcrumbs, { type BreadcrumbItem } from "@/components/shared/Breadcrumbs";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseReadingSlug(slug);
  if (!parsed) return { title: "Không tìm thấy" };

  // Articles redirect to /luat/... — no metadata needed
  if (parsed.entityType === "article") return {};

  const doc = await prisma.legalDocument.findFirst({
    where: { slug: parsed.docSlug, year: parsed.year },
  });
  if (!doc) return { title: "Không tìm thấy" };

  return {
    title: `${doc.title} | LCVN`,
    description: `${doc.title} - ${doc.documentNumber}`,
  };
}

export default async function ReadingPage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseReadingSlug(slug);
  if (!parsed) notFound();

  // Redirect article views to the canonical /luat/... URL
  if (parsed.entityType === "article" && parsed.articleNumber != null) {
    redirect(`/luat/${parsed.docSlug}/${parsed.year}/dieu-${parsed.articleNumber}`);
  }

  const doc = await prisma.legalDocument.findFirst({
    where: { slug: parsed.docSlug, year: parsed.year },
  });
  if (!doc) notFound();

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

  // Document overview
  const articles = await prisma.article.findMany({
    where: { documentId: doc.id },
    include: { _count: { select: { clauses: true } } },
    orderBy: { articleNumber: "asc" },
  });

  const jsonLd = buildDocumentJsonLd(docMeta);
  const breadcrumbs: BreadcrumbItem[] = [{ label: doc.title }];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <JsonLdScript data={jsonLd} />
      <Breadcrumbs items={breadcrumbs} />

      <DocumentOverview
        title={doc.title}
        documentNumber={doc.documentNumber}
        issuingBody={doc.issuingBody}
        issuedDate={docMeta.issuedDate}
        effectiveDate={docMeta.effectiveDate}
        status={doc.status}
        slug={doc.slug}
        year={doc.year}
        articles={articles.map((a) => ({
          articleNumber: a.articleNumber,
          title: a.title,
          chapter: a.chapter,
          clauseCount: a._count.clauses,
        }))}
      />
    </div>
  );
}
