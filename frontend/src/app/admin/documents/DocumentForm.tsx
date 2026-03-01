'use client';

import { useState } from 'react';

export interface DocumentFormData {
  documentNumber: string;
  title: string;
  titleSlug: string;
  documentType: string;
  issuingBody: string;
  issuedDate: string;
  effectiveDate: string;
  expirationDate: string;
  status: string;
  preamble: string;
  keywords: string[];
  summary: string;
  jurisdiction: string;
  sourceOrigin: string;
  sourceUrl: string;
  applicableEntities: string[];
  legalDomains: string[];
  legalSummary: string;
  semanticId: string; // e.g. VN_LDN_2020 — stable AI-facing document identifier
}

const EMPTY: DocumentFormData = {
  documentNumber: '', title: '', titleSlug: '', documentType: 'LAW', issuingBody: '',
  issuedDate: '', effectiveDate: '', expirationDate: '', status: 'EFFECTIVE',
  preamble: '', keywords: [], summary: '', jurisdiction: 'viet_nam',
  sourceOrigin: '', sourceUrl: '', applicableEntities: [], legalDomains: [], legalSummary: '',
  semanticId: '',
};

interface Props {
  initialData?: Partial<DocumentFormData>;
  onSubmit: (data: DocumentFormData) => void;
  saving: boolean;
}

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput('');
  };

  return (
    <div style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '6px 10px', minHeight: '40px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
      {value.map(tag => (
        <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', backgroundColor: '#ecfeff', color: '#0891b2', borderRadius: '4px', fontSize: '12px' }}>
          {tag}
          <button onClick={() => onChange(value.filter(t => t !== tag))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0891b2', padding: 0, fontSize: '14px', lineHeight: 1 }}>×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
        onBlur={addTag}
        placeholder={value.length === 0 ? (placeholder || 'Nhập rồi Enter...') : ''}
        style={{ border: 'none', outline: 'none', fontSize: '13px', flex: 1, minWidth: '80px', backgroundColor: 'transparent' }}
      />
    </div>
  );
}

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

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
};

export function DocumentForm({ initialData, onSubmit, saving }: Props) {
  const [form, setForm] = useState<DocumentFormData>({ ...EMPTY, ...initialData });

  const set = (key: keyof DocumentFormData, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Section 1: Core metadata */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e', marginTop: 0, marginBottom: '16px' }}>
          📋 Thông tin cơ bản
        </h2>
        <div style={{ ...gridStyle, marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Số văn bản *</label>
            <input style={inputStyle} value={form.documentNumber} onChange={e => set('documentNumber', e.target.value)} required placeholder="45/2019/QH14" />
          </div>
          <div>
            <label style={labelStyle}>Loại văn bản *</label>
            <select style={inputStyle} value={form.documentType} onChange={e => set('documentType', e.target.value)}>
              {[['LAW','Luật'],['CODE','Bộ luật'],['DECREE','Nghị định'],['CIRCULAR','Thông tư'],
                ['RESOLUTION','Nghị quyết'],['DECISION','Quyết định'],['DIRECTIVE','Chỉ thị'],['DISPATCH','Công văn']].map(([v,l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Tên văn bản *</label>
          <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Luật Doanh nghiệp" />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Slug (URL)</label>
          <input style={inputStyle} value={form.titleSlug} onChange={e => set('titleSlug', e.target.value)} placeholder="luat-doanh-nghiep" />
        </div>

        <div style={{ ...gridStyle, marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Cơ quan ban hành *</label>
            <input style={inputStyle} value={form.issuingBody} onChange={e => set('issuingBody', e.target.value)} required placeholder="Quốc hội" />
          </div>
          <div>
            <label style={labelStyle}>Trạng thái</label>
            <select style={inputStyle} value={form.status} onChange={e => set('status', e.target.value)}>
              {[['EFFECTIVE','Đang có hiệu lực'],['EXPIRED','Hết hiệu lực'],['DRAFT','Dự thảo'],
                ['NOT_YET_EFFECTIVE','Chưa có hiệu lực'],['PARTIALLY_EXPIRED','Hết hiệu lực một phần']].map(([v,l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>Ngày ban hành *</label>
            <input type="date" style={inputStyle} value={form.issuedDate} onChange={e => set('issuedDate', e.target.value)} required />
          </div>
          <div>
            <label style={labelStyle}>Ngày có hiệu lực</label>
            <input type="date" style={inputStyle} value={form.effectiveDate} onChange={e => set('effectiveDate', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Ngày hết hiệu lực</label>
            <input type="date" style={inputStyle} value={form.expirationDate} onChange={e => set('expirationDate', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Section 2: AI metadata */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e', marginTop: 0, marginBottom: '16px' }}>
          🤖 Metadata AI
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Lĩnh vực pháp luật</label>
          <TagInput value={form.legalDomains} onChange={v => set('legalDomains', v)} placeholder="doanh nghiệp, thuế..." />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Đối tượng áp dụng</label>
          <TagInput value={form.applicableEntities} onChange={v => set('applicableEntities', v)} placeholder="doanh nghiệp, cá nhân..." />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Từ khóa</label>
          <TagInput value={form.keywords} onChange={v => set('keywords', v)} placeholder="thành lập công ty, vốn điều lệ..." />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Tóm tắt AI</label>
          <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={form.legalSummary} onChange={e => set('legalSummary', e.target.value)} placeholder="Tóm tắt ngắn về nội dung văn bản cho AI..." />
        </div>

        <div>
          <label style={labelStyle}>Tóm tắt chung</label>
          <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={form.summary} onChange={e => set('summary', e.target.value)} placeholder="Tóm tắt nội dung văn bản..." />
        </div>
      </div>

      {/* Section 3: Source */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e', marginTop: 0, marginBottom: '16px' }}>
          🔗 Nguồn & Thẩm quyền
        </h2>
        <div style={{ ...gridStyle, marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Jurisdiction</label>
            <input style={inputStyle} value={form.jurisdiction} onChange={e => set('jurisdiction', e.target.value)} placeholder="viet_nam" />
          </div>
          <div>
            <label style={labelStyle}>Nguồn gốc</label>
            <input style={inputStyle} value={form.sourceOrigin} onChange={e => set('sourceOrigin', e.target.value)} placeholder="Cổng thông tin pháp luật" />
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>URL nguồn</label>
          <input type="url" style={inputStyle} value={form.sourceUrl} onChange={e => set('sourceUrl', e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label style={labelStyle}>Semantic ID (AI)</label>
          <input style={inputStyle} value={form.semanticId} onChange={e => set('semanticId', e.target.value)} placeholder="VN_LDN_2020" />
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>
            Mã định danh ổn định cho AI agents (vd: VN_LDN_2020). Tự động điền từ JSON.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        style={{
          padding: '12px 32px',
          backgroundColor: saving ? '#9ca3af' : '#0891b2',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer',
        }}
      >
        {saving ? 'Đang lưu...' : 'Lưu văn bản'}
      </button>
    </form>
  );
}
