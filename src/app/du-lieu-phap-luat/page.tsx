import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://lcvn.vn";

export const metadata: Metadata = {
  title: "Dữ liệu pháp luật - LCVN",
  description: "Tra cứu dữ liệu pháp luật Việt Nam theo lĩnh vực. Đầu tư, lao động, thuế, đất đai, sở hữu trí tuệ và nhiều lĩnh vực khác.",
  alternates: {
    canonical: `${BASE_URL}/du-lieu-phap-luat`,
  },
  openGraph: {
    title: "Dữ liệu pháp luật - LCVN",
    description: "Tra cứu dữ liệu pháp luật Việt Nam theo lĩnh vực.",
    url: `${BASE_URL}/du-lieu-phap-luat`,
  },
};

const LEGAL_FIELDS = [
  {
    label: "Đầu tư & Doanh nghiệp",
    href: "/topic/corporate-law",
    icon: "building",
  },
  {
    label: "Lao động & Nhân sự",
    href: "/topic/labor-hr",
    icon: "users",
  },
  {
    label: "Thuế",
    href: "/topic/tax",
    icon: "receipt",
  },
  {
    label: "Đất đai & Xây dựng",
    href: "/search?q=%C4%91%E1%BA%A5t+%C4%91ai",
    icon: "map",
  },
  {
    label: "SHTT",
    href: "/topic/intellectual-property",
    icon: "lightbulb",
  },
  {
    label: "Môi trường – PCCC",
    href: "/topic/environment",
    icon: "leaf",
  },
  {
    label: "Bảo vệ dữ liệu",
    href: "/topic/data-protection",
    icon: "shield",
  },
  {
    label: "Khác",
    href: "/topic/criminal-law",
    icon: "folder",
  },
];

function FieldIcon({ type }: { type: string }) {
  const cls = "w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors";
  switch (type) {
    case "building":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      );
    case "users":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      );
    case "receipt":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      );
    case "map":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m0-8.25a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 9.75V15m0 0a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m-3.75 0h7.5M6 12h12" />
        </svg>
      );
    case "lightbulb":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
      );
    case "leaf":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      );
    case "shield":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      );
    case "folder":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
      );
    default:
      return <span className="w-6 h-6" />;
  }
}

export default function DuLieuPhapLuatPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Dữ liệu pháp luật
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Tra cứu văn bản pháp luật theo lĩnh vực
        </p>
      </div>

      {/* Search bar */}
      <form action="/search" method="get" className="relative max-w-xl">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          name="q"
          placeholder="Tìm kiếm văn bản pháp luật..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors"
        />
      </form>

      {/* Legal field cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {LEGAL_FIELDS.map((field) => (
          <Link
            key={field.label}
            href={field.href}
            className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <FieldIcon type={field.icon} />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
              {field.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
