import { Router, Response, Request } from 'express';
import { prisma } from '../../../services/prisma.js';
import { requireAdmin } from '../../middleware/adminAuth.js';
import { AuthRequest } from '../../middleware/auth.js';

const router = Router();

// Shared include for article + document info
const articleInclude = {
  select: {
    id: true,
    semanticId: true,
    articleNumber: true,
    title: true,
    document: {
      select: { id: true, documentNumber: true, title: true, titleSlug: true },
    },
  },
} as const;

// Format a relation as a structured LCG edge
function toEdge(rel: any, sourceArticle?: any) {
  return {
    edge_id: rel.id,
    source_id: (rel.fromArticle?.semanticId ?? sourceArticle?.semanticId) || null,
    target_id: (rel.toArticle?.semanticId ?? null),
    relationship_type: rel.relationType,
    notes: rel.note ?? null,
    created_by: rel.createdBy ?? null,
    created_at: rel.createdAt,
    // Full article objects for UI consumption
    fromArticle: rel.fromArticle,
    toArticle: rel.toArticle,
  };
}

// GET /api/admin/article-relations/article/:articleId
// Returns { relationsFrom, relationsTo } as structured edges
router.get('/article/:articleId', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const { articleId } = req.params;
    const { type } = req.query; // optional filter by relationType

    const typeFilter = type ? { relationType: type as any } : {};

    const [relationsFrom, relationsTo] = await Promise.all([
      prisma.articleRelation.findMany({
        where: { fromArticleId: articleId, ...typeFilter },
        include: {
          fromArticle: articleInclude,
          toArticle: articleInclude,
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.articleRelation.findMany({
        where: { toArticleId: articleId, ...typeFilter },
        include: {
          fromArticle: articleInclude,
          toArticle: articleInclude,
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    res.json({
      relationsFrom: relationsFrom.map(r => toEdge(r)),
      relationsTo: relationsTo.map(r => toEdge(r)),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/article-relations — create a directed edge
router.post('/', requireAdmin, async (req: AuthRequest, res: Response, next) => {
  try {
    const { fromArticleId, toArticleId, relationType, note } = req.body;

    if (!fromArticleId || !toArticleId || !relationType) {
      res.status(400).json({ error: 'fromArticleId, toArticleId and relationType are required' });
      return;
    }
    if (fromArticleId === toArticleId) {
      res.status(400).json({ error: 'An article cannot be linked to itself' });
      return;
    }

    const relation = await prisma.articleRelation.create({
      data: {
        fromArticleId,
        toArticleId,
        relationType,
        note: note || null,
        createdBy: req.user?.email ?? null,
      },
      include: {
        fromArticle: articleInclude,
        toArticle: articleInclude,
      },
    });

    res.status(201).json(toEdge(relation));
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Liên kết này đã tồn tại' });
      return;
    }
    next(error);
  }
});

// POST /api/admin/article-relations/import — bulk import from JSON
// Body: { relations: [{ from, to, type, notes }] }  where from/to are semanticId strings
router.post('/import', requireAdmin, async (req: AuthRequest, res: Response, next) => {
  try {
    const items: Array<{ from: string; to: string; type: string; notes?: string }> =
      req.body.relations || [];

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Body must be { relations: [...] }' });
      return;
    }

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        const [fromArticle, toArticle] = await Promise.all([
          prisma.article.findUnique({ where: { semanticId: item.from }, select: { id: true } }),
          prisma.article.findUnique({ where: { semanticId: item.to }, select: { id: true } }),
        ]);

        if (!fromArticle) { errors.push(`from semanticId not found: ${item.from}`); continue; }
        if (!toArticle)   { errors.push(`to semanticId not found: ${item.to}`); continue; }
        if (fromArticle.id === toArticle.id) { errors.push(`self-link skipped: ${item.from}`); continue; }

        await prisma.articleRelation.create({
          data: {
            fromArticleId: fromArticle.id,
            toArticleId: toArticle.id,
            relationType: item.type as any,
            note: item.notes || null,
            createdBy: req.user?.email ?? 'import',
          },
        });
        created++;
      } catch (e: any) {
        if (e.code === 'P2002') { skipped++; } // duplicate
        else { errors.push(`${item.from} → ${item.to}: ${e.message}`); }
      }
    }

    res.json({ created, skipped, errors });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/article-relations/:id
router.delete('/:id', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    await prisma.articleRelation.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
