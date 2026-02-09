import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseSourceSlug } from "@/lib/slug-parser";
import { buildSourceUrl, getEntityTypeLabel } from "@/lib/legal-utils";
import { buildArticleJsonLd, buildClauseJsonLd, buildPointJsonLd } from "@/lib/jsonld";
import JsonLdScript from "@/components/source/JsonLdScript";
import InfoPanel from "@/components/InfoPanel";
import Breadcrumbs, { type BreadcrumbItem } from "@/components/shared/Breadcrumbs";
import type { Relationship, MetadataEntry, DocumentMeta, ArticleWithChildren } from "@/types/legal";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://lcvn.vn";

// ─── Data fetchers ───────────────────────────────────────────

async function getDocumentMeta(slug: string, year: number): Promise<DocumentMeta | null> {
  const doc = await prisma.legalDocument.findFirst({ where: { slug, year } });
  if (!doc) return null;
  return {
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
}

async function getRelationships(canonicalId: string): Promise<Relationship[]> {
  const rels = await prisma.legalRelationship.findMany({
    where: {
      OR: [{ sourceCanonicalId: canonicalId }, { targetCanonicalId: canonicalId }],
    },
  });
  return rels.map((r) => ({
    id: r.id,
    sourceType: r.sourceType as Relationship["sourceType"],
    sourceCanonicalId: r.sourceCanonicalId,
    targetType: r.targetType as Relationship["targetType"],
    targetCanonicalId: r.targetCanonicalId,
    relationshipType: r.relationshipType as Relationship["relationshipType"],
    description: r.description,
    effectiveDate: r.effectiveDate?.toISOString().split("T")[0] ?? null,
  }));
}

async function getExtraMetadata(canonicalId: string): Promise<MetadataEntry[]> {
  const meta = await prisma.legalMetadata.findMany({
    where: { entityCanonicalId: canonicalId },
  });
  return meta.map((m) => ({ key: m.key, value: m.value }));
}

// ─── Metadata for <head> ────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSourceSlug(slug);
  if (!parsed) return { title: "Không tìm thấy" };

  const doc = await getDocumentMeta(parsed.docSlug, parsed.year);
  if (!doc) return { title: "Không tìm thấy" };

  const canonicalPath = buildSourceUrl({
    docSlug: doc.slug,
    year: doc.year,
    articleNumber: parsed.articleNumber,
    clauseNumber: parsed.clauseNumber,
    pointLetter: parsed.pointLetter,
  });

  let title = doc.title;
  if (parsed.articleNumber != null) {
    const article = await prisma.article.findFirst({
      where: { document: { slug: parsed.docSlug, year: parsed.year }, articleNumber: parsed.articleNumber },
      select: { title: true },
    });
    title = article?.title
      ? `Điều ${parsed.articleNumber}. ${article.title} - ${doc.title}`
      : `Điều ${parsed.articleNumber} - ${doc.title}`;
  }

  return {
    title: `${title} | LCVN`,
    description: `${title} - ${doc.documentNumber}`,
    alternates: {
      canonical: `${BASE_URL}${canonicalPath}`,
    },
  };
}

// ─── Page ────────────────────────────────────────────────────

export default async function SourcePage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseSourceSlug(slug);
  if (!parsed) notFound();

  const doc = await getDocumentMeta(parsed.docSlug, parsed.year);
  if (!doc) notFound();

  // ── Article page (single-page layout) ──
  if (parsed.entityType === "article" && parsed.articleNumber != null) {
    return renderArticlePage(doc, parsed.articleNumber);
  }

  // ── Clause / Point source pages (kept for AI citation) ──
  if (parsed.entityType === "clause" && parsed.articleNumber != null && parsed.clauseNumber != null) {
    return renderClausePage(doc, parsed);
  }
  if (parsed.entityType === "point" && parsed.articleNumber != null && parsed.clauseNumber != null && parsed.pointLetter != null) {
    return renderPointPage(doc, parsed);
  }

  notFound();
}

// ─── Article: single-page Grokipedia layout ──────────────────

async function renderArticlePage(doc: DocumentMeta, articleNumber: number) {
  const article = await prisma.article.findFirst({
    where: {
      document: { slug: doc.slug, year: doc.year },
      articleNumber,
    },
    include: {
      clauses: {
        include: { points: { orderBy: { pointLetter: "asc" } } },
        orderBy: { clauseNumber: "asc" },
      },
    },
  });
  if (!article) notFound();

  const articleData: ArticleWithChildren = {
    id: article.id,
    canonicalId: article.canonicalId,
    articleNumber: article.articleNumber,
    title: article.title,
    content: article.content,
    chapter: article.chapter,
    section: article.section,
    document: doc,
    clauses: article.clauses.map((c) => ({
      id: c.id,
      canonicalId: c.canonicalId,
      clauseNumber: c.clauseNumber,
      content: c.content,
      points: c.points.map((p) => ({
        id: p.id,
        canonicalId: p.canonicalId,
        pointLetter: p.pointLetter,
        content: p.content,
      })),
    })),
  };

  const jsonLd = buildArticleJsonLd(articleData);

  const [relationships, extraMetadata, prevArticle, nextArticle] = await Promise.all([
    getRelationships(article.canonicalId),
    getExtraMetadata(article.canonicalId),
    prisma.article.findFirst({
      where: { document: { slug: doc.slug, year: doc.year }, articleNumber: { lt: articleNumber } },
      orderBy: { articleNumber: "desc" },
      select: { articleNumber: true, title: true },
    }),
    prisma.article.findFirst({
      where: { document: { slug: doc.slug, year: doc.year }, articleNumber: { gt: articleNumber } },
      orderBy: { articleNumber: "asc" },
      select: { articleNumber: true, title: true },
    }),
  ]);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: doc.title, href: `/doc/${doc.slug}/${doc.year}` },
    { label: `Điều ${article.articleNumber}` },
  ];

  return (
    <div className="relative">
      {/* CSS-only toggle state */}
      <input type="checkbox" id="info-toggle" className="peer sr-only" />

      {/* Main content */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        <JsonLdScript data={jsonLd} />

        {/* Top bar: breadcrumbs + info toggle */}
        <div className="flex items-center justify-between mb-6">
          <Breadcrumbs items={breadcrumbs} />
          <label
            htmlFor="info-toggle"
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors select-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z" clipRule="evenodd" />
            </svg>
            Thông tin pháp lý
          </label>
        </div>

        {/* ── Article content ── */}
        <article id={`dieu-${article.articleNumber}`}>
          <h1 className="text-2xl font-bold text-gray-900 mb-1 scroll-mt-20">
            Điều {article.articleNumber}
            {article.title && `. ${article.title}`}
          </h1>

          {(article.chapter || article.section) && (
            <p className="text-sm text-gray-500 mb-6">
              {doc.title} &mdash; {article.chapter}
              {article.section && `, ${article.section}`}
            </p>
          )}

          <p className="text-gray-800 leading-relaxed mb-6">{article.content}</p>

          {/* Clauses */}
          {articleData.clauses.map((clause) => (
            <section key={clause.id} id={`khoan-${clause.clauseNumber}`} className="mb-5 scroll-mt-20">
              <h2 className="text-base font-semibold text-gray-900 mb-1">
                Khoản {clause.clauseNumber}
              </h2>
              <p className="text-gray-800 leading-relaxed">{clause.content}</p>

              {/* Points */}
              {clause.points.length > 0 && (
                <div className="ml-4 mt-2 space-y-1.5">
                  {clause.points.map((point) => (
                    <div
                      key={point.id}
                      id={`khoan-${clause.clauseNumber}-diem-${point.pointLetter}`}
                      className="scroll-mt-20"
                    >
                      <h3 className="text-sm font-medium text-gray-700 inline">
                        {point.pointLetter})
                      </h3>{" "}
                      <span className="text-gray-800 text-sm">{point.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </article>

        {/* Article navigation */}
        <nav className="flex justify-between mt-10 pt-6 border-t border-gray-200 text-sm">
          {prevArticle ? (
            <Link
              href={`/luat/${doc.slug}/${doc.year}/dieu-${prevArticle.articleNumber}`}
              className="text-blue-600 hover:text-blue-800"
            >
              &larr; Điều {prevArticle.articleNumber}
              {prevArticle.title && `. ${prevArticle.title}`}
            </Link>
          ) : (
            <span />
          )}
          {nextArticle ? (
            <Link
              href={`/luat/${doc.slug}/${doc.year}/dieu-${nextArticle.articleNumber}`}
              className="text-blue-600 hover:text-blue-800"
            >
              Điều {nextArticle.articleNumber}
              {nextArticle.title && `. ${nextArticle.title}`} &rarr;
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>

      {/* Overlay backdrop (visible when panel open) */}
      <label
        htmlFor="info-toggle"
        className="fixed inset-0 bg-black/20 z-30 hidden peer-checked:block cursor-default"
        aria-hidden="true"
      />

      {/* Info panel (slide-in from right, CSS only) */}
      <InfoPanel
        canonicalId={article.canonicalId}
        documentTitle={doc.title}
        documentNumber={doc.documentNumber}
        issuingBody={doc.issuingBody}
        issuedDate={doc.issuedDate}
        effectiveDate={doc.effectiveDate}
        status={doc.status}
        chapter={article.chapter}
        section={article.section}
        extraMetadata={extraMetadata}
        relationships={relationships}
        docSlug={doc.slug}
        year={doc.year}
      />
    </div>
  );
}

// ─── Clause source page (AI citation) ────────────────────────

async function renderClausePage(
  doc: DocumentMeta,
  parsed: { docSlug: string; year: number; articleNumber?: number; clauseNumber?: number; pointLetter?: string },
) {
  const clause = await prisma.clause.findFirst({
    where: {
      article: {
        document: { slug: parsed.docSlug, year: parsed.year },
        articleNumber: parsed.articleNumber!,
      },
      clauseNumber: parsed.clauseNumber!,
    },
    include: { article: true, points: { orderBy: { pointLetter: "asc" } } },
  });
  if (!clause) notFound();

  const clauseData = {
    id: clause.id,
    canonicalId: clause.canonicalId,
    clauseNumber: clause.clauseNumber,
    content: clause.content,
    points: clause.points.map((p) => ({
      id: p.id, canonicalId: p.canonicalId, pointLetter: p.pointLetter, content: p.content,
    })),
  };

  const jsonLd = buildClauseJsonLd(
    clauseData,
    { canonicalId: clause.article.canonicalId, articleNumber: clause.article.articleNumber, title: clause.article.title },
    doc,
  );

  const breadcrumbs: BreadcrumbItem[] = [
    { label: doc.title, href: `/doc/${doc.slug}/${doc.year}` },
    { label: `Điều ${parsed.articleNumber}`, href: `/luat/${doc.slug}/${doc.year}/dieu-${parsed.articleNumber}` },
    { label: `Khoản ${parsed.clauseNumber}` },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <JsonLdScript data={jsonLd} />
      <Breadcrumbs items={breadcrumbs} />
      <div className="inline-block rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 mb-4">
        {getEntityTypeLabel("clause")} &middot; Nguồn AI
      </div>
      <p className="text-xs text-gray-400 font-mono mb-4">{clause.canonicalId}</p>
      <article>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Khoản {clause.clauseNumber}, Điều {clause.article.articleNumber}
        </h1>
        <p className="text-gray-800 leading-relaxed">{clause.content}</p>
        {clauseData.points.length > 0 && (
          <div className="ml-4 mt-3 space-y-1.5">
            {clauseData.points.map((p) => (
              <p key={p.id} className="text-gray-800 text-sm">
                <span className="font-medium">{p.pointLetter})</span> {p.content}
              </p>
            ))}
          </div>
        )}
      </article>
      <p className="mt-6 text-sm">
        <Link href={`/luat/${doc.slug}/${doc.year}/dieu-${parsed.articleNumber}#khoan-${parsed.clauseNumber}`} className="text-blue-600 hover:underline">
          &larr; Xem toàn bộ Điều {parsed.articleNumber}
        </Link>
      </p>
    </div>
  );
}

// ─── Point source page (AI citation) ─────────────────────────

async function renderPointPage(
  doc: DocumentMeta,
  parsed: { docSlug: string; year: number; articleNumber?: number; clauseNumber?: number; pointLetter?: string },
) {
  const point = await prisma.point.findFirst({
    where: {
      clause: {
        article: {
          document: { slug: parsed.docSlug, year: parsed.year },
          articleNumber: parsed.articleNumber!,
        },
        clauseNumber: parsed.clauseNumber!,
      },
      pointLetter: parsed.pointLetter!,
    },
    include: { clause: { include: { article: true } } },
  });
  if (!point) notFound();

  const jsonLd = buildPointJsonLd(
    { id: point.id, canonicalId: point.canonicalId, pointLetter: point.pointLetter, content: point.content },
    { canonicalId: point.clause.canonicalId, clauseNumber: point.clause.clauseNumber },
    { canonicalId: point.clause.article.canonicalId, articleNumber: point.clause.article.articleNumber },
    doc,
  );

  const breadcrumbs: BreadcrumbItem[] = [
    { label: doc.title, href: `/doc/${doc.slug}/${doc.year}` },
    { label: `Điều ${parsed.articleNumber}`, href: `/luat/${doc.slug}/${doc.year}/dieu-${parsed.articleNumber}` },
    { label: `Khoản ${parsed.clauseNumber}`, href: `/luat/${doc.slug}/${doc.year}/dieu-${parsed.articleNumber}/khoan-${parsed.clauseNumber}` },
    { label: `Điểm ${parsed.pointLetter}` },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <JsonLdScript data={jsonLd} />
      <Breadcrumbs items={breadcrumbs} />
      <div className="inline-block rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 mb-4">
        {getEntityTypeLabel("point")} &middot; Nguồn AI
      </div>
      <p className="text-xs text-gray-400 font-mono mb-4">{point.canonicalId}</p>
      <article>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Điểm {point.pointLetter}, Khoản {point.clause.clauseNumber}, Điều {point.clause.article.articleNumber}
        </h1>
        <p className="text-gray-800 leading-relaxed">{point.content}</p>
      </article>
      <p className="mt-6 text-sm">
        <Link
          href={`/luat/${doc.slug}/${doc.year}/dieu-${parsed.articleNumber}#khoan-${parsed.clauseNumber}-diem-${parsed.pointLetter}`}
          className="text-blue-600 hover:underline"
        >
          &larr; Xem toàn bộ Điều {parsed.articleNumber}
        </Link>
      </p>
    </div>
  );
}
