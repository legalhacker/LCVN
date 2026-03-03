'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuthStore } from '@/stores/adminAuth';
import { createAdminApi } from '@/lib/adminApi';

interface Article {
  id: string;
  semanticId?: string;
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

interface ArticleSearchResult {
  id: string;
  semanticId?: string;
  articleNumber: string;
  title?: string;
  document: { id: string; documentNumber: string; title: string; titleSlug: string };
}

interface ArticleRelation {
  id: string;
  relationType: string;
  note?: string;
  toArticle?: ArticleSearchResult;
  fromArticle?: ArticleSearchResult;
}

interface ArticleRelations {
  relationsFrom: ArticleRelation[];
  relationsTo: ArticleRelation[];
}

const RELATION_LABELS: Record<string, string> = {
  guides:         'Hướng dẫn',
  amends:         'Sửa đổi',
  repeals:        'Bãi bỏ',
  replaces:       'Thay thế',
  references:     'Dẫn chiếu',
  implements:     'Triển khai',
  conflicts_with: 'Xung đột',
  interpreted_by: 'Được giải thích bởi án lệ',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 10px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '12px',
  boxSizing: 'border-box',
};

// ─── JSON Import Button (proper React component, no hooks violation) ──────────

function JsonImportButton({
  onImport,
  onSuccess,
  label,
  hint,
}: {
  onImport: (arr: unknown[]) => Promise<{ created: number; skipped?: number; errors: string[] }>;
  onSuccess?: () => void;
  label: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const arr = Array.isArray(json) ? json : (json.relations || json.annotations || []);
      setStatus('Đang nhập...');
      const result = await onImport(arr);
      const msg = `✓ ${result.created} đã nhập${result.skipped ? `, ${result.skipped} trùng` : ''}${result.errors.length ? `, ${result.errors.length} lỗi` : ''}`;
      setStatus(msg);
      if (onSuccess) onSuccess();
      setTimeout(() => setStatus(''), 6000);
    } catch (err) {
      setStatus(`✗ ${err instanceof Error ? err.message : 'Lỗi parse JSON'}`);
      setTimeout(() => setStatus(''), 6000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <input ref={inputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFile} />
        <button
          onClick={() => inputRef.current?.click()}
          style={{
            padding: '5px 10px', fontSize: '11px', fontWeight: 500,
            border: '1px solid #d1d5db', borderRadius: '5px',
            backgroundColor: '#fff', color: '#374151', cursor: 'pointer',
          }}
        >
          📥 {label}
        </button>
        {status && (
          <span style={{
            fontSize: '11px',
            color: status.startsWith('✓') ? '#15803d' : status.startsWith('✗') ? '#dc2626' : '#6b7280',
          }}>
            {status}
          </span>
        )}
      </div>
      {hint && !status && (
        <span style={{ fontSize: '10px', color: '#b0b8c4', fontFamily: 'monospace', paddingLeft: '2px' }}>
          {hint}
        </span>
      )}
    </div>
  );
}

// ─── Article Relations Manager ────────────────────────────────────────────────

function ArticleRelationsManager({
  articleId,
  documentId,
  semanticId,
  token,
}: {
  articleId: string;
  documentId: string;
  semanticId?: string;
  token: string;
}) {
  const api = createAdminApi(token);
  const [relations, setRelations] = useState<ArticleRelations>({ relationsFrom: [], relationsTo: [] });
  const [relLoading, setRelLoading] = useState(true);
  const [relType, setRelType] = useState('amends');
  const [relNote, setRelNote] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<ArticleSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<ArticleSearchResult | null>(null);
  const [adding, setAdding] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadRelations = useCallback(async () => {
    setRelLoading(true);
    try {
      const data = await api.getArticleRelations(articleId) as ArticleRelations;
      setRelations(data);
    } finally {
      setRelLoading(false);
    }
  }, [articleId, token]); // eslint-disable-line

  useEffect(() => { loadRelations(); }, [loadRelations]);

  const handleSearch = (q: string) => {
    setSearchQ(q);
    setSelected(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!q.trim()) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        // excludeDocumentId → only returns articles from OTHER documents
        const results = await api.searchArticles({ q, excludeDocumentId: documentId }) as ArticleSearchResult[];
        setSearchResults(results);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleAdd = async () => {
    if (!selected) return;
    setAdding(true);
    try {
      await api.createArticleRelation({
        fromArticleId: articleId,
        toArticleId: selected.id,
        relationType: relType,
        note: relNote || undefined,
      });
      setSelected(null);
      setSearchQ('');
      setSearchResults([]);
      setRelNote('');
      await loadRelations();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Thêm liên kết thất bại');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa liên kết này?')) return;
    try {
      await api.deleteArticleRelation(id);
      await loadRelations();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xóa thất bại');
    }
  };

  return (
    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed #e5e7eb' }}>
      <p style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        📎 Liên kết điều khoản
      </p>

      {relLoading ? (
        <p style={{ fontSize: '12px', color: '#9ca3af' }}>Đang tải...</p>
      ) : (
        <>
          {relations.relationsFrom.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>Điều này liên kết đến:</p>
              {relations.relationsFrom.map(rel => (
                <div key={rel.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', backgroundColor: '#f0fdf4', borderRadius: '5px', marginBottom: '4px', fontSize: '12px' }}>
                  <span style={{ padding: '1px 6px', backgroundColor: '#bbf7d0', color: '#166534', borderRadius: '3px', fontWeight: 600, fontSize: '11px', whiteSpace: 'nowrap' }}>
                    {RELATION_LABELS[rel.relationType] || rel.relationType}
                  </span>
                  <span style={{ flex: 1, color: '#374151' }}>
                    Điều {rel.toArticle?.articleNumber}
                    {rel.toArticle?.title ? ` — ${rel.toArticle.title}` : ''}
                    <span style={{ color: '#9ca3af', marginLeft: '4px' }}>({rel.toArticle?.document.documentNumber})</span>
                  </span>
                  <button onClick={() => handleDelete(rel.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                </div>
              ))}
            </div>
          )}

          {relations.relationsTo.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>Điều này được liên kết bởi:</p>
              {relations.relationsTo.map(rel => (
                <div key={rel.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', backgroundColor: '#fef3c7', borderRadius: '5px', marginBottom: '4px', fontSize: '12px' }}>
                  <span style={{ padding: '1px 6px', backgroundColor: '#fde68a', color: '#92400e', borderRadius: '3px', fontWeight: 600, fontSize: '11px', whiteSpace: 'nowrap' }}>
                    {RELATION_LABELS[rel.relationType] || rel.relationType}
                  </span>
                  <span style={{ flex: 1, color: '#374151' }}>
                    Điều {rel.fromArticle?.articleNumber}
                    {rel.fromArticle?.title ? ` — ${rel.fromArticle.title}` : ''}
                    <span style={{ color: '#9ca3af', marginLeft: '4px' }}>({rel.fromArticle?.document.documentNumber})</span>
                  </span>
                  <span style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic' }}>hiển thị cho người đọc</span>
                </div>
              ))}
            </div>
          )}

          {/* Per-article JSON import */}
          {semanticId && (
            <div style={{ marginBottom: '10px', padding: '8px 10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '7px', fontWeight: 600 }}>
                Import hàng loạt cho điều này
                <span style={{ fontFamily: 'monospace', color: '#7e22ce', marginLeft: '6px', backgroundColor: '#ede9fe', padding: '1px 5px', borderRadius: '3px' }}>
                  {semanticId}
                </span>
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <JsonImportButton
                  label="Liên kết (JSON)"
                  onImport={arr => {
                    // Auto-inject "from" = current article's semanticId
                    const relations = arr.map((item: any) => ({ from: semanticId, ...item }));
                    return createAdminApi(token).importArticleRelations(relations) as Promise<any>;
                  }}
                  onSuccess={loadRelations}
                  hint='[{"to":"VN_DOC_ART_X","type":"amends","notes":"..."}]'
                />
                <JsonImportButton
                  label="Annotations (JSON)"
                  onImport={arr => {
                    // Auto-inject "node_id" = current article's semanticId
                    const annotations = arr.map((item: any) => ({ node_id: semanticId, ...item }));
                    return createAdminApi(token).importArticleAnnotations(annotations) as Promise<any>;
                  }}
                  hint='[{"type":"practice_note","title":"...","content":"...","tags":[],"visibility":"public"}]'
                />
              </div>
            </div>
          )}

          <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '10px' }}>
            <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px', fontWeight: 600 }}>Thêm liên kết mới (từ văn bản khác):</p>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
              <select value={relType} onChange={e => setRelType(e.target.value)} style={{ ...inputStyle, width: 'auto', flexShrink: 0 }}>
                {Object.entries(RELATION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  style={inputStyle}
                  value={selected ? `Điều ${selected.articleNumber} — ${selected.document.documentNumber}` : searchQ}
                  onChange={e => { setSelected(null); handleSearch(e.target.value); }}
                  placeholder="Tìm điều luật từ văn bản khác..."
                />
                {(searchResults.length > 0 || searching) && !selected && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                    backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto',
                  }}>
                    {searching && <div style={{ padding: '8px 12px', fontSize: '12px', color: '#9ca3af' }}>Đang tìm...</div>}
                    {!searching && searchResults.length === 0 && searchQ.trim() && (
                      <div style={{ padding: '8px 12px', fontSize: '12px', color: '#9ca3af' }}>Không tìm thấy kết quả từ văn bản khác</div>
                    )}
                    {searchResults.map(r => (
                      <div
                        key={r.id}
                        onClick={() => { setSelected(r); setSearchResults([]); setSearchQ(''); }}
                        style={{ padding: '7px 12px', fontSize: '12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f9ff')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                      >
                        <span style={{ fontWeight: 600, color: '#0891b2' }}>Điều {r.articleNumber}</span>
                        {r.title && <span style={{ color: '#374151' }}> — {r.title}</span>}
                        <span style={{ color: '#9ca3af', display: 'block', fontSize: '11px' }}>
                          {r.document.documentNumber} · {r.document.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input style={{ ...inputStyle, flex: 1 }} value={relNote} onChange={e => setRelNote(e.target.value)} placeholder="Ghi chú (tùy chọn)" />
              <button
                onClick={handleAdd}
                disabled={!selected || adding}
                style={{
                  padding: '6px 14px', backgroundColor: !selected || adding ? '#9ca3af' : '#0891b2',
                  color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px',
                  fontWeight: 600, cursor: !selected || adding ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                {adding ? '...' : '+ Thêm'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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
    if (expanded === article.id) { setExpanded(null); setEditData({}); }
    else { setExpanded(article.id); setEditData({ ...article }); }
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

  const set = (key: keyof Article, value: unknown) => setEditData(prev => ({ ...prev, [key]: value }));

  if (loading) return <div style={{ padding: '32px', color: '#888' }}>Đang tải...</div>;

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link href={`/admin/documents/${id}`} style={{ color: '#0891b2', textDecoration: 'none', fontSize: '13px' }}>
          ← Thông tin văn bản
        </Link>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: '8px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Quản lý điều luật</h1>
            <p style={{ color: '#666', marginTop: '4px', marginBottom: 0 }}>{articles.length} điều</p>
          </div>

        </div>
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
                {/* semanticId chip — click to copy */}
                {article.semanticId && (
                  <span
                    title={`Semantic ID: ${article.semanticId} — Click để copy`}
                    onClick={e => { e.stopPropagation(); navigator.clipboard?.writeText(article.semanticId!); }}
                    style={{
                      fontSize: '10px', padding: '2px 6px', backgroundColor: '#ede9fe',
                      color: '#7e22ce', borderRadius: '4px', fontFamily: 'monospace',
                      cursor: 'copy', userSelect: 'none', maxWidth: '160px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                  >
                    {article.semanticId}
                  </span>
                )}
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
                      {['DEFINITION','GENERAL','PROCEDURE','RIGHTS','OBLIGATIONS','PENALTY'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '3px' }}>NORMATIVE TYPE</label>
                    <select style={inputStyle} value={editData.normativeType || ''} onChange={e => set('normativeType', e.target.value || undefined)}>
                      <option value="">—</option>
                      {['MANDATORY','PROHIBITION','CONDITION','PROCEDURE'].map(t => <option key={t} value={t}>{t}</option>)}
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
                      padding: '8px 20px', backgroundColor: saving === article.id ? '#9ca3af' : '#0891b2',
                      color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px',
                      fontWeight: 600, cursor: saving === article.id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving === article.id ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={editData.penaltyReference ?? false} onChange={e => set('penaltyReference', e.target.checked)} />
                    Có tham chiếu hình phạt
                  </label>
                </div>

                {token && (
                  <ArticleRelationsManager
                    articleId={article.id}
                    documentId={id}
                    semanticId={article.semanticId}
                    token={token}
                  />
                )}
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
