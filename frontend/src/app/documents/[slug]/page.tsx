'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDocument, useDocumentFull } from '@/hooks/useDocuments';
import { Loader2, AlertCircle, List, FileText, Link2, Download, X, ArrowRight, GitMerge, FileEdit, Layers } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { DocumentRelation } from '@/lib/api';

interface DocumentReaderProps {
  params: { slug: string };
}

// Status badge with official styling
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; text: string; border: string }> = {
    EFFECTIVE: { label: 'Còn hiệu lực', bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
    EXPIRED: { label: 'Hết hiệu lực', bg: '#ffebee', text: '#c62828', border: '#ef9a9a' },
    NOT_YET_EFFECTIVE: { label: 'Chưa có hiệu lực', bg: '#fff3e0', text: '#ef6c00', border: '#ffcc80' },
    PARTIALLY_EXPIRED: { label: 'Hết hiệu lực một phần', bg: '#fce4ec', text: '#ad1457', border: '#f48fb1' },
  };
  const { label, bg, text, border } = config[status] || config.EFFECTIVE;

  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      fontSize: '13px',
      fontWeight: 600,
      color: text,
      backgroundColor: bg,
      border: `1px solid ${border}`,
      borderRadius: '4px',
    }}>
      {label}
    </span>
  );
}

// Document type label
function getDocumentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    LAW: 'LUẬT',
    CODE: 'BỘ LUẬT',
    DECREE: 'NGHỊ ĐỊNH',
    CIRCULAR: 'THÔNG TƯ',
    RESOLUTION: 'NGHỊ QUYẾT',
    DECISION: 'QUYẾT ĐỊNH',
  };
  return labels[type] || type;
}

// Relation type labels and icons
const RELATION_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  IMPLEMENTS: { label: 'Hướng dẫn thi hành', color: '#1565c0', bgColor: '#e3f2fd' },
  AMENDS: { label: 'Sửa đổi, bổ sung', color: '#e65100', bgColor: '#fff3e0' },
  SUPPLEMENTS: { label: 'Bổ sung', color: '#2e7d32', bgColor: '#e8f5e9' },
  REPLACES: { label: 'Thay thế', color: '#c62828', bgColor: '#ffebee' },
  REFERENCES: { label: 'Dẫn chiếu', color: '#6a1b9a', bgColor: '#f3e5f5' },
  RELATED: { label: 'Văn bản liên quan', color: '#546e7a', bgColor: '#eceff1' },
};

export default function DocumentReader({ params }: DocumentReaderProps) {
  const { slug } = params;
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [showTOC, setShowTOC] = useState(true);
  const [showRelated, setShowRelated] = useState(false);
  const [hasScrolledToHash, setHasScrolledToHash] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  const { data: document, isLoading: tocLoading, error: tocError } = useDocument(slug);
  const { data: fullDocument, isLoading: contentLoading } = useDocumentFull(slug);

  // Scroll to article by ID
  const scrollToArticle = useCallback((articleId: string) => {
    setTimeout(() => {
      const element = window.document.getElementById(articleId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveArticleId(articleId);
      }
    }, 100);
  }, []);

  // Handle hash from URL
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasScrolledToHash && !contentLoading && fullDocument?.articles?.length) {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const decodedHash = decodeURIComponent(hash);
        scrollToArticle(decodedHash);
        setHasScrolledToHash(true);
      }
    }
  }, [contentLoading, fullDocument, hasScrolledToHash, scrollToArticle]);

  // Set first article as active when document loads
  useEffect(() => {
    if (document?.articles && document.articles.length > 0 && !activeArticleId && !hasScrolledToHash) {
      const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
      if (!hash) {
        setActiveArticleId(document.articles[0].articleId);
      }
    }
  }, [document, activeArticleId, hasScrolledToHash]);

  // Back to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (tocLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <Loader2 size={32} style={{ color: '#1565c0', animation: 'spin 1s linear infinite' }} />
        <span style={{ marginLeft: '12px', fontSize: '16px', color: '#546e7a' }}>Đang tải văn bản...</span>
      </div>
    );
  }

  if (tocError || !document) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <AlertCircle size={48} style={{ color: '#d32f2f', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#263238', marginBottom: '8px' }}>Không tìm thấy văn bản</h2>
        <p style={{ color: '#78909c', marginBottom: '24px' }}>Văn bản bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
        <Link href="/search" style={{ color: '#1565c0', textDecoration: 'none', fontWeight: 500 }}>
          ← Quay lại tìm kiếm
        </Link>
      </div>
    );
  }

  const articles = fullDocument?.articles || [];

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Minimal Toolbar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '48px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setShowTOC(!showTOC)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: 500,
                color: showTOC ? '#1565c0' : '#546e7a',
                backgroundColor: showTOC ? '#e3f2fd' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <List size={16} />
              Mục lục
            </button>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#546e7a',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}>
              <FileText size={16} />
              Văn bản gốc
            </button>
            <button
              onClick={() => setShowRelated(!showRelated)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: 500,
                color: showRelated ? '#1565c0' : '#546e7a',
                backgroundColor: showRelated ? '#e3f2fd' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <Link2 size={16} />
              Văn bản liên quan
              {document && (document.relatedFrom?.length > 0 || document.relatedTo?.length > 0) && (
                <span style={{
                  backgroundColor: '#1565c0',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '10px',
                  minWidth: '18px',
                  textAlign: 'center',
                }}>
                  {(document.relatedFrom?.length || 0) + (document.relatedTo?.length || 0)}
                </span>
              )}
            </button>
          </div>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#546e7a',
            backgroundColor: 'transparent',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            cursor: 'pointer',
          }}>
            <Download size={16} />
            Tải về
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Table of Contents Sidebar */}
        {showTOC && (
          <aside style={{
            width: '280px',
            flexShrink: 0,
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
            height: 'calc(100vh - 48px)',
            position: 'sticky',
            top: '48px',
            overflowY: 'auto',
          }}>
            <div style={{ padding: '20px 16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#37474f', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Mục lục
              </h3>
              <nav>
                {document.tableOfContents?.map((chapter, idx) => (
                  <div key={chapter.chapterNumber || idx} style={{ marginBottom: '8px' }}>
                    {chapter.chapterNumber && (
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#455a64',
                        padding: '8px 0',
                        borderBottom: '1px solid #eceff1',
                        marginBottom: '4px',
                      }}>
                        {chapter.chapterNumber}
                        {chapter.chapterTitle && <span style={{ fontWeight: 400 }}> - {chapter.chapterTitle}</span>}
                      </div>
                    )}
                    {chapter.articles?.map((article) => (
                      <button
                        key={article.articleId}
                        onClick={() => {
                          setActiveArticleId(article.articleId);
                          scrollToArticle(article.articleId);
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: '6px 8px',
                          fontSize: '13px',
                          color: activeArticleId === article.articleId ? '#1565c0' : '#546e7a',
                          backgroundColor: activeArticleId === article.articleId ? '#e3f2fd' : 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginBottom: '2px',
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>{article.articleNumber}</span>
                        {article.title && <span style={{ color: '#78909c' }}>. {article.title}</span>}
                      </button>
                    ))}
                  </div>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main ref={contentContainerRef} style={{
          flex: 1,
          backgroundColor: '#ffffff',
          minHeight: 'calc(100vh - 48px)',
        }}>
          {/* Document Header - Official Style */}
          <header style={{
            padding: '40px 48px',
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#fafafa',
          }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
              {/* National Header */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#37474f', letterSpacing: '1px', marginBottom: '4px' }}>
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </p>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#546e7a' }}>
                  Độc lập - Tự do - Hạnh phúc
                </p>
                <div style={{ width: '60px', height: '2px', backgroundColor: '#1565c0', margin: '12px auto 0' }} />
              </div>

              {/* Issuing Body */}
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#455a64', marginBottom: '20px', textTransform: 'uppercase' }}>
                {document.issuingBody}
              </p>

              {/* Document Type & Number */}
              <div style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#ffffff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#1565c0', marginBottom: '4px' }}>
                  {getDocumentTypeLabel(document.documentType)}
                </p>
                <p style={{ fontSize: '13px', color: '#546e7a' }}>
                  {document.documentNumber}
                </p>
              </div>

              {/* Document Title */}
              <h1 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#263238',
                lineHeight: 1.4,
                marginBottom: '20px',
                maxWidth: '700px',
                margin: '0 auto 20px',
              }}>
                {document.title}
              </h1>

              {/* Meta Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '24px',
                flexWrap: 'wrap',
              }}>
                <StatusBadge status={document.status} />
                <span style={{ fontSize: '13px', color: '#78909c' }}>
                  Ban hành: <span style={{ color: '#455a64', fontWeight: 500 }}>{formatDate(document.issuedDate)}</span>
                </span>
                {document.effectiveDate && (
                  <span style={{ fontSize: '13px', color: '#78909c' }}>
                    Hiệu lực: <span style={{ color: '#455a64', fontWeight: 500 }}>{formatDate(document.effectiveDate)}</span>
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Document Body */}
          <div style={{ padding: '40px 48px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              {contentLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
                  <Loader2 size={24} style={{ color: '#1565c0', animation: 'spin 1s linear infinite' }} />
                  <span style={{ marginLeft: '12px', color: '#78909c' }}>Đang tải nội dung...</span>
                </div>
              ) : articles.length > 0 ? (
                <div>
                  {articles.map((article, index) => (
                    <article
                      key={article.id}
                      id={article.articleId}
                      style={{
                        marginBottom: '32px',
                        paddingBottom: '32px',
                        borderBottom: index < articles.length - 1 ? '1px solid #eceff1' : 'none',
                        scrollMarginTop: '96px',
                      }}
                    >
                      {/* Chapter Header (if new chapter) */}
                      {article.chapterNumber && (
                        index === 0 || articles[index - 1]?.chapterNumber !== article.chapterNumber
                      ) && (
                        <div style={{
                          textAlign: 'center',
                          marginBottom: '32px',
                          paddingBottom: '16px',
                        }}>
                          <h2 style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: '#37474f',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '4px',
                          }}>
                            {article.chapterNumber}
                          </h2>
                          {article.chapterTitle && (
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#546e7a' }}>
                              {article.chapterTitle}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Article Header */}
                      <h3 style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#263238',
                        marginBottom: '16px',
                      }}>
                        {article.articleNumber}
                        {article.title && (
                          <span style={{ fontWeight: 600 }}>. {article.title}</span>
                        )}
                      </h3>

                      {/* Article Content */}
                      <div
                        style={{
                          fontSize: '15px',
                          lineHeight: 1.9,
                          color: '#37474f',
                          textAlign: 'justify',
                        }}
                        dangerouslySetInnerHTML={{
                          __html: article.contentHtml || (article.content?.replace(/\n/g, '<br/>') || 'Nội dung đang được cập nhật...')
                        }}
                      />
                    </article>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#78909c' }}>
                  Văn bản này chưa có nội dung chi tiết.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Related Documents Panel */}
      {showRelated && document && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '420px',
            maxWidth: '100vw',
            backgroundColor: '#ffffff',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideIn 0.2s ease-out',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#263238', margin: 0 }}>
              Văn bản liên quan
            </h3>
            <button
              onClick={() => setShowRelated(false)}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#546e7a',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {/* Documents that this document references/implements */}
            {document.relatedFrom && document.relatedFrom.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#78909c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '12px',
                }}>
                  Văn bản này liên quan đến
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {document.relatedFrom.map((rel: DocumentRelation) => (
                    <Link
                      key={rel.id}
                      href={`/documents/${rel.toDocument?.titleSlug}`}
                      onClick={() => setShowRelated(false)}
                      style={{
                        display: 'block',
                        padding: '14px 16px',
                        backgroundColor: '#fafafa',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#1565c0';
                        e.currentTarget.style.backgroundColor = '#f5f9ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e0e0e0';
                        e.currentTarget.style.backgroundColor = '#fafafa';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          padding: '6px',
                          borderRadius: '6px',
                          backgroundColor: RELATION_LABELS[rel.relationType]?.bgColor || '#eceff1',
                        }}>
                          {rel.relationType === 'IMPLEMENTS' && <Layers size={16} style={{ color: RELATION_LABELS[rel.relationType]?.color }} />}
                          {rel.relationType === 'AMENDS' && <FileEdit size={16} style={{ color: RELATION_LABELS[rel.relationType]?.color }} />}
                          {rel.relationType === 'SUPPLEMENTS' && <GitMerge size={16} style={{ color: RELATION_LABELS[rel.relationType]?.color }} />}
                          {rel.relationType === 'RELATED' && <Link2 size={16} style={{ color: RELATION_LABELS[rel.relationType]?.color }} />}
                          {!['IMPLEMENTS', 'AMENDS', 'SUPPLEMENTS', 'RELATED'].includes(rel.relationType) && <ArrowRight size={16} style={{ color: '#546e7a' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{
                            display: 'inline-block',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: RELATION_LABELS[rel.relationType]?.color || '#546e7a',
                            backgroundColor: RELATION_LABELS[rel.relationType]?.bgColor || '#eceff1',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            marginBottom: '6px',
                          }}>
                            {RELATION_LABELS[rel.relationType]?.label || rel.relationType}
                          </span>
                          <p style={{ fontSize: '13px', fontWeight: 500, color: '#263238', margin: '0 0 4px 0' }}>
                            {rel.toDocument?.title}
                          </p>
                          <p style={{ fontSize: '12px', color: '#78909c', margin: 0 }}>
                            {rel.toDocument?.documentNumber}
                          </p>
                          {rel.description && (
                            <p style={{ fontSize: '12px', color: '#90a4ae', margin: '6px 0 0 0', fontStyle: 'italic' }}>
                              {rel.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Documents that reference this document */}
            {document.relatedTo && document.relatedTo.length > 0 && (
              <div>
                <h4 style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#78909c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '12px',
                }}>
                  Văn bản liên quan đến văn bản này
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {document.relatedTo.map((rel: DocumentRelation) => (
                    <Link
                      key={rel.id}
                      href={`/documents/${rel.fromDocument?.titleSlug}`}
                      onClick={() => setShowRelated(false)}
                      style={{
                        display: 'block',
                        padding: '14px 16px',
                        backgroundColor: '#fafafa',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#1565c0';
                        e.currentTarget.style.backgroundColor = '#f5f9ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e0e0e0';
                        e.currentTarget.style.backgroundColor = '#fafafa';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          padding: '6px',
                          borderRadius: '6px',
                          backgroundColor: RELATION_LABELS[rel.relationType]?.bgColor || '#eceff1',
                        }}>
                          {rel.relationType === 'IMPLEMENTS' && <Layers size={16} style={{ color: RELATION_LABELS[rel.relationType]?.color }} />}
                          {rel.relationType === 'AMENDS' && <FileEdit size={16} style={{ color: RELATION_LABELS[rel.relationType]?.color }} />}
                          {rel.relationType === 'SUPPLEMENTS' && <GitMerge size={16} style={{ color: RELATION_LABELS[rel.relationType]?.color }} />}
                          {rel.relationType === 'RELATED' && <Link2 size={16} style={{ color: RELATION_LABELS[rel.relationType]?.color }} />}
                          {!['IMPLEMENTS', 'AMENDS', 'SUPPLEMENTS', 'RELATED'].includes(rel.relationType) && <ArrowRight size={16} style={{ color: '#546e7a' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{
                            display: 'inline-block',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: RELATION_LABELS[rel.relationType]?.color || '#546e7a',
                            backgroundColor: RELATION_LABELS[rel.relationType]?.bgColor || '#eceff1',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            marginBottom: '6px',
                          }}>
                            {RELATION_LABELS[rel.relationType]?.label || rel.relationType}
                          </span>
                          <p style={{ fontSize: '13px', fontWeight: 500, color: '#263238', margin: '0 0 4px 0' }}>
                            {rel.fromDocument?.title}
                          </p>
                          <p style={{ fontSize: '12px', color: '#78909c', margin: 0 }}>
                            {rel.fromDocument?.documentNumber}
                          </p>
                          {rel.description && (
                            <p style={{ fontSize: '12px', color: '#90a4ae', margin: '6px 0 0 0', fontStyle: 'italic' }}>
                              {rel.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No relations */}
            {(!document.relatedFrom || document.relatedFrom.length === 0) &&
             (!document.relatedTo || document.relatedTo.length === 0) && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#90a4ae' }}>
                <Link2 size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p style={{ margin: 0 }}>Chưa có văn bản liên quan</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop for related panel */}
      {showRelated && (
        <div
          onClick={() => setShowRelated(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 150,
          }}
        />
      )}

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
          boxShadow: '0 4px 14px rgba(8, 145, 178, 0.35)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: showBackToTop ? 1 : 0,
          visibility: showBackToTop ? 'visible' : 'hidden',
          transform: showBackToTop ? 'scale(1)' : 'scale(0.8)',
          transition: 'opacity 0.25s ease, visibility 0.25s ease, transform 0.25s ease, box-shadow 0.2s ease',
          zIndex: 1000,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(8, 145, 178, 0.45)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = showBackToTop ? 'scale(1)' : 'scale(0.8)';
          e.currentTarget.style.boxShadow = '0 4px 14px rgba(8, 145, 178, 0.35)';
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Scrollbar styling */
        aside::-webkit-scrollbar {
          width: 6px;
        }
        aside::-webkit-scrollbar-track {
          background: transparent;
        }
        aside::-webkit-scrollbar-thumb {
          background: #cfd8dc;
          border-radius: 3px;
        }
        aside::-webkit-scrollbar-thumb:hover {
          background: #b0bec5;
        }
      `}</style>
    </div>
  );
}
