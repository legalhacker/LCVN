import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getAllDocumentSlugs,
  getDocumentBySlug,
  getTopicInfo,
} from "@/lib/content";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocumentBySlug(slug);
  if (!doc) return {};
  return {
    title: `${doc.title} - LCVN`,
    description: doc.summary,
  };
}

export default async function DocumentPage({ params }: Props) {
  const { slug } = await params;
  const doc = getDocumentBySlug(slug);
  if (!doc) notFound();

  const topic = getTopicInfo(doc.topic);

  // Query DB for the legal document and its articles
  // dbSlug maps the content URL slug to the DB's Vietnamese slug
  const dbDoc = await prisma.legalDocument.findUnique({
    where: { slug: doc.dbSlug || slug },
    include: {
      articles: {
        orderBy: { articleNumber: "asc" },
        include: {
          _count: { select: { clauses: true } },
        },
      },
    },
  });

  const articles = dbDoc?.articles ?? [];

  // Group articles by chapter
  const chapters: Record<string, typeof articles> = {};
  for (const article of articles) {
    const ch = article.chapter || "General";
    if (!chapters[ch]) chapters[ch] = [];
    chapters[ch].push(article);
  }

  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-16 pb-24">
      {/* Breadcrumb */}
      <nav className="mb-8 text-xs text-gray-400">
        <Link href="/" className="hover:text-gray-600 transition-colors">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        {topic && (
          <>
            <Link
              href={`/topic/${doc.topic}`}
              className="hover:text-gray-600 transition-colors"
            >
              {topic.name}
            </Link>
            <span className="mx-1.5">/</span>
          </>
        )}
        <span className="text-gray-600">{doc.title}</span>
      </nav>

      <article>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          {doc.title}
        </h1>

        <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 text-sm max-w-md">
          <dt className="text-gray-400">Document Number</dt>
          <dd className="font-mono text-gray-700">{doc.documentNumber}</dd>
          <dt className="text-gray-400">Effective Date</dt>
          <dd className="text-gray-700">{doc.effectiveDate}</dd>
          {dbDoc && (
            <>
              <dt className="text-gray-400">Issuing Body</dt>
              <dd className="text-gray-700">{dbDoc.issuingBody}</dd>
              <dt className="text-gray-400">Status</dt>
              <dd className="text-gray-700 capitalize">{dbDoc.status}</dd>
            </>
          )}
          {topic && (
            <>
              <dt className="text-gray-400">Topic</dt>
              <dd>
                <Link
                  href={`/topic/${doc.topic}`}
                  className="text-gray-700 underline underline-offset-2 decoration-gray-300 hover:decoration-gray-500 transition-colors"
                >
                  {topic.name}
                </Link>
              </dd>
            </>
          )}
        </dl>

        <div className="mt-8">
          <p className="text-sm text-gray-600 leading-relaxed">{doc.summary}</p>
        </div>

        {/* Articles table of contents */}
        {articles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
              Articles ({articles.length})
            </h2>

            <div className="space-y-8">
              {Object.entries(chapters).map(([chapter, chapterArticles]) => (
                <div key={chapter}>
                  {Object.keys(chapters).length > 1 && (
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                      {chapter}
                    </h3>
                  )}
                  <ul className="divide-y divide-gray-50">
                    {chapterArticles.map((article) => (
                      <li key={article.articleNumber}>
                        <Link
                          href={`/luat/${doc.dbSlug || slug}/${dbDoc!.year}/dieu-${article.articleNumber}`}
                          className="group flex items-baseline gap-3 py-3 -mx-3 px-3 rounded-lg transition-colors hover:bg-gray-50"
                        >
                          <span className="shrink-0 text-sm font-semibold text-gray-900 group-hover:text-black">
                            Điều {article.articleNumber}
                          </span>
                          {article.title && (
                            <span className="text-sm text-gray-500 group-hover:text-gray-700 min-w-0 truncate">
                              {article.title}
                            </span>
                          )}
                          <span className="ml-auto shrink-0 text-[11px] text-gray-400">
                            {article._count.clauses} khoản
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {articles.length === 0 && dbDoc === null && (
          <p className="mt-12 text-sm text-gray-400 italic">
            Article data for this document is not yet available in the database.
          </p>
        )}
      </article>
    </section>
  );
}
