"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
  adminOnly?: boolean;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [activeHeadlineCount, setActiveHeadlineCount] = useState<number | null>(null);
  const [crawledPendingCount, setCrawledPendingCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/headlines?countOnly=true")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.activeCount === "number") {
          setActiveHeadlineCount(data.activeCount);
        }
      })
      .catch(() => {});

    fetch("/api/admin/crawled-items?countOnly=true")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.pendingCount === "number") {
          setCrawledPendingCount(data.pendingCount);
        }
      })
      .catch(() => {});
  }, []);

  const sections: NavSection[] = [
    {
      title: "TỔNG QUAN",
      items: [
        { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
      ],
    },
    {
      title: "THU THẬP",
      items: [
        {
          href: "/admin/crawled-items",
          label: "Tin thu thập",
          icon: "🔍",
          badge: crawledPendingCount ?? undefined,
        },
      ],
    },
    {
      title: "TRANG CHỦ",
      items: [
        {
          href: "/admin/headlines",
          label: "Headlines",
          icon: "📰",
          badge: activeHeadlineCount ?? undefined,
        },
      ],
    },
    {
      title: "NỘI DUNG",
      items: [
        { href: "/admin/regulatory-changes", label: "Thay đổi pháp luật", icon: "📋" },
        { href: "/admin/legal-documents", label: "Văn bản quy phạm", icon: "📄" },
        { href: "/admin/fields", label: "Lĩnh vực", icon: "🏷️" },
      ],
    },
    {
      title: "HỆ THỐNG",
      items: [
        { href: "/admin/users", label: "Người dùng", icon: "👥" },
      ],
      adminOnly: true,
    },
  ];

  return (
    <aside className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="px-6 py-4">
        <Link href="/admin/dashboard" className="block text-center">
          <span className="text-lg font-bold">LCVN</span>
          <span className="block text-xs text-gray-400">Legal Changes in Vietnam</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 px-3 py-4">
        {sections.map((section) => {
          if (section.adminOnly && session?.user?.role !== "admin") return null;
          return (
            <div key={section.title}>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 px-6 py-4">
        <Link
          href="/"
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
