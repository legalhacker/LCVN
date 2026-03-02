'use client';

import { Download } from 'lucide-react';

export type TabId =
  | 'summary'
  | 'content'
  | 'original'
  | 'english'
  | 'validity'
  | 'related'
  | 'diagram'
  | 'unified';

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: 'summary',  label: 'Tóm tắt' },
  { id: 'content',  label: 'Nội dung' },
  { id: 'original', label: 'VB gốc' },
  { id: 'english',  label: 'Tiếng Anh' },
  { id: 'validity', label: 'Hiệu lực' },
  { id: 'related',  label: 'VB liên quan' },
  { id: 'diagram',  label: 'Lược đồ' },
  { id: 'unified',  label: 'Nội dung hợp nhất' },
];

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  relatedCount?: number;
  onDownload?: () => void;
}

export function DocumentTabs({ activeTab, onTabChange, relatedCount = 0, onDownload }: Props) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'space-between',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e0e0e0',
      padding: '0 24px',
      flexShrink: 0,
      minHeight: '46px',
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'stretch', overflowX: 'auto', gap: 0 }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0 14px',
                fontSize: '13px',
                fontWeight: active ? 600 : 400,
                color: active ? '#1565c0' : '#546e7a',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: active ? '2px solid #1565c0' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s',
                marginBottom: '-1px',
              }}
            >
              {tab.label}
              {tab.id === 'related' && relatedCount > 0 && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  backgroundColor: active ? '#e3f2fd' : '#f1f8e9',
                  color: active ? '#1565c0' : '#558b2f',
                  padding: '1px 5px',
                  borderRadius: '8px',
                  lineHeight: '16px',
                }}>
                  {relatedCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Download button */}
      <button
        onClick={onDownload}
        title="Tải về văn bản"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0 14px',
          fontSize: '13px',
          fontWeight: 500,
          color: '#546e7a',
          backgroundColor: 'transparent',
          border: 'none',
          borderLeft: '1px solid #e0e0e0',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <Download size={14} />
        Tải về
      </button>
    </div>
  );
}
