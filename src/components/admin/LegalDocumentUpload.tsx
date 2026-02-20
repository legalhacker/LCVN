"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ParsedDocument, ParseResult } from "@/lib/parsers/types";

type Step = "upload" | "preview";

const DOC_TYPE_LABELS: Record<string, string> = {
  luat: "Luật",
  nghi_dinh: "Nghị định",
  thong_tu: "Thông tư",
  quyet_dinh: "Quyết định",
};

export default function LegalDocumentUpload() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError("");
    setParseResult(null);
    setStep("upload");
  }

  async function handleParse() {
    if (!file) return;
    setParsing(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/legal-documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Parse failed");
        return;
      }

      setParseResult(data as ParseResult);
      if (data.success) {
        setStep("preview");
      }
    } catch {
      setError("Network error during parse");
    } finally {
      setParsing(false);
    }
  }

  async function handleSave() {
    if (!parseResult?.document) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/legal-documents/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: parseResult.document }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Save failed");
        setSaving(false);
        return;
      }

      router.push("/admin/legal-documents");
      router.refresh();
    } catch {
      setError("Network error during save");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {/* Parse errors */}
      {parseResult && !parseResult.success && parseResult.errors.length > 0 && (
        <div className="rounded bg-red-50 p-4">
          <h3 className="text-sm font-medium text-red-800">Parse errors:</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-red-700">
            {parseResult.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Upload JSON</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">File (.json)</label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleParse}
              disabled={!file || parsing}
              className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {parsing ? "Parsing..." : "Parse & Preview"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === "preview" && parseResult?.document && (
        <PreviewPanel
          document={parseResult.document}
          warnings={parseResult.warnings}
          saving={saving}
          onSave={handleSave}
          onBack={() => setStep("upload")}
        />
      )}
    </div>
  );
}

function PreviewPanel({
  document: doc,
  warnings,
  saving,
  onSave,
  onBack,
}: {
  document: ParsedDocument;
  warnings: string[];
  saving: boolean;
  onSave: () => void;
  onBack: () => void;
}) {
  const totalClauses = doc.articles.reduce((sum, a) => sum + a.clauses.length, 0);
  const totalPoints = doc.articles.reduce(
    (sum, a) => sum + a.clauses.reduce((s, c) => s + c.points.length, 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="rounded bg-yellow-50 p-4">
          <h3 className="text-sm font-medium text-yellow-800">Warnings:</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-yellow-700">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary card */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">{doc.title}</h2>
        <div className="grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
          <div><span className="font-medium text-gray-900">Canonical ID:</span> {doc.canonicalId}</div>
          <div><span className="font-medium text-gray-900">Document #:</span> {doc.documentNumber}</div>
          <div><span className="font-medium text-gray-900">Type:</span> {DOC_TYPE_LABELS[doc.documentType] || doc.documentType}</div>
          <div><span className="font-medium text-gray-900">Issuing Body:</span> {doc.issuingBody}</div>
          <div><span className="font-medium text-gray-900">Issued:</span> {doc.issuedDate}</div>
          <div><span className="font-medium text-gray-900">Effective:</span> {doc.effectiveDate}</div>
          <div><span className="font-medium text-gray-900">Slug:</span> {doc.slug}</div>
          <div><span className="font-medium text-gray-900">Year:</span> {doc.year}</div>
        </div>
        <div className="mt-4 flex gap-4 border-t pt-4 text-sm">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800">
            {doc.articles.length} Điều
          </span>
          <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">
            {totalClauses} Khoản
          </span>
          <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-800">
            {totalPoints} Điểm
          </span>
        </div>
      </div>

      {/* Document tree */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Content Preview</h3>
        <div className="space-y-1">
          {doc.articles.map((art) => (
            <details key={art.articleNumber} className="group">
              <summary className="cursor-pointer rounded px-2 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50">
                Điều {art.articleNumber}.{" "}
                {art.title || "(không có tiêu đề)"}
                {art.chapter && (
                  <span className="ml-2 text-xs text-gray-400">[{art.chapter}]</span>
                )}
                <span className="ml-2 text-xs text-gray-400">
                  ({art.clauses.length} khoản)
                </span>
              </summary>
              <div className="ml-4 border-l border-gray-200 pl-4">
                {art.content && (
                  <p className="py-1 text-sm text-gray-600">{art.content}</p>
                )}
                {art.clauses.map((cl) => (
                  <details key={cl.clauseNumber} className="group/clause">
                    <summary className="cursor-pointer rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-50">
                      {cl.clauseNumber}. {cl.content.slice(0, 120)}
                      {cl.content.length > 120 ? "..." : ""}
                      {cl.points.length > 0 && (
                        <span className="ml-2 text-xs text-gray-400">
                          ({cl.points.length} điểm)
                        </span>
                      )}
                    </summary>
                    {cl.points.length > 0 && (
                      <div className="ml-4 border-l border-gray-100 pl-4 py-1">
                        {cl.points.map((pt) => (
                          <div key={pt.pointLetter} className="py-0.5 text-sm text-gray-600">
                            {pt.pointLetter}) {pt.content.slice(0, 150)}
                            {pt.content.length > 150 ? "..." : ""}
                          </div>
                        ))}
                      </div>
                    )}
                  </details>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Confirm & Save"}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
      </div>
    </div>
  );
}
