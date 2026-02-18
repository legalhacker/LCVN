interface OverviewStats {
  effectiveCount: number;
  upcomingCount: number;
  changeCount: number;
  fieldCounts: { name: string; count: number }[];
  recentFieldCounts: { name: string; count: number }[];
}

export default function OverviewPanel({ stats }: { stats: OverviewStats }) {
  const maxCount = Math.max(...stats.fieldCounts.map((f) => f.count), 1);

  return (
    <aside className="hidden xl:block w-72 shrink-0 border-l border-gray-200 bg-gray-50/50 overflow-y-auto">
      <div className="p-5 space-y-6">
        {/* Header */}
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          Tổng quan thay đổi pháp luật
        </h3>

        {/* Stat cards */}
        <div className="space-y-2.5">
          <div className="rounded-lg bg-white border border-gray-200 p-3">
            <p className="text-[10px] text-gray-400 mb-1">Văn bản có hiệu lực</p>
            <p className="text-lg font-semibold text-gray-800">{stats.effectiveCount}</p>
          </div>
          <div className="rounded-lg bg-white border border-gray-200 p-3">
            <p className="text-[10px] text-gray-400 mb-1">Sắp có hiệu lực</p>
            <p className="text-lg font-semibold text-gray-800">{stats.upcomingCount}</p>
          </div>
          <div className="rounded-lg bg-white border border-gray-200 p-3">
            <p className="text-[10px] text-gray-400 mb-1">Thay đổi đã công bố</p>
            <p className="text-lg font-semibold text-gray-800">{stats.changeCount}</p>
          </div>
        </div>

        {/* Field counts - all time */}
        {stats.fieldCounts.length > 0 && (
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Thay đổi theo lĩnh vực
            </h3>
            <div className="space-y-2.5">
              {stats.fieldCounts.map((f) => (
                <div key={f.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{f.name}</span>
                    <span className="text-[10px] text-gray-400">{f.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-700 rounded-full"
                      style={{ width: `${(f.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent 30 days */}
        {stats.recentFieldCounts.length > 0 && (
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Xu hướng 30 ngày gần đây
            </h3>
            <div className="space-y-2">
              {stats.recentFieldCounts.map((f) => (
                <div
                  key={f.name}
                  className="flex items-center justify-between rounded-lg bg-white border border-gray-200 px-3 py-2"
                >
                  <span className="text-xs text-gray-600">{f.name}</span>
                  <span className="text-xs font-medium text-gray-800">{f.count}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}
