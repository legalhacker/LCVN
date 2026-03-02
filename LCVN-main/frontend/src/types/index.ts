// Document types
export type DocumentType =
  | 'LAW'
  | 'CODE'
  | 'DECREE'
  | 'CIRCULAR'
  | 'RESOLUTION'
  | 'DECISION'
  | 'DIRECTIVE'
  | 'DISPATCH';

export type DocumentStatus =
  | 'DRAFT'
  | 'EFFECTIVE'
  | 'EXPIRED'
  | 'PARTIALLY_EXPIRED'
  | 'NOT_YET_EFFECTIVE';

export interface Document {
  id: string;
  documentNumber: string;
  title: string;
  titleSlug: string;
  documentType: DocumentType;
  issuingBody: string;
  issuedDate: string;
  effectiveDate?: string;
  expirationDate?: string;
  status: DocumentStatus;
  keywords: string[];
  summary?: string;
  preamble?: string;
}

export interface Article {
  id: string;
  articleId: string; // Stable unique ID
  documentId: string;
  articleNumber: string;
  title?: string;
  content: string;
  contentHtml?: string;
  chapterNumber?: string;
  chapterTitle?: string;
  sectionNumber?: string;
  sectionTitle?: string;
  orderIndex: number;
  keywords: string[];
  summary?: string;
  hasPracticalReferences: boolean;
}

export interface ArticleVersion {
  id: string;
  articleId: string;
  versionNumber: number;
  content: string;
  changeType: string;
  changeNote?: string;
  effectiveFrom: string;
  effectiveUntil?: string;
}

// User types
export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  companyName?: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'SUPER_ADMIN' | 'WORKSPACE_ADMIN' | 'MEMBER' | 'VIEWER';
  user: User;
}

// Annotation types
export type AnnotationVisibility = 'PRIVATE' | 'WORKSPACE';
export type AnnotationType = 'highlight' | 'note' | 'bookmark';
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

export interface Annotation {
  id: string;
  articleId: string;
  userId: string;
  workspaceId?: string;
  startOffset?: number;
  endOffset?: number;
  selectedText?: string;
  paragraphIndex?: number;
  annotationType: AnnotationType;
  highlightColor?: HighlightColor;
  noteContent?: string;
  visibility: AnnotationVisibility;
  user: User;
  mentions: Mention[];
  createdAt: string;
  updatedAt: string;
}

export interface Mention {
  id: string;
  annotationId: string;
  mentionedUserId: string;
  mentionedUser: User;
}

// Practical references
export type ResourceType =
  | 'COURT_CASE'
  | 'ADMIN_PENALTY'
  | 'EXPERT_ARTICLE'
  | 'LAW_FIRM_PUBLICATION'
  | 'ACADEMIC_PAPER';

export interface ArticleResource {
  id: string;
  articleId: string;
  resourceType: ResourceType;
  title: string;
  source: string;
  author?: string;
  publishedDate?: string;
  externalUrl?: string;
  citation?: string;
  excerpt?: string;
  caseNumber?: string;
  courtName?: string;
  judgmentDate?: string;
}

// Notification types
export type NotificationType =
  | 'MENTION'
  | 'ANNOTATION_REPLY'
  | 'DOCUMENT_UPDATE'
  | 'WORKSPACE_INVITE';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
  linkType?: string;
  linkId?: string;
  isRead: boolean;
  createdAt: string;
}

// Search types
export interface SearchResult {
  articles: {
    hits: ArticleSearchHit[];
    totalHits: number;
    page: number;
    limit: number;
  };
  documents: {
    hits: DocumentSearchHit[];
    totalHits: number;
  };
}

export interface ArticleSearchHit {
  id: string;
  articleId: string;
  articleNumber: string;
  title?: string;
  content: string;
  documentNumber: string;
  documentTitle: string;
  _formatted?: {
    content?: string;
    title?: string;
  };
}

export interface DocumentSearchHit {
  id: string;
  documentNumber: string;
  title: string;
  titleSlug: string;
  documentType: DocumentType;
  status: DocumentStatus;
  _formatted?: {
    title?: string;
    summary?: string;
  };
}

// Table of contents
export interface TocArticle {
  articleId: string;
  articleNumber: string;
  title?: string;
  hasPracticalReferences: boolean;
}

export interface TocSection {
  sectionNumber?: string;
  sectionTitle?: string;
  articles: TocArticle[];
}

export interface TocChapter {
  chapterNumber?: string;
  chapterTitle?: string;
  sections: TocSection[];
  articles: TocArticle[];
}
