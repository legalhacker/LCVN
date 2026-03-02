'use client';

import { formatDate } from '@/lib/utils';
import { Document } from '@/lib/api';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  EFFECTIVE:         { label: 'Còn hiệu lực',           bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
  EXPIRED:           { label: 'Hết hiệu lực',            bg: '#ffebee', text: '#c62828', border: '#ef9a9a' },
  NOT_YET_EFFECTIVE: { label: 'Chưa có hiệu lực',        bg: '#fff3e0', text: '#ef6c00', border: '#ffcc80' },
  PARTIALLY_EXPIRED: { label: 'Hết hiệu lực một phần',   bg: '#fce4ec', text: '#ad1457', border: '#f48fb1' },
  DRAFT:             { label: 'Dự thảo',                 bg: '#f3e5f5', text: '#6a1b9a', border: '#ce93d8' },
};

interface Props {
  document: Document;
}

export function ValidityTab({ document }: Props) {
  const cfg = STATUS_CONFIG[document.status] ?? STATUS_CONFIG.EFFECTIVE;

  return (
    <div style={{ padding: '40px 48px 80px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: '16px', fontWeight: 700, color: '#263238',
          marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #e3f2fd',
        }}>
          Thông tin hiệu lực
        </h2>

        {/* Status badge */}
        <div style={{ marginBottom: '24px' }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 16px',
            fontSize: '14px',
            fontWeight: 700,
            color: cfg.text,
            backgroundColor: cfg.bg,
            border: `1px solid ${cfg.border}`,
            borderRadius: '6px',
          }}>
            {cfg.label}
          </span>
        </div>

        {/* Date table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
          {[
            { label: 'Số hiệu',        value: document.documentNumber },
            { label: 'Ban hành',        value: formatDate(document.issuedDate) },
            { label: 'Có hiệu lực từ', value: document.effectiveDate ? formatDate(document.effectiveDate) : '—' },
            { label: 'Cơ quan ban hành', value: document.issuingBody },
          ].map(({ label, value }) => (
            <div key={label} style={{
              display: 'flex',
              backgroundColor: '#fff',
              borderBottom: '1px solid #f5f5f5',
            }}>
              <div style={{
                width: '180px', flexShrink: 0,
                padding: '12px 16px',
                fontSize: '13px', fontWeight: 600, color: '#546e7a',
                backgroundColor: '#fafafa',
              }}>
                {label}
              </div>
              <div style={{ flex: 1, padding: '12px 16px', fontSize: '13px', color: '#263238' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
