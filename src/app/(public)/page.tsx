import type { Metadata } from "next";
import RegulatoryFeed from "@/components/dashboard/RegulatoryFeed";
import OverviewPanel from "@/components/dashboard/OverviewPanel";
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
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [headlines, fields, publishedChanges] = await Promise.all([
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
    prisma.regulatoryChange.findMany({
      where: { status: "published" },
      include: { fields: { include: { field: true } } },
    }),
  ]);

  // Compute field counts for overview panel
  const fieldCountMap = new Map<string, number>();
  const recentFieldCountMap = new Map<string, number>();
  for (const change of publishedChanges) {
    for (const cf of change.fields) {
      const name = cf.field.name;
      fieldCountMap.set(name, (fieldCountMap.get(name) || 0) + 1);
      if (change.createdAt >= thirtyDaysAgo) {
        recentFieldCountMap.set(name, (recentFieldCountMap.get(name) || 0) + 1);
      }
    }
  }
  const fieldCounts = Array.from(fieldCountMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  const recentFieldCounts = Array.from(recentFieldCountMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const overviewStats = {
    changeCount: publishedChanges.length,
    fieldCounts,
    recentFieldCounts,
  };

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

      <div className="flex">
        <div className="flex-1 min-w-0 p-4 lg:p-6">
          <RegulatoryFeed
            items={feedItems}
            fields={fields.map((f) => f.name)}
            maxItems={10}
          />
        </div>
        <OverviewPanel stats={overviewStats} />
      </div>
    </>
  );
}
