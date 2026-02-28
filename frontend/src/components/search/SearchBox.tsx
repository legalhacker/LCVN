'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    year: '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const params = new URLSearchParams({ q: query });
      if (filters.type) params.set('type', filters.type);
      if (filters.status) params.set('status', filters.status);
      if (filters.year) params.set('year', filters.year);
      router.push(`/search?${params.toString()}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative">
        {/* Main search input */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm theo tên văn bản, số hiệu, nội dung điều..."
            className="w-full pl-12 pr-24 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <div className="absolute right-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Bộ lọc tìm kiếm</h3>
              <button
                type="button"
                onClick={() => setFilters({ type: '', status: '', year: '' })}
                className="text-sm text-primary-600 hover:underline"
              >
                Xóa tất cả
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Document type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại văn bản
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Tất cả</option>
                  <option value="LAW">Luật</option>
                  <option value="CODE">Bộ luật</option>
                  <option value="DECREE">Nghị định</option>
                  <option value="CIRCULAR">Thông tư</option>
                  <option value="DECISION">Quyết định</option>
                  <option value="DISPATCH">Công văn</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hiệu lực
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Tất cả</option>
                  <option value="EFFECTIVE">Đang có hiệu lực</option>
                  <option value="EXPIRED">Hết hiệu lực</option>
                  <option value="NOT_YET_EFFECTIVE">Chưa có hiệu lực</option>
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Năm ban hành
                </label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Tất cả</option>
                  {Array.from({ length: 10 }, (_, i) => 2024 - i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
