import type { ParsedArticle, ParsedClause, ParsedDocument, ParsedPoint, ParseResult } from "./types";

const VALID_DOCUMENT_TYPES = ["luat", "nghi_dinh", "thong_tu", "quyet_dinh"];
const VALID_STATUSES = ["active", "amended", "repealed"];

// Map external document_type values to internal enum
const DOC_TYPE_MAP: Record<string, string> = {
  LAW: "luat",
  law: "luat",
  DECREE: "nghi_dinh",
  decree: "nghi_dinh",
  CIRCULAR: "thong_tu",
  circular: "thong_tu",
  DECISION: "quyet_dinh",
  decision: "quyet_dinh",
  luat: "luat",
  nghi_dinh: "nghi_dinh",
  thong_tu: "thong_tu",
  quyet_dinh: "quyet_dinh",
};

export function parseJsonDocument(jsonString: string): ParseResult {
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

  // Auto-detect format: external (chapters-based) vs native (articles-based)
  if (obj.chapters || obj.document_id) {
    return parseExternalFormat(obj);
  }
  return parseNativeFormat(obj);
}

// ---------------------------------------------------------------------------
// Native format (flat articles array, camelCase keys)
// ---------------------------------------------------------------------------
function parseNativeFormat(obj: Record<string, unknown>): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];

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

  for (const dateField of ["issuedDate", "effectiveDate"]) {
    if (obj[dateField] && isNaN(Date.parse(obj[dateField] as string))) {
      errors.push(`Invalid date format for ${dateField}`);
    }
  }

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
    if (articleNumbers.has(art.articleNumber as number)) {
      errors.push(`Duplicate articleNumber: ${art.articleNumber}`);
    }
    articleNumbers.add(art.articleNumber as number);

    const clauses = Array.isArray(art.clauses) ? art.clauses : [];
    const clauseNumbers = new Set<number>();

    for (let j = 0; j < clauses.length; j++) {
      const cl = clauses[j] as Record<string, unknown>;
      if (!cl.clauseNumber || typeof cl.clauseNumber !== "number") {
        errors.push(`Article ${art.articleNumber}, clause at index ${j}: missing or invalid clauseNumber`);
        continue;
      }
      if (clauseNumbers.has(cl.clauseNumber as number)) {
        errors.push(`Article ${art.articleNumber}: duplicate clauseNumber ${cl.clauseNumber}`);
      }
      clauseNumbers.add(cl.clauseNumber as number);

      const points = Array.isArray(cl.points) ? cl.points : [];
      const pointLetters = new Set<string>();

      for (let k = 0; k < points.length; k++) {
        const pt = points[k] as Record<string, unknown>;
        if (!pt.pointLetter || typeof pt.pointLetter !== "string" || pt.pointLetter.length !== 1) {
          errors.push(`Article ${art.articleNumber}, clause ${cl.clauseNumber}, point at index ${k}: invalid pointLetter`);
          continue;
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

// ---------------------------------------------------------------------------
// External format (chapters → sections → articles, snake_case keys)
// ---------------------------------------------------------------------------
function parseExternalFormat(obj: Record<string, unknown>): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Map metadata
  const title = (obj.title as string) || "";
  const documentId = (obj.document_id as string) || "";
  const documentNumber = (obj.document_number as string) || "";
  const rawDocType = (obj.document_type as string) || "";
  const documentType = DOC_TYPE_MAP[rawDocType];
  const issuingBody = (obj.issuing_authority as string) || (obj.issuingBody as string) || "";
  const year = (obj.year as number) || 0;

  // Dates: try effective_date, then temporal.effective_from, then signing_date
  const temporal = (obj.temporal || {}) as Record<string, unknown>;
  const effectiveDateRaw = (obj.effective_date as string) || (temporal.effective_from as string) || (obj.signing_date as string) || "";
  const issuedDateRaw = (obj.signing_date as string) || effectiveDateRaw;

  // Generate slug from title
  const slug = (obj.slug as string) || slugify(title, year);

  // Validate
  if (!title) errors.push("Missing required field: title");
  if (!documentId) errors.push("Missing required field: document_id");
  if (!documentNumber) errors.push("Missing required field: document_number");
  if (!documentType) {
    errors.push(`Invalid document_type: "${rawDocType}". Must be one of: LAW, DECREE, CIRCULAR, DECISION`);
  }
  if (!issuingBody) errors.push("Missing required field: issuing_authority");
  if (!year || year < 1945 || year > 2100) errors.push("year must be between 1945 and 2100");

  // Extract articles from chapters → sections → articles hierarchy
  const articles: ParsedArticle[] = [];
  const chapters = Array.isArray(obj.chapters) ? obj.chapters : [];

  if (chapters.length === 0) {
    warnings.push("No chapters found in document");
  }

  for (const ch of chapters) {
    const chapter = ch as Record<string, unknown>;
    const chapterTitle = chapter.title ? `Chương ${chapter.number || ""}: ${chapter.title}` : (chapter.number ? `Chương ${chapter.number}` : null);

    // Articles directly under chapter
    const directArticles = Array.isArray(chapter.articles) ? chapter.articles : [];
    for (const art of directArticles) {
      const parsed = parseExternalArticle(art as Record<string, unknown>, chapterTitle, null);
      if (parsed) articles.push(parsed);
    }

    // Articles under sections
    const sections = Array.isArray(chapter.sections) ? chapter.sections : [];
    for (const sec of sections) {
      const section = sec as Record<string, unknown>;
      const sectionTitle = section.title ? `Mục ${section.number || ""}: ${section.title}` : (section.number ? `Mục ${section.number}` : null);

      const sectionArticles = Array.isArray(section.articles) ? section.articles : [];
      for (const art of sectionArticles) {
        const parsed = parseExternalArticle(art as Record<string, unknown>, chapterTitle, sectionTitle);
        if (parsed) articles.push(parsed);
      }
    }
  }

  // Also check for top-level articles (no chapters)
  if (Array.isArray(obj.articles)) {
    for (const art of obj.articles) {
      const parsed = parseExternalArticle(art as Record<string, unknown>, null, null);
      if (parsed) articles.push(parsed);
    }
  }

  if (articles.length === 0) {
    warnings.push("No articles found in document");
  }

  // Check for duplicate article numbers
  const articleNumbers = new Set<number>();
  for (const art of articles) {
    if (articleNumbers.has(art.articleNumber)) {
      warnings.push(`Duplicate article number: Điều ${art.articleNumber}`);
    }
    articleNumbers.add(art.articleNumber);
  }

  // Sort articles by number
  articles.sort((a, b) => a.articleNumber - b.articleNumber);

  if (errors.length > 0) {
    return { success: false, document: null, errors, warnings };
  }

  // Use today's date as fallback if dates are missing
  const today = new Date().toISOString().split("T")[0];
  if (!effectiveDateRaw) {
    warnings.push("effective_date is missing, using today as placeholder");
  }
  if (!issuedDateRaw) {
    warnings.push("signing_date is missing, using today as placeholder");
  }

  const document: ParsedDocument = {
    canonicalId: documentId,
    title,
    documentNumber,
    documentType: documentType as ParsedDocument["documentType"],
    issuingBody,
    issuedDate: issuedDateRaw || today,
    effectiveDate: effectiveDateRaw || today,
    slug,
    year,
    status: "active",
    articles,
  };

  return { success: true, document, errors: [], warnings };
}

function parseExternalArticle(
  art: Record<string, unknown>,
  chapter: string | null,
  section: string | null,
): ParsedArticle | null {
  const number = art.number;
  if (number === undefined || number === null) return null;

  const articleNumber = typeof number === "number" ? number : parseInt(String(number), 10);
  if (isNaN(articleNumber)) return null;

  const title = (art.title as string) || (art.text_clean as string) || null;
  const content = (art.text_clean as string) || (art.text_raw as string) || "";

  const clauses: ParsedClause[] = [];
  const rawClauses = Array.isArray(art.clauses) ? art.clauses : [];

  for (const cl of rawClauses) {
    const clause = cl as Record<string, unknown>;
    const clNum = clause.number;
    if (clNum === undefined || clNum === null) continue;

    const clauseNumber = typeof clNum === "number" ? clNum : parseInt(String(clNum), 10);
    if (isNaN(clauseNumber)) continue;

    const clContent = (clause.text_clean as string) || (clause.text_raw as string) || "";

    const points: ParsedPoint[] = [];
    const rawPoints = Array.isArray(clause.points) ? clause.points : [];

    for (const pt of rawPoints) {
      const point = pt as Record<string, unknown>;
      const ptNum = point.number;
      if (ptNum === undefined || ptNum === null) continue;

      const pointLetter = String(ptNum).charAt(0).toLowerCase();
      const ptContent = (point.text_clean as string) || (point.text_raw as string) || "";

      points.push({ pointLetter, content: ptContent });
    }

    clauses.push({ clauseNumber, content: clContent, points });
  }

  return { articleNumber, title, content, chapter, section, clauses };
}

function slugify(title: string, year: number): string {
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return year ? `${slug}-${year}` : slug;
}
