import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xs text-gray-400 leading-relaxed max-w-lg">
            <p>
              LCVN provides structured legal documents for research and
              reference purposes only. This platform does not provide legal
              advice. Consult a qualified legal professional for specific
              matters.
            </p>
          </div>
          <nav aria-label="Footer" className="flex gap-4 text-xs text-gray-400 shrink-0">
            <Link href="/about" className="hover:text-gray-600 transition-colors">
              About
            </Link>
            <Link href="/doc/bo-luat-lao-dong/2019" className="hover:text-gray-600 transition-colors">
              Documents
            </Link>
            <Link href="/api-docs" className="hover:text-gray-600 transition-colors">
              API
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
