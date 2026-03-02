'use client';

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Article } from '@/lib/api';

interface Props {
  articles: Article[];
  contentLoading: boolean;
  scrollContainer: React.RefObject<HTMLDivElement | null>;
  onArticleVisible: (articleId: string) => void;
}

export function ContentTab({ articles, contentLoading, scrollContainer, onArticleVisible }: Props) {
  // Highlight active TOC item as user scrolls
  useEffect(() => {
    const container = scrollContainer.current;
    if (!container || !articles.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          onArticleVisible(visible[0].target.id);
        }
      },
      { root: container, rootMargin: '0px 0px -65% 0px', threshold: 0 }
    );

    articles.forEach((article) => {
      const el = window.document.getElementById(article.articleId);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [articles, scrollContainer, onArticleVisible]);

  if (contentLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <Loader2 size={22} style={{ color: '#1565c0', animation: 'spin 1s linear infinite' }} />
        <span style={{ marginLeft: '10px', color: '#78909c', fontSize: '14px' }}>Đang tải nội dung...</span>
      </div>
    );
  }

  if (!articles.length) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#90a4ae', fontSize: '14px' }}>
        Văn bản này chưa có nội dung chi tiết.
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 48px 80px' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        {articles.map((article, index) => {
          const isNewChapter =
            article.chapterNumber &&
            (index === 0 || articles[index - 1]?.chapterNumber !== article.chapterNumber);

          return (
            <article
              key={article.id}
              id={article.articleId}
              style={{
                marginBottom: '28px',
                paddingBottom: '28px',
                borderBottom: index < articles.length - 1 ? '1px solid #f0f4f8' : 'none',
                scrollMarginTop: '16px',
              }}
            >
              {/* Chapter header */}
              {isNewChapter && (
                <div style={{ textAlign: 'center', margin: '8px 0 28px' }}>
                  <h2 style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#37474f',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px',
                  }}>
                    {article.chapterNumber}
                  </h2>
                  {article.chapterTitle && (
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#546e7a' }}>
                      {article.chapterTitle}
                    </p>
                  )}
                </div>
              )}

              {/* Article heading */}
              <h3 style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#1a2332',
                marginBottom: '14px',
                lineHeight: 1.4,
              }}>
                {article.articleNumber}
                {article.title && (
                  <span style={{ fontWeight: 600 }}>. {article.title}</span>
                )}
              </h3>

              {/* Article body */}
              <div
                style={{ fontSize: '15px', lineHeight: 1.9, color: '#37474f', textAlign: 'justify' }}
                dangerouslySetInnerHTML={{
                  __html: article.contentHtml ||
                    (article.content?.replace(/\n/g, '<br/>') ?? 'Nội dung đang được cập nhật...'),
                }}
              />
            </article>
          );
        })}
      </div>
    </div>
  );
}
