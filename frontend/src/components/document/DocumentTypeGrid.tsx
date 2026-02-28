'use client';

import Link from 'next/link';
import {
  BookOpen,
  ScrollText,
  FileCheck,
  FileSpreadsheet,
  Mail,
  FileText,
} from 'lucide-react';

const documentTypes = [
  {
    name: 'Luật',
    description: 'Các văn bản luật do Quốc hội ban hành',
    icon: BookOpen,
    href: '/documents?type=LAW',
    color: 'bg-blue-500',
    count: '2,345',
  },
  {
    name: 'Bộ luật',
    description: 'Bộ luật Dân sự, Hình sự, Lao động...',
    icon: BookOpen,
    href: '/documents?type=CODE',
    color: 'bg-blue-700',
    count: '12',
  },
  {
    name: 'Nghị định',
    description: 'Văn bản quy phạm của Chính phủ',
    icon: ScrollText,
    href: '/documents?type=DECREE',
    color: 'bg-green-500',
    count: '8,567',
  },
  {
    name: 'Thông tư',
    description: 'Hướng dẫn thi hành của các Bộ',
    icon: FileCheck,
    href: '/documents?type=CIRCULAR',
    color: 'bg-purple-500',
    count: '12,890',
  },
  {
    name: 'Quyết định',
    description: 'Quyết định của cơ quan nhà nước',
    icon: FileSpreadsheet,
    href: '/documents?type=DECISION',
    color: 'bg-red-500',
    count: '5,234',
  },
  {
    name: 'Công văn',
    description: 'Công văn hướng dẫn, trả lời',
    icon: Mail,
    href: '/documents?type=DISPATCH',
    color: 'bg-orange-500',
    count: '15,678',
  },
];

export function DocumentTypeGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {documentTypes.map((type) => (
        <Link
          key={type.name}
          href={type.href}
          className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all"
        >
          <div
            className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mb-3`}
          >
            <type.icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-medium text-gray-900 group-hover:text-primary-600">
            {type.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {type.description}
          </p>
          <p className="text-sm font-medium text-primary-600 mt-2">
            {type.count} văn bản
          </p>
        </Link>
      ))}
    </div>
  );
}
