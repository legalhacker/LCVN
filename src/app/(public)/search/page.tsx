import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q ? `"${q}" - Search - LCVN` : "Search - LCVN";
  return {
    title,
    openGraph: {
      title,
      description: "Search Vietnamese legal regulatory changes.",
      url: "/search",
    },
  };
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

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const results = query.length >= 2
    ? await prisma.regulatoryChange.findMany({
        where: {
          status: "published",
          OR: [
            { headline: { contains: query, mode: "insensitive" } },
            { summary: { contains: query, mode: "insensitive" } },
            { lawName: { contains: query, mode: "insensitive" } },
            { analysisSummary: { contains: query, mode: "insensitive" } },
          ],
        },
        select: { slug: true, headline: true, summary: true, lawName: true },
        take: 30,
      })
    : [];

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
          placeholder="Search regulatory changes..."
          className="flex-1 rounded-lg border border-gray-200 bg-gray-50 py-2.5 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-300 focus:bg-white focus:ring-1 focus:ring-gray-300 transition-colors"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-black transition-colors"
        >
          Search
        </button>
      </form>

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
                const snippet = getSnippet(result.summary, query);
                return (
                  <li key={result.slug}>
                    <Link
                      href={`/thay-doi/${result.slug}`}
                      className="group block py-5 -mx-4 px-4 rounded-lg transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">
                          {result.lawName}
                        </span>
                      </div>
                      <h2 className="text-sm font-semibold text-gray-900 group-hover:text-black">
                        {result.headline}
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
          Enter a search term to find regulatory changes.
        </p>
      )}
    </section>
  );
}
