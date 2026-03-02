'use client';

import {
  List, GitCompare, Languages, Download,
  Bookmark, Bell, AlertCircle, Printer, MoreVertical,
} from 'lucide-react';
import { useState } from 'react';

interface ToolbarBtnProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function ToolbarBtn({ icon, label, active = false, onClick }: ToolbarBtnProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '5px 10px',
        fontSize: '12px',
        fontWeight: 500,
        color: active ? '#1565c0' : hovered ? '#263238' : '#546e7a',
        backgroundColor: active ? '#e3f2fd' : hovered ? '#f5f5f5' : 'transparent',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s',
      }}
    >
      {icon}
      <span className="toolbar-label">{label}</span>
    </button>
  );
}

function Divider() {
  return (
    <div style={{
      width: '1px',
      height: '20px',
      backgroundColor: '#e0e0e0',
      margin: '0 4px',
      flexShrink: 0,
    }} />
  );
}

interface Props {
  showTOC: boolean;
  onToggleTOC: () => void;
}

export function DocumentToolbar({ showTOC, onToggleTOC }: Props) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      padding: '4px 20px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e0e0e0',
      flexShrink: 0,
      overflowX: 'auto',
    }}>
      <ToolbarBtn
        icon={<List size={14} />}
        label="Mục lục"
        active={showTOC}
        onClick={onToggleTOC}
      />

      <Divider />

      {/* TODO: implement document comparison */}
      <ToolbarBtn
        icon={<GitCompare size={14} />}
        label="So sánh VB"
        onClick={() => { /* TODO: open compare modal */ }}
      />

      {/* TODO: implement bilingual split view */}
      <ToolbarBtn
        icon={<Languages size={14} />}
        label="VB song ngữ"
        onClick={() => { /* TODO: toggle bilingual view */ }}
      />

      <Divider />

      {/* TODO: trigger file download */}
      <ToolbarBtn
        icon={<Download size={14} />}
        label="Tải VB"
        onClick={() => { /* TODO: download original document */ }}
      />

      {/* TODO: save to user library */}
      <ToolbarBtn
        icon={<Bookmark size={14} />}
        label="Lưu"
        onClick={() => { /* TODO: save document to user library */ }}
      />

      {/* TODO: follow document for update notifications */}
      <ToolbarBtn
        icon={<Bell size={14} />}
        label="Theo dõi"
        onClick={() => { /* TODO: subscribe to document updates */ }}
      />

      <Divider />

      {/* TODO: open report error form */}
      <ToolbarBtn
        icon={<AlertCircle size={14} />}
        label="Báo lỗi"
        onClick={() => { /* TODO: open error report dialog */ }}
      />

      {/* TODO: print document */}
      <ToolbarBtn
        icon={<Printer size={14} />}
        label="In"
        onClick={() => { if (typeof window !== 'undefined') window.print(); }}
      />

      <Divider />

      {/* TODO: overflow menu for less-used actions */}
      <ToolbarBtn
        icon={<MoreVertical size={14} />}
        label=""
        onClick={() => { /* TODO: open overflow menu */ }}
      />

      <style jsx global>{`
        @media (max-width: 900px) {
          .toolbar-label { display: none; }
        }
      `}</style>
    </div>
  );
}
