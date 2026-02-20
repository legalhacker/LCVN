import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <span className="text-lg font-bold tracking-tight text-gray-900">
            LCVN
          </span>
          <span className="hidden sm:inline ml-2 text-xs text-gray-400 font-normal">
            Legal Changes in Vietnam
          </span>
        </Link>

        <form
          action="/search"
          method="get"
          className="flex-1 max-w-lg"
        >
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
              placeholder="Search articles, legal topics, document numbers..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-300 focus:bg-white focus:ring-1 focus:ring-gray-300 transition-colors"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
