'use client';

import Link from 'next/link';
import { Search, Bell, User, LogIn } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';

export function Header() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <span className="font-semibold text-xl text-gray-900">VietLaw</span>
        </Link>

        {/* Search bar (compact) */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm văn bản..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:border-primary-500"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-xs bg-gray-200 text-gray-500 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* User menu */}
              <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.fullName}
                </span>
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <LogIn className="w-4 h-4" />
              <span className="text-sm font-medium">Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
