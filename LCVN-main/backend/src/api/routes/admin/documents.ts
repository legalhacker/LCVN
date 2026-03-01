import { Router, Response, Request } from 'express';
import { randomUUID } from 'crypto';
import multer from 'multer';
import { prisma } from '../../../services/prisma.js';
import { requireAdmin } from '../../middleware/adminAuth.js';
import { AuthRequest } from '../../middleware/auth.js';
import { parseDocx } from '../../../services/documentParser.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// GET /api/admin/documents
router.get('/', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const page = parseInt(String(req.query.page || 1));
    const limit = parseInt(String(req.query.limit || 20));
    const skip = (page - 1) * limit;
    const type = req.query.type as string | undefined;
    const status = req.query.status as string | undefined;
    const q = req.query.q as string | undefined;

    const where: Record<string, unknown> = {};
    if (type) where.documentType = type;
    if (status) where.status = status;
    if (q) where.title = { contains: q, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          documentNumber: true,
          title: true,
          documentType: true,
          status: true,
          issuingBody: true,
          issuedDate: true,
          effectiveDate: true,
          createdAt: true,
          _count: { select: { articles: true } },
        },
      }),
      prisma.document.count({ where }),
    ]);

    res.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/documents
router.post('/', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const {
      documentNumber, title, titleSlug, documentType, issuingBody, issuedDate, effectiveDate,
      expirationDate, status, preamble, keywords, summary, jurisdiction, sourceOrigin, sourceUrl,
      applicableEntities, legalDomains, legalSummary, semanticId,
    } = req.body;

    const doc = await prisma.document.create({
      data: {
        documentNumber,
        title,
        titleSlug: titleSlug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        documentType,
        issuingBody,
        issuedDate: new Date(issuedDate),
        effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
        expirationDate: expirationDate ? new Date(expirationDate) : undefined,
        status: status || 'EFFECTIVE',
        preamble,
        keywords: keywords || [],
        summary,
        jurisdiction: jurisdiction || 'viet_nam',
        sourceOrigin,
        sourceUrl,
        applicableEntities: applicableEntities || [],
        legalDomains: legalDomains || [],
        legalSummary,
        semanticId: semanticId || null,
      },
    });

    res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/documents/:id
router.get('/:id', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { articles: true } },
        relatedFrom: { include: { toDocument: { select: { id: true, documentNumber: true, title: true } } } },
        relatedTo: { include: { fromDocument: { select: { id: true, documentNumber: true, title: true } } } },
      },
    });

    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    res.json(doc);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/documents/:id
router.put('/:id', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const {
      documentNumber, title, titleSlug, documentType, issuingBody, issuedDate, effectiveDate,
      expirationDate, status, preamble, keywords, summary, jurisdiction, sourceOrigin, sourceUrl,
      applicableEntities, legalDomains, legalSummary, semanticId,
    } = req.body;

    const doc = await prisma.document.update({
      where: { id: req.params.id },
      data: {
        ...(documentNumber && { documentNumber }),
        ...(title && { title }),
        ...(titleSlug && { titleSlug }),
        ...(documentType && { documentType }),
        ...(issuingBody && { issuingBody }),
        ...(issuedDate && { issuedDate: new Date(issuedDate) }),
        ...(effectiveDate !== undefined && { effectiveDate: effectiveDate ? new Date(effectiveDate) : null }),
        ...(expirationDate !== undefined && { expirationDate: expirationDate ? new Date(expirationDate) : null }),
        ...(status && { status }),
        ...(preamble !== undefined && { preamble }),
        ...(keywords && { keywords }),
        ...(summary !== undefined && { summary }),
        ...(jurisdiction && { jurisdiction }),
        ...(sourceOrigin !== undefined && { sourceOrigin }),
        ...(sourceUrl !== undefined && { sourceUrl }),
        ...(applicableEntities && { applicableEntities }),
        ...(legalDomains && { legalDomains }),
        ...(legalSummary !== undefined && { legalSummary }),
        ...(semanticId !== undefined && { semanticId: semanticId || null }),
      },
    });

    res.json(doc);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/documents/:id
router.delete('/:id', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    await prisma.document.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/documents/:id/json-articles
// Ingest structured article data from JSON upload. Supports two formats:
//   Legacy:  { article_number, title?, content }
//   New:     { article_number, semantic_id?, title?, effective_from?, effective_to?,
//               clauses: [{ semantic_id, clause_number, legal_text, plain_summary?, ai_metadata? }] }
// Clause-based articles: content/contentHtml are derived from clause texts (JSON is source of truth).
// Output: { success, articleCount, clauseCount }
// NOTE: Replaces all existing articles + clauses for this document atomically.
router.post('/:id/json-articles', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const { articles } = req.body;

    if (!Array.isArray(articles) || articles.length === 0) {
      res.status(400).json({ error: 'articles must be a non-empty array' });
      return;
    }

    const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Validate each article: needs article_number + (clauses OR content)
    for (const a of articles) {
      if (typeof a.article_number !== 'number') {
        res.status(400).json({ error: 'Each article requires article_number (number)' });
        return;
      }
      const hasClauses = Array.isArray(a.clauses) && a.clauses.length > 0;
      const hasContent = typeof a.content === 'string' && a.content.length > 0;
      if (!hasClauses && !hasContent) {
        res.status(400).json({
          error: `Article ${a.article_number}: requires either "clauses" array or "content" string`,
        });
        return;
      }
      if (hasClauses) {
        for (const c of a.clauses) {
          if (!c.semantic_id || typeof c.clause_number !== 'number' || typeof c.legal_text !== 'string') {
            res.status(400).json({
              error: `Article ${a.article_number}: each clause requires semantic_id, clause_number (number), legal_text (string)`,
            });
            return;
          }
        }
      }
    }

    const slug = doc.titleSlug;

    // Deduplicate by article_number (last entry wins)
    const seen = new Map<number, Record<string, unknown>>();
    for (const a of articles) seen.set(a.article_number, a);
    const deduped = Array.from(seen.values());

    // Pre-generate article IDs so clause rows can reference them without a findMany inside the
    // transaction. This lets us use the non-interactive array-form $transaction, which is safe
    // with Supabase PgBouncer in transaction mode (callback form holds a connection across JS
    // execution, which is incompatible with connection poolers).
    const articlesData: Record<string, unknown>[] = [];
    const allClauses: Record<string, unknown>[] = [];

    for (let idx = 0; idx < deduped.length; idx++) {
      const a = deduped[idx];
      const hasClauses = Array.isArray(a.clauses) && (a.clauses as unknown[]).length > 0;

      let content: string;
      let contentHtml: string;

      if (hasClauses) {
        // Derive plain text + HTML from structured clauses (JSON is source of truth, not HTML)
        const clauses = a.clauses as Record<string, unknown>[];
        content = clauses
          .map(c => `${c.clause_number}. ${c.legal_text}`)
          .join('\n');
        contentHtml = clauses
          .map(c => {
            const safe = (c.legal_text as string)
              .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            // id= on <p> enables direct clause deep-linking via #semanticId anchors
            return `<p id="${c.semantic_id}"><strong>${c.clause_number}.</strong> ${safe}</p>`;
          })
          .join('');
      } else {
        content = a.content as string;
        contentHtml = content
          .split('\n')
          .map((l: string) => l.trim())
          .filter((l: string) => l.length > 0)
          .map((l: string) =>
            `<p>${l.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`
          )
          .join('');
      }

      const articleDbId = randomUUID();
      articlesData.push({
        id: articleDbId,
        documentId: req.params.id,
        articleNumber: String(a.article_number),
        articleId: `${slug}:${a.article_number}`,
        semanticId: (a.semantic_id as string) || null,
        title: (a.title as string) || '',
        content,
        contentHtml,
        effectiveFrom: a.effective_from ? new Date(a.effective_from as string) : null,
        effectiveTo: a.effective_to ? new Date(a.effective_to as string) : null,
        orderIndex: idx,
        keywords: [],
        legalTopics: [],
      });

      if (hasClauses) {
        const clauses = a.clauses as Record<string, unknown>[];
        for (const c of clauses) {
          allClauses.push({
            semanticId: c.semantic_id as string,
            articleId: articleDbId,
            clauseNumber: c.clause_number as number,
            legalText: c.legal_text as string,
            plainSummary: (c.plain_summary as string) || null,
            normType: ((c.ai_metadata as Record<string, unknown>)?.norm_type as string) || null,
            riskLevel: ((c.ai_metadata as Record<string, unknown>)?.risk_level as string) || null,
            appliesTo: ((c.ai_metadata as Record<string, unknown>)?.applies_to as string[]) || [],
            effectiveFrom: a.effective_from ? new Date(a.effective_from as string) : null,
            effectiveTo: a.effective_to ? new Date(a.effective_to as string) : null,
          });
        }
      }
    }

    // Atomic replacement using the non-interactive array-form $transaction.
    // All data is pre-built in JS so no findMany is needed inside the transaction —
    // the DB sees only three sequential bulk operations inside a single BEGIN/COMMIT.
    await prisma.$transaction([
      prisma.article.deleteMany({ where: { documentId: req.params.id } }),
      prisma.article.createMany({ data: articlesData as Parameters<typeof prisma.article.createMany>[0]['data'] }),
      ...(allClauses.length > 0
        ? [prisma.clause.createMany({ data: allClauses as Parameters<typeof prisma.clause.createMany>[0]['data'] })]
        : []),
    ]);

    res.json({ success: true, articleCount: articlesData.length, clauseCount: allClauses.length });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/documents/:id/upload
router.post('/:id/upload', requireAdmin, upload.single('file'), async (req: Request, res: Response, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const parsed = await parseDocx(req.file.buffer);

    // Save full text to document
    await prisma.document.update({
      where: { id: req.params.id },
      data: { fullText: parsed.rawText },
    });

    // Delete existing articles and create new ones
    await prisma.article.deleteMany({ where: { documentId: req.params.id } });

    const slug = doc.titleSlug;
    const articlesData = parsed.articles.map(a => ({
      documentId: req.params.id,
      articleNumber: a.articleNumber,
      articleId: `${slug}:${a.articleNumber}`,
      title: a.title,
      content: a.content,
      chapterNumber: a.chapterNumber,
      chapterTitle: a.chapterTitle,
      sectionNumber: a.sectionNumber,
      sectionTitle: a.sectionTitle,
      orderIndex: a.orderIndex,
      keywords: [],
      legalTopics: [],
    }));

    await prisma.article.createMany({ data: articlesData });

    res.json({
      success: true,
      articleCount: articlesData.length,
      rawTextLength: parsed.rawText.length,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
