'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuthStore } from '@/stores/adminAuth';
import { createAdminApi } from '@/lib/adminApi';
import { DocumentForm, type DocumentFormData } from '../DocumentForm';

// Raw article shape from the JSON ingest format
interface JsonArticle {
  article_number: number;
  title?: string;
  content: string;
}

// Map JSON "type" values to DB enum values
function mapDocType(type: string): string {
  const map: Record<string, string> = {
    law: 'LAW', code: 'CODE', decree: 'DECREE', circular: 'CIRCULAR',
    resolution: 'RESOLUTION', decision: 'DECISION', directive: 'DIRECTIVE', dispatch: 'DISPATCH',
  };
  return map[type?.toLowerCase()] || 'LAW';
}

// Map JSON "status" values to DB enum values
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

  // ── Ingest layer ────────────────────────────────────────────────────────────
  // Parse the uploaded JSON, extract metadata for form pre-fill and articles
  // for storage. The JSON is NEVER passed to the frontend reader.
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

        // Map JSON fields → form fields for admin review
        const prefill: Partial<DocumentFormData> = {
          documentNumber: doc.number || '',
          title: doc.title || '',
          documentType: mapDocType(doc.type || ''),
          issuingBody: doc.issuer || '',
          issuedDate: doc.issue_date || '',
          effectiveDate: doc.effective_date || '',
          status: mapStatus(doc.status || ''),
          legalDomains: Array.isArray(ai.legal_domains) ? ai.legal_domains : [],
          applicableEntities: Array.isArray(ai.subjects) ? ai.subjects : [],
          keywords: Array.isArray(ai.keywords) ? ai.keywords : [],
          legalSummary: ai.summary_ai || '',
          summary: ai.summary_human || '',
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
  // 2. If JSON articles exist, store them as Article records (ingest layer → storage layer)
  const handleSubmit = async (data: DocumentFormData) => {
    if (!token) return;
    setSaving(true);
    setError('');
    try {
      const api = createAdminApi(token);

      // Step 1: create Document record
      const doc = await api.createDocument(data as unknown as Record<string, unknown>) as { id: string };

      // Step 2: if articles came from JSON ingest, store them now
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

      {/* ── JSON Ingest Section ─────────────────────────────────────────────────
          Upload a structured .json file to auto-fill the form below.
          Articles are extracted here and stored separately — never rendered as JSON.
      */}
      <div style={{
        backgroundColor: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '24px',
      }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0c4a6e', marginTop: 0, marginBottom: '4px' }}>
          📥 Upload văn bản pháp luật (JSON Ingest)
        </h2>
        <p style={{ fontSize: '12px', color: '#0369a1', marginTop: 0, marginBottom: '16px' }}>
          Tải lên file .json theo chuẩn ingest. Metadata sẽ điền tự động vào form bên dưới — bạn có thể chỉnh sửa trước khi lưu. Nội dung điều khoản sẽ được lưu thành các Article riêng biệt.
        </p>

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
            <span style={{
              padding: '2px 10px',
              backgroundColor: '#dcfce7',
              color: '#166534',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              {jsonArticles.length} điều khoản
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Metadata đã điền vào form bên dưới — kiểm tra và lưu khi sẵn sàng.
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
