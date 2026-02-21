import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://lcvn.vn";

export const metadata: Metadata = {
  title: "Về chúng tôi – LCVN",
  description:
    "LCVN theo dõi và phân tích các thay đổi pháp luật tại Việt Nam, giúp doanh nghiệp và cá nhân nắm bắt kịp thời các quy định mới.",
  alternates: { canonical: `${BASE_URL}/ve-chung-toi` },
  openGraph: {
    title: "Về chúng tôi – LCVN",
    description:
      "LCVN theo dõi và phân tích các thay đổi pháp luật tại Việt Nam.",
    url: `${BASE_URL}/ve-chung-toi`,
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Về chúng tôi</h1>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-2">LCVN là gì?</h2>
        <p className="text-[15px] text-gray-600 leading-relaxed">
          LCVN (<em>Legal Changes in Vietnam</em>) là nền tảng theo dõi và phân tích thay đổi pháp luật tại Việt Nam.
          Chúng tôi tổng hợp các văn bản quy phạm pháp luật mới ban hành, dự thảo đang lấy ý kiến và các thay đổi
          chính sách có tác động đến doanh nghiệp và cá nhân.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-2">Mục tiêu</h2>
        <ul className="space-y-2 text-[15px] text-gray-600 leading-relaxed list-disc pl-5">
          <li>Cung cấp thông tin pháp luật cập nhật, chính xác và dễ tra cứu.</li>
          <li>Phân tích tác động của các thay đổi pháp luật theo từng lĩnh vực.</li>
          <li>Hỗ trợ doanh nghiệp tuân thủ kịp thời các quy định mới.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-2">Lưu ý pháp lý</h2>
        <p className="text-[15px] text-gray-600 leading-relaxed">
          Nội dung trên LCVN chỉ mang tính chất tham khảo và không thay thế tư vấn pháp lý chuyên nghiệp.
          Người dùng nên tham khảo ý kiến luật sư hoặc chuyên gia pháp lý khi cần áp dụng pháp luật vào
          tình huống cụ thể.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-2">Liên hệ</h2>
        <p className="text-[15px] text-gray-600 leading-relaxed">
          Mọi góp ý và phản hồi xin gửi về:{" "}
          <a href="mailto:contact@lcvn.vn" className="text-gray-900 underline underline-offset-2 hover:text-gray-600 transition-colors">
            contact@lcvn.vn
          </a>
        </p>
      </section>
    </div>
  );
}
