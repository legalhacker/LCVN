'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Scale,
  BookOpen,
  ChevronLeft,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Copy,
  Check,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Article {
  id: string;
  articleId: string;
  articleNumber: string;
  title: string | null;
  content: string;
  contentHtml: string | null;
  chapterNumber: string | null;
  chapterTitle: string | null;
  keywords: string[];
  summary: string | null;
  hasPracticalReferences: boolean;
  document: {
    id: string;
    documentNumber: string;
    title: string;
    titleSlug: string;
    documentType: string;
    status: string;
  };
}

interface Navigation {
  prev: { articleId: string; articleNumber: string; title: string | null } | null;
  next: { articleId: string; articleNumber: string; title: string | null } | null;
}

interface Resource {
  id: string;
  resourceType: string;
  title: string;
  source: string;
  author?: string;
  publishedDate?: string;
  externalUrl?: string;
  excerpt?: string;
  caseNumber?: string;
  courtName?: string;
}

interface Resources {
  cases: Resource[];
  expertArticles: Resource[];
  workspaceNotes: any[];
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; bgColor: string; Icon: typeof CheckCircle }> = {
    EFFECTIVE: { label: 'Đang có hiệu lực', color: '#059669', bgColor: '#d1fae5', Icon: CheckCircle },
    EXPIRED: { label: 'Hết hiệu lực', color: '#dc2626', bgColor: '#fee2e2', Icon: XCircle },
    NOT_YET_EFFECTIVE: { label: 'Chưa có hiệu lực', color: '#d97706', bgColor: '#fef3c7', Icon: Clock },
    PARTIALLY_EXPIRED: { label: 'Hết hiệu lực một phần', color: '#9333ea', bgColor: '#f3e8ff', Icon: AlertCircle },
  };

  const { label, color, bgColor, Icon } = config[status] || config.EFFECTIVE;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '13px',
        fontWeight: 500,
        color,
        backgroundColor: bgColor,
      }}
    >
      <Icon size={14} />
      {label}
    </span>
  );
}

// Document type label
function getDocumentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    LAW: 'Luật',
    CODE: 'Bộ luật',
    DECREE: 'Nghị định',
    CIRCULAR: 'Thông tư',
    RESOLUTION: 'Nghị quyết',
    DECISION: 'Quyết định',
  };
  return labels[type] || type;
}

// Resource type label
function getResourceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    COURT_CASE: 'Bản án',
    ADMIN_PENALTY: 'Quyết định xử phạt',
    EXPERT_ARTICLE: 'Bài viết chuyên gia',
    LAW_FIRM_PUBLICATION: 'Bài viết pháp lý',
    ACADEMIC_PAPER: 'Nghiên cứu',
  };
  return labels[type] || type;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const articleId = decodeURIComponent(params.articleId as string);

  const [article, setArticle] = useState<Article | null>(null);
  const [navigation, setNavigation] = useState<Navigation | null>(null);
  const [resources, setResources] = useState<Resources | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'cases' | 'expert'>('content');
  const [copied, setCopied] = useState(false);

  // Fetch article data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [articleRes, navRes, resourcesRes] = await Promise.all([
          fetch(`${API_BASE}/api/articles/${encodeURIComponent(articleId)}`),
          fetch(`${API_BASE}/api/articles/${encodeURIComponent(articleId)}/navigation`),
          fetch(`${API_BASE}/api/articles/${encodeURIComponent(articleId)}/resources`),
        ]);

        if (!articleRes.ok) {
          throw new Error('Không tìm thấy điều khoản');
        }

        const [articleData, navData, resourcesData] = await Promise.all([
          articleRes.json(),
          navRes.json(),
          resourcesRes.json(),
        ]);

        setArticle(articleData);
        setNavigation(navData);
        setResources(resourcesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    }

    if (articleId) {
      fetchData();
    }
  }, [articleId]);

  // Copy article link
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} style={{ color: '#0891b2', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '24px' }}>
        <AlertCircle size={48} style={{ color: '#dc2626', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#171717', marginBottom: '8px' }}>
          Không tìm thấy điều khoản
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Điều khoản bạn đang tìm không tồn tại hoặc đã bị xóa.
        </p>
        <Link
          href="/search"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#0891b2',
            color: '#ffffff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={18} />
          Quay lại tìm kiếm
        </Link>
      </div>
    );
  }

  const hasResources = resources && (resources.cases.length > 0 || resources.expertArticles.length > 0);

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: 'calc(100vh - 64px)' }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e5e5', padding: '12px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <Link href="/search" style={{ color: '#6b7280', textDecoration: 'none' }}>
            Tìm kiếm
          </Link>
          <span style={{ color: '#d1d5db' }}>/</span>
          <Link
            href={`/documents/${article.document.titleSlug}`}
            style={{ color: '#6b7280', textDecoration: 'none' }}
          >
            {article.document.title}
          </Link>
          <span style={{ color: '#d1d5db' }}>/</span>
          <span style={{ color: '#171717', fontWeight: 500 }}>{article.articleNumber}</span>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 10px', backgroundColor: '#f3f4f6', borderRadius: '6px', fontSize: '13px', color: '#525252' }}>
              {getDocumentTypeLabel(article.document.documentType)}
            </span>
            <StatusBadge status={article.document.status} />
            {article.hasPracticalReferences && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: '#fef3c7', borderRadius: '6px', fontSize: '13px', color: '#92400e' }}>
                <Scale size={14} />
                Có án lệ
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#171717', marginBottom: '8px' }}>
            {article.articleNumber}
            {article.title && <span style={{ fontWeight: 500 }}>. {article.title}</span>}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#6b7280', fontSize: '14px', flexWrap: 'wrap' }}>
            <Link
              href={`/documents/${article.document.titleSlug}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0891b2', textDecoration: 'none' }}
            >
              <FileText size={16} />
              {article.document.documentNumber} - {article.document.title}
            </Link>
            {article.chapterTitle && (
              <>
                <span>|</span>
                <span>{article.chapterNumber}: {article.chapterTitle}</span>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Left - Article Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid #e5e5e5', paddingBottom: '0' }}>
              <button
                onClick={() => setActiveTab('content')}
                style={{
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: activeTab === 'content' ? '#0891b2' : '#6b7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'content' ? '2px solid #0891b2' : '2px solid transparent',
                  cursor: 'pointer',
                  marginBottom: '-1px',
                }}
              >
                <BookOpen size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Nội dung
              </button>
              {hasResources && (
                <>
                  <button
                    onClick={() => setActiveTab('cases')}
                    style={{
                      padding: '10px 16px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: activeTab === 'cases' ? '#0891b2' : '#6b7280',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderBottom: activeTab === 'cases' ? '2px solid #0891b2' : '2px solid transparent',
                      cursor: 'pointer',
                      marginBottom: '-1px',
                    }}
                  >
                    <Scale size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    Án lệ ({resources?.cases.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('expert')}
                    style={{
                      padding: '10px 16px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: activeTab === 'expert' ? '#0891b2' : '#6b7280',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderBottom: activeTab === 'expert' ? '2px solid #0891b2' : '2px solid transparent',
                      cursor: 'pointer',
                      marginBottom: '-1px',
                    }}
                  >
                    Bài viết ({resources?.expertArticles.length || 0})
                  </button>
                </>
              )}
            </div>

            {/* Tab Content */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e5e5', padding: '24px' }}>
              {activeTab === 'content' && (
                <div>
                  {article.summary && (
                    <div style={{ padding: '16px', backgroundColor: '#f0fdfa', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #0891b2' }}>
                      <p style={{ fontSize: '14px', color: '#0f766e', margin: 0, lineHeight: 1.6 }}>
                        <strong>Tóm tắt:</strong> {article.summary}
                      </p>
                    </div>
                  )}

                  <div
                    style={{ fontSize: '15px', lineHeight: 1.8, color: '#171717' }}
                    dangerouslySetInnerHTML={{ __html: article.contentHtml || article.content.replace(/\n/g, '<br/>') }}
                  />

                  {article.keywords.length > 0 && (
                    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e5e5e5' }}>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>Từ khóa:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {article.keywords.map((keyword, i) => (
                          <Link
                            key={i}
                            href={`/search?q=${encodeURIComponent(keyword)}`}
                            style={{
                              padding: '4px 10px',
                              backgroundColor: '#f3f4f6',
                              borderRadius: '6px',
                              fontSize: '13px',
                              color: '#525252',
                              textDecoration: 'none',
                            }}
                          >
                            {keyword}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'cases' && resources && (
                <div>
                  {resources.cases.length === 0 ? (
                    <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
                      Chưa có án lệ liên quan
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {resources.cases.map((item) => (
                        <div key={item.id} style={{ padding: '16px', backgroundColor: '#fafafa', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ padding: '2px 8px', backgroundColor: '#dbeafe', borderRadius: '4px', fontSize: '12px', color: '#1e40af' }}>
                              {getResourceTypeLabel(item.resourceType)}
                            </span>
                            {item.caseNumber && (
                              <span style={{ fontSize: '13px', color: '#6b7280' }}>{item.caseNumber}</span>
                            )}
                          </div>
                          <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#171717', marginBottom: '6px' }}>
                            {item.title}
                          </h4>
                          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                            {item.source} {item.courtName && `• ${item.courtName}`}
                          </p>
                          {item.excerpt && (
                            <p style={{ fontSize: '14px', color: '#525252', lineHeight: 1.6, margin: 0 }}>
                              {item.excerpt}
                            </p>
                          )}
                          {item.externalUrl && (
                            <a
                              href={item.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '12px', fontSize: '13px', color: '#0891b2', textDecoration: 'none' }}
                            >
                              Xem chi tiết <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'expert' && resources && (
                <div>
                  {resources.expertArticles.length === 0 ? (
                    <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
                      Chưa có bài viết liên quan
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {resources.expertArticles.map((item) => (
                        <div key={item.id} style={{ padding: '16px', backgroundColor: '#fafafa', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ padding: '2px 8px', backgroundColor: '#fef3c7', borderRadius: '4px', fontSize: '12px', color: '#92400e' }}>
                              {getResourceTypeLabel(item.resourceType)}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#171717', marginBottom: '6px' }}>
                            {item.title}
                          </h4>
                          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                            {item.author && `${item.author} • `}{item.source}
                          </p>
                          {item.excerpt && (
                            <p style={{ fontSize: '14px', color: '#525252', lineHeight: 1.6, margin: 0 }}>
                              {item.excerpt}
                            </p>
                          )}
                          {item.externalUrl && (
                            <a
                              href={item.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '12px', fontSize: '13px', color: '#0891b2', textDecoration: 'none' }}
                            >
                              Đọc bài viết <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            {navigation && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', gap: '16px' }}>
                {navigation.prev ? (
                  <Link
                    href={`/dieu-luat/${encodeURIComponent(navigation.prev.articleId)}`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      border: '1px solid #e5e5e5',
                      textDecoration: 'none',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <ChevronLeft size={20} style={{ color: '#6b7280' }} />
                    <div>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Điều trước</p>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: '#171717', margin: 0 }}>
                        {navigation.prev.articleNumber}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div style={{ flex: 1 }} />
                )}

                {navigation.next ? (
                  <Link
                    href={`/dieu-luat/${encodeURIComponent(navigation.next.articleId)}`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '12px',
                      padding: '16px',
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      border: '1px solid #e5e5e5',
                      textDecoration: 'none',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Điều tiếp</p>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: '#171717', margin: 0 }}>
                        {navigation.next.articleNumber}
                      </p>
                    </div>
                    <ArrowRight size={20} style={{ color: '#6b7280' }} />
                  </Link>
                ) : (
                  <div style={{ flex: 1 }} />
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div style={{ width: '280px', flexShrink: 0 }}>
            {/* Actions */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e5e5', padding: '16px', marginBottom: '16px' }}>
              <button
                onClick={copyLink}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: copied ? '#d1fae5' : '#f3f4f6',
                  color: copied ? '#059669' : '#525252',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Đã sao chép!' : 'Sao chép liên kết'}
              </button>
            </div>

            {/* Document Info */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e5e5', padding: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#171717', marginBottom: '12px' }}>
                Văn bản gốc
              </h3>
              <Link
                href={`/documents/${article.document.titleSlug}`}
                style={{
                  display: 'block',
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  marginBottom: '12px',
                }}
              >
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#171717', margin: '0 0 4px 0' }}>
                  {article.document.title}
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                  {article.document.documentNumber}
                </p>
              </Link>

              <Link
                href={`/documents/${article.document.titleSlug}#${article.articleId}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  backgroundColor: '#0891b2',
                  color: '#ffffff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <FileText size={16} />
                Xem trong văn bản
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .article-content p {
          margin-bottom: 12px;
        }
        .article-content ul, .article-content ol {
          margin: 12px 0;
          padding-left: 24px;
        }
        .article-content li {
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
}
