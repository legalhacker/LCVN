import { Router, Response } from 'express';
import { prisma } from '../../../services/prisma.js';
import { requireAdmin } from '../../middleware/adminAuth.js';
import { AuthRequest } from '../../middleware/auth.js';

const router = Router();

// GET /api/admin/stats
router.get('/', requireAdmin, async (_req: AuthRequest, res: Response, next) => {
  try {
    const [totalDocuments, totalArticles, recentDocuments, totalPages, totalUpdates, recentUpdates] =
      await Promise.all([
        prisma.document.count(),
        prisma.article.count(),
        prisma.document.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, documentNumber: true, title: true, documentType: true, status: true, createdAt: true },
        }),
        prisma.cmsPage.count(),
        prisma.legalUpdate.count(),
        prisma.legalUpdate.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, title: true, publishDate: true, isPublished: true, createdAt: true },
        }),
      ]);

    res.json({
      totalDocuments,
      totalArticles,
      recentDocuments,
      totalPages,
      totalUpdates,
      recentUpdates,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
