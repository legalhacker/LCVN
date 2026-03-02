'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuthStore } from '@/stores/adminAuth';
import { createAdminApi } from '@/lib/adminApi';
import { CmsPageForm, type CmsPageFormData } from '../CmsPageForm';

export default function EditCmsPage() {
  const params = useParams();
  const { token } = useAdminAuthStore();
  const id = params.id as string;

  const [initialData, setInitialData] = useState<Partial<CmsPageFormData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    createAdminApi(token).getPage(id)
      .then(data => setInitialData(data as Partial<CmsPageFormData>))
      .catch(() => setError('Không tìm thấy trang'))
      .finally(() => setLoading(false));
  }, [token, id]);

  const handleSubmit = async (data: CmsPageFormData) => {
    if (!token) return;
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await createAdminApi(token).updatePage(id, data as unknown as Record<string, unknown>);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '32px', color: '#888' }}>Đang tải...</div>;
  if (!initialData) return <div style={{ padding: '32px', color: '#dc2626' }}>Không tìm thấy trang</div>;

  return (
    <div style={{ padding: '32px', maxWidth: '760px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/admin/pages" style={{ color: '#0891b2', textDecoration: 'none', fontSize: '13px' }}>← Danh sách trang</Link>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', marginTop: '8px', marginBottom: 0 }}>Sửa trang</h1>
      </div>
      {error && <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}
      {success && <div style={{ padding: '12px 16px', backgroundColor: '#d1fae5', color: '#059669', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>Lưu thành công!</div>}
      <CmsPageForm initialData={initialData} onSubmit={handleSubmit} saving={saving} />
    </div>
  );
}
