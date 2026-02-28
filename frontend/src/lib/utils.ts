import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, locale = 'vi-VN'): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getDocumentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    LAW: 'Luật',
    CODE: 'Bộ luật',
    DECREE: 'Nghị định',
    CIRCULAR: 'Thông tư',
    RESOLUTION: 'Nghị quyết',
    DECISION: 'Quyết định',
    DIRECTIVE: 'Chỉ thị',
    DISPATCH: 'Công văn',
  };
  return labels[type] || type;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: 'Dự thảo',
    EFFECTIVE: 'Đang có hiệu lực',
    EXPIRED: 'Hết hiệu lực',
    PARTIALLY_EXPIRED: 'Hết hiệu lực một phần',
    NOT_YET_EFFECTIVE: 'Chưa có hiệu lực',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    EFFECTIVE: 'bg-green-100 text-green-800',
    EXPIRED: 'bg-red-100 text-red-800',
    PARTIALLY_EXPIRED: 'bg-yellow-100 text-yellow-800',
    NOT_YET_EFFECTIVE: 'bg-blue-100 text-blue-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
