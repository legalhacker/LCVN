import { Router, Response, Request } from 'express';
import { prisma } from '../../../services/prisma.js';
import { requireAdmin } from '../../middleware/adminAuth.js';
import { AuthRequest } from '../../middleware/auth.js';

const router = Router();

// GET /api/admin/pages
router.get('/', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const page = parseInt(String(req.query.page || 1));
    const limit = parseInt(String(req.query.limit || 20));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.cmsPage.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.cmsPage.count(),
    ]);

    res.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/pages
router.post('/', requireAdmin, async (req: AuthRequest, res: Response, next) => {
  try {
    const { slug, title, content, seoTitle, seoDescription, isPublished } = req.body;

    const cmsPage = await prisma.cmsPage.create({
      data: {
        slug,
        title,
        content,
        seoTitle,
        seoDescription,
        isPublished: isPublished ?? false,
        createdById: req.user!.id,
      },
    });

    res.status(201).json(cmsPage);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/pages/:id
router.get('/:id', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const cmsPage = await prisma.cmsPage.findUnique({ where: { id: req.params.id } });
    if (!cmsPage) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }
    res.json(cmsPage);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/pages/:id
router.put('/:id', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const { slug, title, content, seoTitle, seoDescription, isPublished } = req.body;

    const cmsPage = await prisma.cmsPage.update({
      where: { id: req.params.id },
      data: {
        ...(slug && { slug }),
        ...(title && { title }),
        ...(content !== undefined && { content }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    res.json(cmsPage);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/pages/:id
router.delete('/:id', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    await prisma.cmsPage.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
