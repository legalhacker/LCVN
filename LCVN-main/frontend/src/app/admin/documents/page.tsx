'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAdminAuthStore } from '@/stores/adminAuth';
import { createAdminApi } from '@/lib/adminApi';

interface Doc {
  id: string;
  documentNumber: string;
  title: string;
  documentType: string;
  status: string;
  issuingBody: string;
  issuedDate: string;
  _count: { articles: number };
}

const TYPE_LABELS: Record<string, string> = {
  LAW: 'Luật', CODE: 'Bộ luật', DECREE: 'Nghị định', CIRCULAR: 'Thông tư',
  RESOLUTION: 'Nghị quyết', DECISION: 'Quyết định', DIRECTIVE: 'Chỉ thị', DISPATCH: 'Công văn',
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  EFFECTIVE: { bg: '#d1fae5', color: '#059669' },
  EXPIRED: { bg: '#fee2e2', color: '#dc2626' },
  DRAFT: { bg: '#fef3c7', color: '#d97706' },
  NOT_YET_EFFECTIVE: { bg: '#dbeafe', color: '#2563eb' },
  PARTIALLY_EXPIRED: { bg: '#fde8d8', color: '#c2410c' },
};

export default function DocumentsPage() {
  const { token } = useAdminAuthStore();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async (p = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const api = createAdminApi(token);
      const res = await api.getDocuments({ page: String(p), limit: '20' }) as { data: Doc[]; pagination: { total: number } };
      setDocs(res.data);
      setTotal(res.pagination.total);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(1); }, [load]);

  const handleDelete = async (id: string, docNumber: string) => {
    if (!confirm(`Xóa văn bản ${docNumber}? Hành động này không thể hoàn tác.`)) return;
    if (!token) return;
    setDeleting(id);
    try {
      await createAdminApi(token).deleteDocument(id);
      await load(page);
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
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Văn bản pháp luật</h1>
          <p style={{ color: '#666', marginTop: '4px' }}>{total} văn bản</p>
        </div>
        <Link
          href="/admin/documents/new"
          style={{
            padding: '10px 20px',
            backgroundColor: '#0891b2',
            color: '#fff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          + Thêm văn bản
        </Link>
      </div>

      {loading ? (
        <div style={{ color: '#888' }}>Đang tải...</div>
      ) : (
        <>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Số văn bản', 'Tên văn bản', 'Loại', 'Trạng thái', 'Điều luật', 'Hành động'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map(doc => {
                  const sc = STATUS_COLORS[doc.status] || { bg: '#f3f4f6', color: '#6b7280' };
                  return (
                    <tr key={doc.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#0891b2' }}>
                        {doc.documentNumber}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', maxWidth: '280px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title}</div>
                        <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{doc.issuingBody}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#ecfeff', color: '#0891b2', borderRadius: '4px' }}>
                          {TYPE_LABELS[doc.documentType] || doc.documentType}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: sc.bg, color: sc.color, borderRadius: '4px' }}>
                          {doc.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>
                        {doc._count.articles}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link href={`/admin/documents/${doc.id}`} style={{ fontSize: '13px', color: '#0891b2', textDecoration: 'none' }}>
                            Sửa
                          </Link>
                          <Link href={`/admin/documents/${doc.id}/content`} style={{ fontSize: '13px', color: '#7c3aed', textDecoration: 'none' }}>
                            Nội dung
                          </Link>
                          <Link href={`/admin/documents/${doc.id}/articles`} style={{ fontSize: '13px', color: '#059669', textDecoration: 'none' }}>
                            Điều
                          </Link>
                          <button
                            onClick={() => handleDelete(doc.id, doc.documentNumber)}
                            disabled={deleting === doc.id}
                            style={{ fontSize: '13px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            {deleting === doc.id ? '...' : 'Xóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
              <button onClick={() => load(page - 1)} disabled={page === 1} style={btnStyle}>← Trước</button>
              <span style={{ padding: '6px 12px', fontSize: '13px', color: '#666' }}>Trang {page}</span>
              <button onClick={() => load(page + 1)} disabled={page * 20 >= total} style={btnStyle}>Sau →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '6px 14px',
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  fontSize: '13px',
  cursor: 'pointer',
};
