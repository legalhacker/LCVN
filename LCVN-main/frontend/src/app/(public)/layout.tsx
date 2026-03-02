import { Navbar } from '@/components/layout/Navbar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '64px' }}>
        {children}
      </main>
    </>
  );
}
