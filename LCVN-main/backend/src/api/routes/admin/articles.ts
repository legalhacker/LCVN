import { Router, Response, Request } from 'express';
import { prisma } from '../../../services/prisma.js';
import { requireAdmin } from '../../middleware/adminAuth.js';

const router = Router();

// GET /api/admin/articles/document/:docId
router.get('/document/:docId', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const articles = await prisma.article.findMany({
      where: { documentId: req.params.docId },
      orderBy: { orderIndex: 'asc' },
    });
    res.json(articles);
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/articles/document/:docId
router.post('/document/:docId', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const doc = await prisma.document.findUnique({ where: { id: req.params.docId } });
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const {
      articleNumber, title, content, contentHtml, chapterNumber, chapterTitle,
      sectionNumber, sectionTitle, orderIndex, keywords, summary, legalTopics,
      articleType, subjectMatter, importance, normativeType, complianceActions,
      penaltyReference, confidenceLevel,
    } = req.body;

    const article = await prisma.article.create({
      data: {
        documentId: req.params.docId,
        articleNumber,
        articleId: `${doc.titleSlug}:${articleNumber}`,
        title,
        content,
        contentHtml,
        chapterNumber,
        chapterTitle,
        sectionNumber,
        sectionTitle,
        orderIndex: orderIndex ?? 0,
        keywords: keywords || [],
        summary,
        legalTopics: legalTopics || [],
        articleType,
        subjectMatter,
        importance: importance ?? 1,
        normativeType,
        complianceActions,
        penaltyReference: penaltyReference ?? false,
        confidenceLevel: confidenceLevel || 'HIGH',
      },
    });

    res.status(201).json(article);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/articles/search?q=&excludeDocumentId= — search articles across other documents
router.get('/search', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const q = (req.query.q as string || '').trim();
    const excludeDocumentId = req.query.excludeDocumentId as string | undefined;

    const where: any = {};
    // Exclude articles from the caller's current document so only cross-document results appear
    if (excludeDocumentId) where.documentId = { not: excludeDocumentId };
    if (q) {
      where.OR = [
        { articleNumber: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
      ];
    }

    const articles = await prisma.article.findMany({
      where,
      take: 20,
      orderBy: [{ documentId: 'asc' }, { orderIndex: 'asc' }],
      select: {
        id: true,
        semanticId: true,
        articleNumber: true,
        title: true,
        document: {
          select: {
            id: true,
            documentNumber: true,
            title: true,
            titleSlug: true,
          },
        },
      },
    });

    res.json(articles);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/articles/:id
router.get('/:id', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: req.params.id },
      include: { document: { select: { id: true, documentNumber: true, title: true, titleSlug: true } } },
    });
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    res.json(article);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/articles/:id
router.put('/:id', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const {
      title, content, contentHtml, chapterNumber, chapterTitle, sectionNumber, sectionTitle,
      orderIndex, keywords, summary, legalTopics, articleType, subjectMatter, importance,
      hasPracticalReferences, normativeType, complianceActions, penaltyReference, confidenceLevel,
    } = req.body;

    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(contentHtml !== undefined && { contentHtml }),
        ...(chapterNumber !== undefined && { chapterNumber }),
        ...(chapterTitle !== undefined && { chapterTitle }),
        ...(sectionNumber !== undefined && { sectionNumber }),
        ...(sectionTitle !== undefined && { sectionTitle }),
        ...(orderIndex !== undefined && { orderIndex }),
        ...(keywords && { keywords }),
        ...(summary !== undefined && { summary }),
        ...(legalTopics && { legalTopics }),
        ...(articleType !== undefined && { articleType }),
        ...(subjectMatter !== undefined && { subjectMatter }),
        ...(importance !== undefined && { importance }),
        ...(hasPracticalReferences !== undefined && { hasPracticalReferences }),
        ...(normativeType !== undefined && { normativeType }),
        ...(complianceActions !== undefined && { complianceActions }),
        ...(penaltyReference !== undefined && { penaltyReference }),
        ...(confidenceLevel !== undefined && { confidenceLevel }),
      },
    });

    res.json(article);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/articles/:id
router.delete('/:id', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    await prisma.article.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/articles/document/:docId/reorder
router.put('/document/:docId/reorder', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const { order } = req.body as { order: Array<{ id: string; orderIndex: number }> };

    await Promise.all(
      order.map(({ id, orderIndex }) =>
        prisma.article.update({ where: { id }, data: { orderIndex } })
      )
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
