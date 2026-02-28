'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, FileText, ArrowRight } from 'lucide-react';

interface LegalUpdate {
  id: string;
  title: string;
  type: 'Luật' | 'Nghị định' | 'Thông tư' | 'Quyết định';
  number: string;
  effectiveDate: string;
  category: string;
  status: 'new' | 'amended' | 'replaced';
}

const legalUpdates: LegalUpdate[] = [
  {
    id: '1',
    title: 'Luật sửa đổi, bổ sung một số điều của Luật Đất đai',
    type: 'Luật',
    number: '45/2024/QH15',
    effectiveDate: '2024-08-01',
    category: 'Đất đai',
    status: 'amended',
  },
  {
    id: '2',
    title: 'Nghị định quy định về xử phạt vi phạm hành chính trong lĩnh vực lao động',
    type: 'Nghị định',
    number: '12/2024/NĐ-CP',
    effectiveDate: '2024-07-01',
    category: 'Lao động',
    status: 'new',
  },
  {
    id: '3',
    title: 'Thông tư hướng dẫn về thuế thu nhập doanh nghiệp',
    type: 'Thông tư',
    number: '08/2024/TT-BTC',
    effectiveDate: '2024-06-15',
    category: 'Thuế',
    status: 'new',
  },
  {
    id: '4',
    title: 'Nghị định về đăng ký doanh nghiệp',
    type: 'Nghị định',
    number: '15/2024/NĐ-CP',
    effectiveDate: '2024-06-01',
    category: 'Doanh nghiệp',
    status: 'replaced',
  },
  {
    id: '5',
    title: 'Luật Bảo hiểm xã hội (sửa đổi)',
    type: 'Luật',
    number: '41/2024/QH15',
    effectiveDate: '2025-01-01',
    category: 'Bảo hiểm',
    status: 'amended',
  },
];

const documentTypes = ['Tất cả', 'Luật', 'Nghị định', 'Thông tư', 'Quyết định'];
const categories = ['Lao động', 'Thuế', 'Doanh nghiệp', 'Đất đai', 'Bảo hiểm'];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getStatusStyle(status: LegalUpdate['status']) {
  switch (status) {
    case 'new':
      return { backgroundColor: '#ecfdf5', color: '#059669' };
    case 'amended':
      return { backgroundColor: '#fffbeb', color: '#d97706' };
    case 'replaced':
      return { backgroundColor: '#f5f5f5', color: '#525252' };
  }
}

function getStatusLabel(status: LegalUpdate['status']) {
  switch (status) {
    case 'new':
      return 'Mới';
    case 'amended':
      return 'Sửa đổi';
    case 'replaced':
      return 'Thay thế';
  }
}

function getTypeStyle(type: LegalUpdate['type']) {
  const styles: Record<string, { backgroundColor: string; color: string }> = {
    'Luật': { backgroundColor: '#ecfeff', color: '#0891b2' },
    'Nghị định': { backgroundColor: '#f5f3ff', color: '#7c3aed' },
    'Thông tư': { backgroundColor: '#fffbeb', color: '#d97706' },
    'Quyết định': { backgroundColor: '#fef2f2', color: '#dc2626' },
  };
  return styles[type];
}

export default function ThayDoiMoiPage() {
  const [selectedType, setSelectedType] = useState('Tất cả');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const filteredUpdates = legalUpdates.filter((update) => {
    const typeMatch = selectedType === 'Tất cả' || update.type === selectedType;
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(update.category);
    return typeMatch && categoryMatch;
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: 'calc(100vh - 64px)' }}>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '48px 24px',
        }}
      >
        {/* Page Title */}
        <div style={{ marginBottom: '40px' }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#171717',
              marginBottom: '8px',
            }}
          >
            Thay đổi pháp luật mới
          </h1>
          <p style={{ fontSize: '16px', color: '#525252' }}>
            Cập nhật các văn bản pháp luật mới ban hành và sửa đổi
          </p>
        </div>

        {/* Two-column layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 300px',
            gap: '32px',
          }}
          className="content-grid"
        >
          {/* Left Column - Document List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredUpdates.map((update) => (
              <Link
                key={update.id}
                href={`/documents/${update.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '20px',
                  textDecoration: 'none',
                  border: '1px solid #e5e5e5',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0891b2';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e5e5';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Date badge */}
                <div
                  style={{
                    flexShrink: 0,
                    width: '64px',
                    textAlign: 'center',
                    padding: '8px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                  }}
                >
                  <Calendar style={{ width: '16px', height: '16px', color: '#737373', margin: '0 auto 4px' }} />
                  <div style={{ fontSize: '12px', color: '#737373' }}>
                    {formatDate(update.effectiveDate)}
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        ...getTypeStyle(update.type),
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 500,
                      }}
                    >
                      {update.type}
                    </span>
                    <span
                      style={{
                        ...getStatusStyle(update.status),
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 500,
                      }}
                    >
                      {getStatusLabel(update.status)}
                    </span>
                    <span style={{ fontSize: '12px', color: '#a3a3a3' }}>
                      Số: {update.number}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#171717',
                      lineHeight: 1.4,
                      marginBottom: '4px',
                    }}
                  >
                    {update.title}
                  </h3>
                  <span style={{ fontSize: '13px', color: '#737373' }}>
                    {update.category}
                  </span>
                </div>

                {/* Arrow */}
                <ArrowRight
                  style={{
                    flexShrink: 0,
                    width: '20px',
                    height: '20px',
                    color: '#d4d4d4',
                    alignSelf: 'center',
                  }}
                />
              </Link>
            ))}

            {filteredUpdates.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '48px',
                  color: '#737373',
                }}
              >
                <FileText style={{ width: '48px', height: '48px', color: '#d4d4d4', margin: '0 auto 16px' }} />
                <p>Không tìm thấy văn bản phù hợp</p>
              </div>
            )}
          </div>

          {/* Right Column - Filters */}
          <div>
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e5e5e5',
                position: 'sticky',
                top: '88px',
              }}
            >
              {/* Document Type Filter */}
              <div style={{ marginBottom: '24px' }}>
                <h4
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#171717',
                    marginBottom: '12px',
                  }}
                >
                  Loại văn bản
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {documentTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: selectedType === type ? '#0891b2' : '#f5f5f5',
                        color: selectedType === type ? '#ffffff' : '#525252',
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#171717',
                    marginBottom: '12px',
                  }}
                >
                  Lĩnh vực
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {categories.map((category) => (
                    <label
                      key={category}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        backgroundColor: selectedCategories.includes(category) ? '#ecfeff' : 'transparent',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        style={{
                          width: '16px',
                          height: '16px',
                          accentColor: '#0891b2',
                        }}
                      />
                      <span style={{ fontSize: '14px', color: '#525252' }}>{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
