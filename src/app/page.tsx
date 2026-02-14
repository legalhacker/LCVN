import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://lcvn.vn";

export const metadata: Metadata = {
  title: "LCVN - Legal Compliance in Vietnam",
  description:
    "Structured Vietnamese legal documents optimized for research, navigation, and citation.",
  alternates: {
    canonical: `${BASE_URL}/`,
  },
  openGraph: {
    title: "LCVN - Legal Compliance in Vietnam",
    description: "Structured Vietnamese legal documents optimized for research, navigation, and citation.",
    url: `${BASE_URL}/`,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "LCVN - Legal Compliance in Vietnam",
  url: `${BASE_URL}/`,
  potentialAction: {
    "@type": "SearchAction",
    target: `${BASE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

interface FeedItem {
  id: string;
  title: string;
  summary: string;
  legalBasis: string;
  sourceDocument: string;
  tags: string[];
  href: string;
}

const FEED_ITEMS: FeedItem[] = [
  {
    id: "shtt-ai-ownership",
    title: "Lần đầu tiên luật hóa quyền sở hữu trí tuệ gắn với trí tuệ nhân tạo (AI)",
    summary:
      "Luật SHTT sửa đổi 2025 lần đầu tiên quy định việc xác lập quyền sở hữu trí tuệ đối với đối tượng được tạo ra có sử dụng hệ thống trí tuệ nhân tạo. Chính phủ được giao quy định chi tiết về phát sinh quyền, xác lập quyền và chủ thể quyền trong các trường hợp có AI tham gia.",
    legalBasis: "Khoản 5 Điều 6 (bổ sung)",
    sourceDocument: "Luật Sở hữu trí tuệ sửa đổi 2025 – số 131/2025/QH15",
    tags: ["AI", "Sở hữu trí tuệ", "Luật mới 2025"],
    href: "/search?q=s%E1%BB%9F+h%E1%BB%AFu+tr%C3%AD+tu%E1%BB%87+AI",
  },
  {
    id: "shtt-ai-training-data",
    title: "Cho phép sử dụng dữ liệu đã công bố để huấn luyện hệ thống AI",
    summary:
      "Pháp luật lần đầu cho phép sử dụng hợp pháp văn bản và dữ liệu về đối tượng quyền sở hữu trí tuệ đã được công bố để nghiên cứu, thử nghiệm và huấn luyện hệ thống trí tuệ nhân tạo, với điều kiện không ảnh hưởng bất hợp lý đến quyền của chủ sở hữu.",
    legalBasis: "Khoản 5 Điều 7 (mới)",
    sourceDocument: "Luật Sở hữu trí tuệ sửa đổi 2025 – số 131/2025/QH15",
    tags: ["AI", "Dữ liệu", "Huấn luyện AI", "Bản quyền"],
    href: "/search?q=hu%E1%BA%A5n+luy%E1%BB%87n+AI+d%E1%BB%AF+li%E1%BB%87u",
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="p-4 lg:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 pb-4 mb-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-1.5 3h1.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
            </svg>
            <span className="text-sm font-semibold text-gray-500">Những thay đổi mới nhất</span>
          </div>

          {FEED_ITEMS.map((item, idx) => (
            <article
              key={item.id}
              className={`py-6 ${idx !== FEED_ITEMS.length - 1 ? "border-b border-gray-100" : ""}`}
            >
              {/* Title */}
              <h2 className="text-base font-semibold text-gray-900 leading-snug">
                {item.title}
              </h2>

              {/* Summary */}
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {item.summary}
              </p>

              {/* Legal basis + Source */}
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <p>
                  <span className="font-medium text-gray-600">Căn cứ pháp lý:</span>{" "}
                  {item.legalBasis}
                </p>
                <p>
                  <span className="font-medium text-gray-600">Văn bản nguồn:</span>{" "}
                  {item.sourceDocument}
                </p>
              </div>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action */}
              <div className="mt-4">
                <Link
                  href={item.href}
                  className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Xem chi tiết &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
