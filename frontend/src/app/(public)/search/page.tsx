'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  FileText,
  Filter,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Star,
  Tag,
  X,
} from 'lucide-react';
import {
  globalSearch,
  getSearchFilters,
  SearchResponse,
  ArticleSearchResult,
  DocumentSearchResult,
  SearchFiltersResponse,
  LegalStatus,
} from '@/lib/api';

// Legal status badge component
function LegalStatusBadge({ status }: { status: LegalStatus }) {
  const config: Record<LegalStatus, { label: string; color: string; bgColor: string; Icon: typeof CheckCircle }> = {
    EFFECTIVE: {
      label: 'Hiệu lực',
      color: '#059669',
      bgColor: '#d1fae5',
      Icon: CheckCircle,
    },
    EXPIRED: {
      label: 'Hết hiệu lực',
      color: '#dc2626',
      bgColor: '#fee2e2',
      Icon: XCircle,
    },
    NOT_YET_EFFECTIVE: {
      label: 'Chưa hiệu lực',
      color: '#d97706',
      bgColor: '#fef3c7',
      Icon: Clock,
    },
    PARTIALLY_EXPIRED: {
      label: 'Hết hiệu lực một phần',
      color: '#9333ea',
      bgColor: '#f3e8ff',
      Icon: AlertCircle,
    },
  };

  const { label, color, bgColor, Icon } = config[status];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 500,
        color,
        backgroundColor: bgColor,
      }}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}

// Document type badge
function DocumentTypeBadge({ type }: { type: string }) {
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

  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 500,
        color: '#6b7280',
        backgroundColor: '#f3f4f6',
      }}
    >
      {labels[type] || type}
    </span>
  );
}

// Importance stars component
function ImportanceStars({ importance }: { importance: number }) {
  if (!importance || importance < 2) return null;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        padding: '2px 6px',
        borderRadius: '4px',
        backgroundColor: importance >= 4 ? '#fef3c7' : '#f3f4f6',
      }}
      title={`Mức độ quan trọng: ${importance}/5`}
    >
      {Array.from({ length: Math.min(importance, 5) }).map((_, i) => (
        <Star
          key={i}
          size={10}
          fill={importance >= 4 ? '#f59e0b' : '#9ca3af'}
          style={{ color: importance >= 4 ? '#f59e0b' : '#9ca3af' }}
        />
      ))}
    </span>
  );
}

// Article type badge
function ArticleTypeBadge({ type }: { type: string | null }) {
  if (!type || type === 'GENERAL') return null;

  const config: Record<string, { label: string; color: string; bg: string }> = {
    DEFINITION: { label: 'Định nghĩa', color: '#7c3aed', bg: '#f3e8ff' },
    PROCEDURE: { label: 'Thủ tục', color: '#0891b2', bg: '#ecfeff' },
    RIGHTS: { label: 'Quyền', color: '#059669', bg: '#d1fae5' },
    OBLIGATIONS: { label: 'Nghĩa vụ', color: '#dc2626', bg: '#fee2e2' },
    PENALTY: { label: 'Xử phạt', color: '#c2410c', bg: '#ffedd5' },
    SCOPE: { label: 'Phạm vi', color: '#4f46e5', bg: '#e0e7ff' },
  };

  const { label, color, bg } = config[type] || { label: type, color: '#6b7280', bg: '#f3f4f6' };

  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 600,
        color,
        backgroundColor: bg,
      }}
    >
      {label}
    </span>
  );
}

// Article search result card
function ArticleResultCard({ article }: { article: ArticleSearchResult }) {
  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e5e5',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#0891b2';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(8, 145, 178, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e5e5e5';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: article.importance >= 4 ? '#fef3c7' : '#ecfeff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <FileText size={20} style={{ color: article.importance >= 4 ? '#f59e0b' : '#0891b2' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title row with status and importance */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <Link
              href={`/documents/${article.documentSlug}#${encodeURIComponent(article.articleId)}`}
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#171717',
                textDecoration: 'none',
              }}
            >
              {article.articleNumber}
              {article.title && `: ${article.title}`}
            </Link>
            <LegalStatusBadge status={article.legalStatus} />
            <ImportanceStars importance={article.importance} />
            <ArticleTypeBadge type={article.articleType} />
          </div>

          {/* Subject matter (if different from title) */}
          {article.subjectMatter && article.subjectMatter !== article.title && (
            <div style={{ fontSize: '13px', color: '#0891b2', fontWeight: 500, marginBottom: '4px' }}>
              {article.subjectMatter}
            </div>
          )}

          {/* Document info */}
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
            <DocumentTypeBadge type={article.documentType} />
            <span style={{ margin: '0 8px' }}>|</span>
            <span>{article.documentNumber}</span>
            {article.chapterTitle && (
              <>
                <span style={{ margin: '0 8px' }}>|</span>
                <span>{article.chapterTitle}</span>
              </>
            )}
          </div>

          {/* Snippet */}
          <p
            style={{
              fontSize: '14px',
              color: '#525252',
              lineHeight: 1.6,
              margin: 0,
            }}
            dangerouslySetInnerHTML={{ __html: article.snippet }}
          />

          {/* Topic tags */}
          {article.legalTopics && article.legalTopics.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
              {article.legalTopics.slice(0, 4).map((topic) => (
                <span
                  key={topic}
                  style={{
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#525252',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '12px',
                  }}
                >
                  {topic}
                </span>
              ))}
              {article.legalTopics.length > 4 && (
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                  +{article.legalTopics.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Replaced by warning */}
          {article.replacedBy && (
            <div
              style={{
                marginTop: '10px',
                padding: '8px 12px',
                backgroundColor: '#fef2f2',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#dc2626',
              }}
            >
              Thay thế bởi: {article.replacedBy}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Document search result card
function DocumentResultCard({ document }: { document: DocumentSearchResult }) {
  return (
    <div
      style={{
        padding: '14px',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e5e5e5',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#d1d5db';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e5e5e5';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
        <DocumentTypeBadge type={document.documentType} />
        <span style={{ fontSize: '13px', color: '#6b7280' }}>{document.documentNumber}</span>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>({document.articleCount} điều)</span>
      </div>
      <Link
        href={`/documents/${document.titleSlug}`}
        style={{
          fontSize: '14px',
          fontWeight: 500,
          color: '#171717',
          textDecoration: 'none',
          display: 'block',
          marginBottom: '4px',
        }}
      >
        {document.title}
      </Link>
      <p
        style={{
          fontSize: '13px',
          color: '#6b7280',
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
        dangerouslySetInnerHTML={{ __html: document.snippet }}
      />
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [filters, setFilters] = useState<SearchFiltersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedType, setSelectedType] = useState<string>(searchParams.get('type') || '');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'EFFECTIVE');
  const [searchMode, setSearchMode] = useState<'exact' | 'semantic' | 'hybrid'>(
    (searchParams.get('mode') as 'exact' | 'semantic' | 'hybrid') || 'hybrid'
  );
  const [showFilters, setShowFilters] = useState(false);

  // NEW: Article-level filters
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    searchParams.get('topics')?.split(',').filter(Boolean) || []
  );
  const [selectedArticleType, setSelectedArticleType] = useState<string>(
    searchParams.get('articleType') || ''
  );
  const [minImportance, setMinImportance] = useState<number>(
    parseInt(searchParams.get('importance') || '1') || 1
  );

  // Load filters on mount
  useEffect(() => {
    getSearchFilters()
      .then(setFilters)
      .catch(() => {});
  }, []);

  // Perform search
  const performSearch = useCallback(async () => {
    const q = searchParams.get('q');
    if (!q) return;

    setLoading(true);
    setError(null);

    try {
      const response = await globalSearch({
        q,
        type: selectedType || undefined,
        status: selectedStatus || undefined,
        mode: searchMode,
        page: 1,
        limit: 20,
        // NEW: Article-level filters
        legalTopics: selectedTopics.length > 0 ? selectedTopics : undefined,
        articleType: selectedArticleType || undefined,
        minImportance: minImportance > 1 ? minImportance : undefined,
      });
      setResults(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tìm kiếm');
    } finally {
      setLoading(false);
    }
  }, [searchParams, selectedType, selectedStatus, searchMode, selectedTopics, selectedArticleType, minImportance]);

  // Search when params change
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const params = new URLSearchParams();
      params.set('q', query);
      if (selectedType) params.set('type', selectedType);
      if (selectedStatus) params.set('status', selectedStatus);
      if (searchMode !== 'hybrid') params.set('mode', searchMode);
      if (selectedTopics.length > 0) params.set('topics', selectedTopics.join(','));
      if (selectedArticleType) params.set('articleType', selectedArticleType);
      if (minImportance > 1) params.set('importance', String(minImportance));
      router.push(`/search?${params.toString()}`);
    }
  };

  // Update URL when filters change
  const applyFilters = () => {
    const q = searchParams.get('q');
    if (!q) return;
    const params = new URLSearchParams();
    params.set('q', q);
    if (selectedType) params.set('type', selectedType);
    if (selectedStatus) params.set('status', selectedStatus);
    if (searchMode !== 'hybrid') params.set('mode', searchMode);
    if (selectedTopics.length > 0) params.set('topics', selectedTopics.join(','));
    if (selectedArticleType) params.set('articleType', selectedArticleType);
    if (minImportance > 1) params.set('importance', String(minImportance));
    router.push(`/search?${params.toString()}`);
  };

  // Toggle topic selection
  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedType('');
    setSelectedTopics([]);
    setSelectedArticleType('');
    setMinImportance(1);
    setSelectedStatus('EFFECTIVE');
  };

  // Check if any filters are active
  const hasActiveFilters = selectedType || selectedTopics.length > 0 || selectedArticleType || minImportance > 1;

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: 'calc(100vh - 64px)' }}>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px',
        }}
      >
        {/* Search Input */}
        <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
          <div style={{ position: 'relative', maxWidth: '800px' }}>
            <Search
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                color: '#a3a3a3',
              }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập từ khóa tìm kiếm..."
              style={{
                width: '100%',
                padding: '14px 120px 14px 48px',
                fontSize: '16px',
                border: '2px solid #e5e5e5',
                borderRadius: '12px',
                outline: 'none',
                backgroundColor: '#ffffff',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="submit"
              style={{
                position: 'absolute',
                right: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#0891b2',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Tìm kiếm
            </button>
          </div>
        </form>

        {/* Filters Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '14px',
              fontWeight: 500,
              color: hasActiveFilters ? '#0891b2' : '#525252',
              backgroundColor: hasActiveFilters ? '#ecfeff' : '#ffffff',
              border: `1px solid ${hasActiveFilters ? '#0891b2' : '#e5e5e5'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <Filter size={16} />
            Bộ lọc nâng cao
            {hasActiveFilters && (
              <span
                style={{
                  backgroundColor: '#0891b2',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '10px',
                  marginLeft: '4px',
                }}
              >
                {(selectedType ? 1 : 0) + selectedTopics.length + (selectedArticleType ? 1 : 0) + (minImportance > 1 ? 1 : 0)}
              </span>
            )}
            {showFilters ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* Quick status filter */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['EFFECTIVE', 'EXPIRED', 'ALL'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setSelectedStatus(status);
                  setTimeout(applyFilters, 0);
                }}
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: selectedStatus === status ? '#0891b2' : '#6b7280',
                  backgroundColor: selectedStatus === status ? '#ecfeff' : '#ffffff',
                  border: `1px solid ${selectedStatus === status ? '#0891b2' : '#e5e5e5'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                {status === 'EFFECTIVE' && 'Hiệu lực'}
                {status === 'EXPIRED' && 'Hết hiệu lực'}
                {status === 'ALL' && 'Tất cả'}
              </button>
            ))}
          </div>

          {/* Search mode */}
          <select
            value={searchMode}
            onChange={(e) => {
              setSearchMode(e.target.value as 'exact' | 'semantic' | 'hybrid');
              setTimeout(applyFilters, 0);
            }}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              color: '#525252',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <option value="hybrid">Tìm kiếm thông minh</option>
            <option value="exact">Chính xác</option>
            <option value="semantic">Ngữ nghĩa</option>
          </select>
        </div>

        {/* Expanded Filters Panel */}
        {showFilters && filters && (
          <div
            style={{
              padding: '20px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e5e5e5',
              marginBottom: '20px',
            }}
          >
            {/* Row 1: Document Type & Article Type */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#525252', marginBottom: '6px' }}>
                  Loại văn bản
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                  }}
                >
                  <option value="">Tất cả loại</option>
                  {filters.documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} ({type.count})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#525252', marginBottom: '6px' }}>
                  Loại điều khoản
                </label>
                <select
                  value={selectedArticleType}
                  onChange={(e) => setSelectedArticleType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                  }}
                >
                  <option value="">Tất cả loại điều</option>
                  {filters.articleTypes?.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} ({type.count})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#525252', marginBottom: '6px' }}>
                  Cơ quan ban hành
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                  }}
                >
                  <option value="">Tất cả cơ quan</option>
                  {filters.issuingBodies.map((body) => (
                    <option key={body.value} value={body.value}>
                      {body.label} ({body.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Importance Level */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: '#525252', marginBottom: '8px' }}>
                <Star size={14} />
                Mức độ quan trọng
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setMinImportance(level)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: minImportance === level ? '#0891b2' : '#6b7280',
                      backgroundColor: minImportance === level ? '#ecfeff' : '#f9fafb',
                      border: `1px solid ${minImportance === level ? '#0891b2' : '#e5e5e5'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {level === 1 ? 'Tất cả' : (
                      <>
                        {level}+ <Star size={12} fill={minImportance === level ? '#0891b2' : 'none'} />
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 3: Legal Topics */}
            {filters.legalTopics && filters.legalTopics.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: '#525252', marginBottom: '8px' }}>
                  <Tag size={14} />
                  Chủ đề pháp lý
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {filters.legalTopics.slice(0, 12).map((topic) => (
                    <button
                      key={topic.value}
                      onClick={() => toggleTopic(topic.value)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: selectedTopics.includes(topic.value) ? '#ffffff' : '#525252',
                        backgroundColor: selectedTopics.includes(topic.value) ? '#0891b2' : '#f3f4f6',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {topic.label}
                      {selectedTopics.includes(topic.value) && (
                        <X size={12} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={applyFilters}
                style={{
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ffffff',
                  backgroundColor: '#0891b2',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Áp dụng bộ lọc
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  style={{
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#6b7280',
                    backgroundColor: 'transparent',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
            <Loader2 size={32} style={{ color: '#0891b2', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : error ? (
          <div
            style={{
              padding: '20px',
              backgroundColor: '#fef2f2',
              borderRadius: '12px',
              color: '#dc2626',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        ) : results ? (
          <div style={{ display: 'flex', gap: '24px' }}>
            {/* Main Results - Articles */}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Tìm thấy <strong>{results.totalArticles}</strong> điều khoản
                  {results.query && (
                    <> cho &quot;<strong>{results.query}</strong>&quot;</>
                  )}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {results.articles.map((article) => (
                  <ArticleResultCard key={article.id} article={article} />
                ))}
              </div>

              {results.articles.length === 0 && (
                <div
                  style={{
                    padding: '40px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: '#6b7280',
                  }}
                >
                  Không tìm thấy kết quả phù hợp
                </div>
              )}

              {/* Pagination */}
              {results.pagination.hasMore && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <button
                    style={{
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#0891b2',
                      backgroundColor: '#ecfeff',
                      border: '1px solid #0891b2',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    Xem thêm kết quả
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar - Document Results */}
            {results.documents.length > 0 && (
              <div style={{ width: '320px', flexShrink: 0 }} className="search-sidebar">
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#171717' }}>
                    Văn bản liên quan ({results.totalDocuments})
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {results.documents.map((doc) => (
                    <DocumentResultCard key={doc.id} document={doc} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        mark {
          background-color: #fef08a;
          padding: 0 2px;
          border-radius: 2px;
        }
        @media (max-width: 900px) {
          .search-sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
          <Loader2 size={32} style={{ color: '#0891b2', animation: 'spin 1s linear infinite' }} />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
