'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuthStore } from '@/stores/adminAuth';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/documents', label: 'Văn bản pháp luật', icon: '📄' },
  { href: '/admin/pages', label: 'Nội dung website', icon: '🌐' },
  { href: '/admin/updates', label: 'Thay đổi pháp luật', icon: '⚡' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, admin, logout } = useAdminAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [mounted, isAuthenticated, pathname, router]);

  // Show nothing while checking auth (avoid flicker)
  if (!mounted) return null;

  // Login page: no sidebar
  if (pathname === '/admin/login') {
    return (
      <>
        <meta name="robots" content="noindex,nofollow" />
        {children}
      </>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <meta name="robots" content="noindex,nofollow" />
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* Sidebar */}
        <aside
          style={{
            width: '240px',
            flexShrink: 0,
            backgroundColor: '#1a1a2e',
            color: '#e0e0e0',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Logo */}
          <div
            style={{
              padding: '24px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>L</span>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: '#fff' }}>LCVN Admin</div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '1px' }}>CMS Panel</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: '12px 0', flex: 1 }}>
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#22d3ee' : '#b0b0b0',
                    backgroundColor: isActive ? 'rgba(34,211,238,0.08)' : 'transparent',
                    textDecoration: 'none',
                    borderLeft: isActive ? '3px solid #22d3ee' : '3px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User + Logout */}
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Đăng nhập với</div>
            <div style={{ fontSize: '13px', color: '#e0e0e0', marginBottom: '12px', fontWeight: 500 }}>
              {admin?.fullName}
            </div>
            <button
              onClick={() => {
                logout();
                router.push('/admin/login');
              }}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: '#b0b0b0',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </>
  );
}
