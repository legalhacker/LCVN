'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuthStore } from '@/stores/adminAuth';
import { createAdminApi } from '@/lib/adminApi';
import { DocumentForm, type DocumentFormData } from '../DocumentForm';

export default function NewDocumentPage() {
  const router = useRouter();
  const { token } = useAdminAuthStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: DocumentFormData) => {
    if (!token) return;
    setSaving(true);
    setError('');
    try {
      const api = createAdminApi(token);
      const doc = await api.createDocument(data as unknown as Record<string, unknown>) as { id: string };
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

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', marginBottom: '16px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <DocumentForm onSubmit={handleSubmit} saving={saving} />
    </div>
  );
}
