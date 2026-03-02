'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/stores/adminAuth';
import { login } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login: storeLogin } = useAdminAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (!result.user.isAdmin) {
        setError('Tài khoản này không có quyền admin.');
        return;
      }

      storeLogin(result.user as Parameters<typeof storeLogin>[0], result.token);
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f0f1a',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '40px',
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '24px' }}>L</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, margin: 0 }}>
            LCVN Admin
          </h1>
          <p style={{ color: '#888', fontSize: '14px', marginTop: '4px' }}>
            Đăng nhập vào trang quản trị
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#b0b0b0', fontSize: '13px', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#0f0f1a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="admin@vietlaw.vn"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#b0b0b0', fontSize: '13px', marginBottom: '6px' }}>
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#0f0f1a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#555' : 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
