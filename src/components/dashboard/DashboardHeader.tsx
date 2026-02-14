import Link from "next/link";

export default function DashboardHeader() {
  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center px-4 lg:px-6 shrink-0">
      {/* Mobile menu trigger */}
      <label
        htmlFor="sidebar-toggle"
        className="lg:hidden cursor-pointer text-gray-500 hover:text-gray-700 mr-4"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </label>

      {/* Search — centered */}
      <form action="/search" method="get" className="flex-1 max-w-xl mx-auto">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            name="q"
            placeholder="Tìm kiếm sự thay đổi của quy định pháp luật"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-300 focus:bg-white focus:ring-1 focus:ring-gray-300 transition-colors"
          />
        </div>
      </form>

      <div className="flex items-center gap-3 shrink-0">
        {/* Notification */}
        <button
          type="button"
          className="relative p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Notifications"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User */}
        <Link
          href="/api-docs"
          className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-medium"
        >
          U
        </Link>
      </div>
    </header>
  );
}
