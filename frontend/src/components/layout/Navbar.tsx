'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/thay-doi-moi', label: 'Thay đổi luật mới' },
  { href: '/about', label: 'Giới thiệu' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e5e5',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <nav
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '18px' }}>L</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: '20px', color: '#262626' }}>
              LC<span style={{ color: '#0891b2' }}>VN</span>
            </span>
          </Link>

          {/* Desktop Navigation - Horizontal */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            className="desktop-nav"
          >
            {navLinks.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: isActive ? '#ecfeff' : 'transparent',
                    color: isActive ? '#0891b2' : '#525252',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                      e.currentTarget.style.color = '#171717';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#525252';
                    }
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <button
            className="mobile-menu-btn"
            style={{
              display: 'none',
              padding: '8px',
              color: '#525252',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div
            className="mobile-nav"
            style={{
              display: 'none',
              paddingBottom: '16px',
              borderTop: '1px solid #e5e5e5',
            }}
          >
            {navLinks.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    backgroundColor: isActive ? '#ecfeff' : 'transparent',
                    color: isActive ? '#0891b2' : '#525252',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
          .mobile-nav {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
