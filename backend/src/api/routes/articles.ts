import { Router, Response } from 'express';
import { prisma } from '../../services/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { optionalAuth, authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/articles/:articleId - Get article by stable ID with full content
router.get('/:articleId', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const { articleId } = req.params;

    const article = await prisma.article.findUnique({
      where: { articleId },
      include: {
        document: {
          select: {
            id: true,
            documentNumber: true,
            title: true,
            titleSlug: true,
            documentType: true,
            status: true,
          },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 5,
        },
      },
    });

    if (!article) {
      throw new AppError('Article not found', 404, 'ARTICLE_NOT_FOUND');
    }

    // Return article with all fields including content
    res.json(article);
  } catch (error) {
    next(error);
  }
});

// GET /api/articles/:articleId/content - Get article with full HTML content
router.get('/:articleId/content', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const { articleId } = req.params;

    const article = await prisma.article.findUnique({
      where: { articleId },
      select: {
        id: true,
        articleId: true,
        articleNumber: true,
        title: true,
        content: true,
        contentHtml: true,
        keywords: true,
        summary: true,
        hasPracticalReferences: true,
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

    if (!article) {
      throw new AppError('Article not found', 404, 'ARTICLE_NOT_FOUND');
    }

    res.json(article);
  } catch (error) {
    next(error);
  }
});

// GET /api/articles/:articleId/resources - Get practical references for article
router.get('/:articleId/resources', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const { articleId } = req.params;
    const tab = req.query.tab as string; // 'cases', 'expert', 'workspace'

    const article = await prisma.article.findUnique({
      where: { articleId },
      select: { id: true },
    });

    if (!article) {
      throw new AppError('Article not found', 404, 'ARTICLE_NOT_FOUND');
    }

    // Tab 1: Court cases and administrative penalties
    if (!tab || tab === 'cases') {
      const cases = await prisma.articleResource.findMany({
        where: {
          articleId: article.id,
          resourceType: { in: ['COURT_CASE', 'ADMIN_PENALTY'] },
        },
        orderBy: { publishedDate: 'desc' },
      });

      if (tab === 'cases') {
        return res.json({ cases });
      }
    }

    // Tab 2: Expert articles
    if (!tab || tab === 'expert') {
      const expertArticles = await prisma.articleResource.findMany({
        where: {
          articleId: article.id,
          resourceType: { in: ['EXPERT_ARTICLE', 'LAW_FIRM_PUBLICATION', 'ACADEMIC_PAPER'] },
        },
        orderBy: { publishedDate: 'desc' },
      });

      if (tab === 'expert') {
        return res.json({ expertArticles });
      }
    }

    // Tab 3: Workspace notes (requires auth and workspace membership)
    let workspaceNotes: any[] = [];
    if (!tab || tab === 'workspace') {
      if (req.user) {
        // Get user's workspaces
        const memberships = await prisma.workspaceMember.findMany({
          where: { userId: req.user.id },
          select: { workspaceId: true },
        });

        const workspaceIds = memberships.map(m => m.workspaceId);

        workspaceNotes = await prisma.workspaceNote.findMany({
          where: {
            articleId,
            workspaceId: { in: workspaceIds },
          },
          include: {
            workspace: {
              select: { name: true, slug: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
        });
      }

      if (tab === 'workspace') {
        return res.json({ workspaceNotes });
      }
    }

    // Return all tabs
    const [cases, expertArticles] = await Promise.all([
      prisma.articleResource.findMany({
        where: {
          articleId: article.id,
          resourceType: { in: ['COURT_CASE', 'ADMIN_PENALTY'] },
        },
        orderBy: { publishedDate: 'desc' },
      }),
      prisma.articleResource.findMany({
        where: {
          articleId: article.id,
          resourceType: { in: ['EXPERT_ARTICLE', 'LAW_FIRM_PUBLICATION', 'ACADEMIC_PAPER'] },
        },
        orderBy: { publishedDate: 'desc' },
      }),
    ]);

    res.json({
      cases,
      expertArticles,
      workspaceNotes,
      disclaimer: 'All information is for reference only. This does not constitute legal advice.',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/articles/:articleId/annotations - Get annotations for article
router.get('/:articleId/annotations', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { articleId } = req.params;
    const workspaceId = req.query.workspaceId as string;

    const article = await prisma.article.findUnique({
      where: { articleId },
      select: { id: true },
    });

    if (!article) {
      throw new AppError('Article not found', 404, 'ARTICLE_NOT_FOUND');
    }

    // Build query for annotations
    const where: any = {
      articleId: article.id,
      OR: [
        // User's private annotations
        { userId: req.user!.id, visibility: 'PRIVATE' },
      ],
    };

    // If workspace specified, include workspace annotations
    if (workspaceId) {
      // Verify membership
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: req.user!.id,
          },
        },
      });

      if (membership) {
        where.OR.push({
          workspaceId,
          visibility: 'WORKSPACE',
        });
      }
    }

    const annotations = await prisma.annotation.findMany({
      where,
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        mentions: {
          include: {
            mentionedUser: {
              select: { id: true, fullName: true },
            },
          },
        },
      },
      orderBy: { startOffset: 'asc' },
    });

    res.json(annotations);
  } catch (error) {
    next(error);
  }
});

// GET /api/articles/:articleId/navigation - Get prev/next articles for navigation
router.get('/:articleId/navigation', async (req, res: Response, next) => {
  try {
    const { articleId } = req.params;

    const article = await prisma.article.findUnique({
      where: { articleId },
      select: { id: true, documentId: true, orderIndex: true },
    });

    if (!article) {
      throw new AppError('Article not found', 404, 'ARTICLE_NOT_FOUND');
    }

    // Get prev and next articles in the same document
    const [prev, next_] = await Promise.all([
      prisma.article.findFirst({
        where: {
          documentId: article.documentId,
          orderIndex: { lt: article.orderIndex },
        },
        orderBy: { orderIndex: 'desc' },
        select: {
          articleId: true,
          articleNumber: true,
          title: true,
        },
      }),
      prisma.article.findFirst({
        where: {
          documentId: article.documentId,
          orderIndex: { gt: article.orderIndex },
        },
        orderBy: { orderIndex: 'asc' },
        select: {
          articleId: true,
          articleNumber: true,
          title: true,
        },
      }),
    ]);

    res.json({ prev, next: next_ });
  } catch (error) {
    next(error);
  }
});

export default router;
