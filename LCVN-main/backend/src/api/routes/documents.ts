import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/documents - List documents with filters
router.get('/', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const documentType = req.query.type as string;
    const status = req.query.status as string;
    const issuingBody = req.query.issuingBody as string;
    const year = parseInt(req.query.year as string);

    const where: any = {};

    if (documentType) {
      where.documentType = documentType;
    }
    if (status) {
      where.status = status;
    }
    if (issuingBody) {
      where.issuingBody = { contains: issuingBody, mode: 'insensitive' };
    }
    if (year) {
      where.issuedDate = {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      };
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        select: {
          id: true,
          documentNumber: true,
          title: true,
          titleSlug: true,
          documentType: true,
          issuingBody: true,
          issuedDate: true,
          effectiveDate: true,
          status: true,
          keywords: true,
          _count: {
            select: { articles: true },
          },
        },
        orderBy: { issuedDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.document.count({ where }),
    ]);

    res.json({
      data: documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/:slug - Get document by slug
router.get('/:slug', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const { slug } = req.params;

    const document = await prisma.document.findUnique({
      where: { titleSlug: slug },
      include: {
        articles: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            articleId: true,
            articleNumber: true,
            title: true,
            chapterNumber: true,
            chapterTitle: true,
            sectionNumber: true,
            sectionTitle: true,
            hasPracticalReferences: true,
          },
        },
        relatedFrom: {
          include: {
            toDocument: {
              select: {
                id: true,
                documentNumber: true,
                title: true,
                titleSlug: true,
              },
            },
          },
        },
        relatedTo: {
          include: {
            fromDocument: {
              select: {
                id: true,
                documentNumber: true,
                title: true,
                titleSlug: true,
              },
            },
          },
        },
      },
    });

    if (!document) {
      throw new AppError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
    }

    // Build table of contents structure
    const tableOfContents = buildTableOfContents(document.articles);

    res.json({
      ...document,
      tableOfContents,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/:slug/full - Get document with full article content
router.get('/:slug/full', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const { slug } = req.params;

    const document = await prisma.document.findUnique({
      where: { titleSlug: slug },
      include: {
        articles: {
          orderBy: { orderIndex: 'asc' },
          include: {
            relationsTo: {
              include: {
                fromArticle: {
                  select: {
                    id: true,
                    articleNumber: true,
                    title: true,
                    document: {
                      select: {
                        documentNumber: true,
                        title: true,
                        titleSlug: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!document) {
      throw new AppError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
    }

    res.json(document);
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/stats/overview - Get document statistics
router.get('/stats/overview', async (_req, res: Response, next) => {
  try {
    const [
      totalDocuments,
      byType,
      byStatus,
      recentDocuments,
    ] = await Promise.all([
      prisma.document.count(),
      prisma.document.groupBy({
        by: ['documentType'],
        _count: { id: true },
      }),
      prisma.document.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.document.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          documentNumber: true,
          title: true,
          titleSlug: true,
          documentType: true,
          issuedDate: true,
        },
      }),
    ]);

    res.json({
      totalDocuments,
      byType: byType.map(t => ({ type: t.documentType, count: t._count.id })),
      byStatus: byStatus.map(s => ({ status: s.status, count: s._count.id })),
      recentDocuments,
    });
  } catch (error) {
    next(error);
  }
});

// Helper to build table of contents
interface ArticleToc {
  id: string;
  articleId: string;
  articleNumber: string;
  title: string | null;
  hasPracticalReferences: boolean;
}

interface TocSection {
  sectionNumber: string | null;
  sectionTitle: string | null;
  articles: ArticleToc[];
}

interface TocChapter {
  chapterNumber: string | null;
  chapterTitle: string | null;
  sections: TocSection[];
  articles: ArticleToc[]; // Articles without section
}

function buildTableOfContents(articles: any[]): TocChapter[] {
  const chapters: TocChapter[] = [];
  let currentChapter: TocChapter | null = null;
  let currentSection: TocSection | null = null;

  for (const article of articles) {
    // New chapter
    if (article.chapterNumber && article.chapterNumber !== currentChapter?.chapterNumber) {
      currentChapter = {
        chapterNumber: article.chapterNumber,
        chapterTitle: article.chapterTitle,
        sections: [],
        articles: [],
      };
      chapters.push(currentChapter);
      currentSection = null;
    }

    // New section
    if (article.sectionNumber && article.sectionNumber !== currentSection?.sectionNumber) {
      currentSection = {
        sectionNumber: article.sectionNumber,
        sectionTitle: article.sectionTitle,
        articles: [],
      };
      if (currentChapter) {
        currentChapter.sections.push(currentSection);
      }
    }

    const articleToc: ArticleToc = {
      id: article.id,
      articleId: article.articleId,
      articleNumber: article.articleNumber,
      title: article.title,
      hasPracticalReferences: article.hasPracticalReferences,
    };

    if (currentSection) {
      currentSection.articles.push(articleToc);
    } else if (currentChapter) {
      currentChapter.articles.push(articleToc);
    } else {
      // No chapter structure - create a default one
      if (chapters.length === 0) {
        chapters.push({
          chapterNumber: null,
          chapterTitle: null,
          sections: [],
          articles: [],
        });
      }
      chapters[0].articles.push(articleToc);
    }
  }

  return chapters;
}

export default router;
