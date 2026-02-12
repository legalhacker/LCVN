import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://lcvn.vn";

export const metadata: Metadata = {
  title: "LCVN - Luật Chuẩn Việt Nam",
  description:
    "Cơ sở dữ liệu pháp luật Việt Nam phục vụ AI và người dùng. Dữ liệu chuẩn hóa, có thể trích dẫn, với JSON-LD.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "LCVN",
  },
  twitter: {
    card: "summary",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
