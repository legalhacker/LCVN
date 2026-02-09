export type EntityType = "document" | "article" | "clause" | "point";

export type RelationshipType =
  | "amended_by"
  | "replaces"
  | "related_to"
  | "references"
  | "implements";

export interface LegalEntity {
  canonicalId: string;
  entityType: EntityType;
  title?: string;
  content?: string;
}

export interface DocumentMeta {
  canonicalId: string;
  title: string;
  documentNumber: string;
  documentType: string;
  issuingBody: string;
  issuedDate: string;
  effectiveDate: string;
  slug: string;
  year: number;
  status: string;
}

export interface ArticleWithChildren {
  id: string;
  canonicalId: string;
  articleNumber: number;
  title: string | null;
  content: string;
  chapter: string | null;
  section: string | null;
  document: DocumentMeta;
  clauses: ClauseWithChildren[];
}

export interface ClauseWithChildren {
  id: string;
  canonicalId: string;
  clauseNumber: number;
  content: string;
  points: PointData[];
}

export interface PointData {
  id: string;
  canonicalId: string;
  pointLetter: string;
  content: string;
}

export interface Relationship {
  id: string;
  sourceType: EntityType;
  sourceCanonicalId: string;
  targetType: EntityType;
  targetCanonicalId: string;
  relationshipType: RelationshipType;
  description: string | null;
  effectiveDate: string | null;
}

export interface MetadataEntry {
  key: string;
  value: string;
}

export interface ParsedSlug {
  docSlug: string;
  year: number;
  articleNumber?: number;
  clauseNumber?: number;
  pointLetter?: string;
  entityType: EntityType;
}

export interface ApiResponse<T> {
  data: T;
  canonical_id: string;
  canonical_url: string;
  metadata: MetadataEntry[];
  relationships: Relationship[];
  json_ld: Record<string, unknown>;
}
