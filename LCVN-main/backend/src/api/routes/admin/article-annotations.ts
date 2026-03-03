import { Router, Response, Request } from 'express';
import { prisma } from '../../../services/prisma.js';
import { requireAdmin } from '../../middleware/adminAuth.js';
import { AuthRequest } from '../../middleware/auth.js';

const router = Router();

// GET /api/admin/article-annotations?nodeId=&type=&visibility=
router.get('/', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const { nodeId, type, visibility } = req.query;

    const where: any = {};
    if (nodeId) where.nodeId = nodeId as string;
    if (type) where.type = type as string;
    if (visibility) where.visibility = visibility as string;

    const annotations = await prisma.articleAnnotation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(annotations);
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/article-annotations
router.post('/', requireAdmin, async (req: AuthRequest, res: Response, next) => {
  try {
    const { nodeId, type, title, content, tags, visibility } = req.body;

    if (!nodeId || !type || !title || !content) {
      res.status(400).json({ error: 'nodeId, type, title and content are required' });
      return;
    }

    const annotation = await prisma.articleAnnotation.create({
      data: {
        nodeId,
        type,
        title,
        content,
        tags: tags || [],
        visibility: visibility || 'public',
        createdBy: req.user?.email ?? 'admin',
      },
    });

    res.status(201).json(annotation);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/article-annotations/:id
router.put('/:id', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const { type, title, content, tags, visibility } = req.body;

    const annotation = await prisma.articleAnnotation.update({
      where: { id: req.params.id },
      data: {
        ...(type !== undefined && { type }),
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(tags !== undefined && { tags }),
        ...(visibility !== undefined && { visibility }),
      },
    });

    res.json(annotation);
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/article-annotations/import — bulk import from JSON
// Body: { annotations: [{ node_id, type, title, content, tags, visibility }] }
router.post('/import', requireAdmin, async (req: AuthRequest, res: Response, next) => {
  try {
    const items: Array<{
      node_id: string; type: string; title: string; content: string;
      tags?: string[]; visibility?: string;
    }> = req.body.annotations || [];

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Body must be { annotations: [...] }' });
      return;
    }

    let created = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        if (!item.node_id || !item.type || !item.title || !item.content) {
          errors.push(`Missing required fields for entry: ${JSON.stringify(item).substring(0, 60)}`);
          continue;
        }
        await prisma.articleAnnotation.create({
          data: {
            nodeId: item.node_id,
            type: item.type as any,
            title: item.title,
            content: item.content,
            tags: item.tags || [],
            visibility: (item.visibility as any) || 'public',
            createdBy: req.user?.email ?? 'import',
          },
        });
        created++;
      } catch (e: any) {
        errors.push(`${item.node_id}: ${e.message}`);
      }
    }

    res.json({ created, errors });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/article-annotations/:id
router.delete('/:id', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    await prisma.articleAnnotation.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
