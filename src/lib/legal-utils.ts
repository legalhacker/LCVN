import type { EntityType } from "@/types/legal";

/**
 * Build a canonical ID from its components.
 * Format: VN_LLD_2019_D35_K1_A
 */
export function buildCanonicalId(parts: {
  docPrefix: string;
  year: number;
  articleNumber?: number;
  clauseNumber?: number;
  pointLetter?: string;
}): string {
  let id = `${parts.docPrefix}_${parts.year}`;
  if (parts.articleNumber != null) {
    id += `_D${parts.articleNumber}`;
  }
  if (parts.clauseNumber != null) {
    id += `_K${parts.clauseNumber}`;
  }
  if (parts.pointLetter != null) {
    id += `_${parts.pointLetter.toUpperCase()}`;
  }
  return id;
}

/**
 * Parse a canonical ID into its components.
 */
export function parseCanonicalId(canonicalId: string): {
  docPrefix: string;
  year: number;
  articleNumber?: number;
  clauseNumber?: number;
  pointLetter?: string;
  entityType: EntityType;
} {
  const parts = canonicalId.split("_");
  // e.g. VN_LLD_2019 → docPrefix = VN_LLD, year = 2019
  // VN_LLD_2019_D35 → articleNumber = 35
  // VN_LLD_2019_D35_K1 → clauseNumber = 1
  // VN_LLD_2019_D35_K1_A → pointLetter = a

  let entityType: EntityType = "document";
  let articleNumber: number | undefined;
  let clauseNumber: number | undefined;
  let pointLetter: string | undefined;

  // Find the year part (a 4-digit number)
  let yearIndex = -1;
  for (let i = 0; i < parts.length; i++) {
    if (/^\d{4}$/.test(parts[i])) {
      yearIndex = i;
      break;
    }
  }

  if (yearIndex === -1) {
    throw new Error(`Invalid canonical ID: ${canonicalId}`);
  }

  const docPrefix = parts.slice(0, yearIndex).join("_");
  const year = parseInt(parts[yearIndex], 10);

  const remaining = parts.slice(yearIndex + 1);

  for (const part of remaining) {
    if (part.startsWith("D") && /^\d+$/.test(part.slice(1))) {
      articleNumber = parseInt(part.slice(1), 10);
      entityType = "article";
    } else if (part.startsWith("K") && /^\d+$/.test(part.slice(1))) {
      clauseNumber = parseInt(part.slice(1), 10);
      entityType = "clause";
    } else if (/^[A-Z]$/.test(part)) {
      pointLetter = part.toLowerCase();
      entityType = "point";
    }
  }

  return { docPrefix, year, articleNumber, clauseNumber, pointLetter, entityType };
}

/**
 * Build a source URL from components.
 */
export function buildSourceUrl(parts: {
  docSlug: string;
  year: number;
  articleNumber?: number;
  clauseNumber?: number;
  pointLetter?: string;
}): string {
  let url = `/luat/${parts.docSlug}/${parts.year}`;
  if (parts.articleNumber != null) {
    url += `/dieu-${parts.articleNumber}`;
  }
  if (parts.clauseNumber != null) {
    url += `/khoan-${parts.clauseNumber}`;
  }
  if (parts.pointLetter != null) {
    url += `/diem-${parts.pointLetter}`;
  }
  return url;
}

/**
 * Build a reading URL from components.
 */
export function buildReadingUrl(parts: {
  docSlug: string;
  year: number;
  articleNumber?: number;
}): string {
  let url = `/doc/${parts.docSlug}/${parts.year}`;
  if (parts.articleNumber != null) {
    url += `/dieu-${parts.articleNumber}`;
  }
  return url;
}

/**
 * Get a human-readable label for a relationship type.
 */
export function getRelationshipLabel(type: string): string {
  const labels: Record<string, string> = {
    amended_by: "Được sửa đổi bởi",
    replaces: "Thay thế",
    related_to: "Liên quan đến",
    references: "Tham chiếu",
    implements: "Hướng dẫn thi hành",
  };
  return labels[type] || type;
}

/**
 * Get a human-readable label for entity type.
 */
export function getEntityTypeLabel(type: EntityType): string {
  const labels: Record<EntityType, string> = {
    document: "Văn bản",
    article: "Điều",
    clause: "Khoản",
    point: "Điểm",
  };
  return labels[type];
}
