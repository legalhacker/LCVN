import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://lcvn.vn";

interface ChangeDetail {
  slug: string;
  title: string;
  legalBasis: string;
  sourceDocument: string;
  effectiveDate: string;
  tags: string[];
  analysis: {
    summary: string;
    impact: string[];
    affectedParties: string[];
  };
  comparison: {
    before: string;
    after: string;
    timeline: string;
    context: string;
  };
}

const CHANGES: Record<string, ChangeDetail> = {
  "shtt-ai-ownership": {
    slug: "shtt-ai-ownership",
    title: "[Luật SHTT] Lần đầu luật hóa quyền SHTT với sản phẩm do AI tạo ra",
    legalBasis: "Khoản 5 Điều 6 (bổ sung)",
    sourceDocument: "Luật Sở hữu trí tuệ sửa đổi 2025 – số 131/2025/QH15",
    effectiveDate: "2026-01-01",
    tags: ["AI", "Sở hữu trí tuệ", "Doanh nghiệp", "Luật mới 2025"],
    analysis: {
      summary:
        "Luật SHTT sửa đổi 2025 lần đầu tiên công nhận khả năng xác lập quyền sở hữu trí tuệ đối với các đối tượng được tạo ra có sử dụng hệ thống trí tuệ nhân tạo (AI). Đây là bước ngoặt lớn trong khung pháp lý về SHTT tại Việt Nam, đặt nền tảng cho việc bảo hộ sáng chế, kiểu dáng công nghiệp và các sản phẩm sáng tạo được tạo ra với sự hỗ trợ của AI.",
      impact: [
        "Doanh nghiệp công nghệ và startup AI có thể đăng ký bảo hộ quyền SHTT cho sản phẩm do AI tạo ra, tăng giá trị tài sản trí tuệ.",
        "Chính phủ được giao quy định chi tiết về phát sinh quyền, xác lập quyền và xác định chủ thể quyền — nghĩa là còn cần Nghị định hướng dẫn trước khi áp dụng thực tế.",
        "Nhà đầu tư nước ngoài trong lĩnh vực AI có thêm cơ sở pháp lý để triển khai hoạt động R&D tại Việt Nam.",
        "Tranh chấp về quyền sở hữu giữa người phát triển AI và người sử dụng AI sẽ có khung pháp lý để giải quyết.",
      ],
      affectedParties: [
        "Doanh nghiệp công nghệ & startup AI",
        "Nhà đầu tư lĩnh vực AI/ML",
        "Cơ quan quản lý SHTT (Cục SHTT)",
        "Luật sư / tư vấn SHTT",
      ],
    },
    comparison: {
      before:
        "Pháp luật SHTT không có quy định nào về quyền sở hữu trí tuệ đối với sản phẩm được tạo ra bởi AI hoặc có sự tham gia của AI. Các sản phẩm do AI tạo ra nằm ngoài phạm vi bảo hộ.",
      after:
        "Luật chính thức thừa nhận khả năng xác lập quyền SHTT đối với đối tượng được tạo ra có sử dụng hệ thống AI. Chính phủ sẽ ban hành Nghị định hướng dẫn chi tiết về điều kiện phát sinh quyền, thủ tục xác lập và xác định chủ thể quyền.",
      timeline:
        "Luật được Quốc hội thông qua năm 2025. Hiệu lực dự kiến từ 01/01/2026. Nghị định hướng dẫn chi tiết chưa được ban hành.",
      context:
        "Việt Nam là một trong những quốc gia đầu tiên trong ASEAN có quy định pháp luật rõ ràng về SHTT gắn với AI, theo xu hướng của EU AI Act và các khung pháp lý quốc tế đang hình thành.",
    },
  },
  "shtt-ai-training-data": {
    slug: "shtt-ai-training-data",
    title: "[Luật SHTT] Cho phép dùng dữ liệu đã công bố để huấn luyện AI",
    legalBasis: "Khoản 5 Điều 7 (mới)",
    sourceDocument: "Luật Sở hữu trí tuệ sửa đổi 2025 – số 131/2025/QH15",
    effectiveDate: "2026-01-01",
    tags: ["AI", "Dữ liệu", "Huấn luyện AI", "Bản quyền"],
    analysis: {
      summary:
        "Lần đầu tiên pháp luật Việt Nam cho phép sử dụng hợp pháp văn bản và dữ liệu về đối tượng quyền sở hữu trí tuệ đã được công bố công khai để nghiên cứu, thử nghiệm và huấn luyện hệ thống trí tuệ nhân tạo. Quy định đặt ra điều kiện: việc sử dụng không được ảnh hưởng bất hợp lý đến việc khai thác bình thường quyền của chủ sở hữu.",
      impact: [
        "Doanh nghiệp AI có cơ sở pháp lý rõ ràng để thu thập và sử dụng dữ liệu công khai cho mục đích huấn luyện mô hình, giảm rủi ro pháp lý.",
        "Chủ sở hữu quyền SHTT vẫn được bảo vệ — luật đặt giới hạn 'không ảnh hưởng bất hợp lý' đến quyền khai thác thương mại.",
        "Các tổ chức nghiên cứu, trường đại học có thêm không gian pháp lý cho hoạt động R&D liên quan đến AI.",
        "Cần chờ Nghị định hướng dẫn để xác định rõ thế nào là 'ảnh hưởng bất hợp lý' trong thực tế.",
      ],
      affectedParties: [
        "Doanh nghiệp AI / ML / Data",
        "Chủ sở hữu bản quyền & dữ liệu",
        "Tổ chức nghiên cứu & đại học",
        "Nền tảng nội dung số",
      ],
    },
    comparison: {
      before:
        "Việc sử dụng tác phẩm, dữ liệu có bản quyền để huấn luyện AI nằm trong vùng xám pháp lý. Không có quy định cụ thể cho phép hay cấm, gây rủi ro cho doanh nghiệp AI.",
      after:
        "Luật cho phép rõ ràng việc sử dụng dữ liệu đã công bố để huấn luyện AI, với điều kiện không ảnh hưởng bất hợp lý đến quyền của chủ sở hữu. Đây là ngoại lệ bản quyền (copyright exception) dành riêng cho AI.",
      timeline:
        "Luật được Quốc hội thông qua năm 2025. Hiệu lực dự kiến từ 01/01/2026. Ranh giới 'bất hợp lý' sẽ được làm rõ trong Nghị định hướng dẫn.",
      context:
        "Quy định tương tự 'text and data mining exception' trong EU Copyright Directive (Art. 3–4), nhưng phạm vi áp dụng hẹp hơn — chỉ giới hạn cho dữ liệu đã được công bố công khai.",
    },
  },
};

export function generateStaticParams() {
  return Object.keys(CHANGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const change = CHANGES[slug];
  if (!change) return {};
  return {
    title: `${change.title} - LCVN`,
    description: change.analysis.summary.slice(0, 160),
    alternates: { canonical: `${BASE_URL}/thay-doi/${change.slug}` },
    openGraph: {
      title: `${change.title} - LCVN`,
      description: change.analysis.summary.slice(0, 160),
      url: `${BASE_URL}/thay-doi/${change.slug}`,
    },
  };
}

export default async function ChangeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const change = CHANGES[slug];
  if (!change) notFound();

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-600 transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-gray-600">Phân tích thay đổi</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-lg font-semibold text-gray-900 leading-snug">
            {change.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
            <span>
              <span className="text-gray-500">Căn cứ:</span> {change.legalBasis}
            </span>
            <span>
              <span className="text-gray-500">Nguồn:</span> {change.sourceDocument}
            </span>
            <span>
              <span className="text-gray-500">Hiệu lực:</span> {change.effectiveDate}
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {change.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Tier 1: Analysis */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">
            Phân tích thay đổi
          </h2>

          <p className="text-sm text-gray-600 leading-relaxed">
            {change.analysis.summary}
          </p>

          <h3 className="text-xs font-semibold text-gray-700 mt-5 mb-2">
            Tác động pháp lý & thực tiễn
          </h3>
          <ul className="space-y-2">
            {change.analysis.impact.map((point, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
                <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-gray-300" />
                {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xs font-semibold text-gray-700 mt-5 mb-2">
            Đối tượng bị ảnh hưởng
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {change.analysis.affectedParties.map((party) => (
              <span
                key={party}
                className="inline-flex items-center rounded-md bg-gray-50 border border-gray-200 px-2.5 py-1 text-xs text-gray-600"
              >
                {party}
              </span>
            ))}
          </div>
        </section>

        {/* Divider */}
        <hr className="border-gray-100 mb-8" />

        {/* Tier 2: Comparison & Context */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">
            So sánh & bối cảnh
          </h2>

          {/* Before / After */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                Trước thay đổi
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {change.comparison.before}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 mb-2">
                Sau thay đổi
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {change.comparison.after}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-lg border border-gray-200 p-4 mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Timeline hiệu lực
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {change.comparison.timeline}
            </p>
          </div>

          {/* Context */}
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Bối cảnh quốc tế
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {change.comparison.context}
            </p>
          </div>
        </section>

        {/* Back */}
        <div className="pt-4 border-t border-gray-100">
          <Link
            href="/"
            className="text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
          >
            &larr; Quay lại feed
          </Link>
        </div>
      </div>
    </div>
  );
}
