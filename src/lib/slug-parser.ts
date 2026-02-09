import type { ParsedSlug, EntityType } from "@/types/legal";

/**
 * Parse a source URL slug array into its components.
 * Expected patterns:
 *   [doc-slug, year]                                → document
 *   [doc-slug, year, dieu-N]                        → article
 *   [doc-slug, year, dieu-N, khoan-N]               → clause
 *   [doc-slug, year, dieu-N, khoan-N, diem-X]       → point
 */
export function parseSourceSlug(slugParts: string[]): ParsedSlug | null {
  if (slugParts.length < 2) return null;

  const docSlug = slugParts[0];
  const year = parseInt(slugParts[1], 10);
  if (isNaN(year)) return null;

  let entityType: EntityType = "document";
  let articleNumber: number | undefined;
  let clauseNumber: number | undefined;
  let pointLetter: string | undefined;

  for (let i = 2; i < slugParts.length; i++) {
    const part = slugParts[i];
    const dieuMatch = part.match(/^dieu-(\d+)$/);
    const khoanMatch = part.match(/^khoan-(\d+)$/);
    const diemMatch = part.match(/^diem-([a-z])$/);

    if (dieuMatch) {
      articleNumber = parseInt(dieuMatch[1], 10);
      entityType = "article";
    } else if (khoanMatch) {
      clauseNumber = parseInt(khoanMatch[1], 10);
      entityType = "clause";
    } else if (diemMatch) {
      pointLetter = diemMatch[1];
      entityType = "point";
    } else {
      return null;
    }
  }

  return { docSlug, year, articleNumber, clauseNumber, pointLetter, entityType };
}

/**
 * Parse a reading URL slug array into its components.
 * Expected patterns:
 *   [doc-slug, year]            → document overview
 *   [doc-slug, year, dieu-N]    → article reading view
 */
export function parseReadingSlug(slugParts: string[]): ParsedSlug | null {
  if (slugParts.length < 2) return null;

  const docSlug = slugParts[0];
  const year = parseInt(slugParts[1], 10);
  if (isNaN(year)) return null;

  let entityType: EntityType = "document";
  let articleNumber: number | undefined;

  if (slugParts.length >= 3) {
    const dieuMatch = slugParts[2].match(/^dieu-(\d+)$/);
    if (dieuMatch) {
      articleNumber = parseInt(dieuMatch[1], 10);
      entityType = "article";
    } else {
      return null;
    }
  }

  return { docSlug, year, articleNumber, entityType };
}
