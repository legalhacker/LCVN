import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">
          LCVN
          <span className="ml-2 text-sm font-normal text-gray-500">
            Luật Chuẩn Việt Nam
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/doc/bo-luat-lao-dong/2019"
            className="text-gray-600 hover:text-gray-900"
          >
            Bộ luật Lao động
          </Link>
        </nav>
      </div>
    </header>
  );
}
