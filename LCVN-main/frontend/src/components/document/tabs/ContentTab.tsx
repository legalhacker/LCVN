'use client';

import { useEffect } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';
import { Article, ArticleRelationInfo } from '@/lib/api';
import Link from 'next/link';

interface Props {
  articles: Article[];
  contentLoading: boolean;
  scrollContainer: React.RefObject<HTMLDivElement | null>;
  onArticleVisible: (articleId: string) => void;
}

const RELATION_BANNERS: Record<string, { label: string; bg: string; border: string; color: string; icon: string }> = {
  amends:         { label: 'đã được sửa đổi bởi',            bg: '#fff7ed', border: '#fed7aa', color: '#c2410c', icon: '⚠️' },
  guides:         { label: 'được hướng dẫn bởi',              bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d', icon: '📋' },
  repeals:        { label: 'đã bị bãi bỏ bởi',               bg: '#fef2f2', border: '#fecaca', color: '#dc2626', icon: '🚫' },
  replaces:       { label: 'đã được thay thế bởi',            bg: '#fef2f2', border: '#fca5a5', color: '#b91c1c', icon: '🔄' },
  references:     { label: 'được dẫn chiếu tại',              bg: '#f8fafc', border: '#e2e8f0', color: '#475569', icon: '📌' },
  implements:     { label: 'được triển khai tại',             bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8', icon: '⚙️' },
  conflicts_with: { label: 'có thể xung đột với',             bg: '#fefce8', border: '#fde047', color: '#854d0e', icon: '⚡' },
  interpreted_by: { label: 'được giải thích tại án lệ',       bg: '#faf5ff', border: '#d8b4fe', color: '#7e22ce', icon: '⚖️' },
};

function ArticleRelationBanner({ relation }: { relation: ArticleRelationInfo }) {
  const banner = RELATION_BANNERS[relation.relationType];
  if (!banner) return null;

  const { fromArticle } = relation;
  const href = `/documents/${fromArticle.document.titleSlug}`;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      padding: '8px 12px',
      marginBottom: '10px',
      backgroundColor: banner.bg,
      border: `1px solid ${banner.border}`,
      borderRadius: '6px',
      fontSize: '13px',
      lineHeight: 1.5,
    }}>
      <span style={{ flexShrink: 0, marginTop: '1px' }}>{banner.icon}</span>
      <span style={{ color: banner.color }}>
        Điều này {banner.label}{' '}
        <Link
          href={href}
          style={{ color: banner.color, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}
          target="_blank"
          rel="noopener noreferrer"
        >
          Điều {fromArticle.articleNumber}
          {fromArticle.title ? ` (${fromArticle.title})` : ''}
          , {fromArticle.document.documentNumber}
          <ExternalLink size={11} style={{ display: 'inline', marginLeft: '3px', verticalAlign: 'middle' }} />
        </Link>
        {relation.note && (
          <span style={{ color: '#6b7280', fontStyle: 'italic' }}> — {relation.note}</span>
        )}
      </span>
    </div>
  );
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

              {/* Amendment/guidance banners */}
              {article.relationsTo && article.relationsTo.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  {article.relationsTo.map(rel => (
                    <ArticleRelationBanner key={rel.id} relation={rel} />
                  ))}
                </div>
              )}

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
