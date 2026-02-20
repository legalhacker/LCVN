"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface DocItem {
  id: string;
  slug: string;
  title: string;
  documentNumber: string;
  issuingBody: string;
  effectiveDate: string;
  status: string;
  documentType: string;
  tags: string[];
}

const SLUG_TO_DOC_PAGE: Record<string, string> = {
  "bo-luat-lao-dong": "labor-code-2019",
  "bo-luat-dan-su": "civil-code-2015",
  "luat-doanh-nghiep": "enterprise-law-2020",
};

const DEFAULT_FIELDS = [
  "Đầu tư",
  "Doanh nghiệp",
  "Trí tuệ nhân tạo",
  "Bảo vệ dữ liệu",
  "Lao động",
  "Tài chính – ngân hàng",
];

export default function EffectiveDocuments({
  documents,
  todayDocuments,
  fields,
  maxItems,
}: {
  documents: DocItem[];
  todayDocuments: DocItem[];
  fields?: string[];
  maxItems?: number;
}) {
  const FIELDS = fields && fields.length > 0 ? fields : DEFAULT_FIELDS;
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [appliedFields, setAppliedFields] = useState<Set<string>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  }

  function applyFilter() {
    setAppliedFields(new Set(selectedFields));
    setDropdownOpen(false);
  }

  const allFiltered =
    appliedFields.size === 0
      ? documents
      : documents.filter((d) => {
          for (const f of appliedFields) {
            if (d.tags.some((t) => t === f)) return true;
          }
          return false;
        });

  const filtered = maxItems ? allFiltered.slice(0, maxItems) : allFiltered;
  const hasMore = maxItems ? allFiltered.length > maxItems : false;

  const triggerLabel =
    selectedFields.size === 0
      ? "Lĩnh vực"
      : selectedFields.size <= 2
        ? Array.from(selectedFields).join(", ")
        : `${selectedFields.size} lĩnh vực`;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-1">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 leading-tight shrink-0">
          <span className="text-[22px] leading-none">📋</span>
          Văn bản mới có hiệu lực
        </h2>

        <div className="flex items-center gap-2">
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
                          checked ? "bg-gray-900 border-gray-900" : "border-gray-300"
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

          <button
            type="button"
            onClick={applyFilter}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
            aria-label="Lọc văn bản"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Today highlight */}
      {todayDocuments.length > 0 && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">
            Có hiệu lực từ hôm nay
          </p>
          <ul className="space-y-1.5">
            {todayDocuments.map((doc) => {
              const docPage = SLUG_TO_DOC_PAGE[doc.slug];
              return (
                <li key={doc.id} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                  <Link
                    href={docPage ? `/document/${docPage}` : `/search?q=${encodeURIComponent(doc.title)}`}
                    className="text-sm font-medium text-amber-900 hover:text-amber-700 transition-colors"
                  >
                    {doc.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Document list — headline-only view */}
      {filtered.length > 0 ? (
        <>
          {filtered.map((doc, idx) => {
            const docPage = SLUG_TO_DOC_PAGE[doc.slug];
            return (
              <article
                key={doc.id}
                className={`py-3 ${idx !== filtered.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <Link
                  href={docPage ? `/document/${docPage}` : `/search?q=${encodeURIComponent(doc.title)}`}
                  className="text-[15px] font-semibold text-gray-900 leading-snug hover:text-gray-600 transition-colors"
                >
                  {doc.title}
                </Link>
              </article>
            );
          })}
          {hasMore && (
            <div className="pt-3">
              <Link
                href="/van-ban-moi-co-hieu-luc"
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Xem thêm →
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-400">
            Không có văn bản nào trong lĩnh vực đã chọn.
          </p>
        </div>
      )}
    </div>
  );
}
