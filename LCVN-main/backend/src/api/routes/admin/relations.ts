import { Router, Response, Request } from 'express';
import { prisma } from '../../../services/prisma.js';
import { requireAdmin } from '../../middleware/adminAuth.js';

const router = Router();

// GET /api/admin/relations/document/:docId
router.get('/document/:docId', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const [fromRelations, toRelations] = await Promise.all([
      prisma.documentRelation.findMany({
        where: { fromDocumentId: req.params.docId },
        include: { toDocument: { select: { id: true, documentNumber: true, title: true } } },
      }),
      prisma.documentRelation.findMany({
        where: { toDocumentId: req.params.docId },
        include: { fromDocument: { select: { id: true, documentNumber: true, title: true } } },
      }),
    ]);
    res.json({ fromRelations, toRelations });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/relations
router.post('/', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const { fromDocumentId, toDocumentId, relationType, description } = req.body;

    const relation = await prisma.documentRelation.create({
      data: { fromDocumentId, toDocumentId, relationType, description },
      include: {
        fromDocument: { select: { id: true, documentNumber: true, title: true } },
        toDocument: { select: { id: true, documentNumber: true, title: true } },
      },
    });

    res.status(201).json(relation);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/relations/:id
router.delete('/:id', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    await prisma.documentRelation.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
