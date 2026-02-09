import type { ArticleWithChildren, ClauseWithChildren, PointData, DocumentMeta } from "@/types/legal";
import { buildSourceUrl } from "./legal-utils";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://lcvn.vn";

export function buildDocumentJsonLd(doc: DocumentMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "Legislation",
    name: doc.title,
    legislationIdentifier: doc.canonicalId,
    legislationDate: doc.issuedDate,
    datePublished: doc.issuedDate,
    legislationDateVersion: doc.effectiveDate,
    legislationPassedBy: {
      "@type": "Organization",
      name: doc.issuingBody,
    },
    url: `${BASE_URL}/doc/${doc.slug}/${doc.year}`,
    inLanguage: "vi",
  };
}

export function buildArticleJsonLd(article: ArticleWithChildren) {
  const sourceUrl = buildSourceUrl({
    docSlug: article.document.slug,
    year: article.document.year,
    articleNumber: article.articleNumber,
  });

  const canonicalUrl = `${BASE_URL}${sourceUrl}`;

  return {
    "@context": "https://schema.org",
    "@type": "Legislation",

    // ── Identity ──
    name: article.title
      ? `Điều ${article.articleNumber}. ${article.title}`
      : `Điều ${article.articleNumber}`,
    alternateName: article.title
      ? `Article ${article.articleNumber}. ${article.title}`
      : `Article ${article.articleNumber}`,
    legislationIdentifier: article.document.documentNumber,
    identifier: article.canonicalId,
    articleNumber: article.articleNumber,

    // ── Dates ──
    datePublished: article.document.issuedDate,
    dateEnacted: article.document.issuedDate,
    legislationDate: article.document.issuedDate,
    legislationDateVersion: article.document.effectiveDate,

    // ── Jurisdiction & Authority ──
    legislationJurisdiction: "VN",
    jurisdiction: {
      "@type": "Country",
      name: "Việt Nam",
      identifier: "VN",
    },
    legislationPassedBy: {
      "@type": "GovernmentOrganization",
      name: article.document.issuingBody,
      identifier: "VN_QH",
    },
    publisher: {
      "@type": "GovernmentOrganization",
      name: article.document.issuingBody,
    },

    // ── Hierarchy ──
    isPartOf: {
      "@type": "Legislation",
      name: article.document.title,
      legislationIdentifier: article.document.documentNumber,
      identifier: article.document.canonicalId,
      url: `${BASE_URL}/doc/${article.document.slug}/${article.document.year}`,
      legislationJurisdiction: "VN",
    },

    // ── Child clauses with inline text + anchor URLs ──
    hasPart: article.clauses.map((clause) => ({
      "@type": "Legislation",
      name: `Khoản ${clause.clauseNumber}`,
      identifier: clause.canonicalId,
      text: clause.content,
      url: `${canonicalUrl}#khoan-${clause.clauseNumber}`,
      ...(clause.points.length > 0
        ? {
            hasPart: clause.points.map((point) => ({
              "@type": "Legislation",
              name: `Điểm ${point.pointLetter}`,
              identifier: point.canonicalId,
              text: point.content,
              url: `${canonicalUrl}#khoan-${clause.clauseNumber}-diem-${point.pointLetter}`,
            })),
          }
        : {}),
    })),

    // ── Full article text (for AI verification) ──
    text: article.content,

    // ── URLs & Language ──
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    inLanguage: "vi",
  };
}

export function buildClauseJsonLd(
  clause: ClauseWithChildren,
  article: { canonicalId: string; articleNumber: number; title: string | null },
  doc: DocumentMeta
) {
  const sourceUrl = buildSourceUrl({
    docSlug: doc.slug,
    year: doc.year,
    articleNumber: article.articleNumber,
    clauseNumber: clause.clauseNumber,
  });

  return {
    "@context": "https://schema.org",
    "@type": "Legislation",
    name: `Khoản ${clause.clauseNumber}, Điều ${article.articleNumber}`,
    legislationIdentifier: clause.canonicalId,
    legislationDate: doc.issuedDate,
    legislationPassedBy: {
      "@type": "Organization",
      name: doc.issuingBody,
    },
    isPartOf: {
      "@type": "Legislation",
      name: article.title
        ? `Điều ${article.articleNumber} - ${article.title}`
        : `Điều ${article.articleNumber}`,
      legislationIdentifier: article.canonicalId,
    },
    hasPart: clause.points.map((point) => ({
      "@type": "Legislation",
      name: `Điểm ${point.pointLetter}`,
      legislationIdentifier: point.canonicalId,
    })),
    url: `${BASE_URL}${sourceUrl}`,
    inLanguage: "vi",
  };
}

export function buildPointJsonLd(
  point: PointData,
  clause: { canonicalId: string; clauseNumber: number },
  article: { canonicalId: string; articleNumber: number },
  doc: DocumentMeta
) {
  const sourceUrl = buildSourceUrl({
    docSlug: doc.slug,
    year: doc.year,
    articleNumber: article.articleNumber,
    clauseNumber: clause.clauseNumber,
    pointLetter: point.pointLetter,
  });

  return {
    "@context": "https://schema.org",
    "@type": "Legislation",
    name: `Điểm ${point.pointLetter}, Khoản ${clause.clauseNumber}, Điều ${article.articleNumber}`,
    legislationIdentifier: point.canonicalId,
    legislationDate: doc.issuedDate,
    legislationPassedBy: {
      "@type": "Organization",
      name: doc.issuingBody,
    },
    isPartOf: {
      "@type": "Legislation",
      name: `Khoản ${clause.clauseNumber}`,
      legislationIdentifier: clause.canonicalId,
    },
    url: `${BASE_URL}${sourceUrl}`,
    inLanguage: "vi",
  };
}
