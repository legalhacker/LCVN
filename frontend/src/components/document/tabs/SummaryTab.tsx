'use client';

import { FileText } from 'lucide-react';
import { Document } from '@/lib/api';

interface Props {
  document: Document;
}

export function SummaryTab({ document }: Props) {
  if (!document.summary) {
    return (
      <div style={{ padding: '80px 48px', textAlign: 'center' }}>
        <FileText size={40} style={{ color: '#cfd8dc', marginBottom: '16px' }} />
        <p style={{ color: '#90a4ae', fontSize: '14px', margin: 0 }}>
          Tóm tắt văn bản đang được biên soạn.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 48px 80px' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#263238',
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: '2px solid #e3f2fd',
        }}>
          Tóm tắt nội dung
        </h2>
        <div style={{
          fontSize: '15px',
          lineHeight: 2,
          color: '#37474f',
          whiteSpace: 'pre-line',
        }}>
          {document.summary}
        </div>
      </div>
    </div>
  );
}
