import Link from "next/link";

const recentUpdates = [
  { title: "Luật Doanh nghiệp 2020", href: "/document/enterprise-law-2020", date: "2021-01-01" },
  { title: "Bộ luật Lao động 2019", href: "/document/labor-code-2019", date: "2021-01-01" },
  { title: "Bộ luật Dân sự 2015", href: "/document/civil-code-2015", date: "2017-01-01" },
];

const tags = [
  "hợp đồng", "lao động", "doanh nghiệp", "cổ phần",
  "chấm dứt", "quyền", "nghĩa vụ", "bảo hiểm",
];

const domainStats = [
  { name: "Doanh nghiệp", pct: 35 },
  { name: "Lao động", pct: 40 },
  { name: "Dân sự", pct: 25 },
];

export default function InsightPanel() {
  return (
    <aside className="hidden xl:block w-72 shrink-0 border-l border-gray-200 bg-gray-50/50 overflow-y-auto">
      <div className="p-5 space-y-6">
        {/* AI Insight */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
            AI Insight
          </h3>
          <div className="rounded-lg bg-white border border-gray-200 p-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              3 văn bản pháp luật quan trọng hiện đang có hiệu lực trong hệ thống.
              Luật Doanh nghiệp 2020 và Bộ luật Lao động 2019 có nhiều điều khoản liên quan
              đến nghĩa vụ của doanh nghiệp đối với người lao động.
            </p>
            <p className="mt-2 text-[10px] text-gray-400">
              Powered by structured legal data
            </p>
          </div>
        </section>

        {/* Domain coverage */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Phạm vi lĩnh vực
          </h3>
          <div className="space-y-2.5">
            {domainStats.map((d) => (
              <div key={d.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">{d.name}</span>
                  <span className="text-[10px] text-gray-400">{d.pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-700 rounded-full"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tags */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Từ khóa phổ biến
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="rounded-full bg-white border border-gray-200 px-2.5 py-1 text-[11px] text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>

        {/* Recent updates */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Cập nhật gần đây
          </h3>
          <div className="space-y-2">
            {recentUpdates.map((u) => (
              <Link
                key={u.href}
                href={u.href}
                className="block rounded-lg bg-white border border-gray-200 p-3 hover:border-gray-300 transition-colors"
              >
                <p className="text-xs font-medium text-gray-800 leading-snug">
                  {u.title}
                </p>
                <p className="mt-1 text-[10px] text-gray-400">
                  Hiệu lực: {u.date}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
