const API_BASE = '';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// DOCUMENTS API
// ============================================================================

export interface Document {
  id: string;
  documentNumber: string;
  title: string;
  titleSlug: string;
  documentType: string;
  issuingBody: string;
  issuedDate: string;
  effectiveDate?: string;
  status: string;
  keywords: string[];
  summary?: string;
  _count?: { articles: number };
}

export interface DocumentsResponse {
  data: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DocumentFilters {
  type?: string;
  status?: string;
  issuingBody?: string;
  year?: number;
  page?: number;
  limit?: number;
}

export async function getDocuments(filters: DocumentFilters = {}): Promise<DocumentsResponse> {
  const params = new URLSearchParams();
  if (filters.type) params.set('type', filters.type);
  if (filters.status) params.set('status', filters.status);
  if (filters.issuingBody) params.set('issuingBody', filters.issuingBody);
  if (filters.year) params.set('year', String(filters.year));
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  const query = params.toString();
  return fetchAPI<DocumentsResponse>(`/api/documents${query ? `?${query}` : ''}`);
}

export interface Article {
  id: string;
  articleId: string;
  articleNumber: string;
  title?: string;
  content?: string;
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

export interface TocArticle {
  id: string;
  articleId: string;
  articleNumber: string;
  title?: string;
  hasPracticalReferences: boolean;
}

export interface TocChapter {
  chapterNumber?: string;
  chapterTitle?: string;
  sections: {
    sectionNumber?: string;
    sectionTitle?: string;
    articles: TocArticle[];
  }[];
  articles: TocArticle[];
}

export interface RelatedDocument {
  id: string;
  documentNumber: string;
  title: string;
  titleSlug: string;
}

export interface DocumentRelation {
  id: string;
  relationType: 'AMENDS' | 'SUPPLEMENTS' | 'IMPLEMENTS' | 'REPLACES' | 'REFERENCES' | 'RELATED';
  description?: string;
  toDocument?: RelatedDocument;
  fromDocument?: RelatedDocument;
}

export interface DocumentDetail extends Document {
  preamble?: string;
  articles: TocArticle[];
  tableOfContents: TocChapter[];
  relatedFrom: DocumentRelation[];
  relatedTo: DocumentRelation[];
}

export async function getDocumentBySlug(slug: string): Promise<DocumentDetail> {
  return fetchAPI<DocumentDetail>(`/api/documents/${slug}`);
}

export interface DocumentFull extends Document {
  articles: Article[];
}

export async function getDocumentFull(slug: string): Promise<DocumentFull> {
  return fetchAPI<DocumentFull>(`/api/documents/${slug}/full`);
}

// ============================================================================
// ARTICLES API
// ============================================================================

export interface ArticleDetail extends Article {
  document: {
    id: string;
    documentNumber: string;
    title: string;
    titleSlug: string;
    documentType: string;
    status: string;
  };
  versions: any[];
}

export async function getArticle(articleId: string): Promise<ArticleDetail> {
  return fetchAPI<ArticleDetail>(`/api/articles/${encodeURIComponent(articleId)}`);
}

export async function getArticleContent(articleId: string): Promise<Article> {
  return fetchAPI<Article>(`/api/articles/${encodeURIComponent(articleId)}/content`);
}

export interface ArticleResource {
  id: string;
  resourceType: string;
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

export interface ArticleResourcesResponse {
  cases: ArticleResource[];
  expertArticles: ArticleResource[];
  workspaceNotes: any[];
  disclaimer: string;
}

export async function getArticleResources(articleId: string): Promise<ArticleResourcesResponse> {
  return fetchAPI<ArticleResourcesResponse>(`/api/articles/${encodeURIComponent(articleId)}/resources`);
}

// ============================================================================
// SEARCH API
// ============================================================================

export type LegalStatus = 'EFFECTIVE' | 'EXPIRED' | 'NOT_YET_EFFECTIVE' | 'PARTIALLY_EXPIRED';

export interface ArticleSearchResult {
  id: string;
  articleId: string;
  articleNumber: string;
  title: string | null;
  documentId: string;
  documentSlug: string;
  documentNumber: string;
  documentTitle: string;
  documentType: string;
  chapterTitle: string | null;
  snippet: string; // highlighted content excerpt
  legalStatus: LegalStatus;
  effectiveDate: string | null;
  expirationDate: string | null;
  replacedBy: string | null;
  score: number;
  // Topic classification
  legalTopics: string[];
  articleType: string | null;
  subjectMatter: string | null;
  importance: number;
}

export interface DocumentSearchResult {
  id: string;
  titleSlug: string;
  documentNumber: string;
  title: string;
  documentType: string;
  issuingBody: string;
  status: string;
  snippet: string;
  effectiveDate: string | null;
  expirationDate: string | null;
  replacedBy: string | null;
  articleCount: number;
}

export interface SearchResponse {
  query: string;
  totalArticles: number;
  totalDocuments: number;
  articles: ArticleSearchResult[];
  documents: DocumentSearchResult[];
  filters: {
    documentType: string | null;
    status: string | null;
    issuingBody: string | null;
    legalTopics: string[] | null;
    articleType: string | null;
    minImportance: number | null;
  };
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
  searchMode: 'exact' | 'semantic' | 'hybrid';
}

export interface SearchParams {
  q: string;
  type?: string;
  status?: string;
  issuingBody?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  mode?: 'exact' | 'semantic' | 'hybrid';
  // Article-level filters
  legalTopics?: string[];
  articleType?: string;
  minImportance?: number;
}

export async function globalSearch(params: SearchParams): Promise<SearchResponse> {
  return fetchAPI<SearchResponse>('/api/search/global', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export interface SearchSuggestion {
  type: 'document' | 'article' | 'query';
  text: string;
  subtext: string;
  documentType?: string;
}

export interface SearchSuggestionsResponse {
  suggestions: SearchSuggestion[];
}

export async function getSearchSuggestions(q: string, limit: number = 5): Promise<SearchSuggestionsResponse> {
  const params = new URLSearchParams({ q, limit: String(limit) });
  return fetchAPI<SearchSuggestionsResponse>(`/api/search/suggestions?${params}`);
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface SearchFiltersResponse {
  documentTypes: FilterOption[];
  statuses: FilterOption[];
  issuingBodies: FilterOption[];
  years: number[];
  // Article-level filters
  legalTopics?: FilterOption[];
  articleTypes?: FilterOption[];
  importanceLevels?: { value: number; label: string }[];
}

export async function getSearchFilters(): Promise<SearchFiltersResponse> {
  return fetchAPI<SearchFiltersResponse>('/api/search/filters');
}

export interface InDocumentSearchParams {
  q: string;
  documentId: string;
  mode: 'exact' | 'semantic';
}

export interface InDocumentHit {
  id: string;
  articleId: string;
  articleNumber: string;
  title: string | null;
  content: string;
  chapterTitle: string | null;
  orderIndex: number;
}

export interface InDocumentSearchResponse {
  hits: InDocumentHit[];
  totalHits: number;
  mode: string;
  query: string;
}

export async function inDocumentSearch(params: InDocumentSearchParams): Promise<InDocumentSearchResponse> {
  return fetchAPI<InDocumentSearchResponse>('/api/search/document', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ============================================================================
// AUTH API
// ============================================================================

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isAdmin?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return fetchAPI<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email: string, password: string, fullName: string): Promise<LoginResponse> {
  return fetchAPI<LoginResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, fullName }),
  });
}

export async function getMe(token: string): Promise<User> {
  return fetchAPI<User>('/api/auth/me', { token });
}
