'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuthStore } from '@/stores/adminAuth';
import { createAdminApi } from '@/lib/adminApi';

interface Article {
  id: string;
  articleNumber: string;
  title?: string;
  content: string;
  chapterNumber?: string;
  chapterTitle?: string;
  sectionNumber?: string;
  sectionTitle?: string;
  orderIndex: number;
  keywords: string[];
  summary?: string;
  legalTopics: string[];
  articleType?: string;
  subjectMatter?: string;
  importance: number;
  normativeType?: string;
  complianceActions?: string;
  penaltyReference: boolean;
  confidenceLevel: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 10px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '12px',
  boxSizing: 'border-box',
};

export default function ArticlesPage() {
  const params = useParams();
  const { token } = useAdminAuthStore();
  const id = params.id as string;

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Article>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await createAdminApi(token).getArticles(id) as Article[];
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tải thất bại');
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => { load(); }, [load]);

  const handleExpand = (article: Article) => {
    if (expanded === article.id) {
      setExpanded(null);
      setEditData({});
    } else {
      setExpanded(article.id);
      setEditData({ ...article });
    }
  };

  const handleSave = async (articleId: string) => {
    if (!token) return;
    setSaving(articleId);
    try {
      await createAdminApi(token).updateArticle(articleId, editData as Record<string, unknown>);
      await load();
      setExpanded(null);
      setEditData({});
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (articleId: string, articleNumber: string) => {
    if (!confirm(`Xóa Điều ${articleNumber}?`)) return;
    if (!token) return;
    try {
      await createAdminApi(token).deleteArticle(articleId);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xóa thất bại');
    }
  };

  const set = (key: keyof Article, value: unknown) =>
    setEditData(prev => ({ ...prev, [key]: value }));

  if (loading) return <div style={{ padding: '32px', color: '#888' }}>Đang tải...</div>;

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href={`/admin/documents/${id}`} style={{ color: '#0891b2', textDecoration: 'none', fontSize: '13px' }}>
          ← Thông tin văn bản
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', marginTop: '8px', marginBottom: 0 }}>
          Quản lý điều luật
        </h1>
        <p style={{ color: '#666', marginTop: '4px' }}>{articles.length} điều</p>
      </div>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {articles.map(article => (
          <div
            key={article.id}
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              border: expanded === article.id ? '1px solid #0891b2' : '1px solid #e5e7eb',
            }}
          >
            {/* Header row */}
            <div
              style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', gap: '12px' }}
              onClick={() => handleExpand(article)}
            >
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0891b2', minWidth: '60px' }}>
                Điều {article.articleNumber}
              </span>
              {article.chapterNumber && (
                <span style={{ fontSize: '11px', color: '#9ca3af', padding: '1px 6px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                  Chương {article.chapterNumber}
                </span>
              )}
              <span style={{ fontSize: '13px', color: '#374151', flex: 1 }}>
                {article.title || article.content.substring(0, 80) + '...'}
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: '#ecfeff', color: '#0891b2', borderRadius: '4px' }}>
                  {article.confidenceLevel}
                </span>
                {article.normativeType && (
                  <span style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: '#f3f4f6', color: '#6b7280', borderRadius: '4px' }}>
                    {article.normativeType}
                  </span>
                )}
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(article.id, article.articleNumber); }}
                  style={{ fontSize: '12px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Xóa
                </button>
                <span style={{ color: '#9ca3af', fontSize: '16px' }}>{expanded === article.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {/* Edit form */}
            {expanded === article.id && (
              <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '3px' }}>TIÊU ĐỀ</label>
                    <input style={inputStyle} value={editData.title || ''} onChange={e => set('title', e.target.value)} placeholder="Tiêu đề điều..." />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '3px' }}>LOẠI (articleType)</label>
                    <select style={inputStyle} value={editData.articleType || ''} onChange={e => set('articleType', e.target.value)}>
                      <option value="">—</option>
                      {['DEFINITION','GENERAL','PROCEDURE','RIGHTS','OBLIGATIONS','PENALTY'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '3px' }}>NORMATIVE TYPE</label>
                    <select style={inputStyle} value={editData.normativeType || ''} onChange={e => set('normativeType', e.target.value || undefined)}>
                      <option value="">—</option>
                      {['MANDATORY','PROHIBITION','CONDITION','PROCEDURE'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '3px' }}>CONFIDENCE</label>
                    <select style={inputStyle} value={editData.confidenceLevel || 'HIGH'} onChange={e => set('confidenceLevel', e.target.value)}>
                      {['HIGH','MEDIUM','LOW'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '3px' }}>TẦM QUAN TRỌNG (1-5)</label>
                    <input type="number" min={1} max={5} style={inputStyle} value={editData.importance ?? 1} onChange={e => set('importance', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '3px' }}>CHỦ ĐỀ CHÍNH</label>
                    <input style={inputStyle} value={editData.subjectMatter || ''} onChange={e => set('subjectMatter', e.target.value)} />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '3px' }}>NỘI DUNG</label>
                  <textarea rows={6} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} value={editData.content || ''} onChange={e => set('content', e.target.value)} />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '3px' }}>TÓM TẮT</label>
                  <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }} value={editData.summary || ''} onChange={e => set('summary', e.target.value)} />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '3px' }}>HÀNH ĐỘNG TUÂN THỦ</label>
                  <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }} value={editData.complianceActions || ''} onChange={e => set('complianceActions', e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button
                    onClick={() => handleSave(article.id)}
                    disabled={saving === article.id}
                    style={{
                      padding: '8px 20px',
                      backgroundColor: saving === article.id ? '#9ca3af' : '#0891b2',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: saving === article.id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving === article.id ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editData.penaltyReference ?? false}
                      onChange={e => set('penaltyReference', e.target.checked)}
                    />
                    Có tham chiếu hình phạt
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}

        {articles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
            Chưa có điều luật nào. <Link href={`/admin/documents/${id}/content`} style={{ color: '#0891b2' }}>Upload .docx</Link> để trích xuất.
          </div>
        )}
      </div>
    </div>
  );
}
