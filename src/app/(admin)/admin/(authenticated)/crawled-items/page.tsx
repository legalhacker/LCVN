"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

type ReviewStatus = "pending" | "reviewed" | "published" | "rejected";

interface CrawledItem {
  id: string;
  title: string;
  summary: string | null;
  sourceUrl: string;
  sourceName: string;
  publishDate: string | null;
  documentType: string;
  isDraft: boolean;
  legalFields: string[];
  reviewStatus: ReviewStatus;
  editedTitle: string | null;
  crawledAt: string;
  reviewedAt: string | null;
}

const STATUS_TABS: { label: string; value: ReviewStatus | "all" }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ duyệt", value: "pending" },
  { label: "Đã xem xét", value: "reviewed" },
  { label: "Đã xuất bản", value: "published" },
  { label: "Từ chối", value: "rejected" },
];

const STATUS_BADGE: Record<ReviewStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  published: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: "Chờ duyệt",
  reviewed: "Đã xem xét",
  published: "Đã xuất bản",
  rejected: "Từ chối",
};

const SOURCE_OPTIONS = [
  { value: "", label: "Tất cả nguồn" },
  { value: "vnexpress", label: "VnExpress" },
  { value: "xaydungchinhsach", label: "Xây dựng chính sách" },
  { value: "duthaoonline", label: "Dự thảo Online" },
];

const DOC_TYPE_LABEL: Record<string, string> = {
  law: "Luật",
  amendment: "Sửa đổi",
  draft: "Dự thảo",
  policy_direction: "Chính sách",
};

export default function CrawledItemsPage() {
  const [items, setItems] = useState<CrawledItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReviewStatus | "all">("pending");
  const [sourceFilter, setSourceFilter] = useState("");
  const [triggering, setTriggering] = useState(false);
  const [triggerResult, setTriggerResult] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("status", activeTab);
      if (sourceFilter) params.set("source", sourceFilter);
      const res = await fetch(`/api/admin/crawled-items?${params}`);
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, [activeTab, sourceFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleTrigger = async () => {
    setTriggering(true);
    setTriggerResult(null);
    try {
      const res = await fetch("/api/admin/crawl/trigger", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setTriggerResult(
          `Thu thập xong: ${data.summary.totalNew} mới, ${data.summary.totalSkipped} trùng, ${data.summary.totalErrors} lỗi`
        );
        fetchItems();
      } else {
        setTriggerResult(`Lỗi: ${data.error}`);
      }
    } catch {
      setTriggerResult("Lỗi kết nối");
    } finally {
      setTriggering(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa mục này?")) return;
    const res = await fetch(`/api/admin/crawled-items/${id}`, { method: "DELETE" });
    if (res.ok) fetchItems();
  };

  const handleStatusChange = async (id: string, newStatus: ReviewStatus) => {
    const res = await fetch(`/api/admin/crawled-items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewStatus: newStatus }),
    });
    if (res.ok) fetchItems();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tin thu thập</h1>
        <div className="flex gap-2">
          <button
            onClick={handleTrigger}
            disabled={triggering}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {triggering ? "Đang thu thập..." : "Thu thập ngay"}
          </button>
          <Link
            href="/admin/crawled-items/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Thêm thủ công
          </Link>
        </div>
      </div>

      {triggerResult && (
        <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
          {triggerResult}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {SOURCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Không có mục nào.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Tiêu đề</th>
                <th className="px-4 py-3 w-28">Nguồn</th>
                <th className="px-4 py-3 w-24">Loại</th>
                <th className="px-4 py-3 w-28">Trạng thái</th>
                <th className="px-4 py-3 w-32">Ngày thu thập</th>
                <th className="px-4 py-3 w-48">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {item.editedTitle || item.title}
                    </p>
                    {item.summary && (
                      <p className="mt-1 text-xs text-gray-500 line-clamp-1">
                        {item.summary}
                      </p>
                    )}
                    {item.legalFields.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.legalFields.map((f) => (
                          <span
                            key={f}
                            className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.sourceName}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600">
                      {DOC_TYPE_LABEL[item.documentType] || item.documentType}
                    </span>
                    {item.isDraft && (
                      <span className="ml-1 inline-block rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700">
                        Dự thảo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[item.reviewStatus]}`}
                    >
                      {STATUS_LABEL[item.reviewStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(item.crawledAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Link
                        href={`/admin/crawled-items/${item.id}`}
                        className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        Chi tiết
                      </Link>
                      {item.reviewStatus === "pending" && (
                        <button
                          onClick={() => handleStatusChange(item.id, "reviewed")}
                          className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                        >
                          Xem xét
                        </button>
                      )}
                      {(item.reviewStatus === "pending" || item.reviewStatus === "reviewed") && (
                        <button
                          onClick={() => handleStatusChange(item.id, "published")}
                          className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                        >
                          Xuất bản
                        </button>
                      )}
                      {item.reviewStatus !== "rejected" && (
                        <button
                          onClick={() => handleStatusChange(item.id, "rejected")}
                          className="rounded bg-yellow-600 px-2 py-1 text-xs text-white hover:bg-yellow-700"
                        >
                          Từ chối
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
