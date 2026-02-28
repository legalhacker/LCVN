'use client';

import { ChevronDown, ChevronRight, BookmarkPlus } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ArticleToc {
  articleId: string;
  articleNumber: string;
  title?: string | null;
  hasPracticalReferences: boolean;
}

interface TocChapter {
  chapterNumber?: string | null;
  chapterTitle?: string | null;
  articles: ArticleToc[];
  sections: {
    sectionNumber?: string | null;
    sectionTitle?: string | null;
    articles: ArticleToc[];
  }[];
}

interface DocumentTOCProps {
  document: {
    documentNumber: string;
    title: string;
    tableOfContents: TocChapter[];
  };
  activeArticleId: string | null;
  onArticleSelect: (articleId: string) => void;
}

export function DocumentTOC({
  document,
  activeArticleId,
  onArticleSelect,
}: DocumentTOCProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(document.tableOfContents.map((c) => c.chapterNumber || ''))
  );

  const toggleChapter = (chapterNumber: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterNumber)) {
      newExpanded.delete(chapterNumber);
    } else {
      newExpanded.add(chapterNumber);
    }
    setExpandedChapters(newExpanded);
  };

  return (
    <div className="p-4">
      {/* Document info */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-900 line-clamp-2">
          {document.title}
        </h2>
        <p className="text-xs text-gray-500 mt-1">{document.documentNumber}</p>
      </div>

      {/* Table of contents */}
      <nav className="space-y-1">
        {document.tableOfContents.map((chapter, idx) => (
          <div key={chapter.chapterNumber || idx}>
            {/* Chapter header */}
            {chapter.chapterNumber && (
              <button
                onClick={() => toggleChapter(chapter.chapterNumber!)}
                className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {expandedChapters.has(chapter.chapterNumber) ? (
                  <ChevronDown className="w-4 h-4 mr-2 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 mr-2 flex-shrink-0" />
                )}
                <span className="text-left">
                  {chapter.chapterNumber}
                  {chapter.chapterTitle && (
                    <span className="text-gray-500 font-normal">
                      {' '}
                      - {chapter.chapterTitle}
                    </span>
                  )}
                </span>
              </button>
            )}

            {/* Articles list */}
            {(!chapter.chapterNumber ||
              expandedChapters.has(chapter.chapterNumber)) && (
              <div className="ml-4 space-y-0.5">
                {chapter.articles.map((article) => (
                  <button
                    key={article.articleId}
                    onClick={() => onArticleSelect(article.articleId)}
                    className={cn(
                      'flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors',
                      activeArticleId === article.articleId
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    <span className="flex-1 text-left">
                      <span className="font-medium">{article.articleNumber}</span>
                      {article.title && (
                        <span className="text-gray-500">. {article.title}</span>
                      )}
                    </span>
                    {article.hasPracticalReferences && (
                      <BookmarkPlus className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    )}
                  </button>
                ))}

                {/* Sections within chapter */}
                {chapter.sections.map((section, sIdx) => (
                  <div key={section.sectionNumber || sIdx} className="ml-4">
                    {section.sectionNumber && (
                      <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">
                        {section.sectionNumber}
                        {section.sectionTitle && ` - ${section.sectionTitle}`}
                      </div>
                    )}
                    {section.articles.map((article) => (
                      <button
                        key={article.articleId}
                        onClick={() => onArticleSelect(article.articleId)}
                        className={cn(
                          'flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors',
                          activeArticleId === article.articleId
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        )}
                      >
                        <span className="flex-1 text-left">
                          <span className="font-medium">{article.articleNumber}</span>
                          {article.title && (
                            <span className="text-gray-500">. {article.title}</span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
