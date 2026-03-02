'use client';

import { useState } from 'react';
import { Search, X, ChevronUp, ChevronDown, Sparkles, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InDocumentSearchProps {
  documentId: string;
  mode: 'exact' | 'semantic';
  onModeChange: (mode: 'exact' | 'semantic') => void;
  onClose: () => void;
}

export function InDocumentSearch({
  documentId,
  mode,
  onModeChange,
  onClose,
}: InDocumentSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    // TODO: Replace with actual API call
    // const response = await fetch('/api/search/document', {
    //   method: 'POST',
    //   body: JSON.stringify({ q: query, documentId, mode }),
    // });

    // Mock results
    setTimeout(() => {
      setResults([
        { articleId: 'dieu-1', articleNumber: 'Điều 1', matchCount: 3 },
        { articleId: 'dieu-3', articleNumber: 'Điều 3', matchCount: 1 },
      ]);
      setIsSearching(false);
    }, 300);
  };

  const goToNext = () => {
    if (results.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % results.length);
    }
  };

  const goToPrev = () => {
    if (results.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + results.length) % results.length);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* Search mode toggle */}
      <div className="flex items-center space-x-2 mb-3">
        <button
          onClick={() => onModeChange('exact')}
          className={cn(
            'flex items-center space-x-1 px-3 py-1.5 text-sm rounded-lg transition-colors',
            mode === 'exact'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          )}
        >
          <Type className="w-4 h-4" />
          <span>Chính xác</span>
        </button>
        <button
          onClick={() => onModeChange('semantic')}
          className={cn(
            'flex items-center space-x-1 px-3 py-1.5 text-sm rounded-lg transition-colors',
            mode === 'semantic'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          )}
        >
          <Sparkles className="w-4 h-4" />
          <span>Theo ý nghĩa</span>
        </button>
      </div>

      {/* Search input */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={
              mode === 'exact'
                ? 'Nhập từ khóa cần tìm...'
                : 'Mô tả nội dung cần tìm...'
            }
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Navigation */}
        {results.length > 0 && (
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <span>
              {currentIndex + 1} / {results.length}
            </span>
            <button
              onClick={goToPrev}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={goToNext}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode description */}
      <p className="mt-2 text-xs text-gray-500">
        {mode === 'exact' ? (
          <>
            <strong>Tìm kiếm chính xác:</strong> Tìm các từ/cụm từ khớp chính xác
            trong văn bản (như Ctrl+F)
          </>
        ) : (
          <>
            <strong>Tìm kiếm theo ý nghĩa:</strong> Tìm các điều khoản liên quan
            đến nội dung bạn mô tả, ngay cả khi từ khóa không khớp chính xác
          </>
        )}
      </p>

      {/* Results preview */}
      {results.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Tìm thấy trong {results.length} điều:
          </p>
          <div className="flex flex-wrap gap-2">
            {results.map((result, idx) => (
              <button
                key={result.articleId}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  'px-2 py-1 text-xs rounded transition-colors',
                  currentIndex === idx
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                )}
              >
                {result.articleNumber}
                {result.matchCount > 1 && (
                  <span className="ml-1 text-gray-400">
                    ({result.matchCount})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
