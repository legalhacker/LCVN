'use client';

import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import {
  X,
  Scale,
  BookOpen,
  Building2,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentSidebarProps {
  articleId: string | null;
  documentId: string;
}

// Mock data - replace with API calls
const mockCases = [
  {
    id: '1',
    title: 'Bản án số 45/2023/DS-PT',
    source: 'TAND TP. Hồ Chí Minh',
    judgmentDate: '2023-08-15',
    excerpt: 'Về tranh chấp quyền sử dụng đất giữa các bên...',
    externalUrl: '#',
  },
  {
    id: '2',
    title: 'Quyết định xử phạt vi phạm hành chính',
    source: 'UBND Quận 1',
    judgmentDate: '2023-05-20',
    excerpt: 'Xử phạt về hành vi vi phạm quy định sử dụng đất...',
    externalUrl: '#',
  },
];

const mockExpertArticles = [
  {
    id: '1',
    title: 'Phân tích quy định về quyền sử dụng đất',
    author: 'TS. Nguyễn Văn A',
    source: 'Tạp chí Luật học',
    publishedDate: '2023-10-01',
    externalUrl: '#',
  },
  {
    id: '2',
    title: 'Thực tiễn áp dụng Luật Đất đai tại doanh nghiệp',
    author: 'Công ty Luật ABC',
    source: 'Legal Newsletter',
    publishedDate: '2023-11-15',
    externalUrl: '#',
  },
];

const mockWorkspaceNotes = [
  {
    id: '1',
    title: 'Lưu ý khi áp dụng cho dự án XYZ',
    workspace: 'Phòng Pháp chế',
    updatedAt: '2024-01-10',
  },
];

export function DocumentSidebar({ articleId, documentId }: DocumentSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('cases');

  if (!articleId) {
    return (
      <div className="w-80 border-l border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500">
          Chọn một điều khoản để xem ghi chú và tham chiếu
        </p>
      </div>
    );
  }

  return (
    <div className="w-96 border-l border-gray-200 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="font-medium text-gray-900">Tham chiếu thực tiễn</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Tabs */}
      <Tabs.Root
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <Tabs.List className="flex border-b border-gray-200">
          <Tabs.Trigger
            value="cases"
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'cases'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <Scale className="w-4 h-4 inline mr-2" />
            Vụ việc
          </Tabs.Trigger>
          <Tabs.Trigger
            value="expert"
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'expert'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Chuyên gia
          </Tabs.Trigger>
          <Tabs.Trigger
            value="workspace"
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'workspace'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <Building2 className="w-4 h-4 inline mr-2" />
            Nội bộ
          </Tabs.Trigger>
        </Tabs.List>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {/* Cases Tab */}
          <Tabs.Content value="cases" className="p-4 space-y-4">
            {mockCases.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <a
                  href={item.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between"
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.source} • {item.judgmentDate}
                    </p>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {item.excerpt}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                </a>
              </div>
            ))}
          </Tabs.Content>

          {/* Expert Tab */}
          <Tabs.Content value="expert" className="p-4 space-y-4">
            {mockExpertArticles.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <a
                  href={item.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between"
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.author} • {item.source}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {item.publishedDate}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                </a>
              </div>
            ))}
          </Tabs.Content>

          {/* Workspace Tab */}
          <Tabs.Content value="workspace" className="p-4 space-y-4">
            {mockWorkspaceNotes.length > 0 ? (
              mockWorkspaceNotes.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <h4 className="text-sm font-medium text-gray-900">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.workspace} • Cập nhật: {item.updatedAt}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Chưa có ghi chú nội bộ cho điều khoản này
              </p>
            )}

            <button className="w-full py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg">
              + Thêm ghi chú mới
            </button>
          </Tabs.Content>
        </div>
      </Tabs.Root>

      {/* Disclaimer */}
      <div className="p-3 bg-yellow-50 border-t border-yellow-200">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800">
            Thông tin chỉ mang tính tham khảo, không cấu thành tư vấn pháp lý.
          </p>
        </div>
      </div>
    </div>
  );
}
