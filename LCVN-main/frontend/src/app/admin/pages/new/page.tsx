'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuthStore } from '@/stores/adminAuth';
import { createAdminApi } from '@/lib/adminApi';
import { CmsPageForm, type CmsPageFormData } from '../CmsPageForm';

export default function NewCmsPage() {
  const router = useRouter();
  const { token } = useAdminAuthStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: CmsPageFormData) => {
    if (!token) return;
    setSaving(true);
    setError('');
    try {
      await createAdminApi(token).createPage(data as unknown as Record<string, unknown>);
      router.push('/admin/pages');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại');
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '760px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/admin/pages" style={{ color: '#0891b2', textDecoration: 'none', fontSize: '13px' }}>← Danh sách trang</Link>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', marginTop: '8px', marginBottom: 0 }}>Thêm trang mới</h1>
      </div>
      {error && <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}
      <CmsPageForm onSubmit={handleSubmit} saving={saving} />
    </div>
  );
}
