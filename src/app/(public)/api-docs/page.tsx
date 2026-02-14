import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation – LCVN",
  description:
    "REST API reference for the LCVN Vietnamese legal database. Query documents, articles, clauses, points, relationships, and full-text search.",
  openGraph: {
    title: "API Documentation – LCVN",
    description: "REST API reference for the LCVN Vietnamese legal database.",
    url: "/api-docs",
  },
};

const BASE = "/api/v1";

interface Endpoint {
  method: string;
  path: string;
  title: string;
  description: string;
  params: { name: string; in: string; required: boolean; description: string }[];
  exampleUrl: string;
  responseShape: string;
}

const endpoints: Endpoint[] = [
  {
    method: "GET",
    path: `${BASE}/documents`,
    title: "List documents",
    description:
      "Returns all legal documents ordered by year descending. Each entry includes canonical ID, title, document number, type, issuing body, dates, slug, and status.",
    params: [],
    exampleUrl: `${BASE}/documents`,
    responseShape: `{
  "data": [
    {
      "canonicalId": "VN_LLD_2019",
      "title": "Bộ luật Lao động",
      "documentNumber": "45/2019/QH14",
      "documentType": "luat",
      "issuingBody": "Quốc hội",
      "issuedDate": "2019-11-20",
      "effectiveDate": "2021-01-01",
      "slug": "bo-luat-lao-dong",
      "year": 2019,
      "status": "active"
    }
  ]
}`,
  },
  {
    method: "GET",
    path: `${BASE}/documents?canonicalId={id}`,
    title: "Get single document",
    description:
      "Returns a single document by its canonical ID, including its article list, metadata, relationships, and JSON-LD structured data.",
    params: [
      {
        name: "canonicalId",
        in: "query",
        required: true,
        description:
          'Canonical ID of the document, e.g. "VN_LLD_2019"',
      },
    ],
    exampleUrl: `${BASE}/documents?canonicalId=VN_LLD_2019`,
    responseShape: `{
  "data": {
    "canonicalId": "VN_LLD_2019",
    "title": "Bộ luật Lao động",
    "documentNumber": "45/2019/QH14",
    "documentType": "luat",
    "issuingBody": "Quốc hội",
    "issuedDate": "2019-11-20",
    "effectiveDate": "2021-01-01",
    "slug": "bo-luat-lao-dong",
    "year": 2019,
    "status": "active",
    "articles": [
      { "canonicalId": "VN_LLD_2019_D1", "articleNumber": 1, "title": "Phạm vi điều chỉnh" }
    ]
  },
  "canonical_id": "VN_LLD_2019",
  "canonical_url": "/doc/bo-luat-lao-dong/2019",
  "metadata": [
    { "key": "language", "value": "vi" }
  ],
  "relationships": [],
  "json_ld": { "@context": "https://schema.org", "@type": "Legislation", "..." : "..." }
}`,
  },
  {
    method: "GET",
    path: `${BASE}/articles/{canonicalId}`,
    title: "Get article",
    description:
      "Returns a single article by canonical ID with its full clause/point hierarchy, parent document metadata, relationships, and JSON-LD.",
    params: [
      {
        name: "canonicalId",
        in: "path",
        required: true,
        description:
          'Canonical ID of the article, e.g. "VN_LLD_2019_D35"',
      },
    ],
    exampleUrl: `${BASE}/articles/VN_LLD_2019_D35`,
    responseShape: `{
  "data": {
    "id": "uuid",
    "canonicalId": "VN_LLD_2019_D35",
    "articleNumber": 35,
    "title": "Quyền đơn phương chấm dứt hợp đồng lao động của người lao động",
    "content": "Full article text...",
    "chapter": "Chương III",
    "section": "Mục 4",
    "document": {
      "canonicalId": "VN_LLD_2019",
      "title": "Bộ luật Lao động",
      "documentNumber": "45/2019/QH14",
      "..."
    },
    "clauses": [
      {
        "canonicalId": "VN_LLD_2019_D35_K1",
        "clauseNumber": 1,
        "content": "Clause text...",
        "points": [
          {
            "canonicalId": "VN_LLD_2019_D35_K1_A",
            "pointLetter": "a",
            "content": "Point text..."
          }
        ]
      }
    ]
  },
  "canonical_id": "VN_LLD_2019_D35",
  "canonical_url": "/luat/bo-luat-lao-dong/2019/dieu-35",
  "metadata": [],
  "relationships": [],
  "json_ld": { "@context": "https://schema.org", "@type": "Legislation", "..." : "..." }
}`,
  },
  {
    method: "GET",
    path: `${BASE}/relationships/{canonicalId}`,
    title: "Get relationships",
    description:
      "Returns all legal relationships where the given canonical ID appears as source or target. Useful for finding amendments, replacements, references, and implementing regulations.",
    params: [
      {
        name: "canonicalId",
        in: "path",
        required: true,
        description:
          'Canonical ID of any legal entity, e.g. "VN_LLD_2019_D35"',
      },
    ],
    exampleUrl: `${BASE}/relationships/VN_LLD_2019_D35`,
    responseShape: `{
  "canonical_id": "VN_LLD_2019_D35",
  "relationships": [
    {
      "id": "uuid",
      "sourceType": "article",
      "sourceCanonicalId": "VN_BLDS_2015_D385",
      "targetType": "article",
      "targetCanonicalId": "VN_LLD_2019_D35",
      "relationshipType": "related_to",
      "description": "General contract principles apply to labor contracts",
      "effectiveDate": null
    }
  ]
}`,
  },
  {
    method: "GET",
    path: `${BASE}/search`,
    title: "Full-text search",
    description:
      "Searches across articles, clauses, and points using case-insensitive matching. Returns matching entities with canonical URLs and parent document context. Query must be at least 2 characters.",
    params: [
      {
        name: "q",
        in: "query",
        required: true,
        description: "Search query (min 2 characters). Supports Vietnamese diacritics.",
      },
      {
        name: "type",
        in: "query",
        required: false,
        description:
          'Filter by entity type: "article", "clause", or "point". Omit to search all types.',
      },
    ],
    exampleUrl: `${BASE}/search?q=lao+động`,
    responseShape: `{
  "query": "lao động",
  "total": 15,
  "results": [
    {
      "canonical_id": "VN_LLD_2019_D1",
      "entity_type": "article",
      "title": "Điều 1. Phạm vi điều chỉnh",
      "content": "First 200 characters of matching text...",
      "canonical_url": "/luat/bo-luat-lao-dong/2019/dieu-1",
      "document_title": "Bộ luật Lao động"
    }
  ]
}`,
  },
];

function ParamBadge({ type }: { type: string }) {
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
        type === "path"
          ? "bg-blue-100 text-blue-800"
          : "bg-green-100 text-green-800"
      }`}
    >
      {type}
    </span>
  );
}

function EndpointCard({ ep }: { ep: Endpoint }) {
  return (
    <section
      id={ep.title.toLowerCase().replace(/\s+/g, "-")}
      className="rounded-lg border border-gray-200 bg-white"
    >
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="rounded bg-emerald-600 px-2 py-1 text-xs font-bold text-white">
            {ep.method}
          </span>
          <code className="text-sm text-gray-800">{ep.path}</code>
        </div>
        <h3 className="mt-2 text-lg font-semibold text-gray-900">{ep.title}</h3>
        <p className="mt-1 text-sm text-gray-600">{ep.description}</p>
      </div>

      {/* Parameters */}
      {ep.params.length > 0 && (
        <div className="border-b border-gray-200 px-6 py-4">
          <h4 className="mb-3 text-sm font-semibold text-gray-700">
            Parameters
          </h4>
          <div className="space-y-3">
            {ep.params.map((p) => (
              <div key={p.name} className="flex items-start gap-3">
                <code className="mt-0.5 rounded bg-gray-100 px-1.5 py-0.5 text-sm font-medium text-gray-800">
                  {p.name}
                </code>
                <ParamBadge type={p.in} />
                {p.required && (
                  <span className="mt-0.5 text-xs font-medium text-red-600">
                    required
                  </span>
                )}
                <span className="text-sm text-gray-600">{p.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Example request */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h4 className="mb-2 text-sm font-semibold text-gray-700">
          Example request
        </h4>
        <pre className="overflow-x-auto rounded bg-gray-900 p-3 text-sm text-green-400">
          <code>curl {ep.exampleUrl}</code>
        </pre>
      </div>

      {/* Response shape */}
      <div className="px-6 py-4">
        <h4 className="mb-2 text-sm font-semibold text-gray-700">
          Response
        </h4>
        <pre className="overflow-x-auto rounded bg-gray-900 p-3 text-sm text-gray-300">
          <code>{ep.responseShape}</code>
        </pre>
      </div>
    </section>
  );
}

export default function ApiDocsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
      <p className="mt-2 text-gray-600">
        REST API for querying Vietnamese legal documents, articles, clauses,
        points, and their relationships.
      </p>

      {/* Quick info */}
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 px-6 py-4">
        <h2 className="text-sm font-semibold text-blue-900">Base URL</h2>
        <code className="text-sm text-blue-800">/api/v1</code>
        <div className="mt-3 space-y-1 text-sm text-blue-800">
          <p>All endpoints return JSON. All requests use the GET method.</p>
          <p>
            Canonical IDs follow the pattern:{" "}
            <code className="rounded bg-blue-100 px-1 py-0.5">
              VN_LLD_2019_D35_K1_A
            </code>{" "}
            where D = Điều (article), K = Khoản (clause), letter = Điểm (point).
          </p>
        </div>
      </div>

      {/* Table of contents */}
      <nav className="mt-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Endpoints
        </h2>
        <ul className="mt-2 space-y-1">
          {endpoints.map((ep) => (
            <li key={ep.title}>
              <a
                href={`#${ep.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {ep.method}
                </span>
                <code className="text-gray-600">{ep.path}</code>
                <span className="text-gray-400">—</span>
                <span>{ep.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Canonical ID reference */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-gray-900">Canonical ID Format</h2>
        <p className="mt-2 text-sm text-gray-600">
          Every legal entity has a unique canonical ID that encodes its position
          in the document hierarchy.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-2 pr-4 font-semibold text-gray-700">Level</th>
                <th className="pb-2 pr-4 font-semibold text-gray-700">Pattern</th>
                <th className="pb-2 font-semibold text-gray-700">Example</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4">Document</td>
                <td className="py-2 pr-4">
                  <code>VN_{'{prefix}'}_{'{year}'}</code>
                </td>
                <td className="py-2">
                  <code>VN_LLD_2019</code>
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4">Article (Điều)</td>
                <td className="py-2 pr-4">
                  <code>...D{'{n}'}</code>
                </td>
                <td className="py-2">
                  <code>VN_LLD_2019_D35</code>
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4">Clause (Khoản)</td>
                <td className="py-2 pr-4">
                  <code>...K{'{n}'}</code>
                </td>
                <td className="py-2">
                  <code>VN_LLD_2019_D35_K1</code>
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Point (Điểm)</td>
                <td className="py-2 pr-4">
                  <code>...{'{LETTER}'}</code>
                </td>
                <td className="py-2">
                  <code>VN_LLD_2019_D35_K1_A</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Relationship types */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-gray-900">Relationship Types</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-2 pr-4 font-semibold text-gray-700">Type</th>
                <th className="pb-2 pr-4 font-semibold text-gray-700">Vietnamese</th>
                <th className="pb-2 font-semibold text-gray-700">Description</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4"><code>amended_by</code></td>
                <td className="py-2 pr-4">Được sửa đổi bởi</td>
                <td className="py-2">Source was amended by target</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4"><code>replaces</code></td>
                <td className="py-2 pr-4">Thay thế</td>
                <td className="py-2">Source replaces target</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4"><code>related_to</code></td>
                <td className="py-2 pr-4">Liên quan đến</td>
                <td className="py-2">Bidirectional topical relationship</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4"><code>references</code></td>
                <td className="py-2 pr-4">Tham chiếu</td>
                <td className="py-2">Source explicitly references target</td>
              </tr>
              <tr>
                <td className="py-2 pr-4"><code>implements</code></td>
                <td className="py-2 pr-4">Hướng dẫn thi hành</td>
                <td className="py-2">Source implements/guides target</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Error responses */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-gray-900">Error Responses</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <code className="rounded bg-red-100 px-1.5 py-0.5 font-medium text-red-800">400</code>
            <span className="text-gray-600">
              Invalid or missing required parameters. Returns{" "}
              <code>{`{"error": "message"}`}</code>.
            </span>
          </div>
          <div className="flex items-start gap-3">
            <code className="rounded bg-red-100 px-1.5 py-0.5 font-medium text-red-800">404</code>
            <span className="text-gray-600">
              Entity not found. Returns{" "}
              <code>{`{"error": "Document not found"}`}</code> or{" "}
              <code>{`{"error": "Article not found"}`}</code>.
            </span>
          </div>
        </div>
      </section>

      {/* Endpoint cards */}
      <div className="mt-10 space-y-6">
        {endpoints.map((ep) => (
          <EndpointCard key={ep.title} ep={ep} />
        ))}
      </div>
    </main>
  );
}
