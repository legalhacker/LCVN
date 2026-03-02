'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useDocument, useDocumentFull } from '@/hooks/useDocuments';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

import { DocumentTabs, TabId } from '@/components/document/DocumentTabs';
import { DocumentToolbar } from '@/components/document/DocumentToolbar';
import { TableOfContents } from '@/components/document/TableOfContents';
import { ContentTab } from '@/components/document/tabs/ContentTab';
import { SummaryTab } from '@/components/document/tabs/SummaryTab';
import { ValidityTab } from '@/components/document/tabs/ValidityTab';
import { RelatedTab } from '@/components/document/tabs/RelatedTab';
import { PlaceholderTab } from '@/components/document/tabs/PlaceholderTab';

// ─── helpers ────────────────────────────────────────────────────────────────

const DOC_TYPE_LABELS: Record<string, string> = {
  LAW: 'LUẬT', CODE: 'BỘ LUẬT', DECREE: 'NGHỊ ĐỊNH',
  CIRCULAR: 'THÔNG TƯ', RESOLUTION: 'NGHỊ QUYẾT', DECISION: 'QUYẾT ĐỊNH',
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  EFFECTIVE:         { label: 'Còn hiệu lực',         bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
  EXPIRED:           { label: 'Hết hiệu lực',          bg: '#ffebee', text: '#c62828', border: '#ef9a9a' },
  NOT_YET_EFFECTIVE: { label: 'Chưa có hiệu lực',      bg: '#fff3e0', text: '#ef6c00', border: '#ffcc80' },
  PARTIALLY_EXPIRED: { label: 'Hết hiệu lực một phần', bg: '#fce4ec', text: '#ad1457', border: '#f48fb1' },
  DRAFT:             { label: 'Dự thảo',               bg: '#f3e5f5', text: '#6a1b9a', border: '#ce93d8' },
};

// ─── component ──────────────────────────────────────────────────────────────

export default function DocumentReader() {
  const params = useParams();
  const slug = params.slug as string;

  const [activeTab, setActiveTab] = useState<TabId>('content');
  const [showTOC, setShowTOC] = useState(true);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [hasScrolledToHash, setHasScrolledToHash] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  const { data: document, isLoading: docLoading, error: docError } = useDocument(slug);
  const { data: fullDocument, isLoading: contentLoading } = useDocumentFull(slug);

  const articles = fullDocument?.articles ?? [];

  // ── scroll helpers ──────────────────────────────────────────────────────

  const scrollToArticle = useCallback((articleId: string) => {
    setTimeout(() => {
      const element = window.document.getElementById(articleId);
      const container = contentRef.current;
      if (!element || !container) return;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const target = container.scrollTop + elementRect.top - containerRect.top - 16;
      container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
      setActiveArticleId(articleId);
    }, 100);
  }, []);

  // ── hash navigation ─────────────────────────────────────────────────────

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasScrolledToHash || contentLoading || !articles.length) return;
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash) {
      scrollToArticle(hash);
      setHasScrolledToHash(true);
    }
  }, [contentLoading, articles, hasScrolledToHash, scrollToArticle]);

  // ── default active article ──────────────────────────────────────────────

  useEffect(() => {
    if (!document?.articles?.length || activeArticleId || hasScrolledToHash) return;
    if (typeof window !== 'undefined' && window.location.hash) return;
    setActiveArticleId(document.articles[0].articleId);
  }, [document, activeArticleId, hasScrolledToHash]);

  // ── back-to-top visibility ──────────────────────────────────────────────

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const onScroll = () => setShowBackToTop(container.scrollTop > 400);
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  // ── reset scroll on tab change ──────────────────────────────────────────

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };

  // ── loading / error states ──────────────────────────────────────────────

  if (docLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={28} style={{ color: '#1565c0', animation: 'spin 1s linear infinite' }} />
        <span style={{ marginLeft: '12px', fontSize: '15px', color: '#78909c' }}>Đang tải văn bản...</span>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  if (docError || !document) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <AlertCircle size={44} style={{ color: '#d32f2f', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#263238', marginBottom: '8px' }}>
          Không tìm thấy văn bản
        </h2>
        <p style={{ color: '#78909c', marginBottom: '24px' }}>
          Văn bản bạn đang tìm không tồn tại hoặc đã bị xóa.
        </p>
        <Link href="/search" style={{ color: '#1565c0', textDecoration: 'none', fontWeight: 500 }}>
          ← Quay lại tìm kiếm
        </Link>
      </div>
    );
  }

  const relatedCount =
    (document.relatedFrom?.length ?? 0) + (document.relatedTo?.length ?? 0);

  const statusCfg = STATUS_CONFIG[document.status] ?? STATUS_CONFIG.EFFECTIVE;

  // ── render ──────────────────────────────────────────────────────────────

  return (
    // Full-viewport container: 100vh minus Navbar (64px). No body scroll.
    <div style={{
      height: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: '#f5f5f5',
    }}>

      {/* ── Tab bar ── */}
      <DocumentTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        relatedCount={relatedCount}
        onDownload={() => { /* TODO: implement download */ }}
      />

      {/* ── Toolbar (content tab only) ── */}
      {activeTab === 'content' && (
        <DocumentToolbar showTOC={showTOC} onToggleTOC={() => setShowTOC((v) => !v)} />
      )}

      {/* ── 2-column body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left: Table of Contents (content tab only) */}
        {activeTab === 'content' && showTOC && (
          <TableOfContents
            toc={document.tableOfContents ?? []}
            activeArticleId={activeArticleId}
            onArticleClick={scrollToArticle}
          />
        )}

        {/* Right: scrollable content pane */}
        <div
          ref={contentRef}
          className="doc-content-pane"
          style={{
            flex: 1,
            overflowY: 'scroll',
            backgroundColor: '#ffffff',
            scrollbarWidth: 'thin',
            scrollbarColor: '#b0bec5 #f5f5f5',
          } as React.CSSProperties}
        >
          {/* Document header — scrolls with content */}
          <DocHeader document={document} statusCfg={statusCfg} />

          {/* Tab content */}
          {activeTab === 'summary'  && <SummaryTab  document={document} />}
          {activeTab === 'content'  && (
            <ContentTab
              articles={articles}
              contentLoading={contentLoading}
              scrollContainer={contentRef}
              onArticleVisible={setActiveArticleId}
            />
          )}
          {activeTab === 'validity' && <ValidityTab document={document} />}
          {activeTab === 'related'  && <RelatedTab  document={document} />}
          {!['summary', 'content', 'validity', 'related'].includes(activeTab) && (
            <PlaceholderTab tab={activeTab} />
          )}
        </div>
      </div>

      {/* ── Back-to-top button ── */}
      <button
        onClick={() => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Lên đầu trang"
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
          boxShadow: '0 4px 14px rgba(8,145,178,0.35)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: showBackToTop ? 1 : 0,
          visibility: showBackToTop ? 'visible' : 'hidden',
          transform: showBackToTop ? 'scale(1)' : 'scale(0.8)',
          transition: 'opacity .2s, visibility .2s, transform .2s',
          zIndex: 500,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      {/* ── Global styles ── */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* Webkit scrollbar — main content pane */
        .doc-content-pane::-webkit-scrollbar       { width: 8px; }
        .doc-content-pane::-webkit-scrollbar-track  { background: #f5f5f5; border-left: 1px solid #e0e0e0; }
        .doc-content-pane::-webkit-scrollbar-thumb  { background: #b0bec5; border-radius: 4px; border: 1px solid #f5f5f5; }
        .doc-content-pane::-webkit-scrollbar-thumb:hover { background: #78909c; }
      `}</style>
    </div>
  );
}

// ─── Document header (title + meta, always visible as first item in pane) ───

interface DocHeaderProps {
  document: ReturnType<typeof useDocument>['data'] & object;
  statusCfg: { label: string; bg: string; text: string; border: string };
}

function DocHeader({ document, statusCfg }: DocHeaderProps) {
  if (!document) return null;
  return (
    <header style={{
      padding: '36px 48px 28px',
      borderBottom: '1px solid #e0e0e0',
      backgroundColor: '#fafafa',
    }}>
      <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
        {/* Republic header */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#37474f', letterSpacing: '1px', marginBottom: '3px' }}>
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </p>
          <p style={{ fontSize: '12px', fontWeight: 500, color: '#546e7a' }}>
            Độc lập – Tự do – Hạnh phúc
          </p>
          <div style={{ width: '50px', height: '2px', backgroundColor: '#1565c0', margin: '10px auto 0' }} />
        </div>

        {/* Issuing body */}
        <p style={{ fontSize: '12px', fontWeight: 700, color: '#455a64', textTransform: 'uppercase', marginBottom: '16px' }}>
          {document.issuingBody}
        </p>

        {/* Type + number badge */}
        <div style={{
          display: 'inline-block',
          padding: '10px 20px',
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#1565c0', marginBottom: '3px' }}>
            {DOC_TYPE_LABELS[document.documentType] ?? document.documentType}
          </p>
          <p style={{ fontSize: '12px', color: '#546e7a' }}>{document.documentNumber}</p>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#263238',
          lineHeight: 1.45,
          margin: '0 auto 18px',
          maxWidth: '700px',
        }}>
          {document.title}
        </h1>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-block',
            padding: '3px 12px',
            fontSize: '12px',
            fontWeight: 700,
            color: statusCfg.text,
            backgroundColor: statusCfg.bg,
            border: `1px solid ${statusCfg.border}`,
            borderRadius: '4px',
          }}>
            {statusCfg.label}
          </span>
          <span style={{ fontSize: '12px', color: '#78909c' }}>
            Ban hành:{' '}
            <span style={{ color: '#455a64', fontWeight: 600 }}>{formatDate(document.issuedDate)}</span>
          </span>
          {document.effectiveDate && (
            <span style={{ fontSize: '12px', color: '#78909c' }}>
              Hiệu lực:{' '}
              <span style={{ color: '#455a64', fontWeight: 600 }}>{formatDate(document.effectiveDate)}</span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
