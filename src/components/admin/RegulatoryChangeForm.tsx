"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Field {
  id: string;
  name: string;
}

interface RegulatoryChangeData {
  id?: string;
  slug: string;
  lawName: string;
  changeType: string;
  legalBasis: string;
  source: string;
  effectiveDate: string;
  headline: string;
  summary: string;
  practicalImpact: string[];
  affectedParties: string[];
  analysisSummary: string;
  comparisonBefore: string;
  comparisonAfter: string;
  timeline: string;
  context: string;
  status: string;
  legalDocumentId: string;
  fieldIds: string[];
}

interface Props {
  initialData?: RegulatoryChangeData;
  fields: Field[];
  legalDocuments: { id: string; title: string }[];
}

export default function RegulatoryChangeForm({ initialData, fields, legalDocuments }: Props) {
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
      slug: form.get("slug"),
      lawName: form.get("lawName"),
      changeType: form.get("changeType"),
      legalBasis: form.get("legalBasis"),
      source: form.get("source"),
      effectiveDate: form.get("effectiveDate"),
      headline: form.get("headline"),
      summary: form.get("summary"),
      practicalImpact: (form.get("practicalImpact") as string).split("\n").filter(Boolean),
      affectedParties: (form.get("affectedParties") as string).split("\n").filter(Boolean),
      analysisSummary: form.get("analysisSummary") || null,
      comparisonBefore: form.get("comparisonBefore") || null,
      comparisonAfter: form.get("comparisonAfter") || null,
      timeline: form.get("timeline") || null,
      context: form.get("context") || null,
      status: form.get("status"),
      legalDocumentId: form.get("legalDocumentId") || null,
      fieldIds: form.getAll("fieldIds"),
    };

    const url = isEdit
      ? `/api/admin/regulatory-changes/${initialData.id}`
      : "/api/admin/regulatory-changes";

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

    router.push("/admin/regulatory-changes");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {/* Section A: Legal Info */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Legal Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Law Name *</label>
            <input name="lawName" required defaultValue={initialData?.lawName}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug *</label>
            <input name="slug" required defaultValue={initialData?.slug}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Change Type *</label>
            <select name="changeType" required defaultValue={initialData?.changeType || "amendment"}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="amendment">Amendment</option>
              <option value="addition">Addition</option>
              <option value="first_codification">First Codification</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Legal Basis *</label>
            <input name="legalBasis" required defaultValue={initialData?.legalBasis}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Source *</label>
            <input name="source" required defaultValue={initialData?.source}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Effective Date *</label>
            <input name="effectiveDate" type="date" required
              defaultValue={initialData?.effectiveDate}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
      </section>

      {/* Section B: Display Content */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Display Content</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Headline *</label>
            <textarea name="headline" required rows={2} defaultValue={initialData?.headline}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Summary *</label>
            <textarea name="summary" required rows={4} defaultValue={initialData?.summary}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Practical Impact (one per line)</label>
            <textarea name="practicalImpact" rows={4}
              defaultValue={initialData?.practicalImpact?.join("\n")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
      </section>

      {/* Section C: Analysis */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Analysis</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Analysis Summary</label>
            <textarea name="analysisSummary" rows={4} defaultValue={initialData?.analysisSummary}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Comparison Before</label>
              <textarea name="comparisonBefore" rows={4} defaultValue={initialData?.comparisonBefore}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Comparison After</label>
              <textarea name="comparisonAfter" rows={4} defaultValue={initialData?.comparisonAfter}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Timeline</label>
            <textarea name="timeline" rows={3} defaultValue={initialData?.timeline}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Context</label>
            <textarea name="context" rows={3} defaultValue={initialData?.context}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
      </section>

      {/* Section D: Classification */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Classification</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fields</label>
            <div className="flex flex-wrap gap-2">
              {fields.map((field) => (
                <label key={field.id} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" name="fieldIds" value={field.id}
                    defaultChecked={initialData?.fieldIds?.includes(field.id)} />
                  {field.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Affected Parties (one per line)</label>
            <textarea name="affectedParties" rows={3}
              defaultValue={initialData?.affectedParties?.join("\n")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
      </section>

      {/* Section E: Status & Links */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Status & Links</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select name="status" defaultValue={initialData?.status || "draft"}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Legal Document</label>
            <select name="legalDocumentId" defaultValue={initialData?.legalDocumentId || ""}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">None</option>
              {legalDocuments.map((doc) => (
                <option key={doc.id} value={doc.id}>{doc.title}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

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
