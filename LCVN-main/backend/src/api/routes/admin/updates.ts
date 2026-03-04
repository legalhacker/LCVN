import { Router, Response, Request } from 'express';
import { prisma } from '../../../services/prisma.js';
import { requireAdmin } from '../../middleware/adminAuth.js';
import { AuthRequest } from '../../middleware/auth.js';
import jwt from 'jsonwebtoken';
import { config } from '../../../config/index.js';

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

// POST /api/admin/updates/:id/file — Vercel Blob client upload handler
router.post('/:id/file', async (req: Request, res: Response, next) => {
  try {
    const updateId = req.params.id;
    const { handleUpload } = await import('@vercel/blob/client') as any;

    const webReq = {
      headers: { get: (key: string) => req.get(key) ?? null },
    } as unknown as globalThis.Request;

    const jsonResponse = await handleUpload({
      body: req.body,
      request: webReq,
      onBeforeGenerateToken: async (_pathname: string, clientPayload?: string) => {
        const { jwtToken, fileSize = 0 } = clientPayload ? JSON.parse(clientPayload) : {};
        if (!jwtToken) throw new Error('Authentication required');
        const decoded = jwt.verify(jwtToken, config.jwt.secret) as { userId: string };
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { isAdmin: true, isActive: true },
        });
        if (!user?.isActive || !user?.isAdmin) throw new Error('Admin access required');

        const update = await prisma.legalUpdate.findUnique({ where: { id: updateId } });
        if (!update) throw new Error('Update not found');

        return {
          allowedContentTypes: [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
          ],
          maximumSizeInBytes: 50 * 1024 * 1024,
          tokenPayload: JSON.stringify({ updateId, fileSize }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }: { blob: { url: string; pathname: string }; tokenPayload?: string }) => {
        const { updateId: id, fileSize = 0 } = JSON.parse(tokenPayload || '{}');
        const fileName = (blob.pathname as string).split('/').pop() || blob.pathname;

        const existing = await prisma.legalUpdate.findUnique({
          where: { id },
          select: { downloadUrl: true },
        });
        if (existing?.downloadUrl && existing.downloadUrl !== blob.url) {
          const { del } = await import('@vercel/blob');
          await del(existing.downloadUrl).catch(() => {});
        }

        await prisma.legalUpdate.update({
          where: { id },
          data: { downloadUrl: blob.url, downloadFileName: fileName, downloadFileSize: fileSize },
        });
      },
    });

    res.json(jsonResponse);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/updates/:id/file
router.delete('/:id/file', requireAdmin, async (req: Request, res: Response, next) => {
  try {
    const update = await prisma.legalUpdate.findUnique({
      where: { id: req.params.id },
      select: { downloadUrl: true },
    });
    if (update?.downloadUrl) {
      const { del } = await import('@vercel/blob');
      await del(update.downloadUrl).catch(() => {});
    }
    await prisma.legalUpdate.update({
      where: { id: req.params.id },
      data: { downloadUrl: null, downloadFileName: null, downloadFileSize: null },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
