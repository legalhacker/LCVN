import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllTopicSlugs,
  getTopicInfo,
  getDocumentsByTopic,
} from "@/lib/content";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllTopicSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicInfo(slug);
  if (!topic) return {};
  return {
    title: `${topic.name} - LCVN`,
    description: topic.description,
    openGraph: {
      title: `${topic.name} - LCVN`,
      description: topic.description,
      url: `/topic/${slug}`,
    },
  };
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = getTopicInfo(slug);
  if (!topic) notFound();

  const documents = getDocumentsByTopic(slug);

  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-16 pb-24">
      {/* Breadcrumb */}
      <nav className="mb-8 text-xs text-gray-400">
        <Link href="/" className="hover:text-gray-600 transition-colors">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-600">{topic.name}</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
        {topic.name}
      </h1>
      <p className="mt-2 text-sm text-gray-500 max-w-lg">{topic.description}</p>

      {documents.length === 0 ? (
        <p className="mt-12 text-sm text-gray-400">
          No documents available for this topic yet.
        </p>
      ) : (
        <ul className="mt-10 divide-y divide-gray-100">
          {documents.map((doc) => (
            <li key={doc.slug}>
              <Link
                href={`/document/${doc.slug}`}
                className="group block py-5 transition-colors hover:bg-gray-50 -mx-4 px-4 rounded-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-gray-900 group-hover:text-black">
                      {doc.title}
                    </h2>
                    <p className="mt-1 text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {doc.summary}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-xs font-mono text-gray-400">
                      {doc.documentNumber}
                    </span>
                    <div className="mt-1 text-[11px] text-gray-400">
                      Effective {doc.effectiveDate}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
