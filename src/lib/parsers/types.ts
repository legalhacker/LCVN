export interface ParsedPoint {
  pointLetter: string;
  content: string;
}

export interface ParsedClause {
  clauseNumber: number;
  content: string;
  points: ParsedPoint[];
}

export interface ParsedArticle {
  articleNumber: number;
  title: string | null;
  content: string;
  chapter: string | null;
  section: string | null;
  clauses: ParsedClause[];
}

export interface ParsedDocument {
  canonicalId: string;
  title: string;
  documentNumber: string;
  documentType: "luat" | "nghi_dinh" | "thong_tu" | "quyet_dinh";
  issuingBody: string;
  issuedDate: string;
  effectiveDate: string;
  slug: string;
  year: number;
  status: "active" | "amended" | "repealed";
  articles: ParsedArticle[];
}

export interface ParseResult {
  success: boolean;
  document: ParsedDocument | null;
  errors: string[];
  warnings: string[];
}
