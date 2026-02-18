import Link from "next/link";

interface ContextualInsightProps {
  fields: string[];
  relatedChanges: { headline: string; slug: string }[];
  relatedDocuments: { title: string; slug: string; documentType: string }[];
}

const docTypeLabels: Record<string, string> = {
  luat: "Luật",
  nghi_dinh: "Nghị định",
  thong_tu: "Thông tư",
  quyet_dinh: "Quyết định",
};

export default function ContextualInsightPanel({
  fields,
  relatedChanges,
  relatedDocuments,
}: ContextualInsightProps) {
  return (
    <aside className="hidden xl:block w-72 shrink-0 border-l border-gray-200 bg-gray-50/50 overflow-y-auto">
      <div className="p-5 space-y-6">
        {/* Header */}
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          Insight
        </h3>

        {/* Fields */}
        {fields.length > 0 && (
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Lĩnh vực
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {fields.map((field) => (
                <span
                  key={field}
                  className="rounded-full bg-white border border-gray-200 px-2.5 py-1 text-[11px] text-gray-600"
                >
                  {field}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Related changes */}
        {relatedChanges.length > 0 && (
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Thay đổi tương tự
            </h3>
            <div className="space-y-2">
              {relatedChanges.map((c) => (
                <Link
                  key={c.slug}
                  href={`/thay-doi/${c.slug}`}
                  className="block rounded-lg bg-white border border-gray-200 p-3 hover:border-gray-300 transition-colors"
                >
                  <p className="text-xs font-medium text-gray-800 leading-snug line-clamp-2">
                    {c.headline}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related documents */}
        {relatedDocuments.length > 0 && (
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Văn bản liên quan
            </h3>
            <div className="space-y-2">
              {relatedDocuments.map((d) => (
                <Link
                  key={d.slug}
                  href={`/doc/${d.slug}`}
                  className="block rounded-lg bg-white border border-gray-200 p-3 hover:border-gray-300 transition-colors"
                >
                  <p className="text-xs font-medium text-gray-800 leading-snug line-clamp-2">
                    {d.title}
                  </p>
                  <p className="mt-1 text-[10px] text-gray-400">
                    {docTypeLabels[d.documentType] || d.documentType}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}
