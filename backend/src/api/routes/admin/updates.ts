import { Router, Response, Request } from 'express';
import { prisma } from '../../../services/prisma.js';
import { requireAdmin } from '../../middleware/adminAuth.js';
import { AuthRequest } from '../../middleware/auth.js';

const router = Router();

// GET /api/admin/updates
router.get('/', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const page = parseInt(String(req.query.page || 1));
    const limit = parseInt(String(req.query.limit || 20));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.legalUpdate.findMany({
        skip,
        take: limit,
        orderBy: { publishDate: 'desc' },
      }),
      prisma.legalUpdate.count(),
    ]);

    res.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/updates
router.post('/', requireAdmin, async (req: AuthRequest, res: Response, next) => {
  try {
    const { title, summary, content, publishDate, isHighlighted, isPublished, relatedDocIds } = req.body;

    const update = await prisma.legalUpdate.create({
      data: {
        title,
        summary,
        content,
        publishDate: new Date(publishDate),
        isHighlighted: isHighlighted ?? false,
        isPublished: isPublished ?? false,
        relatedDocIds: relatedDocIds || [],
        createdById: req.user!.id,
      },
    });

    res.status(201).json(update);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/updates/:id
router.get('/:id', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const update = await prisma.legalUpdate.findUnique({ where: { id: req.params.id } });
    if (!update) {
      res.status(404).json({ error: 'Update not found' });
      return;
    }
    res.json(update);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/updates/:id
router.put('/:id', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const { title, summary, content, publishDate, isHighlighted, isPublished, relatedDocIds } = req.body;

    const update = await prisma.legalUpdate.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(summary !== undefined && { summary }),
        ...(content !== undefined && { content }),
        ...(publishDate && { publishDate: new Date(publishDate) }),
        ...(isHighlighted !== undefined && { isHighlighted }),
        ...(isPublished !== undefined && { isPublished }),
        ...(relatedDocIds && { relatedDocIds }),
      },
    });

    res.json(update);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/updates/:id
router.delete('/:id', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    await prisma.legalUpdate.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
