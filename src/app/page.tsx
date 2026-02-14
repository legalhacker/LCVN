import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import FilterBar from "@/components/dashboard/FilterBar";
import DocumentListTable from "@/components/dashboard/DocumentListTable";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://lcvn.vn";

export const dynamic = "force-dynamic";

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

const DOMAIN_MAP: Record<string, string> = {
  "bo-luat-lao-dong": "Lao động & Nhân sự",
  "bo-luat-dan-su": "Dân sự",
  "luat-doanh-nghiep": "Doanh nghiệp",
};

const SLUG_TO_DOC_PAGE: Record<string, string> = {
  "bo-luat-lao-dong": "labor-code-2019",
  "bo-luat-dan-su": "civil-code-2015",
  "luat-doanh-nghiep": "enterprise-law-2020",
};

const RELATIONSHIP_LABELS: Record<string, string> = {
  amended_by: "Sửa đổi bởi",
  replaces: "Thay thế",
  related_to: "Liên quan đến",
  references: "Tham chiếu",
  implements: "Hướng dẫn thi hành",
};

export default async function HomePage() {
  const documents = await prisma.legalDocument.findMany({
    orderBy: { effectiveDate: "desc" },
  });

  const relationships = await prisma.legalRelationship.findMany({
    orderBy: { effectiveDate: "desc" },
    take: 10,
  });

  // Derive change events from relationships, falling back to documents
  type ChangeEvent = {
    id: string;
    title: string;
    field: string;
    effectiveDate: string;
    summary: string;
    href: string;
  };

  const events: ChangeEvent[] = [];

  if (relationships.length > 0) {
    for (const rel of relationships) {
      // Find the source document to get context
      const sourceDoc = documents.find(
        (d) => d.canonicalId === rel.sourceCanonicalId,
      );
      const targetDoc = documents.find(
        (d) => d.canonicalId === rel.targetCanonicalId,
      );

      const relLabel = RELATIONSHIP_LABELS[rel.relationshipType] || rel.relationshipType;
      const title = rel.description || `${relLabel}: ${sourceDoc?.title || rel.sourceCanonicalId}`;
      const field = sourceDoc ? (DOMAIN_MAP[sourceDoc.slug] || "Pháp luật") : "Pháp luật";
      const effectiveDate = rel.effectiveDate
        ? rel.effectiveDate.toISOString().split("T")[0]
        : sourceDoc?.effectiveDate.toISOString().split("T")[0] || "";
      const docPage = sourceDoc ? SLUG_TO_DOC_PAGE[sourceDoc.slug] : null;
      const href = docPage
        ? `/document/${docPage}`
        : targetDoc
          ? `/search?q=${encodeURIComponent(targetDoc.title)}`
          : "/search";

      events.push({ id: rel.id, title, field, effectiveDate, summary: `${relLabel}`, href });
    }
  }

  // Fall back to recent documents if no relationships
  if (events.length === 0) {
    for (const doc of documents.slice(0, 6)) {
      const docPage = SLUG_TO_DOC_PAGE[doc.slug];
      events.push({
        id: doc.id,
        title: doc.title,
        field: DOMAIN_MAP[doc.slug] || "Pháp luật",
        effectiveDate: doc.effectiveDate.toISOString().split("T")[0],
        summary: `${doc.documentNumber} — ${doc.issuingBody}`,
        href: docPage ? `/document/${docPage}` : `/search?q=${encodeURIComponent(doc.title)}`,
      });
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Regulatory Intelligence
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Theo dõi quy định pháp luật Việt Nam
          </p>
        </div>

        {/* Section 0 — Văn bản mới có hiệu lực */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              Văn bản mới có hiệu lực
            </h2>
            <Link
              href="/search"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Tìm kiếm nâng cao
            </Link>
          </div>

          <div className="mb-3">
            <FilterBar showSearchInput={false} />
          </div>

          <DocumentListTable
            documents={documents}
            slugToDocPage={SLUG_TO_DOC_PAGE}
          />
        </section>

        {/* Section 1 — Sự kiện thay đổi pháp luật */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Sự kiện thay đổi pháp luật
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={event.href}
                className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium text-gray-900 leading-snug">
                    {event.title}
                  </h3>
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                    {event.field}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {event.summary}
                </p>
                {event.effectiveDate && (
                  <p className="mt-1 text-[10px] text-gray-400">
                    Hiệu lực: {event.effectiveDate}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
