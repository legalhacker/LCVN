import { MeiliSearch } from 'meilisearch';
import { config } from '../config/index.js';
import { prisma } from './prisma.js';

// ============================================================================
// VIETLAW LEGAL DOCUMENT SEARCH ENGINE
// ============================================================================
// This search system helps users find legal documents and articles.
// It does NOT provide legal advice or interpretation.
// ============================================================================

// Initialize Meilisearch client
const client = new MeiliSearch({
  host: config.meilisearch.host,
  apiKey: config.meilisearch.apiKey,
});

// Check if Meilisearch is configured
const isMeilisearchConfigured = () =>
  config.meilisearch.host !== 'http://localhost:7700';

// Index names
const DOCUMENTS_INDEX = 'documents';
const ARTICLES_INDEX = 'articles';

// ============================================================================
// VIETNAMESE LEGAL SYNONYMS
// ============================================================================
// Common legal terms and their synonyms for semantic matching
const LEGAL_SYNONYMS: Record<string, string[]> = {
  // Employment & Labor
  'sa thải': ['chấm dứt hợp đồng', 'đuổi việc', 'cho thôi việc', 'kỷ luật buộc thôi việc'],
  'lao động': ['người lao động', 'nhân viên', 'công nhân', 'người làm công'],
  'hợp đồng lao động': ['hợp đồng làm việc', 'hợp đồng thuê mướn'],
  'tiền lương': ['lương', 'thù lao', 'tiền công', 'thu nhập'],
  'nghỉ phép': ['nghỉ hàng năm', 'ngày nghỉ', 'phép năm'],

  // Insurance
  'bảo hiểm xã hội': ['bhxh', 'bảo hiểm', 'đóng bảo hiểm'],
  'bảo hiểm y tế': ['bhyt', 'bảo hiểm sức khỏe'],
  'bảo hiểm thất nghiệp': ['bhtn', 'trợ cấp thất nghiệp'],

  // Business & Enterprise
  'doanh nghiệp': ['công ty', 'tổ chức', 'đơn vị', 'cơ sở kinh doanh'],
  'thành lập công ty': ['đăng ký doanh nghiệp', 'thành lập doanh nghiệp'],
  'giải thể': ['đóng cửa', 'ngừng hoạt động', 'phá sản'],

  // Tax
  'thuế': ['nộp thuế', 'nghĩa vụ thuế', 'kê khai thuế'],
  'thuế thu nhập': ['thuế tndn', 'thuế tncn', 'thuế lợi tức'],
  'hóa đơn': ['chứng từ', 'hóa đơn điện tử', 'hóa đơn gtgt'],

  // Contracts
  'hợp đồng': ['thỏa thuận', 'giao kèo', 'cam kết'],
  'vi phạm hợp đồng': ['phá vỡ hợp đồng', 'không thực hiện hợp đồng'],
  'chấm dứt hợp đồng': ['hủy hợp đồng', 'kết thúc hợp đồng', 'thanh lý hợp đồng'],

  // Penalties
  'xử phạt': ['phạt', 'xử lý vi phạm', 'chế tài'],
  'vi phạm hành chính': ['lỗi hành chính', 'vi phạm pháp luật'],

  // Legal procedures
  'tranh chấp': ['kiện tụng', 'mâu thuẫn', 'khiếu nại'],
  'tòa án': ['tòa', 'cơ quan xét xử'],
  'trọng tài': ['hội đồng trọng tài', 'phân xử'],
};

// ============================================================================
// INDEXED DATA TYPES
// ============================================================================

interface IndexedDocument {
  id: string;
  documentNumber: string;
  title: string;
  titleSlug: string;
  documentType: string;
  issuingBody: string;
  issuedDate: number; // timestamp
  effectiveDate: number | null;
  expirationDate: number | null;
  status: string;
  keywords: string[];
  summary: string | null;
  // Legal status metadata
  isCurrentlyEffective: boolean;
  replacedByDocumentId: string | null;
  replacedByDocumentNumber: string | null;
}

interface IndexedArticle {
  id: string;
  articleId: string; // stable unique ID (format: doc_slug:article_number)
  documentId: string;
  documentSlug: string;
  documentNumber: string;
  documentTitle: string;
  documentType: string;
  documentStatus: string;
  articleNumber: string;
  title: string | null;
  content: string;
  chapterNumber: string | null;
  chapterTitle: string | null;
  sectionNumber: string | null;
  sectionTitle: string | null;
  keywords: string[];
  summary: string | null;
  orderIndex: number;
  // Legal status metadata
  isDocumentEffective: boolean;
  documentEffectiveDate: number | null;
  documentExpirationDate: number | null;
  replacedByDocumentNumber: string | null;
  // For boosting
  hasPracticalReferences: boolean;
  // NEW: Legal topic classification for improved relevance
  legalTopics: string[];
  articleType: string | null;    // DEFINITION, GENERAL, PROCEDURE, RIGHTS, OBLIGATIONS, PENALTY
  subjectMatter: string | null;  // Primary subject (what article is ABOUT)
  importance: number;            // 1-5, higher = more important
}

// ============================================================================
// SEARCH RESULT TYPES
// ============================================================================

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
  // Legal status
  legalStatus: 'EFFECTIVE' | 'EXPIRED' | 'NOT_YET_EFFECTIVE' | 'PARTIALLY_EXPIRED';
  effectiveDate: string | null;
  expirationDate: string | null;
  replacedBy: string | null; // document number that replaced this
  // Relevance
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
  snippet: string; // highlighted summary
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

// ============================================================================
// INDEX INITIALIZATION
// ============================================================================

export async function initializeSearchIndexes(): Promise<void> {
  if (!isMeilisearchConfigured()) {
    console.log('Meilisearch not configured — skipping search index initialization');
    return;
  }
  try {
  console.log('Initializing search indexes...');

  // Documents index
  const documentsIndex = client.index(DOCUMENTS_INDEX);
  await documentsIndex.updateSettings({
    searchableAttributes: [
      'title',
      'documentNumber',
      'keywords',
      'summary',
      'issuingBody',
    ],
    filterableAttributes: [
      'documentType',
      'status',
      'issuingBody',
      'issuedDate',
      'effectiveDate',
      'expirationDate',
      'isCurrentlyEffective',
    ],
    sortableAttributes: [
      'issuedDate',
      'effectiveDate',
      'title',
    ],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
    ],
    // Vietnamese language support
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: {
        oneTypo: 4,
        twoTypos: 8,
      },
    },
  });

  // Articles index - the PRIMARY search index
  // RANKING STRATEGY: Prioritize title/topic matches over incidental content mentions
  const articlesIndex = client.index(ARTICLES_INDEX);
  await articlesIndex.updateSettings({
    // IMPORTANT: Order matters! First attributes are weighted higher
    searchableAttributes: [
      'title',             // 1st priority: Article title match
      'subjectMatter',     // 2nd: What the article is ABOUT
      'legalTopics',       // 3rd: Legal topic tags
      'keywords',          // 4th: Curated keywords
      'articleNumber',     // 5th: "Điều X"
      'summary',           // 6th: Article summary
      'chapterTitle',      // 7th: Chapter context
      'documentTitle',     // 8th: Parent document
      'content',           // 9th (last): Full text - deprioritized to reduce noise
    ],
    filterableAttributes: [
      'documentId',
      'documentNumber',
      'documentType',
      'documentStatus',
      'isDocumentEffective',
      'hasPracticalReferences',
      'articleType',       // NEW: Filter by article type
      'legalTopics',       // NEW: Filter by topic
      'importance',        // NEW: Filter by importance
    ],
    sortableAttributes: [
      'orderIndex',
      'articleNumber',
      'documentEffectiveDate',
      'importance',        // NEW: Sort by importance
    ],
    rankingRules: [
      'words',             // Documents containing more query words
      'typo',              // Fewer typos = better
      'proximity',         // Words closer together = better
      'attribute',         // Matches in higher-priority attributes = better
      'sort',              // Custom sort order
      'exactness',         // Exact matches = better
    ],
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: {
        oneTypo: 4,
        twoTypos: 8,
      },
    },
    // Configure synonyms for Vietnamese legal terms
    synonyms: LEGAL_SYNONYMS,
  });

  console.log('Search indexes initialized with Vietnamese legal synonyms');
  } catch (err) {
    console.warn('Failed to initialize search indexes (Meilisearch unavailable):', err);
  }
}

// ============================================================================
// DATA SYNCHRONIZATION
// ============================================================================

export async function syncDocumentsToSearch(): Promise<void> {
  if (!isMeilisearchConfigured()) {
    console.log('Meilisearch not configured — skipping document sync');
    return;
  }
  console.log('Syncing documents to search index...');

  const documents = await prisma.document.findMany({
    include: {
      replacedBy: {
        select: { id: true, documentNumber: true },
        take: 1,
      },
    },
  });

  const now = new Date();

  const indexedDocs: IndexedDocument[] = documents.map(doc => {
    // Determine if currently effective
    const effectiveDate = doc.effectiveDate ? new Date(doc.effectiveDate) : null;
    const expirationDate = doc.expirationDate ? new Date(doc.expirationDate) : null;
    const isCurrentlyEffective =
      doc.status === 'EFFECTIVE' &&
      (!effectiveDate || effectiveDate <= now) &&
      (!expirationDate || expirationDate > now);

    // Find replacement document (if this doc was replaced)
    const replacement = doc.replacedBy[0];

    return {
      id: doc.id,
      documentNumber: doc.documentNumber,
      title: doc.title,
      titleSlug: doc.titleSlug,
      documentType: doc.documentType,
      issuingBody: doc.issuingBody,
      issuedDate: doc.issuedDate.getTime(),
      effectiveDate: doc.effectiveDate?.getTime() || null,
      expirationDate: doc.expirationDate?.getTime() || null,
      status: doc.status,
      keywords: doc.keywords,
      summary: doc.summary,
      isCurrentlyEffective,
      replacedByDocumentId: replacement?.id || null,
      replacedByDocumentNumber: replacement?.documentNumber || null,
    };
  });

  try {
    const index = client.index(DOCUMENTS_INDEX);
    await index.addDocuments(indexedDocs, { primaryKey: 'id' });
    console.log(`Synced ${indexedDocs.length} documents to search index`);
  } catch (err) {
    console.warn('Failed to sync documents to search index:', err);
  }
}

export async function syncArticlesToSearch(): Promise<void> {
  if (!isMeilisearchConfigured()) {
    console.log('Meilisearch not configured — skipping article sync');
    return;
  }
  console.log('Syncing articles to search index...');

  const articles = await prisma.article.findMany({
    include: {
      document: {
        include: {
          replacedBy: {
            select: { documentNumber: true },
            take: 1,
          },
        },
      },
    },
  });

  const now = new Date();

  const indexedArticles: IndexedArticle[] = articles.map(article => {
    const doc = article.document;
    const effectiveDate = doc.effectiveDate ? new Date(doc.effectiveDate) : null;
    const expirationDate = doc.expirationDate ? new Date(doc.expirationDate) : null;
    const isDocumentEffective =
      doc.status === 'EFFECTIVE' &&
      (!effectiveDate || effectiveDate <= now) &&
      (!expirationDate || expirationDate > now);

    const replacement = doc.replacedBy[0];

    return {
      id: article.id,
      articleId: article.articleId,
      documentId: article.documentId,
      documentSlug: doc.titleSlug,
      documentNumber: doc.documentNumber,
      documentTitle: doc.title,
      documentType: doc.documentType,
      documentStatus: doc.status,
      articleNumber: article.articleNumber,
      title: article.title,
      content: article.content,
      chapterNumber: article.chapterNumber,
      chapterTitle: article.chapterTitle,
      sectionNumber: article.sectionNumber,
      sectionTitle: article.sectionTitle,
      keywords: article.keywords,
      summary: article.summary,
      orderIndex: article.orderIndex,
      isDocumentEffective,
      documentEffectiveDate: doc.effectiveDate?.getTime() || null,
      documentExpirationDate: doc.expirationDate?.getTime() || null,
      replacedByDocumentNumber: replacement?.documentNumber || null,
      hasPracticalReferences: article.hasPracticalReferences,
      // NEW: Legal topic classification
      legalTopics: article.legalTopics || [],
      articleType: article.articleType,
      subjectMatter: article.subjectMatter,
      importance: article.importance || 1,
    };
  });

  try {
    const index = client.index(ARTICLES_INDEX);
    await index.addDocuments(indexedArticles, { primaryKey: 'id' });
    console.log(`Synced ${indexedArticles.length} articles to search index`);
  } catch (err) {
    console.warn('Failed to sync articles to search index:', err);
  }
}

// ============================================================================
// SEARCH PARAMETERS
// ============================================================================

export interface GlobalSearchParams {
  query: string;
  documentType?: string;
  status?: string; // 'EFFECTIVE' | 'EXPIRED' | 'ALL'
  issuingBody?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  mode?: 'exact' | 'semantic' | 'hybrid'; // Search mode
  // NEW: Article-level filters
  legalTopics?: string[];      // Filter by legal topics
  articleType?: string;        // Filter by article type
  minImportance?: number;      // Filter by minimum importance (1-5)
}

export interface InDocumentSearchParams {
  query: string;
  documentId: string;
  mode: 'exact' | 'semantic';
}

// ============================================================================
// GLOBAL SEARCH - Primary search function
// ============================================================================

const EMPTY_SEARCH_RESPONSE = (params: GlobalSearchParams): SearchResponse => ({
  query: params.query,
  totalArticles: 0,
  totalDocuments: 0,
  articles: [],
  documents: [],
  filters: {
    documentType: params.documentType || null,
    status: params.status || null,
    issuingBody: params.issuingBody || null,
    legalTopics: params.legalTopics || null,
    articleType: params.articleType || null,
    minImportance: params.minImportance || null,
  },
  pagination: { page: params.page || 1, limit: params.limit || 20, hasMore: false },
  searchMode: params.mode || 'hybrid',
});

async function prismaFallbackSearch(params: GlobalSearchParams): Promise<SearchResponse> {
  const { query, documentType, status, issuingBody, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const docWhere: Record<string, unknown> = {};
  if (query) {
    docWhere.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { documentNumber: { contains: query, mode: 'insensitive' } },
      { summary: { contains: query, mode: 'insensitive' } },
    ];
  }
  if (documentType) docWhere.documentType = documentType;
  if (status) docWhere.status = status;
  if (issuingBody) docWhere.issuingBody = { contains: issuingBody, mode: 'insensitive' };

  const [docs, totalDocuments] = await Promise.all([
    prisma.document.findMany({
      where: docWhere,
      skip,
      take: limit,
      orderBy: { issuedDate: 'desc' },
      include: { _count: { select: { articles: true } } },
    }),
    prisma.document.count({ where: docWhere }),
  ]);

  const documents: DocumentSearchResult[] = docs.map(d => ({
    id: d.id,
    titleSlug: d.titleSlug,
    documentNumber: d.documentNumber,
    title: d.title,
    documentType: d.documentType,
    issuingBody: d.issuingBody,
    status: d.status,
    snippet: d.summary ? d.summary.slice(0, 200) : '',
    effectiveDate: d.effectiveDate ? d.effectiveDate.toISOString() : null,
    expirationDate: d.expirationDate ? d.expirationDate.toISOString() : null,
    replacedBy: null,
    articleCount: d._count.articles,
  }));

  // Article search — only when query present
  let articles: ArticleSearchResult[] = [];
  let totalArticles = 0;
  if (query) {
    const artWhere: Record<string, unknown> = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ],
    };
    if (documentType || status) {
      artWhere.document = {
        ...(documentType && { documentType }),
        ...(status && { status }),
      };
    }

    const [artRows, artTotal] = await Promise.all([
      prisma.article.findMany({
        where: artWhere,
        skip,
        take: limit,
        orderBy: { orderIndex: 'asc' },
        include: {
          document: {
            select: {
              id: true, titleSlug: true, documentNumber: true, title: true,
              documentType: true, status: true, effectiveDate: true, expirationDate: true,
            },
          },
        },
      }),
      prisma.article.count({ where: artWhere }),
    ]);

    totalArticles = artTotal;
    articles = artRows.map(a => {
      const snippet = a.content
        ? a.content.slice(0, 200).replace(/\n/g, ' ')
        : '';
      return {
        id: a.id,
        articleId: a.articleId,
        articleNumber: a.articleNumber,
        title: a.title || null,
        documentId: a.document.id,
        documentSlug: a.document.titleSlug,
        documentNumber: a.document.documentNumber,
        documentTitle: a.document.title,
        documentType: a.document.documentType,
        chapterTitle: a.chapterTitle || null,
        snippet,
        legalStatus: a.document.status as ArticleSearchResult['legalStatus'],
        effectiveDate: a.document.effectiveDate ? a.document.effectiveDate.toISOString() : null,
        expirationDate: a.document.expirationDate ? a.document.expirationDate.toISOString() : null,
        replacedBy: null,
        score: 1,
        legalTopics: (a.legalTopics as string[]) || [],
        articleType: null,
        subjectMatter: null,
        importance: 3,
      };
    });
  }

  return {
    query,
    totalArticles,
    totalDocuments,
    articles,
    documents,
    filters: {
      documentType: documentType || null,
      status: status || null,
      issuingBody: issuingBody || null,
      legalTopics: null,
      articleType: null,
      minImportance: null,
    },
    pagination: { page, limit, hasMore: totalDocuments > page * limit || totalArticles > page * limit },
    searchMode: 'exact',
  };
}

export async function globalSearch(params: GlobalSearchParams): Promise<SearchResponse> {
  if (!isMeilisearchConfigured()) {
    return prismaFallbackSearch(params);
  }
  const {
    query,
    documentType,
    status = 'EFFECTIVE', // Default to effective documents
    issuingBody,
    dateFrom,
    dateTo,
    page = 1,
    limit = 20,
    mode = 'hybrid',
    legalTopics,
    articleType,
    minImportance,
  } = params;

  // Expand query with synonyms for semantic search
  let expandedQuery = query;
  if (mode === 'semantic' || mode === 'hybrid') {
    expandedQuery = expandQueryWithSynonyms(query);
  }

  // Build filters for articles
  const articleFilters: string[] = [];
  if (documentType) {
    articleFilters.push(`documentType = "${documentType}"`);
  }
  if (status === 'EFFECTIVE') {
    articleFilters.push('isDocumentEffective = true');
  } else if (status === 'EXPIRED') {
    articleFilters.push('isDocumentEffective = false');
  }
  // 'ALL' = no status filter

  // NEW: Legal topic filters
  if (legalTopics && legalTopics.length > 0) {
    // Match any of the selected topics
    const topicFilters = legalTopics.map(t => `legalTopics = "${t}"`);
    articleFilters.push(`(${topicFilters.join(' OR ')})`);
  }
  if (articleType) {
    articleFilters.push(`articleType = "${articleType}"`);
  }
  if (minImportance && minImportance > 1) {
    articleFilters.push(`importance >= ${minImportance}`);
  }

  // Build filters for documents
  const documentFilters: string[] = [];
  if (documentType) {
    documentFilters.push(`documentType = "${documentType}"`);
  }
  if (status === 'EFFECTIVE') {
    documentFilters.push('isCurrentlyEffective = true');
  } else if (status === 'EXPIRED') {
    documentFilters.push('isCurrentlyEffective = false');
  }
  if (issuingBody) {
    documentFilters.push(`issuingBody = "${issuingBody}"`);
  }
  if (dateFrom) {
    documentFilters.push(`effectiveDate >= ${dateFrom.getTime()}`);
  }
  if (dateTo) {
    documentFilters.push(`effectiveDate <= ${dateTo.getTime()}`);
  }

  try {
  // Search articles (PRIMARY results)
  const articlesIndex = client.index(ARTICLES_INDEX);
  const articleSearchOptions: Record<string, unknown> = {
    filter: articleFilters.length > 0 ? articleFilters.join(' AND ') : undefined,
    offset: (page - 1) * limit,
    limit,
    attributesToHighlight: ['content', 'title', 'summary'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    attributesToCrop: ['content'],
    cropLength: 150,
    showRankingScore: true,
  };

  // For exact mode, disable typo tolerance
  if (mode === 'exact') {
    articleSearchOptions.matchingStrategy = 'all';
  }

  const articleResults = await articlesIndex.search(
    mode === 'exact' ? query : expandedQuery,
    articleSearchOptions
  );

  // Search documents (secondary results)
  const documentsIndex = client.index(DOCUMENTS_INDEX);
  const documentResults = await documentsIndex.search(query, {
    filter: documentFilters.length > 0 ? documentFilters.join(' AND ') : undefined,
    limit: 10,
    attributesToHighlight: ['title', 'summary'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    showRankingScore: true,
  });

  // Format article results
  const articles: ArticleSearchResult[] = articleResults.hits.map((hit: Record<string, unknown>) => {
    const highlighted = (hit._formatted as Record<string, unknown>) || hit;
    return {
      id: hit.id as string,
      articleId: hit.articleId as string,
      articleNumber: hit.articleNumber as string,
      title: hit.title as string | null,
      documentId: hit.documentId as string,
      documentSlug: hit.documentSlug as string,
      documentNumber: hit.documentNumber as string,
      documentTitle: hit.documentTitle as string,
      documentType: hit.documentType as string,
      chapterTitle: hit.chapterTitle as string | null,
      snippet: (highlighted.content as string) || (hit.content as string).substring(0, 200),
      legalStatus: getLegalStatus(hit),
      effectiveDate: hit.documentEffectiveDate
        ? new Date(hit.documentEffectiveDate as number).toISOString()
        : null,
      expirationDate: hit.documentExpirationDate
        ? new Date(hit.documentExpirationDate as number).toISOString()
        : null,
      replacedBy: hit.replacedByDocumentNumber as string | null,
      score: (hit._rankingScore as number) || 0,
      // Topic classification
      legalTopics: (hit.legalTopics as string[]) || [],
      articleType: hit.articleType as string | null,
      subjectMatter: hit.subjectMatter as string | null,
      importance: (hit.importance as number) || 1,
    };
  });

  // Format document results
  const documents: DocumentSearchResult[] = await Promise.all(
    documentResults.hits.map(async (hit: Record<string, unknown>) => {
      const highlighted = (hit._formatted as Record<string, unknown>) || hit;
      // Get article count
      const articleCount = await prisma.article.count({
        where: { documentId: hit.id as string },
      });
      return {
        id: hit.id as string,
        titleSlug: hit.titleSlug as string,
        documentNumber: hit.documentNumber as string,
        title: hit.title as string,
        documentType: hit.documentType as string,
        issuingBody: hit.issuingBody as string,
        status: hit.status as string,
        snippet: (highlighted.summary as string) || (highlighted.title as string),
        effectiveDate: hit.effectiveDate
          ? new Date(hit.effectiveDate as number).toISOString()
          : null,
        expirationDate: hit.expirationDate
          ? new Date(hit.expirationDate as number).toISOString()
          : null,
        replacedBy: hit.replacedByDocumentNumber as string | null,
        articleCount,
      };
    })
  );

  // Log search for analytics (non-blocking)
  logSearch(query, articleResults.estimatedTotalHits || 0, mode).catch(() => {});

  return {
    query,
    totalArticles: articleResults.estimatedTotalHits || 0,
    totalDocuments: documentResults.estimatedTotalHits || 0,
    articles,
    documents,
    filters: {
      documentType: documentType || null,
      status: status || null,
      issuingBody: issuingBody || null,
      legalTopics: legalTopics || null,
      articleType: articleType || null,
      minImportance: minImportance || null,
    },
    pagination: {
      page,
      limit,
      hasMore: (articleResults.estimatedTotalHits || 0) > page * limit,
    },
    searchMode: mode,
  };
  } catch (err) {
    console.warn('Search failed (Meilisearch unavailable):', err);
    return EMPTY_SEARCH_RESPONSE(params);
  }
}

// ============================================================================
// IN-DOCUMENT SEARCH - Search within a specific document
// ============================================================================

export async function inDocumentSearch(params: InDocumentSearchParams) {
  const { query, documentId, mode } = params;

  if (!isMeilisearchConfigured()) {
    return { hits: [], totalHits: 0, mode, query };
  }

  try {
  const articlesIndex = client.index(ARTICLES_INDEX);

  const searchOptions: Record<string, unknown> = {
    filter: `documentId = "${documentId}"`,
    limit: 100, // Return all matches within document
    attributesToHighlight: ['content', 'title'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    attributesToCrop: ['content'],
    cropLength: 100,
  };

  let searchQuery = query;

  if (mode === 'exact') {
    // Exact match - strict matching
    searchOptions.matchingStrategy = 'all';
  } else {
    // Semantic mode - expand with synonyms
    searchQuery = expandQueryWithSynonyms(query);
    searchOptions.attributesToSearchOn = ['keywords', 'summary', 'content', 'title'];
  }

  const results = await articlesIndex.search(searchQuery, searchOptions);

  return {
    hits: results.hits.map((hit: Record<string, unknown>) => {
      const formatted = hit._formatted as Record<string, unknown> | undefined;
      return {
        id: hit.id as string,
        articleId: hit.articleId as string,
        articleNumber: hit.articleNumber as string,
        title: hit.title as string | null,
        content: (formatted?.content as string) || (hit.content as string),
        chapterTitle: hit.chapterTitle as string | null,
        orderIndex: hit.orderIndex as number,
      };
    }),
    totalHits: results.estimatedTotalHits || 0,
    mode,
    query: searchQuery,
  };
  } catch (err) {
    console.warn('In-document search failed (Meilisearch unavailable):', err);
    return { hits: [], totalHits: 0, mode, query };
  }
}

// ============================================================================
// SEARCH SUGGESTIONS / AUTOCOMPLETE
// ============================================================================

export async function getSearchSuggestions(query: string, limit: number = 5) {
  if (query.length < 2) {
    return { suggestions: [] };
  }

  if (!isMeilisearchConfigured()) {
    return { suggestions: [] };
  }

  try {
  // Search for matching document titles
  const documentsIndex = client.index(DOCUMENTS_INDEX);
  const docResults = await documentsIndex.search(query, {
    limit,
    attributesToRetrieve: ['documentNumber', 'title', 'documentType'],
  });

  // Search for matching article titles
  const articlesIndex = client.index(ARTICLES_INDEX);
  const articleResults = await articlesIndex.search(query, {
    limit,
    attributesToRetrieve: ['articleNumber', 'title', 'documentNumber'],
  });

  // Get popular searches matching the query
  const popularSearches = await prisma.searchLog.groupBy({
    by: ['query'],
    where: {
      query: {
        contains: query,
        mode: 'insensitive',
      },
    },
    _count: { query: true },
    orderBy: { _count: { query: 'desc' } },
    take: 3,
  });

  return {
    suggestions: [
      ...docResults.hits.map((hit: Record<string, unknown>) => ({
        type: 'document',
        text: hit.title as string,
        subtext: hit.documentNumber as string,
        documentType: hit.documentType as string,
      })),
      ...articleResults.hits.map((hit: Record<string, unknown>) => ({
        type: 'article',
        text: (hit.title as string) || (hit.articleNumber as string),
        subtext: hit.documentNumber as string,
      })),
      ...popularSearches.map((s) => ({
        type: 'query',
        text: s.query,
        subtext: `${s._count.query} lượt tìm kiếm`,
      })),
    ].slice(0, limit * 2),
  };
  } catch (err) {
    console.warn('Search suggestions failed (Meilisearch unavailable):', err);
    return { suggestions: [] };
  }
}

// ============================================================================
// FILTER OPTIONS
// ============================================================================

export async function getFilterOptions() {
  const [documentTypes, issuingBodies, years, articles] = await Promise.all([
    prisma.document.groupBy({
      by: ['documentType'],
      _count: { documentType: true },
    }),
    prisma.document.groupBy({
      by: ['issuingBody'],
      _count: { issuingBody: true },
    }),
    prisma.document.findMany({
      select: { issuedDate: true },
      distinct: ['issuedDate'],
    }),
    // Get unique legal topics and article types
    prisma.article.findMany({
      select: { legalTopics: true, articleType: true },
    }),
  ]);

  // Extract unique years
  const uniqueYears = [...new Set(
    years.map(y => y.issuedDate.getFullYear())
  )].sort((a, b) => b - a);

  // Extract unique legal topics with counts
  const topicCounts: Record<string, number> = {};
  const articleTypeCounts: Record<string, number> = {};

  for (const article of articles) {
    for (const topic of article.legalTopics || []) {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    }
    if (article.articleType) {
      articleTypeCounts[article.articleType] = (articleTypeCounts[article.articleType] || 0) + 1;
    }
  }

  // Sort topics by count
  const legalTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({
      value: topic,
      label: topic,
      count,
    }));

  // Article type labels
  const articleTypeLabels: Record<string, string> = {
    DEFINITION: 'Định nghĩa',
    GENERAL: 'Quy định chung',
    PROCEDURE: 'Thủ tục',
    RIGHTS: 'Quyền',
    OBLIGATIONS: 'Nghĩa vụ',
    PENALTY: 'Xử phạt',
    SCOPE: 'Phạm vi',
  };

  const articleTypes = Object.entries(articleTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      value: type,
      label: articleTypeLabels[type] || type,
      count,
    }));

  return {
    documentTypes: documentTypes.map(d => ({
      value: d.documentType,
      label: getDocumentTypeLabel(d.documentType),
      count: d._count.documentType,
    })),
    statuses: [
      { value: 'EFFECTIVE', label: 'Đang có hiệu lực' },
      { value: 'EXPIRED', label: 'Hết hiệu lực' },
      { value: 'NOT_YET_EFFECTIVE', label: 'Chưa có hiệu lực' },
      { value: 'ALL', label: 'Tất cả' },
    ],
    issuingBodies: issuingBodies.map(b => ({
      value: b.issuingBody,
      label: b.issuingBody,
      count: b._count.issuingBody,
    })),
    years: uniqueYears,
    // NEW: Article-level filters
    legalTopics,
    articleTypes,
    importanceLevels: [
      { value: 5, label: 'Rất quan trọng (5)' },
      { value: 4, label: 'Quan trọng (4)' },
      { value: 3, label: 'Trung bình (3)' },
      { value: 2, label: 'Ít quan trọng (2)' },
      { value: 1, label: 'Tất cả' },
    ],
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function expandQueryWithSynonyms(query: string): string {
  let expanded = query.toLowerCase();

  // Check if query matches any synonym keys
  for (const [key, synonyms] of Object.entries(LEGAL_SYNONYMS)) {
    if (expanded.includes(key)) {
      // Add first synonym as OR term
      expanded = `${expanded} ${synonyms[0]}`;
      break;
    }
    // Also check synonyms
    for (const synonym of synonyms) {
      if (expanded.includes(synonym)) {
        expanded = `${expanded} ${key}`;
        break;
      }
    }
  }

  return expanded;
}

function getLegalStatus(hit: Record<string, unknown>): 'EFFECTIVE' | 'EXPIRED' | 'NOT_YET_EFFECTIVE' | 'PARTIALLY_EXPIRED' {
  if (hit.isDocumentEffective) {
    return 'EFFECTIVE';
  }
  if (hit.documentStatus === 'NOT_YET_EFFECTIVE') {
    return 'NOT_YET_EFFECTIVE';
  }
  if (hit.documentStatus === 'PARTIALLY_EXPIRED') {
    return 'PARTIALLY_EXPIRED';
  }
  return 'EXPIRED';
}

function getDocumentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    LAW: 'Luật',
    CODE: 'Bộ luật',
    DECREE: 'Nghị định',
    CIRCULAR: 'Thông tư',
    RESOLUTION: 'Nghị quyết',
    DECISION: 'Quyết định',
    DIRECTIVE: 'Chỉ thị',
    DISPATCH: 'Công văn',
  };
  return labels[type] || type;
}

async function logSearch(query: string, resultCount: number, mode: string): Promise<void> {
  try {
    await prisma.searchLog.create({
      data: {
        query,
        searchType: mode,
        resultsCount: resultCount,
      },
    });
  } catch {
    // Silently fail - analytics should not break search
  }
}

// ============================================================================
// REAL-TIME INDEXING
// ============================================================================

export async function indexDocument(documentId: string): Promise<void> {
  if (!isMeilisearchConfigured()) return;
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      replacedBy: {
        select: { id: true, documentNumber: true },
        take: 1,
      },
    },
  });

  if (!document) return;

  const now = new Date();
  const effectiveDate = document.effectiveDate ? new Date(document.effectiveDate) : null;
  const expirationDate = document.expirationDate ? new Date(document.expirationDate) : null;
  const isCurrentlyEffective =
    document.status === 'EFFECTIVE' &&
    (!effectiveDate || effectiveDate <= now) &&
    (!expirationDate || expirationDate > now);

  const replacement = document.replacedBy[0];

  const indexedDoc: IndexedDocument = {
    id: document.id,
    documentNumber: document.documentNumber,
    title: document.title,
    titleSlug: document.titleSlug,
    documentType: document.documentType,
    issuingBody: document.issuingBody,
    issuedDate: document.issuedDate.getTime(),
    effectiveDate: document.effectiveDate?.getTime() || null,
    expirationDate: document.expirationDate?.getTime() || null,
    status: document.status,
    keywords: document.keywords,
    summary: document.summary,
    isCurrentlyEffective,
    replacedByDocumentId: replacement?.id || null,
    replacedByDocumentNumber: replacement?.documentNumber || null,
  };

  try {
    const index = client.index(DOCUMENTS_INDEX);
    await index.addDocuments([indexedDoc], { primaryKey: 'id' });
  } catch (err) {
    console.warn('Failed to index document:', err);
  }
}

export async function indexArticlesForDocument(documentId: string): Promise<void> {
  if (!isMeilisearchConfigured()) return;
  const articles = await prisma.article.findMany({
    where: { documentId },
    include: {
      document: {
        include: {
          replacedBy: {
            select: { documentNumber: true },
            take: 1,
          },
        },
      },
    },
  });

  if (articles.length === 0) return;

  const now = new Date();
  const doc = articles[0].document;
  const effectiveDate = doc.effectiveDate ? new Date(doc.effectiveDate) : null;
  const expirationDate = doc.expirationDate ? new Date(doc.expirationDate) : null;
  const isDocumentEffective =
    doc.status === 'EFFECTIVE' &&
    (!effectiveDate || effectiveDate <= now) &&
    (!expirationDate || expirationDate > now);

  const replacement = doc.replacedBy[0];

  const indexedArticles: IndexedArticle[] = articles.map(article => ({
    id: article.id,
    articleId: article.articleId,
    documentId: article.documentId,
    documentSlug: doc.titleSlug,
    documentNumber: doc.documentNumber,
    documentTitle: doc.title,
    documentType: doc.documentType,
    documentStatus: doc.status,
    articleNumber: article.articleNumber,
    title: article.title,
    content: article.content,
    chapterNumber: article.chapterNumber,
    chapterTitle: article.chapterTitle,
    sectionNumber: article.sectionNumber,
    sectionTitle: article.sectionTitle,
    keywords: article.keywords,
    summary: article.summary,
    orderIndex: article.orderIndex,
    isDocumentEffective,
    documentEffectiveDate: doc.effectiveDate?.getTime() || null,
    documentExpirationDate: doc.expirationDate?.getTime() || null,
    replacedByDocumentNumber: replacement?.documentNumber || null,
    hasPracticalReferences: article.hasPracticalReferences,
    // NEW: Legal topic classification
    legalTopics: article.legalTopics || [],
    articleType: article.articleType,
    subjectMatter: article.subjectMatter,
    importance: article.importance || 1,
  }));

  try {
    const index = client.index(ARTICLES_INDEX);
    await index.addDocuments(indexedArticles, { primaryKey: 'id' });
  } catch (err) {
    console.warn('Failed to index articles:', err);
  }
}

export async function removeDocumentFromIndex(documentId: string): Promise<void> {
  if (!isMeilisearchConfigured()) return;
  try {
    // Remove from documents index
    const documentsIndex = client.index(DOCUMENTS_INDEX);
    await documentsIndex.deleteDocument(documentId);

    // Remove all articles for this document
    const articles = await prisma.article.findMany({
      where: { documentId },
      select: { id: true },
    });

    if (articles.length > 0) {
      const articlesIndex = client.index(ARTICLES_INDEX);
      await articlesIndex.deleteDocuments(articles.map(a => a.id));
    }
  } catch (err) {
    console.warn('Failed to remove document from index:', err);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  initializeSearchIndexes,
  syncDocumentsToSearch,
  syncArticlesToSearch,
  globalSearch,
  inDocumentSearch,
  getSearchSuggestions,
  getFilterOptions,
  indexDocument,
  indexArticlesForDocument,
  removeDocumentFromIndex,
};
