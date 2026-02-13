import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

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

const IMPACT_LEVELS: Record<string, { label: string; cls: string }> = {
  "bo-luat-lao-dong": { label: "Cao", cls: "bg-amber-100 text-amber-800" },
  "bo-luat-dan-su": { label: "Trung bình", cls: "bg-blue-100 text-blue-700" },
  "luat-doanh-nghiep": { label: "Cao", cls: "bg-amber-100 text-amber-800" },
};

const SLUG_TO_DOC_PAGE: Record<string, string> = {
  "bo-luat-lao-dong": "labor-code-2019",
  "bo-luat-dan-su": "civil-code-2015",
  "luat-doanh-nghiep": "enterprise-law-2020",
};

export default async function HomePage() {
  const documents = await prisma.legalDocument.findMany({
    orderBy: { effectiveDate: "desc" },
    include: {
      _count: { select: { articles: true } },
    },
  });

  const totalArticles = await prisma.article.count();
  const activeCount = documents.filter((d) => d.status === "active").length;

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
            Regulatory Intelligence Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Theo dõi quy định pháp luật Việt Nam
          </p>
        </div>

        {/* Stats cards */}
        <nav aria-label="Legal topics" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
              Tổng cập nhật
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {totalArticles}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              điều khoản trong hệ thống
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
              Tác động cao
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-600">
              {documents.filter((d) => IMPACT_LEVELS[d.slug]?.label === "Cao").length}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              văn bản tác động cao
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
              Hiện hành
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {activeCount}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              văn bản đang có hiệu lực
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
              Lĩnh vực
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {documents.length}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              văn bản pháp luật
            </p>
          </div>
        </nav>

        {/* Regulation table */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              Văn bản pháp luật
            </h2>
            <Link
              href="/search"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Tìm kiếm nâng cao
            </Link>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    <th className="text-left py-2.5 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                      Văn bản
                    </th>
                    <th className="text-left py-2.5 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">
                      Lĩnh vực
                    </th>
                    <th className="text-left py-2.5 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">
                      Cơ quan ban hành
                    </th>
                    <th className="text-left py-2.5 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">
                      Hiệu lực
                    </th>
                    <th className="text-left py-2.5 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                      Điều
                    </th>
                    <th className="text-left py-2.5 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                      Mức độ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => {
                    const impact = IMPACT_LEVELS[doc.slug] || {
                      label: "Thấp",
                      cls: "bg-gray-100 text-gray-600",
                    };
                    const docPage = SLUG_TO_DOC_PAGE[doc.slug];
                    return (
                      <tr
                        key={doc.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <Link
                            href={docPage ? `/document/${docPage}` : `/search?q=${encodeURIComponent(doc.title)}`}
                            className="group"
                          >
                            <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                              {doc.title}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {doc.documentNumber}
                            </p>
                          </Link>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <span className="text-xs text-gray-500">
                            {DOMAIN_MAP[doc.slug] || "Khác"}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className="text-xs text-gray-500">
                            {doc.issuingBody}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <span className="text-xs text-gray-500">
                            {doc.effectiveDate.toISOString().split("T")[0]}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-gray-500">
                            {doc._count.articles}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${impact.cls}`}
                          >
                            {impact.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
