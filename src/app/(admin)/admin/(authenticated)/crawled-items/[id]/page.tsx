"use client";

import { useEffect, useState, use } from "react";
import CrawledItemForm from "@/components/admin/CrawledItemForm";

interface CrawledItemData {
  id: string;
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  publishDate: string;
  documentType: string;
  isDraft: boolean;
  legalFields: string[];
  affectedSubjects: string[];
  consultationStartDate: string;
  consultationEndDate: string;
  draftingAuthority: string;
  expectedApprovalTime: string;
  reviewStatus: string;
  editedTitle: string;
  editedSummary: string;
  adminNotes: string;
  rawHtml: string;
  crawledAt: string;
  reviewedAt: string;
}

export default function CrawledItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [item, setItem] = useState<CrawledItemData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/crawled-items/${id}`)
      .then((res) => res.json())
      .then((data) => setItem(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Đang tải...</div>;
  }

  if (!item) {
    return <div className="p-8 text-center text-sm text-red-500">Không tìm thấy mục này.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chi tiết tin thu thập</h1>
        <p className="mt-1 text-sm text-gray-500">
          Thu thập lúc: {new Date(item.crawledAt).toLocaleString("vi-VN")}
          {item.reviewedAt && (
            <> &middot; Xét duyệt lúc: {new Date(item.reviewedAt).toLocaleString("vi-VN")}</>
          )}
        </p>
      </div>
      <CrawledItemForm initialData={item} />
    </div>
  );
}
