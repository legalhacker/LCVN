import type { Metadata } from "next";
import TopicGrid from "@/components/TopicGrid";

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

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-16">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 max-w-2xl">
          Research Vietnamese Law
        </h1>
        <p className="mt-2 text-lg sm:text-xl text-gray-400 font-light max-w-xl">
          Structured by Articles &mdash; Precise &mdash; Citation-Ready
        </p>
        <p className="mt-6 text-sm text-gray-500 max-w-lg leading-relaxed">
          This platform provides structured Vietnamese legal documents optimized
          for research, navigation, and citation.
        </p>
      </section>

      {/* Topics */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-24">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Browse by topic
        </h2>
        <TopicGrid />
      </section>
    </>
  );
}
