'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAdminAuthStore } from '@/stores/adminAuth';
import { createAdminApi } from '@/lib/adminApi';

interface CmsPage {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PagesListPage() {
  const { token } = useAdminAuthStore();
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await createAdminApi(token).getPages() as { data: CmsPage[]; pagination: { total: number } };
      setPages(res.data);
      setTotal(res.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Xóa trang "${title}"?`) || !token) return;
    setDeleting(id);
    try {
      await createAdminApi(token).deletePage(id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xóa thất bại');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Nội dung website</h1>
          <p style={{ color: '#666', marginTop: '4px' }}>{total} trang</p>
        </div>
        <Link href="/admin/pages/new" style={{ padding: '10px 20px', backgroundColor: '#0891b2', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
          + Thêm trang
        </Link>
      </div>

      {loading ? (
        <div style={{ color: '#888' }}>Đang tải...</div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Slug', 'Tiêu đề', 'Trạng thái', 'Cập nhật', 'Hành động'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pages.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>{p.slug}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500 }}>{p.title}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: p.isPublished ? '#d1fae5' : '#fef3c7', color: p.isPublished ? '#059669' : '#d97706', borderRadius: '4px' }}>
                      {p.isPublished ? 'Đã đăng' : 'Bản nháp'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#888' }}>
                    {new Date(p.updatedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Link href={`/admin/pages/${p.id}`} style={{ fontSize: '13px', color: '#0891b2', textDecoration: 'none' }}>Sửa</Link>
                      <button onClick={() => handleDelete(p.id, p.title)} disabled={deleting === p.id} style={{ fontSize: '13px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        {deleting === p.id ? '...' : 'Xóa'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Chưa có trang nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
