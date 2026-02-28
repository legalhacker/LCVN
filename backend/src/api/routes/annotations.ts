import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Validation schemas
const createAnnotationSchema = z.object({
  articleId: z.string(), // Stable article ID
  workspaceId: z.string().optional(),

  // Text range anchoring
  startOffset: z.number().optional(),
  endOffset: z.number().optional(),
  selectedText: z.string().optional(),
  paragraphIndex: z.number().optional(),

  // Annotation content
  annotationType: z.enum(['highlight', 'note', 'bookmark']).default('note'),
  highlightColor: z.string().optional(),
  noteContent: z.string().optional(),

  // Visibility
  visibility: z.enum(['PRIVATE', 'WORKSPACE']).default('PRIVATE'),

  // Mentions
  mentionUserIds: z.array(z.string()).optional(),
});

const updateAnnotationSchema = z.object({
  noteContent: z.string().optional(),
  highlightColor: z.string().optional(),
});

// GET /api/annotations - Get user's annotations
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const workspaceId = req.query.workspaceId as string;

    const where: any = {
      OR: [
        { userId: req.user!.id },
      ],
    };

    if (workspaceId) {
      // Check membership
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
        article: {
          select: {
            articleId: true,
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
      orderBy: { createdAt: 'desc' },
    });

    res.json(annotations);
  } catch (error) {
    next(error);
  }
});

// POST /api/annotations - Create annotation
router.post('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = createAnnotationSchema.parse(req.body);

    // Find article by stable ID
    const article = await prisma.article.findUnique({
      where: { articleId: data.articleId },
    });

    if (!article) {
      throw new AppError('Article not found', 404, 'ARTICLE_NOT_FOUND');
    }

    // If workspace annotation, verify membership
    if (data.workspaceId && data.visibility === 'WORKSPACE') {
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: data.workspaceId,
            userId: req.user!.id,
          },
        },
      });

      if (!membership) {
        throw new AppError('Not a workspace member', 403, 'NOT_MEMBER');
      }

      if (membership.role === 'VIEWER') {
        throw new AppError('Viewers cannot create annotations', 403, 'INSUFFICIENT_ROLE');
      }
    }

    // Create annotation
    const annotation = await prisma.annotation.create({
      data: {
        articleId: article.id,
        userId: req.user!.id,
        workspaceId: data.visibility === 'WORKSPACE' ? data.workspaceId : null,

        startOffset: data.startOffset,
        endOffset: data.endOffset,
        selectedText: data.selectedText,
        paragraphIndex: data.paragraphIndex,

        annotationType: data.annotationType,
        highlightColor: data.highlightColor,
        noteContent: data.noteContent,

        visibility: data.visibility,
      },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });

    // Create mentions and notifications
    if (data.mentionUserIds && data.mentionUserIds.length > 0) {
      await Promise.all(
        data.mentionUserIds.map(async (userId) => {
          // Create mention record
          await prisma.mention.create({
            data: {
              annotationId: annotation.id,
              mentionedUserId: userId,
            },
          });

          // Create notification
          await prisma.notification.create({
            data: {
              userId,
              type: 'MENTION',
              title: 'You were mentioned',
              message: `${req.user!.fullName} mentioned you in a note`,
              linkType: 'annotation',
              linkId: annotation.id,
            },
          });
        })
      );
    }

    res.status(201).json(annotation);
  } catch (error) {
    next(error);
  }
});

// PUT /api/annotations/:id - Update annotation
router.put('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const data = updateAnnotationSchema.parse(req.body);

    // Check ownership
    const annotation = await prisma.annotation.findUnique({
      where: { id },
    });

    if (!annotation) {
      throw new AppError('Annotation not found', 404, 'ANNOTATION_NOT_FOUND');
    }

    if (annotation.userId !== req.user!.id) {
      throw new AppError('Not authorized to edit', 403, 'NOT_OWNER');
    }

    const updated = await prisma.annotation.update({
      where: { id },
      data: {
        noteContent: data.noteContent,
        highlightColor: data.highlightColor,
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/annotations/:id - Delete annotation
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    const annotation = await prisma.annotation.findUnique({
      where: { id },
    });

    if (!annotation) {
      throw new AppError('Annotation not found', 404, 'ANNOTATION_NOT_FOUND');
    }

    if (annotation.userId !== req.user!.id) {
      throw new AppError('Not authorized to delete', 403, 'NOT_OWNER');
    }

    await prisma.annotation.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
