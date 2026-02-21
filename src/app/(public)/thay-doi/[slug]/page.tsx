import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ContextualInsightPanel from "@/components/dashboard/ContextualInsightPanel";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://lcvn.vn";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const change = await prisma.regulatoryChange.findUnique({
    where: { slug },
  });
  if (!change) return {};
  return {
    title: `${change.headline} - LCVN`,
    description: (change.analysisSummary || change.summary).slice(0, 160),
    alternates: { canonical: `${BASE_URL}/thay-doi/${change.slug}` },
    openGraph: {
      title: `${change.headline} - LCVN`,
      description: (change.analysisSummary || change.summary).slice(0, 160),
      url: `${BASE_URL}/thay-doi/${change.slug}`,
    },
  };
}

export default async function ChangeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const change = await prisma.regulatoryChange.findUnique({
    where: { slug },
    include: {
      fields: { include: { field: true } },
    },
  });

  if (!change || change.status !== "published") notFound();

  const tags = change.fields.map((f) => f.field.name);
  const fieldIds = change.fields.map((f) => f.fieldId);

  const relatedChanges = await prisma.regulatoryChange.findMany({
    where: {
      status: "published",
      id: { not: change.id },
      fields: { some: { fieldId: { in: fieldIds } } },
    },
    select: { headline: true, slug: true },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex">
      <div className="flex-1 min-w-0 p-4 lg:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
            <Link href="/" className="hover:text-gray-600 transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-gray-600">Phân tích thay đổi</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-lg font-semibold text-gray-900 leading-snug">
              {change.headline}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
              <span>
                <span className="text-gray-500">Căn cứ:</span> {change.legalBasis}
              </span>
              <span>
                <span className="text-gray-500">Nguồn:</span> {change.source}
              </span>
              <span>
                <span className="text-gray-500">Hiệu lực:</span> {change.effectiveDate.toISOString().split("T")[0]}
              </span>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* Tier 1: Analysis */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">
              Phân tích thay đổi
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed">
              {change.analysisSummary || change.summary}
            </p>

            {change.practicalImpact.length > 0 && (
              <>
                <h3 className="text-xs font-semibold text-gray-700 mt-5 mb-2">
                  Tác động pháp lý & thực tiễn
                </h3>
                <ul className="space-y-2">
                  {change.practicalImpact.map((point, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
                      <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-gray-300" />
                      {point}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {change.affectedParties.length > 0 && (
              <>
                <h3 className="text-xs font-semibold text-gray-700 mt-5 mb-2">
                  Đối tượng bị ảnh hưởng
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {change.affectedParties.map((party) => (
                    <span
                      key={party}
                      className="inline-flex items-center rounded-md bg-gray-50 border border-gray-200 px-2.5 py-1 text-xs text-gray-600"
                    >
                      {party}
                    </span>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Divider */}
          <hr className="border-gray-100 mb-8" />

          {/* Tier 2: Comparison & Context */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">
              So sánh & bối cảnh
            </h2>

            {/* Before / After */}
            {(change.comparisonBefore || change.comparisonAfter) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {change.comparisonBefore && (
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                      Trước thay đổi
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {change.comparisonBefore}
                    </p>
                  </div>
                )}
                {change.comparisonAfter && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 mb-2">
                      Sau thay đổi
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {change.comparisonAfter}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            {change.timeline && (
              <div className="rounded-lg border border-gray-200 p-4 mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                  Timeline hiệu lực
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {change.timeline}
                </p>
              </div>
            )}

            {/* Context */}
            {change.context && (
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                  Bối cảnh quốc tế
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {change.context}
                </p>
              </div>
            )}
          </section>

          {/* Back */}
          <div className="pt-4 border-t border-gray-100">
            <Link
              href="/"
              className="text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
            >
              &larr; Quay lại feed
            </Link>
          </div>
        </div>
      </div>
      <ContextualInsightPanel
        fields={tags}
        relatedChanges={relatedChanges}
      />
    </div>
  );
}
