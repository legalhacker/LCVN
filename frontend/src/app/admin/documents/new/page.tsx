'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuthStore } from '@/stores/adminAuth';
import { createAdminApi } from '@/lib/adminApi';
import { DocumentForm, type DocumentFormData } from '../DocumentForm';

// ── JSON Ingest Schema Types ─────────────────────────────────────────────────
// Mirrors the canonical ingest JSON format. Both old and new schemas are supported.

interface JsonClause {
  semantic_id: string;
  clause_number: number;
  legal_text: string;
  plain_summary?: string;
  ai_metadata?: {
    norm_type?: string;
    risk_level?: string;
    applies_to?: string[];
  };
}

interface JsonArticle {
  article_number: number;
  semantic_id?: string;
  title?: string;
  // Legacy format: flat content string
  content?: string;
  // New format: structured clause array (clause-level granularity for AI)
  clauses?: JsonClause[];
  effective_from?: string;
  effective_to?: string;
}

// ── Enum mappers ─────────────────────────────────────────────────────────────

function mapDocType(type: string): string {
  const map: Record<string, string> = {
    law: 'LAW', code: 'CODE', decree: 'DECREE', circular: 'CIRCULAR',
    resolution: 'RESOLUTION', decision: 'DECISION', directive: 'DIRECTIVE', dispatch: 'DISPATCH',
  };
  return map[type?.toLowerCase()] || 'LAW';
}

function mapStatus(status: string): string {
  const map: Record<string, string> = {
    effective: 'EFFECTIVE', expired: 'EXPIRED', draft: 'DRAFT',
    not_yet_effective: 'NOT_YET_EFFECTIVE', partially_expired: 'PARTIALLY_EXPIRED',
  };
  return map[status?.toLowerCase()] || 'EFFECTIVE';
}

export default function NewDocumentPage() {
  const router = useRouter();
  const { token } = useAdminAuthStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // JSON ingest state — articles stay separate from metadata form
  const [jsonArticles, setJsonArticles] = useState<JsonArticle[]>([]);
  const [jsonFileName, setJsonFileName] = useState('');
  const [jsonError, setJsonError] = useState('');

  // formKey forces DocumentForm to remount with new initialData when JSON is parsed
  const [formKey, setFormKey] = useState(0);
  const [prefillData, setPrefillData] = useState<Partial<DocumentFormData>>({});

  // Total clause count across all ingested articles
  const clauseCount = jsonArticles.reduce((sum, a) => sum + (a.clauses?.length || 0), 0);

  // ── Ingest layer ─────────────────────────────────────────────────────────────
  // Parse the uploaded JSON: extract metadata for form pre-fill and articles for storage.
  // Supports both new schema (clauses) and legacy schema (content string).
  function handleJsonFile(file: File) {
    setJsonError('');
    if (!file.name.endsWith('.json')) {
      setJsonError('Chỉ chấp nhận file .json');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        const doc = raw.document || {};
        const ai = raw.ai_metadata || {};
        const rawArticles: JsonArticle[] = Array.isArray(raw.articles) ? raw.articles : [];

        // Validate minimal required fields
        if (!doc.title && !doc.number) {
          setJsonError('JSON thiếu thông tin document (title hoặc number)');
          return;
        }
        if (rawArticles.length === 0) {
          setJsonError('JSON không có articles');
          return;
        }

        // Validate each article has either clauses or content
        for (const a of rawArticles) {
          const hasClauses = Array.isArray(a.clauses) && a.clauses.length > 0;
          const hasContent = typeof a.content === 'string' && a.content.length > 0;
          if (!hasClauses && !hasContent) {
            setJsonError(`Điều ${a.article_number}: cần có "clauses" array hoặc "content" string`);
            return;
          }
        }

        // Map JSON fields → form fields (handles both old and new field names)
        const prefill: Partial<DocumentFormData> = {
          documentNumber: doc.number || '',
          title: doc.title || '',
          titleSlug: doc.slug || '',
          documentType: mapDocType(doc.type || ''),
          // New: "issuing_authority", old: "issuer"
          issuingBody: doc.issuing_authority || doc.issuer || '',
          issuedDate: doc.issue_date || '',
          effectiveDate: doc.effective_date || '',
          // New: "expiry_date", old: no equivalent
          expirationDate: doc.expiry_date || '',
          status: mapStatus(doc.status || ''),
          legalDomains: Array.isArray(ai.legal_domains) ? ai.legal_domains : [],
          // New: "applicable_to", old: "subjects"
          applicableEntities: Array.isArray(ai.applicable_to)
            ? ai.applicable_to
            : Array.isArray(ai.subjects) ? ai.subjects : [],
          keywords: Array.isArray(ai.keywords) ? ai.keywords : [],
          // New: "ai_summary", old: "summary_ai"
          legalSummary: ai.ai_summary || ai.summary_ai || '',
          // New: "plain_summary", old: "summary_human"
          summary: ai.plain_summary || ai.summary_human || '',
          // Stable AI identifier
          semanticId: doc.semantic_id || '',
        };

        setPrefillData(prefill);
        setFormKey(k => k + 1); // remount form with pre-filled values
        setJsonArticles(rawArticles);
        setJsonFileName(file.name);
      } catch {
        setJsonError('Không đọc được JSON — kiểm tra lại định dạng file');
      }
    };
    reader.readAsText(file);
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  // 1. Save document metadata (always)
  // 2. If JSON articles exist, store them as Article + Clause records
  const handleSubmit = async (data: DocumentFormData) => {
    if (!token) return;
    setSaving(true);
    setError('');
    try {
      const api = createAdminApi(token);

      // Step 1: create Document record
      const doc = await api.createDocument(data as unknown as Record<string, unknown>) as { id: string };

      // Step 2: if articles came from JSON ingest, store them (with clauses if present)
      if (jsonArticles.length > 0) {
        await api.ingestJsonArticles(doc.id, jsonArticles);
      }

      router.push(`/admin/documents/${doc.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại');
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '860px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/admin/documents" style={{ color: '#0891b2', textDecoration: 'none', fontSize: '13px' }}>
          ← Danh sách văn bản
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', marginTop: '8px', marginBottom: 0 }}>
          Thêm văn bản mới
        </h1>
      </div>

      {/* ── JSON Ingest Section ──────────────────────────────────────────────────
          Upload a structured .json file to auto-fill the form and store articles/clauses.
          Supports both legacy (article.content) and new clause-level format.
          JSON is the single source of truth — HTML is derived, never stored separately.
      */}
      <div style={{
        backgroundColor: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '24px',
      }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0c4a6e', marginTop: 0, marginBottom: '4px' }}>
          📥 Upload văn bản pháp luật (JSON Ingest – AI Optimized)
        </h2>
        <p style={{ fontSize: '12px', color: '#0369a1', marginTop: 0, marginBottom: '16px' }}>
          Tải lên file .json theo chuẩn ingest. Hỗ trợ cả định dạng có khoản (clauses) để truy cập AI chi tiết.
          Metadata điền tự động vào form — kiểm tra trước khi lưu.
        </p>

        {/* Schema hint */}
        <details style={{ marginBottom: '16px' }}>
          <summary style={{ fontSize: '12px', color: '#0369a1', cursor: 'pointer', fontWeight: 600 }}>
            Xem cấu trúc JSON chuẩn ▾
          </summary>
          <pre style={{
            marginTop: '8px',
            padding: '12px',
            backgroundColor: '#e0f2fe',
            borderRadius: '8px',
            fontSize: '11px',
            color: '#0c4a6e',
            overflow: 'auto',
            lineHeight: 1.5,
          }}>{`{
  "jurisdiction": "VN",
  "document": {
    "semantic_id": "VN_LDN_2020",
    "number": "59/2020/QH14",
    "title": "Luật Doanh nghiệp",
    "type": "law",
    "issuing_authority": "Quốc hội",
    "issue_date": "2020-06-17",
    "effective_date": "2021-01-01",
    "expiry_date": null,
    "status": "effective",
    "slug": "luat-doanh-nghiep"
  },
  "ai_metadata": {
    "legal_domains": ["doanh nghiệp"],
    "applicable_to": ["doanh nghiệp", "cá nhân"],
    "keywords": ["thành lập doanh nghiệp"],
    "ai_summary": "...",
    "plain_summary": "..."
  },
  "articles": [{
    "semantic_id": "VN_LDN_2020_ART_2",
    "article_number": 2,
    "title": "Đối tượng áp dụng",
    "effective_from": "2021-01-01",
    "clauses": [{
      "semantic_id": "VN_LDN_2020_ART_2_CLAUSE_1",
      "clause_number": 1,
      "legal_text": "Doanh nghiệp.",
      "plain_summary": "Luật áp dụng cho doanh nghiệp",
      "ai_metadata": {
        "norm_type": "definition",
        "risk_level": "low",
        "applies_to": ["doanh nghiệp"]
      }
    }]
  }]
}`}</pre>
        </details>

        <label style={{
          display: 'inline-block',
          padding: '8px 16px',
          backgroundColor: '#0891b2',
          color: '#fff',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          Chọn file .json
          <input
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleJsonFile(file);
              e.target.value = '';
            }}
          />
        </label>

        {jsonFileName && (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: '#0369a1' }}>
              ✓ <strong>{jsonFileName}</strong>
            </span>
            {/* Article count */}
            <span style={{
              padding: '2px 10px',
              backgroundColor: '#dcfce7',
              color: '#166534',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              {jsonArticles.length} điều
            </span>
            {/* Clause count (only shown when clause-level data present) */}
            {clauseCount > 0 && (
              <span style={{
                padding: '2px 10px',
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
              }}>
                {clauseCount} khoản
              </span>
            )}
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {clauseCount > 0
                ? 'Có dữ liệu khoản — AI có thể truy cập chi tiết từng khoản.'
                : 'Metadata đã điền vào form — kiểm tra và lưu khi sẵn sàng.'}
            </span>
          </div>
        )}

        {jsonError && (
          <div style={{ marginTop: '10px', fontSize: '13px', color: '#dc2626' }}>
            ⚠ {jsonError}
          </div>
        )}
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', marginBottom: '16px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* key resets form state when JSON prefill data changes */}
      <DocumentForm key={formKey} initialData={prefillData} onSubmit={handleSubmit} saving={saving} />
    </div>
  );
}
