import type { ParsedDocument, ParseResult } from "./types";

const VALID_DOCUMENT_TYPES = ["luat", "nghi_dinh", "thong_tu", "quyet_dinh"];
const VALID_STATUSES = ["active", "amended", "repealed"];

export function parseJsonDocument(jsonString: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  let raw: unknown;
  try {
    raw = JSON.parse(jsonString);
  } catch {
    return { success: false, document: null, errors: ["Invalid JSON format"], warnings: [] };
  }

  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { success: false, document: null, errors: ["JSON must be an object"], warnings: [] };
  }

  const obj = raw as Record<string, unknown>;

  // Validate required metadata fields
  const requiredFields = [
    "canonicalId", "title", "documentNumber", "documentType",
    "issuingBody", "issuedDate", "effectiveDate", "slug", "year",
  ];
  for (const field of requiredFields) {
    if (!obj[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (obj.documentType && !VALID_DOCUMENT_TYPES.includes(obj.documentType as string)) {
    errors.push(`Invalid documentType: ${obj.documentType}. Must be one of: ${VALID_DOCUMENT_TYPES.join(", ")}`);
  }

  if (obj.status && !VALID_STATUSES.includes(obj.status as string)) {
    errors.push(`Invalid status: ${obj.status}. Must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  if (obj.year && (typeof obj.year !== "number" || obj.year < 1945 || obj.year > 2100)) {
    errors.push("year must be a number between 1945 and 2100");
  }

  // Validate dates
  for (const dateField of ["issuedDate", "effectiveDate"]) {
    if (obj[dateField] && isNaN(Date.parse(obj[dateField] as string))) {
      errors.push(`Invalid date format for ${dateField}`);
    }
  }

  // Validate articles
  const articles = Array.isArray(obj.articles) ? obj.articles : [];
  if (articles.length === 0) {
    warnings.push("No articles found in document");
  }

  const articleNumbers = new Set<number>();

  for (let i = 0; i < articles.length; i++) {
    const art = articles[i] as Record<string, unknown>;
    if (!art.articleNumber || typeof art.articleNumber !== "number") {
      errors.push(`Article at index ${i}: missing or invalid articleNumber`);
      continue;
    }
    if (!art.content && typeof art.content !== "string") {
      errors.push(`Article ${art.articleNumber}: missing content`);
    }
    if (articleNumbers.has(art.articleNumber as number)) {
      errors.push(`Duplicate articleNumber: ${art.articleNumber}`);
    }
    articleNumbers.add(art.articleNumber as number);

    // Validate clauses
    const clauses = Array.isArray(art.clauses) ? art.clauses : [];
    const clauseNumbers = new Set<number>();

    for (let j = 0; j < clauses.length; j++) {
      const cl = clauses[j] as Record<string, unknown>;
      if (!cl.clauseNumber || typeof cl.clauseNumber !== "number") {
        errors.push(`Article ${art.articleNumber}, clause at index ${j}: missing or invalid clauseNumber`);
        continue;
      }
      if (!cl.content && typeof cl.content !== "string") {
        errors.push(`Article ${art.articleNumber}, clause ${cl.clauseNumber}: missing content`);
      }
      if (clauseNumbers.has(cl.clauseNumber as number)) {
        errors.push(`Article ${art.articleNumber}: duplicate clauseNumber ${cl.clauseNumber}`);
      }
      clauseNumbers.add(cl.clauseNumber as number);

      // Validate points
      const points = Array.isArray(cl.points) ? cl.points : [];
      const pointLetters = new Set<string>();

      for (let k = 0; k < points.length; k++) {
        const pt = points[k] as Record<string, unknown>;
        if (!pt.pointLetter || typeof pt.pointLetter !== "string" || pt.pointLetter.length !== 1) {
          errors.push(`Article ${art.articleNumber}, clause ${cl.clauseNumber}, point at index ${k}: invalid pointLetter`);
          continue;
        }
        if (!pt.content && typeof pt.content !== "string") {
          errors.push(`Article ${art.articleNumber}, clause ${cl.clauseNumber}, point ${pt.pointLetter}: missing content`);
        }
        if (pointLetters.has(pt.pointLetter as string)) {
          errors.push(`Article ${art.articleNumber}, clause ${cl.clauseNumber}: duplicate pointLetter "${pt.pointLetter}"`);
        }
        pointLetters.add(pt.pointLetter as string);
      }
    }
  }

  if (errors.length > 0) {
    return { success: false, document: null, errors, warnings };
  }

  const document: ParsedDocument = {
    canonicalId: obj.canonicalId as string,
    title: obj.title as string,
    documentNumber: obj.documentNumber as string,
    documentType: obj.documentType as ParsedDocument["documentType"],
    issuingBody: obj.issuingBody as string,
    issuedDate: obj.issuedDate as string,
    effectiveDate: obj.effectiveDate as string,
    slug: obj.slug as string,
    year: obj.year as number,
    status: (obj.status as ParsedDocument["status"]) || "active",
    articles: articles.map((art: Record<string, unknown>) => ({
      articleNumber: art.articleNumber as number,
      title: (art.title as string) || null,
      content: (art.content as string) || "",
      chapter: (art.chapter as string) || null,
      section: (art.section as string) || null,
      clauses: (Array.isArray(art.clauses) ? art.clauses : []).map(
        (cl: Record<string, unknown>) => ({
          clauseNumber: cl.clauseNumber as number,
          content: (cl.content as string) || "",
          points: (Array.isArray(cl.points) ? cl.points : []).map(
            (pt: Record<string, unknown>) => ({
              pointLetter: pt.pointLetter as string,
              content: (pt.content as string) || "",
            })
          ),
        })
      ),
    })),
  };

  return { success: true, document, errors: [], warnings };
}
