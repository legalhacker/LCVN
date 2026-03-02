'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminAuthStore } from '@/stores/adminAuth';
import { createAdminApi } from '@/lib/adminApi';

interface Stats {
  totalDocuments: number;
  totalArticles: number;
  totalPages: number;
  totalUpdates: number;
  recentDocuments: Array<{ id: string; documentNumber: string; title: string; documentType: string; status: string; createdAt: string }>;
  recentUpdates: Array<{ id: string; title: string; publishDate: string; isPublished: boolean; createdAt: string }>;
}

const TYPE_LABELS: Record<string, string> = {
  LAW: 'Luật', CODE: 'Bộ luật', DECREE: 'Nghị định', CIRCULAR: 'Thông tư',
  RESOLUTION: 'Nghị quyết', DECISION: 'Quyết định', DIRECTIVE: 'Chỉ thị', DISPATCH: 'Công văn',
};

export default function DashboardPage() {
  const { token } = useAdminAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const api = createAdminApi(token);
    api.getStats()
      .then(data => setStats(data as Stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const statCards = [
    { label: 'Văn bản pháp luật', value: stats?.totalDocuments ?? 0, href: '/admin/documents', color: '#0891b2' },
    { label: 'Điều luật', value: stats?.totalArticles ?? 0, href: '/admin/documents', color: '#7c3aed' },
    { label: 'Trang CMS', value: stats?.totalPages ?? 0, href: '/admin/pages', color: '#059669' },
    { label: 'Thay đổi pháp luật', value: stats?.totalUpdates ?? 0, href: '/admin/updates', color: '#d97706' },
  ];

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
        Dashboard
      </h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>Tổng quan hệ thống LCVN</p>

      {loading ? (
        <div style={{ color: '#888' }}>Đang tải...</div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            {statCards.map(card => (
              <Link key={card.href + card.label} href={card.href} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    borderLeft: `4px solid ${card.color}`,
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{ fontSize: '32px', fontWeight: 700, color: card.color }}>
                    {card.value.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>{card.label}</div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Recent documents */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Văn bản mới nhất</h2>
                <Link href="/admin/documents" style={{ fontSize: '13px', color: '#0891b2', textDecoration: 'none' }}>
                  Xem tất cả →
                </Link>
              </div>
              {stats?.recentDocuments.map(doc => (
                <Link key={doc.id} href={`/admin/documents/${doc.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      padding: '10px 0',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#262626', marginBottom: '2px' }}>
                      {doc.documentNumber}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {doc.title}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: '#ecfeff', color: '#0891b2', borderRadius: '4px' }}>
                        {TYPE_LABELS[doc.documentType] || doc.documentType}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Recent updates */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Thay đổi mới nhất</h2>
                <Link href="/admin/updates" style={{ fontSize: '13px', color: '#0891b2', textDecoration: 'none' }}>
                  Xem tất cả →
                </Link>
              </div>
              {stats?.recentUpdates.length === 0 && (
                <div style={{ color: '#888', fontSize: '13px' }}>Chưa có thay đổi nào.</div>
              )}
              {stats?.recentUpdates.map(upd => (
                <Link key={upd.id} href={`/admin/updates/${upd.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#262626', marginBottom: '2px' }}>
                      {upd.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {new Date(upd.publishDate).toLocaleDateString('vi-VN')}
                      {' · '}
                      <span style={{ color: upd.isPublished ? '#059669' : '#d97706' }}>
                        {upd.isPublished ? 'Đã đăng' : 'Bản nháp'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
