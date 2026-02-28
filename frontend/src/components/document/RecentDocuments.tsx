'use client';

import Link from 'next/link';
import { formatDate, getDocumentTypeLabel, getStatusColor, getStatusLabel } from '@/lib/utils';
import { useDocuments } from '@/hooks/useDocuments';
import { Loader2 } from 'lucide-react';

export function RecentDocuments() {
  const { data, isLoading, error } = useDocuments({ limit: 5 });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-500">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
        <p className="text-red-600">Không thể tải dữ liệu. Vui lòng thử lại.</p>
      </div>
    );
  }

  const documents = data?.data || [];

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Chưa có văn bản nào.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-200">
        {documents.map((doc) => (
          <Link
            key={doc.id}
            href={`/documents/${doc.titleSlug}`}
            className="block p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-primary-600">
                    {doc.documentNumber}
                  </span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-500">
                    {getDocumentTypeLabel(doc.documentType)}
                  </span>
                  {doc._count && doc._count.articles > 0 && (
                    <>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {doc._count.articles} điều
                      </span>
                    </>
                  )}
                </div>
                <h3 className="text-base font-medium text-gray-900 truncate">
                  {doc.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Ban hành: {formatDate(doc.issuedDate)}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(
                  doc.status
                )}`}
              >
                {getStatusLabel(doc.status)}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <Link
          href="/documents"
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Xem tất cả văn bản ({data?.pagination.total || 0}) →
        </Link>
      </div>
    </div>
  );
}
