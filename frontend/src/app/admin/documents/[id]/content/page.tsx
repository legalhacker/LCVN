'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuthStore } from '@/stores/adminAuth';
import { createAdminApi } from '@/lib/adminApi';

interface UploadResult {
  success: boolean;
  articleCount: number;
  rawTextLength: number;
}

export default function ContentPage() {
  const params = useParams();
  const { token } = useAdminAuthStore();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file || !token) return;
    setUploading(true);
    setError('');
    setResult(null);
    try {
      const res = await createAdminApi(token).uploadDocument(id, file) as UploadResult;
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 24px',
    border: 'none',
    borderBottom: active ? '2px solid #0891b2' : '2px solid transparent',
    backgroundColor: 'transparent',
    color: active ? '#0891b2' : '#6b7280',
    fontSize: '14px',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
  });

  return (
    <div style={{ padding: '32px', maxWidth: '760px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href={`/admin/documents/${id}`} style={{ color: '#0891b2', textDecoration: 'none', fontSize: '13px' }}>
          ← Thông tin văn bản
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', marginTop: '8px', marginBottom: 0 }}>
          Nội dung văn bản
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <button style={tabStyle(activeTab === 'upload')} onClick={() => setActiveTab('upload')}>
          📤 Upload .docx
        </button>
        <button style={tabStyle(activeTab === 'paste')} onClick={() => setActiveTab('paste')}>
          📝 Dán văn bản
        </button>
      </div>

      {activeTab === 'upload' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <p style={{ color: '#6b7280', fontSize: '13px', marginTop: 0 }}>
            Upload file .docx để tự động trích xuất các điều luật. Các điều hiện tại sẽ bị thay thế.
          </p>

          <div
            style={{
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>📄</div>
            <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
              {file ? file.name : 'Chọn file .docx'}
            </div>
            <input
              type="file"
              accept=".docx"
              onChange={e => setFile(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label
              htmlFor="file-input"
              style={{
                padding: '8px 20px',
                backgroundColor: '#ecfeff',
                color: '#0891b2',
                border: '1px solid #0891b2',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              Chọn file
            </label>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          {result && (
            <div style={{ padding: '10px 14px', backgroundColor: '#d1fae5', color: '#059669', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}>
              Đã trích xuất {result.articleCount} điều từ {(result.rawTextLength / 1000).toFixed(1)}KB văn bản.
              {' '}<Link href={`/admin/documents/${id}/articles`} style={{ color: '#059669', fontWeight: 600 }}>Xem điều →</Link>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            style={{
              padding: '10px 24px',
              backgroundColor: !file || uploading ? '#9ca3af' : '#0891b2',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: !file || uploading ? 'not-allowed' : 'pointer',
            }}
          >
            {uploading ? 'Đang xử lý...' : 'Upload & Trích xuất'}
          </button>
        </div>
      )}

      {activeTab === 'paste' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <p style={{ color: '#6b7280', fontSize: '13px', marginTop: 0 }}>
            Tính năng dán văn bản trực tiếp đang phát triển. Sử dụng upload .docx để trích xuất điều luật.
          </p>
          <textarea
            rows={20}
            disabled
            placeholder="Tính năng đang phát triển..."
            style={{
              width: '100%',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '13px',
              fontFamily: 'monospace',
              backgroundColor: '#f9fafb',
              boxSizing: 'border-box',
              resize: 'vertical',
              color: '#9ca3af',
            }}
          />
        </div>
      )}
    </div>
  );
}
