import type { Metadata } from "next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
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
      <body className="bg-gray-100 text-gray-900 antialiased">
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
