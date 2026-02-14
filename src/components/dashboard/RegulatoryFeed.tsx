"use client";

import { useState } from "react";
import Link from "next/link";

interface FeedItem {
  slug: string;
  title: string;
  summary: string;
  legalBasis: string;
  sourceDocument: string;
  effectiveDate?: string;
  tags: string[];
}

const FILTERS = [
  "Tất cả",
  "Đầu tư",
  "Doanh nghiệp",
  "Trí tuệ nhân tạo",
  "Bảo vệ dữ liệu",
  "Lao động",
  "Tài chính – ngân hàng",
] as const;

/** Map filter label → tags it matches in feed items */
const FILTER_TAG_MAP: Record<string, string[]> = {
  "Đầu tư": ["Đầu tư"],
  "Doanh nghiệp": ["Doanh nghiệp"],
  "Trí tuệ nhân tạo": ["AI", "Huấn luyện AI"],
  "Bảo vệ dữ liệu": ["Dữ liệu", "Bảo vệ dữ liệu"],
  "Lao động": ["Lao động"],
  "Tài chính – ngân hàng": ["Tài chính", "Ngân hàng"],
};

export default function RegulatoryFeed({ items }: { items: FeedItem[] }) {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  function toggleFilter(filter: string) {
    if (filter === "Tất cả") {
      setActiveFilters(new Set());
      return;
    }
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) {
        next.delete(filter);
      } else {
        next.add(filter);
      }
      return next;
    });
  }

  const filtered =
    activeFilters.size === 0
      ? items
      : items.filter((item) => {
          for (const f of activeFilters) {
            const matchTags = FILTER_TAG_MAP[f] || [];
            if (item.tags.some((t) => matchTags.includes(t))) return true;
          }
          return false;
        });

  return (
    <div>
      {/* Header: title left + filters right */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-1">
        {/* Title */}
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 leading-tight shrink-0">
          <span className="text-[22px] leading-none">📰</span>
          Những thay đổi mới nhất
        </h2>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {FILTERS.map((filter) => {
            const isAll = filter === "Tất cả";
            const isActive = isAll ? activeFilters.size === 0 : activeFilters.has(filter);

            return (
              <button
                key={filter}
                type="button"
                onClick={() => toggleFilter(filter)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed items */}
      {filtered.length > 0 ? (
        filtered.map((item, idx) => (
          <article
            key={item.slug}
            className={`py-5 ${idx !== filtered.length - 1 ? "border-b border-gray-100" : ""}`}
          >
            <h3 className="text-[15px] font-semibold text-gray-900 leading-snug">
              <span className="mr-1">⚡</span>{item.title}
            </h3>

            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              {item.summary}
            </p>

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

            <div className="mt-3">
              <Link
                href={`/thay-doi/${item.slug}`}
                className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                Xem phân tích chi tiết &rarr;
              </Link>
            </div>
          </article>
        ))
      ) : (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-400">
            Không có thay đổi nào trong lĩnh vực đã chọn.
          </p>
        </div>
      )}
    </div>
  );
}
