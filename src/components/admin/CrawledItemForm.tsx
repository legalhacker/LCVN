"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface CrawledItemData {
  id?: string;
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  publishDate: string;
  documentType: string;
  isDraft: boolean;
  legalFields: string[];
  affectedSubjects: string[];
  consultationStartDate: string;
  consultationEndDate: string;
  draftingAuthority: string;
  expectedApprovalTime: string;
  reviewStatus: string;
  editedTitle: string;
  editedSummary: string;
  adminNotes: string;
  rawHtml: string;
}

interface Props {
  initialData?: CrawledItemData;
}

const DOCUMENT_TYPES = [
  { value: "law", label: "Luật / Văn bản" },
  { value: "amendment", label: "Sửa đổi / Bổ sung" },
  { value: "draft", label: "Dự thảo" },
  { value: "policy_direction", label: "Định hướng chính sách" },
];

const REVIEW_STATUSES = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "reviewed", label: "Đã xem xét" },
  { value: "published", label: "Đã xuất bản" },
  { value: "rejected", label: "Từ chối" },
];

export default function CrawledItemForm({ initialData }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showRawHtml, setShowRawHtml] = useState(false);

  const isEdit = !!initialData?.id;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const body: Record<string, unknown> = {
      title: form.get("title"),
      summary: form.get("summary") || null,
      sourceUrl: form.get("sourceUrl"),
      sourceName: form.get("sourceName"),
      documentType: form.get("documentType"),
      isDraft: form.get("isDraft") === "on",
      legalFields: (form.get("legalFields") as string || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      affectedSubjects: (form.get("affectedSubjects") as string || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      publishDate: form.get("publishDate") || null,
      consultationStartDate: form.get("consultationStartDate") || null,
      consultationEndDate: form.get("consultationEndDate") || null,
      draftingAuthority: form.get("draftingAuthority") || null,
      expectedApprovalTime: form.get("expectedApprovalTime") || null,
      reviewStatus: form.get("reviewStatus"),
      editedTitle: form.get("editedTitle") || null,
      editedSummary: form.get("editedSummary") || null,
      adminNotes: form.get("adminNotes") || null,
    };

    const url = isEdit
      ? `/api/admin/crawled-items/${initialData.id}`
      : "/api/admin/crawled-items";

    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save");
      setSaving(false);
      return;
    }

    router.push("/admin/crawled-items");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {/* Section 1: Nội dung gốc */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Nội dung gốc</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Tiêu đề *</label>
            <input
              name="title"
              required
              defaultValue={initialData?.title}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Tóm tắt</label>
            <textarea
              name="summary"
              rows={3}
              defaultValue={initialData?.summary}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">URL nguồn *</label>
            <input
              name="sourceUrl"
              required
              defaultValue={initialData?.sourceUrl}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên nguồn *</label>
            <input
              name="sourceName"
              required
              defaultValue={initialData?.sourceName}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="vnexpress, xaydungchinhsach, duthaoonline..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày xuất bản</label>
            <input
              name="publishDate"
              type="datetime-local"
              defaultValue={initialData?.publishDate?.slice(0, 16)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          {initialData?.sourceUrl && (
            <div className="flex items-end">
              <a
                href={initialData.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-blue-600 hover:bg-gray-50"
              >
                Xem bài gốc &rarr;
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Section 2: Phân loại */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Phân loại</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Loại văn bản</label>
            <select
              name="documentType"
              defaultValue={initialData?.documentType || "law"}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isDraft"
                defaultChecked={initialData?.isDraft}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Là dự thảo</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lĩnh vực pháp luật (phân cách bằng dấu phẩy)
            </label>
            <input
              name="legalFields"
              defaultValue={initialData?.legalFields?.join(", ")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Doanh nghiệp, Thuế, Lao động..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Đối tượng ảnh hưởng (phân cách bằng dấu phẩy)
            </label>
            <input
              name="affectedSubjects"
              defaultValue={initialData?.affectedSubjects?.join(", ")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Doanh nghiệp, Người lao động, Cá nhân..."
            />
          </div>
        </div>
      </section>

      {/* Section 3: Thông tin dự thảo */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Thông tin dự thảo</h2>
        <p className="mb-4 text-xs text-gray-500">
          Chỉ áp dụng cho văn bản dạng dự thảo
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu lấy ý kiến</label>
            <input
              name="consultationStartDate"
              type="date"
              defaultValue={initialData?.consultationStartDate?.slice(0, 10)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày kết thúc lấy ý kiến</label>
            <input
              name="consultationEndDate"
              type="date"
              defaultValue={initialData?.consultationEndDate?.slice(0, 10)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cơ quan soạn thảo</label>
            <input
              name="draftingAuthority"
              defaultValue={initialData?.draftingAuthority}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Thời gian dự kiến thông qua</label>
            <input
              name="expectedApprovalTime"
              defaultValue={initialData?.expectedApprovalTime}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Quý 2/2026, Kỳ họp thứ 11..."
            />
          </div>
        </div>
      </section>

      {/* Section 4: Xét duyệt */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Xét duyệt</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Trạng thái xét duyệt</label>
            <select
              name="reviewStatus"
              defaultValue={initialData?.reviewStatus || "pending"}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {REVIEW_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Tiêu đề đã chỉnh sửa</label>
            <input
              name="editedTitle"
              defaultValue={initialData?.editedTitle}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Để trống nếu giữ nguyên tiêu đề gốc"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Tóm tắt đã chỉnh sửa</label>
            <textarea
              name="editedSummary"
              rows={3}
              defaultValue={initialData?.editedSummary}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Để trống nếu giữ nguyên tóm tắt gốc"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Ghi chú admin</label>
            <textarea
              name="adminNotes"
              rows={3}
              defaultValue={initialData?.adminNotes}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Raw HTML toggle */}
        {initialData?.rawHtml && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowRawHtml(!showRawHtml)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showRawHtml ? "Ẩn HTML gốc" : "Xem HTML gốc"}
            </button>
            {showRawHtml && (
              <pre className="mt-2 max-h-64 overflow-auto rounded border border-gray-200 bg-gray-50 p-3 text-xs">
                {initialData.rawHtml.slice(0, 5000)}
                {initialData.rawHtml.length > 5000 && "\n...(truncated)"}
              </pre>
            )}
          </div>
        )}
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
