'use client';

import { useState, useRef } from 'react';
import {
  Link2,
  BookmarkPlus,
  MessageSquare,
  Highlighter,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Article {
  id: string;
  articleId: string;
  articleNumber: string;
  title?: string | null;
  content?: string;
  contentHtml?: string;
  chapterNumber?: string;
  chapterTitle?: string;
  hasPracticalReferences: boolean;
}

interface ArticleContentProps {
  article: Article;
  isActive: boolean;
  onActivate: () => void;
}

export function ArticleContent({
  article,
  isActive,
  onActivate,
}: ArticleContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showActions, setShowActions] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString());
      setShowActions(true);
    } else {
      setShowActions(false);
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#${article.articleId}`;
    navigator.clipboard.writeText(url);
  };

  // Use contentHtml if available, otherwise use content
  const displayContent = article.contentHtml || article.content || 'Nội dung đang được cập nhật...';

  return (
    <article
      id={article.articleId}
      className={cn(
        'relative mb-8 p-6 rounded-xl border transition-all cursor-pointer',
        isActive
          ? 'border-primary-500 bg-primary-50/30 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300'
      )}
      onClick={onActivate}
    >
      {/* Article header */}
      <header className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {article.articleNumber}
            {article.title && (
              <span className="font-medium">. {article.title}</span>
            )}
          </h3>
          {article.chapterNumber && (
            <p className="text-sm text-gray-500 mt-1">
              {article.chapterNumber}
              {article.chapterTitle && ` - ${article.chapterTitle}`}
            </p>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
          {article.hasPracticalReferences && (
            <button
              className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg"
              title="Xem tham chiếu thực tiễn"
            >
              <BookmarkPlus className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleCopyLink}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Sao chép link"
          >
            <Link2 className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Thêm ghi chú"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Article content */}
      {article.contentHtml ? (
        <div
          ref={contentRef}
          className="article-content text-gray-700 leading-relaxed"
          onMouseUp={handleTextSelection}
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />
      ) : (
        <div
          ref={contentRef}
          className="article-content text-gray-700 whitespace-pre-wrap leading-relaxed"
          onMouseUp={handleTextSelection}
        >
          {displayContent}
        </div>
      )}

      {/* Text selection popup */}
      {showActions && selectedText && (
        <div className="absolute bg-gray-900 text-white rounded-lg shadow-lg p-1 flex items-center space-x-1 z-20 top-16 right-4">
          <button
            className="p-2 hover:bg-gray-700 rounded"
            title="Highlight"
            onClick={(e) => e.stopPropagation()}
          >
            <Highlighter className="w-4 h-4" />
          </button>
          <button
            className="p-2 hover:bg-gray-700 rounded"
            title="Thêm ghi chú"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            className="p-2 hover:bg-gray-700 rounded"
            title="Thêm tuỳ chọn"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      )}
    </article>
  );
}
