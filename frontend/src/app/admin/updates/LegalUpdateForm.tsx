'use client';

import { useState } from 'react';

export interface LegalUpdateFormData {
  title: string;
  summary: string;
  content: string;
  publishDate: string;
  isHighlighted: boolean;
  isPublished: boolean;
  relatedDocIds: string[];
}

const EMPTY: LegalUpdateFormData = {
  title: '', summary: '', content: '',
  publishDate: new Date().toISOString().substring(0, 10),
  isHighlighted: false, isPublished: false, relatedDocIds: [],
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
  borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151',
  marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em',
};

const sectionStyle: React.CSSProperties = {
  backgroundColor: '#fff', borderRadius: '12px', padding: '24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '20px',
};

interface Props {
  initialData?: Partial<LegalUpdateFormData>;
  onSubmit: (data: LegalUpdateFormData) => void;
  saving: boolean;
}

export function LegalUpdateForm({ initialData, onSubmit, saving }: Props) {
  const [form, setForm] = useState<LegalUpdateFormData>({ ...EMPTY, ...initialData });

  const set = (key: keyof LegalUpdateFormData, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e', marginTop: 0, marginBottom: '16px' }}>Nội dung bài viết</h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Tiêu đề *</label>
          <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Luật Doanh nghiệp 2020 có gì mới?" />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Tóm tắt</label>
          <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={form.summary} onChange={e => set('summary', e.target.value)} placeholder="Tóm tắt ngắn gọn..." />
        </div>

        <div>
          <label style={labelStyle}>Nội dung chi tiết *</label>
          <textarea rows={16} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} value={form.content} onChange={e => set('content', e.target.value)} required placeholder="Nội dung đầy đủ (hỗ trợ Markdown)..." />
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e', marginTop: 0, marginBottom: '16px' }}>Cài đặt</h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Ngày đăng *</label>
          <input type="date" style={inputStyle} value={form.publishDate} onChange={e => set('publishDate', e.target.value)} required />
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isPublished} onChange={e => set('isPublished', e.target.checked)} />
            Đăng công khai
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isHighlighted} onChange={e => set('isHighlighted', e.target.checked)} />
            Đánh dấu nổi bật ⭐
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        style={{ padding: '12px 32px', backgroundColor: saving ? '#9ca3af' : '#0891b2', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}
      >
        {saving ? 'Đang lưu...' : 'Lưu bài viết'}
      </button>
    </form>
  );
}
