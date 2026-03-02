'use client';

import { TocChapter } from '@/types';

interface Props {
  toc: TocChapter[];
  activeArticleId: string | null;
  onArticleClick: (articleId: string) => void;
}

export function TableOfContents({ toc, activeArticleId, onArticleClick }: Props) {
  return (
    <aside
      className="doc-toc-pane"
      style={{
        width: '290px',
        flexShrink: 0,
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e0e0e0',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: '#cfd8dc transparent',
      } as React.CSSProperties}
    >
      <div style={{ padding: '16px 14px' }}>
        <p style={{
          fontSize: '11px',
          fontWeight: 700,
          color: '#90a4ae',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: '12px',
          paddingLeft: '8px',
        }}>
          Mục lục
        </p>

        <nav>
          {toc?.map((chapter, chIdx) => (
            <div key={chapter.chapterNumber ?? `ch-${chIdx}`} style={{ marginBottom: '4px' }}>
              {/* Chapter heading */}
              {chapter.chapterNumber && (
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#37474f',
                  padding: '7px 8px 4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                  borderTop: chIdx > 0 ? '1px solid #f0f0f0' : 'none',
                  marginTop: chIdx > 0 ? '8px' : 0,
                }}>
                  {chapter.chapterNumber}
                  {chapter.chapterTitle && (
                    <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>
                      {' – '}{chapter.chapterTitle}
                    </span>
                  )}
                </div>
              )}

              {/* Articles directly in chapter (no section) */}
              {chapter.articles?.map((article) => (
                <TocArticleBtn
                  key={article.articleId}
                  articleId={article.articleId}
                  articleNumber={article.articleNumber}
                  title={article.title}
                  active={activeArticleId === article.articleId}
                  indent={false}
                  onClick={onArticleClick}
                />
              ))}

              {/* Sections */}
              {chapter.sections?.map((section, sIdx) => (
                <div key={section.sectionNumber ?? `s-${sIdx}`}>
                  {section.sectionNumber && (
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#546e7a',
                      padding: '5px 8px 3px 16px',
                    }}>
                      {section.sectionNumber}
                      {section.sectionTitle && (
                        <span style={{ fontWeight: 400 }}> – {section.sectionTitle}</span>
                      )}
                    </div>
                  )}
                  {section.articles?.map((article) => (
                    <TocArticleBtn
                      key={article.articleId}
                      articleId={article.articleId}
                      articleNumber={article.articleNumber}
                      title={article.title}
                      active={activeArticleId === article.articleId}
                      indent={!!section.sectionNumber}
                      onClick={onArticleClick}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <style jsx global>{`
        .doc-toc-pane::-webkit-scrollbar { width: 5px; }
        .doc-toc-pane::-webkit-scrollbar-track { background: transparent; }
        .doc-toc-pane::-webkit-scrollbar-thumb { background: #cfd8dc; border-radius: 3px; }
        .doc-toc-pane::-webkit-scrollbar-thumb:hover { background: #b0bec5; }
      `}</style>
    </aside>
  );
}

interface TocArticleBtnProps {
  articleId: string;
  articleNumber: string;
  title?: string;
  active: boolean;
  indent: boolean;
  onClick: (id: string) => void;
}

function TocArticleBtn({ articleId, articleNumber, title, active, indent, onClick }: TocArticleBtnProps) {
  return (
    <button
      onClick={() => onClick(articleId)}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: `5px 8px 5px ${indent ? '24px' : '8px'}`,
        fontSize: '12.5px',
        color: active ? '#1565c0' : '#546e7a',
        backgroundColor: active ? '#e8f4fd' : 'transparent',
        border: 'none',
        borderLeft: active ? '3px solid #1565c0' : '3px solid transparent',
        borderRadius: '0 4px 4px 0',
        cursor: 'pointer',
        marginBottom: '1px',
        lineHeight: 1.4,
        transition: 'all 0.12s',
      }}
    >
      <span style={{ fontWeight: 600 }}>{articleNumber}</span>
      {title && (
        <span style={{ color: active ? '#1976d2' : '#78909c', fontWeight: 400 }}>
          . {title}
        </span>
      )}
    </button>
  );
}
