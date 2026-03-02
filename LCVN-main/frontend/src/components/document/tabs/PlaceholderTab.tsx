'use client';

import { Construction } from 'lucide-react';
import { TabId } from '../DocumentTabs';

const TAB_LABELS: Record<TabId, string> = {
  summary:  'Tóm tắt',
  content:  'Nội dung',
  original: 'Văn bản gốc',
  english:  'Tiếng Anh',
  validity: 'Hiệu lực',
  related:  'Văn bản liên quan',
  diagram:  'Lược đồ',
  unified:  'Nội dung hợp nhất',
};

interface Props {
  tab: TabId;
}

export function PlaceholderTab({ tab }: Props) {
  return (
    <div style={{ padding: '80px 48px', textAlign: 'center' }}>
      <Construction size={40} style={{ color: '#cfd8dc', marginBottom: '16px' }} />
      <p style={{ fontSize: '15px', fontWeight: 600, color: '#78909c', margin: '0 0 8px' }}>
        {TAB_LABELS[tab]}
      </p>
      <p style={{ fontSize: '13px', color: '#b0bec5', margin: 0 }}>
        Tính năng này đang được phát triển.
      </p>
    </div>
  );
}
