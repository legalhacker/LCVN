"use client";

import { useState, useRef, useEffect } from "react";
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

const DEFAULT_FIELDS = [
  "Đầu tư",
  "Doanh nghiệp",
  "Trí tuệ nhân tạo",
  "Bảo vệ dữ liệu",
  "Lao động",
  "Tài chính – ngân hàng",
];

export default function RegulatoryFeed({ items, fields }: { items: FeedItem[]; fields?: string[] }) {
  const FIELDS = fields && fields.length > 0 ? fields : DEFAULT_FIELDS;
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [appliedFields, setAppliedFields] = useState<Set<string>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleField(field: string) {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  }

  function applyFilter() {
    setAppliedFields(new Set(selectedFields));
    setDropdownOpen(false);
  }

  const filtered =
    appliedFields.size === 0
      ? items
      : items.filter((item) => {
          for (const f of appliedFields) {
            if (item.tags.some((t) => t === f)) return true;
          }
          return false;
        });

  // Label for the dropdown trigger
  const triggerLabel =
    selectedFields.size === 0
      ? "Lĩnh vực"
      : selectedFields.size <= 2
        ? Array.from(selectedFields).join(", ")
        : `${selectedFields.size} lĩnh vực`;

  return (
    <div>
      {/* Header: title left + filter right */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-1">
        {/* Title */}
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 leading-tight shrink-0">
          <span className="text-[22px] leading-none">📰</span>
          Những thay đổi mới nhất
        </h2>

        {/* Filter control: dropdown + search icon */}
        <div className="flex items-center gap-2">
          {/* Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:border-gray-300 transition-colors"
            >
              <span className="truncate max-w-[180px]">{triggerLabel}</span>
              <svg className="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 sm:left-0 top-full mt-1 z-20 w-56 rounded-lg border border-gray-200 bg-white shadow-lg py-1">
                {FIELDS.map((field) => {
                  const checked = selectedFields.has(field);
                  return (
                    <button
                      key={field}
                      type="button"
                      onClick={() => toggleField(field)}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      <span
                        className={`flex items-center justify-center w-4 h-4 rounded border shrink-0 ${
                          checked
                            ? "bg-gray-900 border-gray-900"
                            : "border-gray-300"
                        }`}
                      >
                        {checked && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </span>
                      {field}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search trigger */}
          <button
            type="button"
            onClick={applyFilter}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
            aria-label="Lọc feed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
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
