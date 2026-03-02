'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuthStore } from '@/stores/adminAuth';
import { createAdminApi } from '@/lib/adminApi';

interface RelatedDoc { id: string; documentNumber: string; title: string }
interface Relation {
  id: string;
  relationType: string;
  description?: string;
  toDocument?: RelatedDoc;
  fromDocument?: RelatedDoc;
}

const RELATION_LABELS: Record<string, string> = {
  AMENDS: 'Sửa đổi', SUPPLEMENTS: 'Bổ sung', IMPLEMENTS: 'Hướng dẫn',
  REPLACES: 'Thay thế', REFERENCES: 'Dẫn chiếu', RELATED: 'Liên quan',
};

export default function RelationsPage() {
  const params = useParams();
  const { token } = useAdminAuthStore();
  const id = params.id as string;

  const [fromRelations, setFromRelations] = useState<Relation[]>([]);
  const [toRelations, setToRelations] = useState<Relation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ toDocumentId: '', relationType: 'RELATED', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [docSearch, setDocSearch] = useState('');
  const [searchResults, setSearchResults] = useState<RelatedDoc[]>([]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await createAdminApi(token).getRelations(id) as { fromRelations: Relation[]; toRelations: Relation[] };
      setFromRelations(data.fromRelations);
      setToRelations(data.toRelations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tải thất bại');
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = async (q: string) => {
    setDocSearch(q);
    if (!q.trim() || !token) { setSearchResults([]); return; }
    try {
      const res = await createAdminApi(token).getDocuments({ q, limit: '10' }) as { data: RelatedDoc[] };
      setSearchResults(res.data.filter(d => d.id !== id));
    } catch {
      setSearchResults([]);
    }
  };

  const handleAdd = async () => {
    if (!token || !form.toDocumentId) return;
    setSaving(true);
    try {
      await createAdminApi(token).createRelation({ fromDocumentId: id, ...form });
      setShowModal(false);
      setForm({ toDocumentId: '', relationType: 'RELATED', description: '' });
      setDocSearch('');
      setSearchResults([]);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Thêm thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (relId: string) => {
    if (!confirm('Xóa quan hệ này?') || !token) return;
    try {
      await createAdminApi(token).deleteRelation(relId);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xóa thất bại');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '13px',
    boxSizing: 'border-box',
  };

  if (loading) return <div style={{ padding: '32px', color: '#888' }}>Đang tải...</div>;

  return (
    <div style={{ padding: '32px', maxWidth: '860px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href={`/admin/documents/${id}`} style={{ color: '#0891b2', textDecoration: 'none', fontSize: '13px' }}>
          ← Thông tin văn bản
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', marginTop: '8px', marginBottom: 0 }}>
          Quan hệ văn bản
        </h1>
      </div>

      {error && <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}

      <button
        onClick={() => setShowModal(true)}
        style={{ marginBottom: '24px', padding: '10px 20px', backgroundColor: '#0891b2', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
      >
        + Thêm quan hệ
      </button>

      {/* From relations */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, marginTop: 0, marginBottom: '12px' }}>Văn bản này → Văn bản khác ({fromRelations.length})</h2>
        {fromRelations.length === 0 && <div style={{ color: '#9ca3af', fontSize: '13px' }}>Chưa có quan hệ.</div>}
        {fromRelations.map(r => (
          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div>
              <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#ecfeff', color: '#0891b2', borderRadius: '4px', marginRight: '8px' }}>
                {RELATION_LABELS[r.relationType] || r.relationType}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 500 }}>{r.toDocument?.documentNumber}</span>
              <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>{r.toDocument?.title}</span>
              {r.description && <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{r.description}</div>}
            </div>
            <button onClick={() => handleDelete(r.id)} style={{ fontSize: '12px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Xóa</button>
          </div>
        ))}
      </div>

      {/* To relations */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, marginTop: 0, marginBottom: '12px' }}>Văn bản khác → Văn bản này ({toRelations.length})</h2>
        {toRelations.length === 0 && <div style={{ color: '#9ca3af', fontSize: '13px' }}>Chưa có quan hệ.</div>}
        {toRelations.map(r => (
          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 500 }}>{r.fromDocument?.documentNumber}</span>
              <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#f3f4f6', color: '#6b7280', borderRadius: '4px', margin: '0 8px' }}>
                {RELATION_LABELS[r.relationType] || r.relationType}
              </span>
              <span style={{ fontSize: '12px', color: '#666' }}>{r.fromDocument?.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '480px', maxWidth: '90vw' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>Thêm quan hệ văn bản</h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Loại quan hệ</label>
              <select style={inputStyle} value={form.relationType} onChange={e => setForm(f => ({ ...f, relationType: e.target.value }))}>
                {Object.entries(RELATION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Tìm văn bản đích</label>
              <input
                style={inputStyle}
                value={docSearch}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Tìm theo tên..."
              />
              {searchResults.length > 0 && (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', marginTop: '4px', maxHeight: '160px', overflow: 'auto' }}>
                  {searchResults.map(d => (
                    <button
                      key={d.id}
                      onClick={() => { setForm(f => ({ ...f, toDocumentId: d.id })); setDocSearch(d.documentNumber + ' - ' + d.title); setSearchResults([]); }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', backgroundColor: form.toDocumentId === d.id ? '#ecfeff' : 'transparent', cursor: 'pointer', fontSize: '13px' }}
                    >
                      <strong>{d.documentNumber}</strong> — {d.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Mô tả (tùy chọn)</label>
              <input style={inputStyle} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleAdd}
                disabled={saving || !form.toDocumentId}
                style={{ padding: '8px 20px', backgroundColor: !form.toDocumentId || saving ? '#9ca3af' : '#0891b2', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: !form.toDocumentId || saving ? 'not-allowed' : 'pointer' }}
              >
                {saving ? 'Đang lưu...' : 'Thêm'}
              </button>
              <button onClick={() => { setShowModal(false); setForm({ toDocumentId: '', relationType: 'RELATED', description: '' }); setDocSearch(''); setSearchResults([]); }} style={{ padding: '8px 20px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
