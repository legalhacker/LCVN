import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllDocumentSlugs,
  getDocumentBySlug,
  getTopicInfo,
} from "@/lib/content";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllDocumentSlugs().map(({ slug }) => ({ slug }));
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

        <div className="mt-8 prose prose-sm prose-gray max-w-none">
          <p className="text-gray-600 leading-relaxed">{doc.summary}</p>
        </div>
      </article>
    </section>
  );
}
