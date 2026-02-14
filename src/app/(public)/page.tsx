import type { Metadata } from "next";
import RegulatoryFeed from "@/components/dashboard/RegulatoryFeed";
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
  const changes = await prisma.regulatoryChange.findMany({
    where: { status: "published" },
    include: { fields: { include: { field: true } } },
    orderBy: { effectiveDate: "desc" },
  });

  const fields = await prisma.field.findMany({ orderBy: { name: "asc" } });

  const feedItems: FeedItem[] = changes.map((c) => ({
    slug: c.slug,
    title: c.headline,
    summary: c.summary,
    legalBasis: c.legalBasis,
    sourceDocument: c.source,
    effectiveDate: c.effectiveDate.toISOString().split("T")[0],
    tags: c.fields.map((f) => f.field.name),
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="p-4 lg:p-6">
        <div className="max-w-3xl mx-auto">
          <RegulatoryFeed
            items={feedItems}
            fields={fields.map((f) => f.name)}
          />
        </div>
      </div>
    </>
  );
}
