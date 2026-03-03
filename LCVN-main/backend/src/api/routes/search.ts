import { Router, Response } from 'express';
import { z } from 'zod';
import {
  globalSearch,
  inDocumentSearch,
  getSearchSuggestions,
  getFilterOptions,
} from '../../services/search.js';
import { prisma } from '../../services/prisma.js';
import { optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Validation schemas
const globalSearchSchema = z.object({
  q: z.string().min(1).max(500),
  type: z.string().optional(),
  status: z.string().optional(),
  issuingBody: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.union([z.string(), z.number()]).optional(),
  limit: z.union([z.string(), z.number()]).optional(),
  mode: z.enum(['exact', 'semantic', 'hybrid']).optional(),
  // NEW: Article-level filters
  legalTopics: z.array(z.string()).optional(),
  articleType: z.string().optional(),
  minImportance: z.union([z.string(), z.number()]).optional(),
});

const inDocumentSearchSchema = z.object({
  q: z.string().min(1).max(500),
  documentId: z.string(),
  mode: z.enum(['exact', 'semantic']).default('exact'),
});

// POST /api/search/global - Global search across all documents
router.post('/global', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const params = globalSearchSchema.parse(req.body);

    const results = await globalSearch({
      query: params.q,
      documentType: params.type,
      status: params.status,
      issuingBody: params.issuingBody,
      dateFrom: params.dateFrom ? new Date(params.dateFrom) : undefined,
      dateTo: params.dateTo ? new Date(params.dateTo) : undefined,
      page: params.page ? (typeof params.page === 'string' ? parseInt(params.page) : params.page) : 1,
      limit: params.limit ? (typeof params.limit === 'string' ? parseInt(params.limit) : params.limit) : 20,
      mode: params.mode || 'hybrid',
      // NEW: Article-level filters
      legalTopics: params.legalTopics,
      articleType: params.articleType,
      minImportance: params.minImportance ? (typeof params.minImportance === 'string' ? parseInt(params.minImportance) : params.minImportance) : undefined,
    });

    // Search logging is already handled in the service
    res.json(results);
  } catch (error) {
    next(error);
  }
});

// POST /api/search/document - In-document search (advanced Ctrl+F)
router.post('/document', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const params = inDocumentSearchSchema.parse(req.body);

    const results = await inDocumentSearch({
      query: params.q,
      documentId: params.documentId,
      mode: params.mode,
    });

    // Log search for in-document searches
    prisma.searchLog.create({
      data: {
        userId: req.user?.id,
        query: params.q,
        searchType: params.mode === 'exact' ? 'in_document' : 'semantic',
        documentId: params.documentId,
        resultsCount: results.totalHits || 0,
      },
    }).catch(() => {});

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// GET /api/search/suggestions - Search suggestions/autocomplete (uses Meilisearch)
router.get('/suggestions', async (req, res: Response, next) => {
  try {
    const q = (req.query.q as string) || '';
    const limit = parseInt(req.query.limit as string) || 5;

    const results = await getSearchSuggestions(q, limit);
    res.json(results);
  } catch (error) {
    next(error);
  }
});

// GET /api/search/filters - Get available filter options
router.get('/filters', async (_req, res: Response, next) => {
  try {
    const filters = await getFilterOptions();
    res.json(filters);
  } catch (error) {
    next(error);
  }
});

// GET /api/search - Alternative GET endpoint for simpler queries
router.get('/', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 1) {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }

    const results = await globalSearch({
      query: q,
      documentType: req.query.type as string,
      status: (req.query.status as string) || 'EFFECTIVE',
      issuingBody: req.query.issuingBody as string,
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
      dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      mode: (req.query.mode as 'exact' | 'semantic' | 'hybrid') || 'hybrid',
    });

    res.json(results);
  } catch (error) {
    next(error);
  }
});

export default router;
