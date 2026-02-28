'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuthStore } from '@/stores/adminAuth';
import { createAdminApi } from '@/lib/adminApi';
import { DocumentForm, type DocumentFormData } from '../DocumentForm';

export default function EditDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAdminAuthStore();
  const id = params.id as string;

  const [doc, setDoc] = useState<Partial<DocumentFormData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    createAdminApi(token).getDocument(id)
      .then(data => {
        const d = data as Record<string, unknown>;
        setDoc({
          documentNumber: String(d.documentNumber || ''),
          title: String(d.title || ''),
          titleSlug: String(d.titleSlug || ''),
          documentType: String(d.documentType || 'LAW'),
          issuingBody: String(d.issuingBody || ''),
          issuedDate: d.issuedDate ? String(d.issuedDate).substring(0, 10) : '',
          effectiveDate: d.effectiveDate ? String(d.effectiveDate).substring(0, 10) : '',
          expirationDate: d.expirationDate ? String(d.expirationDate).substring(0, 10) : '',
          status: String(d.status || 'EFFECTIVE'),
          preamble: String(d.preamble || ''),
          keywords: (d.keywords as string[]) || [],
          summary: String(d.summary || ''),
          jurisdiction: String(d.jurisdiction || 'viet_nam'),
          sourceOrigin: String(d.sourceOrigin || ''),
          sourceUrl: String(d.sourceUrl || ''),
          applicableEntities: (d.applicableEntities as string[]) || [],
          legalDomains: (d.legalDomains as string[]) || [],
          legalSummary: String(d.legalSummary || ''),
        });
      })
      .catch(() => setError('Không tìm thấy văn bản'))
      .finally(() => setLoading(false));
  }, [token, id]);

  const handleSubmit = async (data: DocumentFormData) => {
    if (!token) return;
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await createAdminApi(token).updateDocument(id, data as unknown as Record<string, unknown>);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '32px', color: '#888' }}>Đang tải...</div>;
  if (!doc) return <div style={{ padding: '32px', color: '#dc2626' }}>Không tìm thấy văn bản</div>;

  return (
    <div style={{ padding: '32px', maxWidth: '860px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/admin/documents" style={{ color: '#0891b2', textDecoration: 'none', fontSize: '13px' }}>
          ← Danh sách văn bản
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', marginTop: '8px', marginBottom: '4px' }}>
          Sửa văn bản
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href={`/admin/documents/${id}/content`} style={{ fontSize: '13px', color: '#7c3aed', textDecoration: 'none' }}>
            📤 Upload nội dung
          </Link>
          <Link href={`/admin/documents/${id}/articles`} style={{ fontSize: '13px', color: '#059669', textDecoration: 'none' }}>
            📝 Quản lý điều
          </Link>
          <Link href={`/admin/documents/${id}/relations`} style={{ fontSize: '13px', color: '#d97706', textDecoration: 'none' }}>
            🔗 Quan hệ văn bản
          </Link>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', marginBottom: '16px', fontSize: '13px' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '12px 16px', backgroundColor: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#059669', marginBottom: '16px', fontSize: '13px' }}>
          Lưu thành công!
        </div>
      )}

      <DocumentForm initialData={doc} onSubmit={handleSubmit} saving={saving} />
    </div>
  );
}
