'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuthStore } from '@/stores/adminAuth';
import { createAdminApi } from '@/lib/adminApi';
import { LegalUpdateForm, type LegalUpdateFormData } from '../LegalUpdateForm';

export default function EditUpdatePage() {
  const params = useParams();
  const { token } = useAdminAuthStore();
  const id = params.id as string;

  const [initialData, setInitialData] = useState<Partial<LegalUpdateFormData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    createAdminApi(token).getUpdate(id)
      .then(data => {
        const d = data as Record<string, unknown>;
        setInitialData({
          title: String(d.title || ''),
          summary: String(d.summary || ''),
          content: String(d.content || ''),
          publishDate: d.publishDate ? String(d.publishDate).substring(0, 10) : new Date().toISOString().substring(0, 10),
          isHighlighted: Boolean(d.isHighlighted),
          isPublished: Boolean(d.isPublished),
          relatedDocIds: (d.relatedDocIds as string[]) || [],
        });
      })
      .catch(() => setError('Không tìm thấy bài viết'))
      .finally(() => setLoading(false));
  }, [token, id]);

  const handleSubmit = async (data: LegalUpdateFormData) => {
    if (!token) return;
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await createAdminApi(token).updateUpdate(id, data as unknown as Record<string, unknown>);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '32px', color: '#888' }}>Đang tải...</div>;
  if (!initialData) return <div style={{ padding: '32px', color: '#dc2626' }}>Không tìm thấy bài viết</div>;

  return (
    <div style={{ padding: '32px', maxWidth: '760px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/admin/updates" style={{ color: '#0891b2', textDecoration: 'none', fontSize: '13px' }}>← Danh sách</Link>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', marginTop: '8px', marginBottom: 0 }}>Sửa bài viết</h1>
      </div>
      {error && <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}
      {success && <div style={{ padding: '12px 16px', backgroundColor: '#d1fae5', color: '#059669', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>Lưu thành công!</div>}
      <LegalUpdateForm initialData={initialData} onSubmit={handleSubmit} saving={saving} />
    </div>
  );
}
