import type { ParsedArticle, ParsedClause, ParsedDocument, ParsedPoint, ParseResult } from "./types";

interface DocumentMetadata {
  canonicalId: string;
  title: string;
  documentNumber: string;
  documentType: "luat" | "nghi_dinh" | "thong_tu" | "quyet_dinh";
  issuingBody: string;
  issuedDate: string;
  effectiveDate: string;
  slug: string;
  year: number;
  status?: "active" | "amended" | "repealed";
}

// Patterns for Vietnamese legal document structure
const ARTICLE_PATTERN = /^Điều\s+(\d+)\.\s*(.*)$/;
const CLAUSE_PATTERN = /^(\d+)\.\s+(.+)$/;
const POINT_PATTERN = /^([a-zđ])\)\s+(.+)$/;
const CHAPTER_PATTERN = /^Chương\s+(.+)$/i;
const SECTION_PATTERN = /^Mục\s+(.+)$/i;

type ParserState = "idle" | "article" | "clause" | "point";

export function parseTextDocument(text: string, metadata: DocumentMetadata): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!text.trim()) {
    return { success: false, document: null, errors: ["Empty text content"], warnings: [] };
  }

  const lines = text.split(/\r?\n/);
  const articles: ParsedArticle[] = [];

  let state: ParserState = "idle";
  let currentChapter: string | null = null;
  let currentSection: string | null = null;
  let currentArticle: ParsedArticle | null = null;
  let currentClause: ParsedClause | null = null;
  let currentPoint: ParsedPoint | null = null;

  function finalizePoint() {
    if (currentPoint && currentClause) {
      currentPoint.content = currentPoint.content.trim();
      currentClause.points.push(currentPoint);
      currentPoint = null;
    }
  }

  function finalizeClause() {
    finalizePoint();
    if (currentClause && currentArticle) {
      currentClause.content = currentClause.content.trim();
      currentArticle.clauses.push(currentClause);
      currentClause = null;
    }
  }

  function finalizeArticle() {
    finalizeClause();
    if (currentArticle) {
      currentArticle.content = currentArticle.content.trim();
      articles.push(currentArticle);
      currentArticle = null;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Check for chapter header
    const chapterMatch = line.match(CHAPTER_PATTERN);
    if (chapterMatch) {
      currentChapter = line;
      currentSection = null;
      continue;
    }

    // Check for section header
    const sectionMatch = line.match(SECTION_PATTERN);
    if (sectionMatch) {
      currentSection = line;
      continue;
    }

    // Check for article header: "Điều N. Title"
    const articleMatch = line.match(ARTICLE_PATTERN);
    if (articleMatch) {
      finalizeArticle();
      const articleNumber = parseInt(articleMatch[1], 10);
      const title = articleMatch[2].trim() || null;
      currentArticle = {
        articleNumber,
        title,
        content: "",
        chapter: currentChapter,
        section: currentSection,
        clauses: [],
      };
      state = "article";
      continue;
    }

    // Check for clause: "N. content" (only inside an article)
    if (state !== "idle") {
      const clauseMatch = line.match(CLAUSE_PATTERN);
      if (clauseMatch) {
        finalizeClause();
        const clauseNumber = parseInt(clauseMatch[1], 10);
        // Heuristic: clause numbers should be sequential and reasonable
        const lastClauseNum = currentArticle?.clauses.length
          ? currentArticle.clauses[currentArticle.clauses.length - 1].clauseNumber
          : 0;
        if (clauseNumber <= 200 && (clauseNumber === lastClauseNum + 1 || currentArticle?.clauses.length === 0)) {
          currentClause = {
            clauseNumber,
            content: clauseMatch[2],
            points: [],
          };
          state = "clause";
          continue;
        }
        // Otherwise treat as continuation text
      }
    }

    // Check for point: "a) content" (only inside a clause)
    if (state === "clause" || state === "point") {
      const pointMatch = line.match(POINT_PATTERN);
      if (pointMatch) {
        finalizePoint();
        currentPoint = {
          pointLetter: pointMatch[1],
          content: pointMatch[2],
        };
        state = "point";
        continue;
      }
    }

    // Continuation text — append to current element
    if (state === "point" && currentPoint) {
      currentPoint.content += " " + line;
    } else if (state === "clause" && currentClause) {
      currentClause.content += " " + line;
    } else if (state === "article" && currentArticle) {
      currentArticle.content += (currentArticle.content ? " " : "") + line;
    }
    // Lines in "idle" state before any article are ignored
  }

  // Finalize last elements
  finalizeArticle();

  if (articles.length === 0) {
    warnings.push("No articles (Điều) found in text. Check that the text follows Vietnamese legal document format.");
  }

  // Check for duplicate article numbers
  const articleNumbers = new Set<number>();
  for (const art of articles) {
    if (articleNumbers.has(art.articleNumber)) {
      errors.push(`Duplicate article number: Điều ${art.articleNumber}`);
    }
    articleNumbers.add(art.articleNumber);
  }

  if (errors.length > 0) {
    return { success: false, document: null, errors, warnings };
  }

  const document: ParsedDocument = {
    ...metadata,
    status: metadata.status || "active",
    articles,
  };

  return { success: true, document, errors: [], warnings };
}
