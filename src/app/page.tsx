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
  slug: string;
  title: string;
  summary: string;
  legalBasis: string;
  sourceDocument: string;
  effectiveDate?: string;
  tags: string[];
}

const FEED_ITEMS: FeedItem[] = [
  {
    slug: "shtt-ai-ownership",
    title: "[Luật SHTT] Lần đầu luật hóa quyền SHTT với sản phẩm do AI tạo ra → ảnh hưởng trực tiếp tới doanh nghiệp công nghệ & startup AI",
    summary:
      "Trước đây, pháp luật SHTT không thừa nhận quyền sở hữu trí tuệ đối với sản phẩm được tạo ra bởi AI. Nay Luật SHTT sửa đổi 2025 chính thức cho phép xác lập quyền, đồng thời giao Chính phủ quy định chi tiết về chủ thể quyền khi có AI tham gia.",
    legalBasis: "Khoản 5 Điều 6 (bổ sung)",
    sourceDocument: "Luật Sở hữu trí tuệ sửa đổi 2025 – số 131/2025/QH15",
    effectiveDate: "2026-01-01",
    tags: ["AI", "Sở hữu trí tuệ", "Doanh nghiệp", "Luật mới 2025"],
  },
  {
    slug: "shtt-ai-training-data",
    title: "[Luật SHTT] Cho phép dùng dữ liệu đã công bố để huấn luyện AI → doanh nghiệp AI có cơ sở pháp lý rõ ràng để thu thập dữ liệu",
    summary:
      "Trước đây, việc sử dụng tác phẩm/dữ liệu có bản quyền để huấn luyện AI nằm trong vùng xám pháp lý. Nay luật cho phép rõ ràng, với điều kiện không ảnh hưởng bất hợp lý đến quyền của chủ sở hữu.",
    legalBasis: "Khoản 5 Điều 7 (mới)",
    sourceDocument: "Luật Sở hữu trí tuệ sửa đổi 2025 – số 131/2025/QH15",
    effectiveDate: "2026-01-01",
    tags: ["AI", "Dữ liệu", "Huấn luyện AI", "Bản quyền"],
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
            <span className="text-base">📰</span>
            <span className="text-sm font-semibold text-gray-500">Những thay đổi mới nhất</span>
          </div>

          {FEED_ITEMS.map((item, idx) => (
            <article
              key={item.slug}
              className={`py-5 ${idx !== FEED_ITEMS.length - 1 ? "border-b border-gray-100" : ""}`}
            >
              {/* Title */}
              <h2 className="text-[15px] font-semibold text-gray-900 leading-snug">
                <span className="mr-1">⚡</span>{item.title}
              </h2>

              {/* Summary */}
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {item.summary}
              </p>

              {/* Meta */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                <span>
                  <span className="text-gray-500">Căn cứ:</span> {item.legalBasis}
                </span>
                <span>
                  <span className="text-gray-500">Nguồn:</span> {item.sourceDocument}
                </span>
                {item.effectiveDate && (
                  <span>
                    <span className="text-gray-500">Hiệu lực:</span> {item.effectiveDate}
                  </span>
                )}
              </div>

              {/* Tags */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-3">
                <Link
                  href={`/thay-doi/${item.slug}`}
                  className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Xem phân tích chi tiết &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
