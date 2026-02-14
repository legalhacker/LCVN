"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface LegalDocumentData {
  id?: string;
  title: string;
  canonicalId: string;
  documentNumber: string;
  documentType: string;
  issuingBody: string;
  issuedDate: string;
  effectiveDate: string;
  slug: string;
  year: number;
  status: string;
}

interface Props {
  initialData?: LegalDocumentData;
}

export default function LegalDocumentForm({ initialData }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!initialData?.id;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const body = {
      title: form.get("title"),
      canonicalId: form.get("canonicalId"),
      documentNumber: form.get("documentNumber"),
      documentType: form.get("documentType"),
      issuingBody: form.get("issuingBody"),
      issuedDate: form.get("issuedDate"),
      effectiveDate: form.get("effectiveDate"),
      slug: form.get("slug"),
      year: parseInt(form.get("year") as string),
      status: form.get("status"),
    };

    const url = isEdit
      ? `/api/admin/legal-documents/${initialData.id}`
      : "/api/admin/legal-documents";

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

    router.push("/admin/legal-documents");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input name="title" required defaultValue={initialData?.title}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Canonical ID *</label>
            <input name="canonicalId" required defaultValue={initialData?.canonicalId}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Document Number *</label>
            <input name="documentNumber" required defaultValue={initialData?.documentNumber}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Document Type *</label>
            <select name="documentType" required defaultValue={initialData?.documentType || "luat"}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="luat">Luật</option>
              <option value="nghi_dinh">Nghị định</option>
              <option value="thong_tu">Thông tư</option>
              <option value="quyet_dinh">Quyết định</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Issuing Body *</label>
            <input name="issuingBody" required defaultValue={initialData?.issuingBody}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Issued Date *</label>
            <input name="issuedDate" type="date" required defaultValue={initialData?.issuedDate}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Effective Date *</label>
            <input name="effectiveDate" type="date" required defaultValue={initialData?.effectiveDate}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug *</label>
            <input name="slug" required defaultValue={initialData?.slug}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Year *</label>
            <input name="year" type="number" required defaultValue={initialData?.year}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select name="status" defaultValue={initialData?.status || "active"}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="active">Active</option>
              <option value="amended">Amended</option>
              <option value="repealed">Repealed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
          {saving ? "Saving..." : isEdit ? "Update" : "Create"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
