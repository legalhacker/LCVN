'use client';

import Link from 'next/link';
import { ArrowRight, GitMerge, FileEdit, Layers, Link2 } from 'lucide-react';
import { DocumentRelation } from '@/lib/api';

const RELATION_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  IMPLEMENTS:   { label: 'Hướng dẫn thi hành',  color: '#1565c0', bgColor: '#e3f2fd' },
  AMENDS:       { label: 'Sửa đổi, bổ sung',     color: '#e65100', bgColor: '#fff3e0' },
  SUPPLEMENTS:  { label: 'Bổ sung',               color: '#2e7d32', bgColor: '#e8f5e9' },
  REPLACES:     { label: 'Thay thế',              color: '#c62828', bgColor: '#ffebee' },
  REFERENCES:   { label: 'Dẫn chiếu',             color: '#6a1b9a', bgColor: '#f3e5f5' },
  RELATED:      { label: 'Văn bản liên quan',     color: '#546e7a', bgColor: '#eceff1' },
};

function RelationIcon({ type }: { type: string }) {
  const color = RELATION_LABELS[type]?.color ?? '#546e7a';
  if (type === 'IMPLEMENTS')  return <Layers  size={15} style={{ color }} />;
  if (type === 'AMENDS')      return <FileEdit size={15} style={{ color }} />;
  if (type === 'SUPPLEMENTS') return <GitMerge size={15} style={{ color }} />;
  if (type === 'RELATED')     return <Link2   size={15} style={{ color }} />;
  return <ArrowRight size={15} style={{ color }} />;
}

function RelationCard({ rel, href }: { rel: DocumentRelation; href: string }) {
  const cfg = RELATION_LABELS[rel.relationType] ?? RELATION_LABELS.RELATED;
  const doc = rel.toDocument ?? rel.fromDocument;
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        textDecoration: 'none',
        transition: 'border-color 0.15s, background 0.15s',
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
      <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: cfg.bgColor, flexShrink: 0 }}>
        <RelationIcon type={rel.relationType} />
      </div>
      <div style={{ flex: 1 }}>
        <span style={{
          display: 'inline-block',
          fontSize: '11px', fontWeight: 600,
          color: cfg.color, backgroundColor: cfg.bgColor,
          padding: '2px 8px', borderRadius: '4px', marginBottom: '6px',
        }}>
          {cfg.label}
        </span>
        <p style={{ fontSize: '13px', fontWeight: 500, color: '#263238', margin: '0 0 3px' }}>
          {doc?.title}
        </p>
        <p style={{ fontSize: '12px', color: '#78909c', margin: 0 }}>
          {doc?.documentNumber}
        </p>
        {rel.description && (
          <p style={{ fontSize: '12px', color: '#90a4ae', margin: '5px 0 0', fontStyle: 'italic' }}>
            {rel.description}
          </p>
        )}
      </div>
    </Link>
  );
}

interface DocumentWithRelations {
  relatedFrom?: DocumentRelation[];
  relatedTo?: DocumentRelation[];
}

interface Props {
  document: DocumentWithRelations;
}

export function RelatedTab({ document }: Props) {
  const hasAny =
    (document.relatedFrom?.length ?? 0) > 0 ||
    (document.relatedTo?.length ?? 0) > 0;

  if (!hasAny) {
    return (
      <div style={{ padding: '80px 48px', textAlign: 'center' }}>
        <Link2 size={40} style={{ color: '#cfd8dc', marginBottom: '16px' }} />
        <p style={{ color: '#90a4ae', fontSize: '14px', margin: 0 }}>Chưa có văn bản liên quan.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 48px 80px' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {document.relatedFrom && document.relatedFrom.length > 0 && (
          <section>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#90a4ae', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>
              Văn bản này liên quan đến
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {document.relatedFrom.map((rel) => (
                <RelationCard key={rel.id} rel={rel} href={`/documents/${rel.toDocument?.titleSlug}`} />
              ))}
            </div>
          </section>
        )}

        {document.relatedTo && document.relatedTo.length > 0 && (
          <section>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#90a4ae', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>
              Văn bản liên quan đến văn bản này
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {document.relatedTo.map((rel) => (
                <RelationCard key={rel.id} rel={rel} href={`/documents/${rel.fromDocument?.titleSlug}`} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
