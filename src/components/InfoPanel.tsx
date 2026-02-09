import Link from "next/link";
import type { Relationship, MetadataEntry } from "@/types/legal";
import { getRelationshipLabel, getEntityTypeLabel } from "@/lib/legal-utils";

interface InfoPanelProps {
  canonicalId: string;
  documentTitle: string;
  documentNumber: string;
  issuingBody: string;
  issuedDate: string;
  effectiveDate: string;
  status: string;
  chapter?: string | null;
  section?: string | null;
  extraMetadata?: MetadataEntry[];
  relationships: Relationship[];
  docSlug: string;
  year: number;
}

const statusLabels: Record<string, string> = {
  active: "Còn hiệu lực",
  amended: "Đã sửa đổi",
  repealed: "Hết hiệu lực",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  amended: "bg-yellow-100 text-yellow-800",
  repealed: "bg-red-100 text-red-800",
};

export default function InfoPanel({
  canonicalId,
  documentTitle,
  documentNumber,
  issuingBody,
  issuedDate,
  effectiveDate,
  status,
  chapter,
  section,
  extraMetadata,
  relationships,
  docSlug,
  year,
}: InfoPanelProps) {
  const grouped = relationships.reduce(
    (acc, rel) => {
      const key = rel.relationshipType;
      if (!acc[key]) acc[key] = [];
      acc[key].push(rel);
      return acc;
    },
    {} as Record<string, Relationship[]>,
  );

  return (
    <aside className="fixed top-0 right-0 bottom-0 w-80 bg-white border-l border-gray-200 shadow-lg translate-x-full peer-checked:translate-x-0 transition-transform duration-200 overflow-y-auto z-40">
      {/* Close button */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">Thông tin pháp lý</span>
        <label
          htmlFor="info-toggle"
          className="cursor-pointer text-gray-400 hover:text-gray-600 p-1"
          aria-label="Đóng"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </label>
      </div>

      <div className="p-4 space-y-5">
        {/* Status badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 uppercase tracking-wide">Trạng thái</span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>
            {statusLabels[status] || status}
          </span>
        </div>

        {/* Canonical ID */}
        <div>
          <span className="text-xs text-gray-400 uppercase tracking-wide block mb-1">Canonical ID</span>
          <code className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded block break-all">
            {canonicalId}
          </code>
        </div>

        {/* Metadata table */}
        <div>
          <span className="text-xs text-gray-400 uppercase tracking-wide block mb-2">Thông tin văn bản</span>
          <dl className="space-y-2 text-sm">
            <MetaRow label="Văn bản" value={documentTitle} />
            <MetaRow label="Số hiệu" value={documentNumber} />
            <MetaRow label="Cơ quan ban hành" value={issuingBody} />
            <MetaRow label="Ngày ban hành" value={issuedDate} />
            <MetaRow label="Ngày hiệu lực" value={effectiveDate} />
            {chapter && <MetaRow label="Chương" value={chapter} />}
            {section && <MetaRow label="Mục" value={section} />}
            {extraMetadata?.map((m) => (
              <MetaRow key={m.key} label={m.key} value={m.value} />
            ))}
          </dl>
        </div>

        {/* Relationships */}
        {relationships.length > 0 && (
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wide block mb-2">Liên kết pháp lý</span>
            <div className="space-y-3">
              {Object.entries(grouped).map(([type, rels]) => (
                <div key={type}>
                  <span className="text-xs font-medium text-gray-500 block mb-1">
                    {getRelationshipLabel(type)}
                  </span>
                  <ul className="space-y-1">
                    {rels.map((rel) => {
                      const isSource = rel.sourceCanonicalId === canonicalId;
                      const targetId = isSource ? rel.targetCanonicalId : rel.sourceCanonicalId;
                      const targetType = isSource ? rel.targetType : rel.sourceType;
                      // Parse article number from canonical ID for link
                      const artMatch = targetId.match(/_D(\d+)/);
                      const targetUrl = artMatch
                        ? `/luat/${docSlug}/${year}/dieu-${artMatch[1]}`
                        : "#";

                      return (
                        <li key={rel.id}>
                          <Link
                            href={targetUrl}
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline block"
                          >
                            <span className="text-gray-400 text-xs mr-1">
                              [{getEntityTypeLabel(targetType)}]
                            </span>
                            {rel.description || targetId}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-gray-500 shrink-0">{label}</dt>
      <dd className="text-gray-900 text-right">{value}</dd>
    </div>
  );
}
