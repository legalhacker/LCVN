'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Users, Calculator, Building2, Handshake, Shield, AlertTriangle, Briefcase, Gavel } from 'lucide-react';

const categories = [
  {
    id: 'lao-dong',
    title: 'Lao động – Tiền lương',
    description: 'Hợp đồng lao động, BHXH, tiền lương, kỷ luật',
    icon: Users,
    color: '#3b82f6',
    bgColor: '#eff6ff',
  },
  {
    id: 'thue-ke-toan',
    title: 'Thuế & Kế toán',
    description: 'Thuế GTGT, thuế TNDN, hóa đơn, chế độ kế toán',
    icon: Calculator,
    color: '#10b981',
    bgColor: '#ecfdf5',
  },
  {
    id: 'doanh-nghiep',
    title: 'Doanh nghiệp',
    description: 'Thành lập, giải thể, sáp nhập, quản trị',
    icon: Building2,
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
  },
  {
    id: 'hop-dong',
    title: 'Hợp đồng',
    description: 'Hợp đồng thương mại, dân sự, mẫu phổ biến',
    icon: Handshake,
    color: '#f59e0b',
    bgColor: '#fffbeb',
  },
  {
    id: 'bao-hiem',
    title: 'Bảo hiểm',
    description: 'BHXH, BHYT, BHTN, bảo hiểm thương mại',
    icon: Shield,
    color: '#06b6d4',
    bgColor: '#ecfeff',
  },
  {
    id: 'xu-phat',
    title: 'Xử phạt hành chính',
    description: 'Vi phạm lao động, thuế, môi trường',
    icon: AlertTriangle,
    color: '#ef4444',
    bgColor: '#fef2f2',
  },
  {
    id: 'dau-tu',
    title: 'Đầu tư',
    description: 'Đầu tư trong nước, nước ngoài, ưu đãi',
    icon: Briefcase,
    color: '#6366f1',
    bgColor: '#eef2ff',
  },
  {
    id: 'tranh-chap',
    title: 'Tranh chấp & Tố tụng',
    description: 'Giải quyết tranh chấp, trọng tài, tố tụng',
    icon: Gavel,
    color: '#f97316',
    bgColor: '#fff7ed',
  },
];

export default function PhapLuatSMEPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: 'calc(100vh - 64px)' }}>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 24px',
        }}
      >
        {/* Search Section - Top */}
        <div style={{ marginBottom: '48px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#171717',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            Tra cứu văn bản pháp luật
          </h1>

          <form onSubmit={handleSearch}>
            <div
              style={{
                position: 'relative',
                maxWidth: '800px',
                margin: '0 auto',
              }}
            >
              <Search
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '24px',
                  height: '24px',
                  color: '#a3a3a3',
                }}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nhập từ khóa tìm kiếm..."
                style={{
                  width: '100%',
                  padding: '20px 140px 20px 56px',
                  fontSize: '18px',
                  border: '2px solid #e5e5e5',
                  borderRadius: '16px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0891b2';
                  e.target.style.boxShadow = '0 4px 24px rgba(8, 145, 178, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e5e5';
                  e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.06)';
                }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '14px 28px',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#ffffff',
                  backgroundColor: '#0891b2',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0e7490')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0891b2')}
              >
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>

        {/* SME Legal Categories Section */}
        <div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#171717',
              marginBottom: '24px',
            }}
          >
            Lĩnh vực pháp luật dành cho SME
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
            }}
            className="category-grid"
          >
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.id}
                  href={`/search?category=${category.id}`}
                  style={{
                    display: 'block',
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    padding: '20px',
                    textDecoration: 'none',
                    border: '1px solid #e5e5e5',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = category.color;
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e5e5';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: category.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    <IconComponent style={{ width: '22px', height: '22px', color: category.color }} />
                  </div>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#171717',
                      marginBottom: '6px',
                    }}
                  >
                    {category.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#737373',
                      lineHeight: 1.4,
                    }}
                  >
                    {category.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .category-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .category-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .category-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
