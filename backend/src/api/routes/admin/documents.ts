import { Router, Response, Request } from 'express';
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
      applicableEntities, legalDomains, legalSummary,
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
      applicableEntities, legalDomains, legalSummary,
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
