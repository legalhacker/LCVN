'use client';

import { Mail, Phone, MapPin } from 'lucide-react';

export default function AboutPage() {
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
            Giới thiệu
          </h1>
          <p style={{ fontSize: '16px', color: '#525252' }}>
            Về LCVN và cách liên hệ với chúng tôi
          </p>
        </div>

        {/* Two-column layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '48px',
          }}
          className="about-grid"
        >
          {/* Left Column - About */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid #e5e5e5',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#171717',
                marginBottom: '20px',
              }}
            >
              Về LCVN
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '15px', color: '#525252', lineHeight: 1.7 }}>
                LCVN là nền tảng tra cứu pháp luật hiện đại, được thiết kế dành riêng cho
                doanh nghiệp và cá nhân tại Việt Nam.
              </p>

              <p style={{ fontSize: '15px', color: '#525252', lineHeight: 1.7 }}>
                Chúng tôi tin rằng việc tiếp cận thông tin pháp luật không nên là đặc quyền
                của riêng ai. LCVN giúp bạn tìm kiếm, tra cứu và hiểu các văn bản pháp luật
                một cách dễ dàng và nhanh chóng.
              </p>

              <div style={{ marginTop: '16px' }}>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#171717',
                    marginBottom: '12px',
                  }}
                >
                  Tại sao chọn LCVN?
                </h3>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {[
                    'Dữ liệu pháp luật chính xác, cập nhật liên tục',
                    'Giao diện thân thiện, dễ sử dụng',
                    'Tìm kiếm thông minh, nhanh chóng',
                    'Miễn phí cho người dùng cơ bản',
                  ].map((item, index) => (
                    <li
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        fontSize: '14px',
                        color: '#525252',
                      }}
                    >
                      <span
                        style={{
                          flexShrink: 0,
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#0891b2',
                          marginTop: '7px',
                        }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Contact */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid #e5e5e5',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#171717',
                marginBottom: '20px',
              }}
            >
              Liên hệ
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#ecfeff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Mail style={{ width: '20px', height: '20px', color: '#0891b2' }} />
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: '#737373', marginBottom: '4px' }}>Email</p>
                  <a
                    href="mailto:hello@lcvn.vn"
                    style={{
                      fontSize: '15px',
                      color: '#171717',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#0891b2')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#171717')}
                  >
                    hello@lcvn.vn
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#ecfeff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Phone style={{ width: '20px', height: '20px', color: '#0891b2' }} />
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: '#737373', marginBottom: '4px' }}>Hotline</p>
                  <a
                    href="tel:1900xxxx"
                    style={{
                      fontSize: '15px',
                      color: '#171717',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#0891b2')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#171717')}
                  >
                    1900 xxxx
                  </a>
                </div>
              </div>

              {/* Address */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#ecfeff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MapPin style={{ width: '20px', height: '20px', color: '#0891b2' }} />
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: '#737373', marginBottom: '4px' }}>Địa chỉ</p>
                  <p
                    style={{
                      fontSize: '15px',
                      color: '#171717',
                      fontWeight: 500,
                      lineHeight: 1.5,
                    }}
                  >
                    Tầng 10, Tòa nhà ABC
                    <br />
                    Quận 1, TP. Hồ Chí Minh
                  </p>
                </div>
              </div>

              {/* Working hours */}
              <div
                style={{
                  marginTop: '8px',
                  padding: '16px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '12px',
                }}
              >
                <p style={{ fontSize: '13px', color: '#737373', marginBottom: '4px' }}>
                  Giờ làm việc
                </p>
                <p style={{ fontSize: '14px', color: '#171717', fontWeight: 500 }}>
                  Thứ 2 - Thứ 6: 8:00 - 17:30
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .about-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
