'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  BookOpen,
  ScrollText,
  FileCheck,
  FileSpreadsheet,
  Mail,
  Sparkles,
  Users,
  Bookmark,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const documentTypes = [
  { name: 'Luật', icon: BookOpen, href: '/documents?type=LAW', color: 'text-blue-600' },
  { name: 'Bộ luật', icon: BookOpen, href: '/documents?type=CODE', color: 'text-blue-800' },
  { name: 'Nghị định', icon: ScrollText, href: '/documents?type=DECREE', color: 'text-green-600' },
  { name: 'Thông tư', icon: FileCheck, href: '/documents?type=CIRCULAR', color: 'text-purple-600' },
  { name: 'Quyết định', icon: FileSpreadsheet, href: '/documents?type=DECISION', color: 'text-red-600' },
  { name: 'Công văn', icon: Mail, href: '/documents?type=DISPATCH', color: 'text-orange-600' },
];

const mainNav = [
  { name: 'Trang chủ', icon: Home, href: '/' },
  { name: 'Tất cả văn bản', icon: FileText, href: '/documents' },
  { name: 'Văn bản mới', icon: Sparkles, href: '/documents/new' },
];

const userNav = [
  { name: 'Workspace', icon: Users, href: '/workspace' },
  { name: 'Đánh dấu', icon: Bookmark, href: '/bookmarks' },
  { name: 'Cài đặt', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4 space-y-8">
        {/* Main Navigation */}
        <div>
          <ul className="space-y-1">
            {mainNav.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    pathname === item.href
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Document Types */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Loại văn bản
          </h3>
          <ul className="space-y-1">
            {documentTypes.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    pathname === item.href
                      ? 'bg-gray-100 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <item.icon className={cn('w-5 h-5', item.color)} />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* User Navigation */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Cá nhân
          </h3>
          <ul className="space-y-1">
            {userNav.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    pathname === item.href
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
