"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const DOMAINS = [
  { label: "Đầu tư & Doanh nghiệp", value: "corporate-law" },
  { label: "Lao động & Nhân sự", value: "labor-hr" },
  { label: "Thuế", value: "tax" },
  { label: "Dân sự", value: "civil-law" },
  { label: "SHTT", value: "intellectual-property" },
  { label: "Môi trường – PCCC", value: "environment" },
  { label: "Bảo vệ dữ liệu", value: "data-protection" },
  { label: "Hình sự", value: "criminal-law" },
];

const AUTHORITIES = [
  { label: "Quốc hội", value: "quoc-hoi" },
  { label: "Chính phủ", value: "chinh-phu" },
  { label: "Bộ / Cơ quan ngang bộ", value: "bo-nganh" },
  { label: "Hội đồng nhân dân", value: "hdnd" },
  { label: "Uỷ ban nhân dân", value: "ubnd" },
  { label: "Toà án nhân dân tối cao", value: "tand-tc" },
];

const DATE_OPTIONS = [
  { label: "Tất cả", value: "" },
  { label: "30 ngày tới", value: "30d" },
  { label: "90 ngày tới", value: "90d" },
  { label: "Năm 2024", value: "2024" },
  { label: "Năm 2023", value: "2023" },
  { label: "Trước 2023", value: "before-2023" },
];

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:border-gray-300 transition-colors whitespace-nowrap"
      >
        {label}
        {selected.length > 0 && (
          <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-800 px-1.5 text-[10px] font-medium text-white">
            {selected.length}
          </span>
        )}
        <svg className="w-3.5 h-3.5 text-gray-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-64 rounded-lg border border-gray-200 bg-white shadow-lg py-1">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="h-3.5 w-3.5 rounded border-gray-300 text-gray-800 focus:ring-gray-300"
              />
              {opt.label}
            </label>
          ))}
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full border-t border-gray-100 px-3 py-2 text-xs text-gray-400 hover:text-gray-600 text-left"
            >
              Xoá bộ lọc
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SingleSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  selected: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedLabel = options.find((o) => o.value === selected)?.label;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:border-gray-300 transition-colors whitespace-nowrap"
      >
        {selected ? selectedLabel : label}
        <svg className="w-3.5 h-3.5 text-gray-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-48 rounded-lg border border-gray-200 bg-white shadow-lg py-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                selected === opt.value
                  ? "text-gray-900 font-medium"
                  : "text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilterBar({
  showSearchInput = true,
  showAuthorityFilter = true,
  basePath = "/",
}: {
  showSearchInput?: boolean;
  showAuthorityFilter?: boolean;
  basePath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [domains, setDomains] = useState<string[]>(
    searchParams.get("domain")?.split(",").filter(Boolean) || [],
  );
  const [authorities, setAuthorities] = useState<string[]>(
    searchParams.get("authority")?.split(",").filter(Boolean) || [],
  );
  const [dateFilter, setDateFilter] = useState(
    searchParams.get("date") || "",
  );
  const [search, setSearch] = useState(
    searchParams.get("q") || "",
  );

  const applyFilters = (
    newDomains?: string[],
    newAuthorities?: string[],
    newDate?: string,
    newSearch?: string,
  ) => {
    const d = newDomains ?? domains;
    const a = newAuthorities ?? authorities;
    const dt = newDate ?? dateFilter;
    const s = newSearch ?? search;

    const params = new URLSearchParams();
    if (d.length > 0) params.set("domain", d.join(","));
    if (a.length > 0) params.set("authority", a.join(","));
    if (dt) params.set("date", dt);
    if (s) params.set("q", s);

    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <MultiSelect
        label="Lĩnh vực"
        options={DOMAINS}
        selected={domains}
        onChange={(v) => {
          setDomains(v);
          applyFilters(v);
        }}
      />

      {showAuthorityFilter && (
        <MultiSelect
          label="Cơ quan ban hành"
          options={AUTHORITIES}
          selected={authorities}
          onChange={(v) => {
            setAuthorities(v);
            applyFilters(undefined, v);
          }}
        />
      )}

      <SingleSelect
        label="Ngày hiệu lực"
        options={DATE_OPTIONS}
        selected={dateFilter}
        onChange={(v) => {
          setDateFilter(v);
          applyFilters(undefined, undefined, v);
        }}
      />

      {showSearchInput ? (
        <div className="relative flex-1 min-w-[180px]">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyFilters(undefined, undefined, undefined, search);
            }}
            placeholder="Tìm kiếm văn bản..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors"
          />
        </div>
      ) : (
        <Link
          href="/search"
          className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors"
          aria-label="Tìm kiếm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </Link>
      )}
    </div>
  );
}
