import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildSourceUrl } from "@/lib/legal-utils";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string; type?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `"${q}" - Search - LCVN` : "Search - LCVN",
  };
}

interface SearchResult {
  canonicalId: string;
  entityType: string;
  title: string;
  content: string;
  url: string;
  documentTitle: string;
}

async function search(q: string, type?: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  if (!type || type === "article") {
    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { document: true },
      take: 30,
    });

    for (const a of articles) {
      results.push({
        canonicalId: a.canonicalId,
        entityType: "article",
        title: a.title
          ? `Điều ${a.articleNumber}. ${a.title}`
          : `Điều ${a.articleNumber}`,
        content: a.content,
        url: buildSourceUrl({
          docSlug: a.document.slug,
          year: a.document.year,
          articleNumber: a.articleNumber,
        }),
        documentTitle: a.document.title,
      });
    }
  }

  if (!type || type === "clause") {
    const clauses = await prisma.clause.findMany({
      where: {
        content: { contains: q, mode: "insensitive" },
      },
      include: { article: { include: { document: true } } },
      take: 30,
    });

    for (const c of clauses) {
      results.push({
        canonicalId: c.canonicalId,
        entityType: "clause",
        title: `Khoản ${c.clauseNumber}, Điều ${c.article.articleNumber}`,
        content: c.content,
        url: buildSourceUrl({
          docSlug: c.article.document.slug,
          year: c.article.document.year,
          articleNumber: c.article.articleNumber,
          clauseNumber: c.clauseNumber,
        }),
        documentTitle: c.article.document.title,
      });
    }
  }

  if (!type || type === "point") {
    const points = await prisma.point.findMany({
      where: {
        content: { contains: q, mode: "insensitive" },
      },
      include: {
        clause: { include: { article: { include: { document: true } } } },
      },
      take: 30,
    });

    for (const p of points) {
      results.push({
        canonicalId: p.canonicalId,
        entityType: "point",
        title: `Điểm ${p.pointLetter}, Khoản ${p.clause.clauseNumber}, Điều ${p.clause.article.articleNumber}`,
        content: p.content,
        url: buildSourceUrl({
          docSlug: p.clause.article.document.slug,
          year: p.clause.article.document.year,
          articleNumber: p.clause.article.articleNumber,
          clauseNumber: p.clause.clauseNumber,
          pointLetter: p.pointLetter,
        }),
        documentTitle: p.clause.article.document.title,
      });
    }
  }

  return results;
}

function highlightMatch(text: string, query: string): string {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(
    new RegExp(`(${escaped})`, "gi"),
    "<mark>$1</mark>",
  );
}

function getSnippet(content: string, query: string, contextLen = 80): string {
  const lower = content.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return content.substring(0, 200);
  const start = Math.max(0, idx - contextLen);
  const end = Math.min(content.length, idx + query.length + contextLen);
  let snippet = content.substring(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < content.length) snippet = snippet + "...";
  return snippet;
}

const TYPE_LABELS: Record<string, string> = {
  article: "Điều",
  clause: "Khoản",
  point: "Điểm",
};

export default async function SearchPage({ searchParams }: Props) {
  const { q, type } = await searchParams;
  const query = q?.trim() || "";
  const results = query.length >= 2 ? await search(query, type) : [];

  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-16 pb-24">
      {/* Breadcrumb */}
      <nav className="mb-8 text-xs text-gray-400">
        <Link href="/" className="hover:text-gray-600 transition-colors">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-600">Search</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
        Search
      </h1>

      {/* Search form */}
      <form action="/search" method="get" className="mt-6 flex gap-3">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search articles, clauses, points..."
          className="flex-1 rounded-lg border border-gray-200 bg-gray-50 py-2.5 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-300 focus:bg-white focus:ring-1 focus:ring-gray-300 transition-colors"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-black transition-colors"
        >
          Search
        </button>
      </form>

      {/* Type filter */}
      {query && (
        <div className="mt-4 flex gap-2">
          {[
            { value: "", label: "All" },
            { value: "article", label: "Articles" },
            { value: "clause", label: "Clauses" },
            { value: "point", label: "Points" },
          ].map((f) => {
            const isActive = (type || "") === f.value;
            return (
              <Link
                key={f.value}
                href={`/search?q=${encodeURIComponent(query)}${f.value ? `&type=${f.value}` : ""}`}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Results */}
      {query && (
        <div className="mt-8">
          <p className="text-xs text-gray-400 mb-6">
            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>

          {results.length === 0 ? (
            <p className="text-sm text-gray-500">
              No results found. Try a different search term.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {results.map((result) => {
                const snippet = getSnippet(result.content, query);
                return (
                  <li key={result.canonicalId}>
                    <Link
                      href={result.url}
                      className="group block py-5 -mx-4 px-4 rounded-lg transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gray-500">
                          {TYPE_LABELS[result.entityType] || result.entityType}
                        </span>
                        <span className="text-xs text-gray-400">
                          {result.documentTitle}
                        </span>
                      </div>
                      <h2 className="text-sm font-semibold text-gray-900 group-hover:text-black">
                        {result.title}
                      </h2>
                      <p
                        className="mt-1 text-xs text-gray-500 leading-relaxed line-clamp-2 [&>mark]:bg-yellow-200 [&>mark]:text-gray-900 [&>mark]:px-0.5 [&>mark]:rounded"
                        dangerouslySetInnerHTML={{
                          __html: highlightMatch(snippet, query),
                        }}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {!query && (
        <p className="mt-12 text-sm text-gray-400">
          Enter a search term to find articles, clauses, and points across Vietnamese legal documents.
        </p>
      )}
    </section>
  );
}
