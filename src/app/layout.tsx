import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "LCVN - Luật Chuẩn Việt Nam",
  description:
    "Cơ sở dữ liệu pháp luật Việt Nam phục vụ AI và người dùng. Dữ liệu chuẩn hóa, có thể trích dẫn, với JSON-LD.",
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
