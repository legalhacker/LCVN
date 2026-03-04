import { Router, Response, Request } from 'express';
import { prisma } from '../../services/prisma.js';

const router = Router();

// GET /api/updates?page=1&limit=20&highlighted=true
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const page = parseInt(String(req.query.page || 1));
    const limit = parseInt(String(req.query.limit || 20));
    const skip = (page - 1) * limit;
    const onlyHighlighted = req.query.highlighted === 'true';

    const where = {
      isPublished: true,
      ...(onlyHighlighted && { isHighlighted: true }),
    };

    const [data, total] = await Promise.all([
      prisma.legalUpdate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishDate: 'desc' },
        select: {
          id: true,
          title: true,
          summary: true,
          publishDate: true,
          isHighlighted: true,
          relatedDocIds: true,
          downloadUrl: true,
          downloadFileName: true,
          downloadFileSize: true,
        },
      }),
      prisma.legalUpdate.count({ where }),
    ]);

    res.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
});

// GET /api/updates/:id
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const update = await prisma.legalUpdate.findFirst({
      where: { id: req.params.id, isPublished: true },
    });
    if (!update) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(update);
  } catch (error) {
    next(error);
  }
});

export default router;
