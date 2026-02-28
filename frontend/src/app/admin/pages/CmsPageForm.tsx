'use client';

import { useState } from 'react';

export interface CmsPageFormData {
  slug: string;
  title: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  isPublished: boolean;
}

const EMPTY: CmsPageFormData = {
  slug: '', title: '', content: '', seoTitle: '', seoDescription: '', isPublished: false,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const sectionStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  marginBottom: '20px',
};

interface Props {
  initialData?: Partial<CmsPageFormData>;
  onSubmit: (data: CmsPageFormData) => void;
  saving: boolean;
}

export function CmsPageForm({ initialData, onSubmit, saving }: Props) {
  const [form, setForm] = useState<CmsPageFormData>({ ...EMPTY, ...initialData });

  const set = (key: keyof CmsPageFormData, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e', marginTop: 0, marginBottom: '16px' }}>Nội dung trang</h2>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Slug (URL) *</label>
          <input style={inputStyle} value={form.slug} onChange={e => set('slug', e.target.value)} required placeholder="gioi-thieu" />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Tiêu đề *</label>
          <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Giới thiệu" />
        </div>
        <div>
          <label style={labelStyle}>Nội dung *</label>
          <textarea rows={16} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} value={form.content} onChange={e => set('content', e.target.value)} required placeholder="Nội dung trang (hỗ trợ Markdown)..." />
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e', marginTop: 0, marginBottom: '16px' }}>SEO</h2>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>SEO Title</label>
          <input style={inputStyle} value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)} placeholder="Tiêu đề cho Google..." />
        </div>
        <div>
          <label style={labelStyle}>SEO Description</label>
          <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }} value={form.seoDescription} onChange={e => set('seoDescription', e.target.value)} placeholder="Mô tả cho Google..." />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <button
          type="submit"
          disabled={saving}
          style={{ padding: '12px 32px', backgroundColor: saving ? '#9ca3af' : '#0891b2', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Đang lưu...' : 'Lưu trang'}
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.isPublished} onChange={e => set('isPublished', e.target.checked)} />
          Đăng công khai
        </label>
      </div>
    </form>
  );
}
