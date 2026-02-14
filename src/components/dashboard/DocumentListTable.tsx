import Link from "next/link";

interface DocumentRow {
  id: string;
  slug: string;
  title: string;
  documentNumber: string;
  issuingBody: string;
  effectiveDate: Date;
  status: string;
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  active: { label: "Có hiệu lực", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  amended: { label: "Sửa đổi", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  repealed: { label: "Hết hiệu lực", cls: "bg-red-50 text-red-700 border-red-200" },
};

export default function DocumentListTable({
  documents,
  slugToDocPage,
}: {
  documents: DocumentRow[];
  slugToDocPage: Record<string, string>;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="text-left py-2.5 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                Văn bản
              </th>
              <th className="text-left py-2.5 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">
                Số hiệu
              </th>
              <th className="text-left py-2.5 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">
                Cơ quan ban hành
              </th>
              <th className="text-left py-2.5 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">
                Ngày hiệu lực
              </th>
              <th className="text-left py-2.5 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => {
              const docPage = slugToDocPage[doc.slug];
              const badge = STATUS_BADGE[doc.status] || STATUS_BADGE.active;
              return (
                <tr
                  key={doc.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                >
                  <td className="py-3 px-4">
                    <Link
                      href={docPage ? `/document/${docPage}` : `/search?q=${encodeURIComponent(doc.title)}`}
                      className="group"
                    >
                      <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                        {doc.title}
                      </p>
                    </Link>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className="text-xs text-gray-500">
                      {doc.documentNumber}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="text-xs text-gray-500">
                      {doc.issuingBody}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className="text-xs text-gray-500">
                      {doc.effectiveDate.toISOString().split("T")[0]}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
