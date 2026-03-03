import { Router, Response } from 'express';
import { prisma } from '../../services/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications - Get user's notifications
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unread === 'true';

    const where: any = { userId: req.user!.id };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: req.user!.id, isRead: false },
      }),
    ]);

    res.json({
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/notifications/read - Mark notifications as read
router.post('/read', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { ids } = req.body; // Array of notification IDs

    if (ids && Array.isArray(ids)) {
      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: {
          id: { in: ids },
          userId: req.user!.id,
        },
        data: { isRead: true },
      });
    } else {
      // Mark all as read
      await prisma.notification.updateMany({
        where: {
          userId: req.user!.id,
          isRead: false,
        },
        data: { isRead: true },
      });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/notifications/count - Get unread count
router.get('/count', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.user!.id,
        isRead: false,
      },
    });

    res.json({ unreadCount: count });
  } catch (error) {
    next(error);
  }
});

export default router;
