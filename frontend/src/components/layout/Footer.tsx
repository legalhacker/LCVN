'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-100 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">L</span>
              </div>
              <span className="font-semibold text-lg text-neutral-800">
                LC<span className="text-primary-500">VN</span>
              </span>
            </Link>
            <p className="text-neutral-500 text-sm max-w-sm leading-relaxed">
              Nền tảng tra cứu pháp luật hiện đại, thân thiện dành cho doanh nghiệp và cá nhân Việt Nam.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-neutral-800 mb-4">Khám phá</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-neutral-500 hover:text-primary-600 text-sm transition-colors">
                  Pháp luật SME
                </Link>
              </li>
              <li>
                <Link href="/thay-doi-moi" className="text-neutral-500 hover:text-primary-600 text-sm transition-colors">
                  Thay đổi luật mới
                </Link>
              </li>
              <li>
                <Link href="/documents" className="text-neutral-500 hover:text-primary-600 text-sm transition-colors">
                  Tất cả văn bản
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-neutral-800 mb-4">Liên hệ</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-neutral-500 hover:text-primary-600 text-sm transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <a href="mailto:hello@lcvn.vn" className="text-neutral-500 hover:text-primary-600 text-sm transition-colors">
                  hello@lcvn.vn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-neutral-100 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-400 text-sm">
            © 2024 LCVN. Thông tin chỉ mang tính tham khảo.
          </p>
          <div className="flex items-center space-x-4 text-sm text-neutral-400">
            <span>Made with ♡ for Vietnamese businesses</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
