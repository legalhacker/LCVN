import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'LCVN - Tra cứu pháp luật dễ dàng',
  description: 'Nền tảng tra cứu pháp luật hiện đại dành cho doanh nghiệp Việt Nam',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          minHeight: '100vh',
          margin: 0,
          padding: 0,
          backgroundColor: '#fafafa',
          color: '#262626',
        }}
      >
        <Providers>
          <Navbar />
          <main style={{ paddingTop: '64px' }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
