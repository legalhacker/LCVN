"use client";

import CrawledItemForm from "@/components/admin/CrawledItemForm";

export default function NewCrawledItemPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Thêm tin thủ công</h1>
        <p className="mt-1 text-sm text-gray-500">
          Nhập thông tin tin tức pháp luật thu thập thủ công
        </p>
      </div>
      <CrawledItemForm />
    </div>
  );
}
