import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://lcvn.vn";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = await prisma.legalDocument.findUnique({ where: { slug } });
  if (!doc) return {};
  return {
    title: `${doc.title} – LCVN`,
    alternates: { canonical: `${BASE_URL}/van-ban/${doc.slug}` },
    openGraph: {
      title: `${doc.title} – LCVN`,
      url: `${BASE_URL}/van-ban/${doc.slug}`,
    },
  };
}

export default async function LegalDocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await prisma.legalDocument.findUnique({ where: { slug } });

  if (!doc) notFound();

  return (
    <div className="flex-1 min-w-0 p-4 lg:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-600 transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-gray-600">Văn bản pháp luật</span>
        </nav>

        {/* Header */}
        <header className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
            Văn bản pháp luật
          </p>
          <h1 className="text-xl font-semibold text-gray-900 leading-snug">
            {doc.title}
          </h1>
          {doc.fileType && (
            <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 uppercase">
              {doc.fileType}
            </span>
          )}
        </header>

        {/* Content */}
        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-6">
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
            {doc.content}
          </pre>
        </div>

        {/* Back */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <Link
            href="/"
            className="text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
          >
            &larr; Quay lại feed
          </Link>
        </div>
      </div>
    </div>
  );
}
