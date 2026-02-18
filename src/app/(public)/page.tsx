import type { Metadata } from "next";
import RegulatoryFeed from "@/components/dashboard/RegulatoryFeed";
import EffectiveDocuments from "@/components/dashboard/EffectiveDocuments";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://lcvn.vn";

export const metadata: Metadata = {
  title: "LCVN - Legal Compliance in Vietnam",
  description:
    "Structured Vietnamese legal documents optimized for research, navigation, and citation.",
  alternates: {
    canonical: `${BASE_URL}/`,
  },
  openGraph: {
    title: "LCVN - Legal Compliance in Vietnam",
    description: "Structured Vietnamese legal documents optimized for research, navigation, and citation.",
    url: `${BASE_URL}/`,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "LCVN - Legal Compliance in Vietnam",
  url: `${BASE_URL}/`,
  potentialAction: {
    "@type": "SearchAction",
    target: `${BASE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

interface FeedItem {
  slug: string;
  title: string;
  summary: string;
  legalBasis: string;
  sourceDocument: string;
  effectiveDate?: string;
  tags: string[];
}

export default async function HomePage() {
  const [headlines, fields, effectiveDocs] = await Promise.all([
    prisma.homepageHeadline.findMany({
      where: { status: "active" },
      include: {
        regulatoryChange: {
          include: { fields: { include: { field: true } } },
        },
      },
      orderBy: [{ pinned: "desc" }, { position: "asc" }],
    }),
    prisma.field.findMany({ orderBy: { name: "asc" } }),
    prisma.legalDocument.findMany({
      where: { effectiveDate: { lte: new Date() } },
      orderBy: { effectiveDate: "desc" },
    }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayDocs = effectiveDocs.filter(
    (d) => d.effectiveDate >= today && d.effectiveDate < tomorrow
  );

  const serializeDoc = (d: (typeof effectiveDocs)[number]) => ({
    id: d.id,
    slug: d.slug,
    title: d.title,
    documentNumber: d.documentNumber,
    issuingBody: d.issuingBody,
    effectiveDate: d.effectiveDate.toISOString(),
    status: d.status,
    documentType: d.documentType,
  });

  const feedItems: FeedItem[] = headlines.map((h) => ({
    slug: h.regulatoryChange.slug,
    title: h.title,
    summary: h.subtitle || h.regulatoryChange.summary,
    legalBasis: h.regulatoryChange.legalBasis,
    sourceDocument: h.regulatoryChange.source,
    effectiveDate: h.regulatoryChange.effectiveDate.toISOString().split("T")[0],
    tags: h.regulatoryChange.fields.map((f) => f.field.name),
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="p-4 lg:p-6">
        <div className="max-w-3xl mx-auto space-y-10">
          <RegulatoryFeed
            items={feedItems}
            fields={fields.map((f) => f.name)}
          />

          <EffectiveDocuments
            documents={effectiveDocs.map(serializeDoc)}
            todayDocuments={todayDocs.map(serializeDoc)}
          />
        </div>
      </div>
    </>
  );
}
