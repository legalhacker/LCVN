import type { MetadataEntry } from "@/types/legal";

interface MetadataBlockProps {
  canonicalId: string;
  entityType: string;
  documentTitle: string;
  documentNumber: string;
  issuingBody: string;
  issuedDate: string;
  effectiveDate: string;
  status: string;
  chapter?: string | null;
  section?: string | null;
  extraMetadata?: MetadataEntry[];
}

export default function MetadataBlock({
  canonicalId,
  entityType,
  documentTitle,
  documentNumber,
  issuingBody,
  issuedDate,
  effectiveDate,
  status,
  chapter,
  section,
  extraMetadata,
}: MetadataBlockProps) {
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

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Thông tin nguồn
        </h2>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`}
        >
          {statusLabels[status] || status}
        </span>
      </div>

      <table className="w-full text-sm">
        <tbody>
          <Row label="Canonical ID" value={canonicalId} mono />
          <Row label="Loại" value={entityType} />
          <Row label="Văn bản" value={documentTitle} />
          <Row label="Số hiệu" value={documentNumber} />
          <Row label="Cơ quan ban hành" value={issuingBody} />
          <Row label="Ngày ban hành" value={issuedDate} />
          <Row label="Ngày hiệu lực" value={effectiveDate} />
          {chapter && <Row label="Chương" value={chapter} />}
          {section && <Row label="Mục" value={section} />}
          {extraMetadata?.map((m) => (
            <Row key={m.key} label={m.key} value={m.value} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <tr className="border-t border-gray-100">
      <td className="py-1.5 pr-4 text-gray-500 whitespace-nowrap">{label}</td>
      <td className={`py-1.5 text-gray-900 ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </td>
    </tr>
  );
}
