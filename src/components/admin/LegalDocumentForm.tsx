"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

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

interface ParsedPreview {
  articles: number;
  clauses: number;
  points: number;
}

const DOC_TYPE_MAP: Record<string, string> = {
  LAW: "luat", law: "luat", luat: "luat",
  DECREE: "nghi_dinh", decree: "nghi_dinh", nghi_dinh: "nghi_dinh",
  CIRCULAR: "thong_tu", circular: "thong_tu", thong_tu: "thong_tu",
  DECISION: "quyet_dinh", decision: "quyet_dinh", quyet_dinh: "quyet_dinh",
};

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function num(v: unknown): number {
  return typeof v === "number" ? v : 0;
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function slugify(title: string, year: number): string {
  const s = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return year ? `${s}-${year}` : s;
}

function countContent(obj: Record<string, unknown>): ParsedPreview {
  let articles = 0;
  let clauses = 0;
  let points = 0;

  function countArticle(art: Record<string, unknown>) {
    const raw = art.number ?? art.articleNumber;
    if (raw === undefined || raw === null) return;
    articles++;
    for (const cl of asArray(art.clauses)) {
      const c = cl as Record<string, unknown>;
      if ((c.number ?? c.clauseNumber) == null) continue;
      clauses++;
      for (const pt of asArray(c.points)) {
        const p = pt as Record<string, unknown>;
        if ((p.number ?? p.pointLetter) != null) points++;
      }
    }
  }

  for (const ch of asArray(obj.chapters)) {
    const chapter = ch as Record<string, unknown>;
    for (const art of asArray(chapter.articles))
      countArticle(art as Record<string, unknown>);
    for (const sec of asArray(chapter.sections)) {
      const section = sec as Record<string, unknown>;
      for (const art of asArray(section.articles))
        countArticle(art as Record<string, unknown>);
    }
  }

  for (const art of asArray(obj.articles))
    countArticle(art as Record<string, unknown>);

  return { articles, clauses, points };
}

export default function LegalDocumentForm({ initialData }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedPreview | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isEdit = !!initialData?.id;

  function setFieldValue(name: string, value: string) {
    const form = formRef.current;
    if (!form) return;
    const el = form.elements.namedItem(name);
    if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) {
      el.value = value;
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setJsonFile(null);
      setPreview(null);
      return;
    }

    setError("");
    let obj: Record<string, unknown>;
    try {
      obj = JSON.parse(await file.text());
    } catch {
      setError("Invalid JSON file");
      setJsonFile(null);
      setPreview(null);
      return;
    }

    setJsonFile(file);
    setPreview(countContent(obj));

    // Pre-fill form fields from JSON
    const title = str(obj.title);
    const canonicalId = str(obj.document_id) || str(obj.canonicalId);
    const documentNumber = str(obj.document_number) || str(obj.documentNumber);
    const rawDocType = str(obj.document_type) || str(obj.documentType);
    const documentType = DOC_TYPE_MAP[rawDocType] || "";
    const issuingBody = str(obj.issuing_authority) || str(obj.issuingBody);
    const year = num(obj.year);

    const temporal = (obj.temporal || {}) as Record<string, unknown>;
    const effectiveDate =
      str(obj.effective_date) ||
      str(temporal.effective_from) ||
      str(obj.effectiveDate) ||
      str(obj.signing_date) ||
      "";
    const issuedDate =
      str(obj.signing_date) || str(obj.issuedDate) || effectiveDate;
    const slug = str(obj.slug) || slugify(title, year);

    if (title) setFieldValue("title", title);
    if (canonicalId) setFieldValue("canonicalId", canonicalId);
    if (documentNumber) setFieldValue("documentNumber", documentNumber);
    if (documentType) setFieldValue("documentType", documentType);
    if (issuingBody) setFieldValue("issuingBody", issuingBody);
    if (issuedDate) setFieldValue("issuedDate", issuedDate);
    if (effectiveDate) setFieldValue("effectiveDate", effectiveDate);
    if (slug) setFieldValue("slug", slug);
    if (year) setFieldValue("year", String(year));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const fieldValues = {
      title: form.get("title") as string,
      canonicalId: form.get("canonicalId") as string,
      documentNumber: form.get("documentNumber") as string,
      documentType: form.get("documentType") as string,
      issuingBody: form.get("issuingBody") as string,
      issuedDate: form.get("issuedDate") as string,
      effectiveDate: form.get("effectiveDate") as string,
      slug: form.get("slug") as string,
      year: parseInt(form.get("year") as string),
      status: form.get("status") as string,
    };

    try {
      let res: Response;

      if (isEdit) {
        // Edit mode: JSON PUT
        res = await fetch(`/api/admin/legal-documents/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fieldValues),
        });
      } else if (jsonFile) {
        // Create mode with file: FormData to upload endpoint
        const uploadData = new FormData();
        uploadData.append("file", jsonFile);
        for (const [key, value] of Object.entries(fieldValues)) {
          uploadData.append(key, String(value));
        }
        res = await fetch("/api/admin/legal-documents/upload", {
          method: "POST",
          body: uploadData,
        });
      } else {
        // Create mode without file: JSON POST
        res = await fetch("/api/admin/legal-documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fieldValues),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        setSaving(false);
        return;
      }

      router.push("/admin/legal-documents");
      router.refresh();
    } catch {
      setError("Network error");
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {!isEdit && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            Import from JSON (optional)
          </h2>
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
          />
          {preview && (
            <p className="mt-2 text-sm text-gray-600">
              Found {preview.articles} articles, {preview.clauses} clauses, {preview.points} points
            </p>
          )}
        </div>
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
          {saving ? "Saving..." : isEdit ? "Update" : jsonFile ? "Upload & Create" : "Create"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
