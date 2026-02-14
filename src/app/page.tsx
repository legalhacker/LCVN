import type { Metadata } from "next";
import RegulatoryFeed from "@/components/dashboard/RegulatoryFeed";

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
        <div className="max-w-3xl mx-auto">
          <RegulatoryFeed items={FEED_ITEMS} />
        </div>
      </div>
    </>
  );
}
