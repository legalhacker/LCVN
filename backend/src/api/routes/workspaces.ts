import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate, requireWorkspaceMember, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Validation schemas
const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  companyName: z.string().optional(),
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['MEMBER', 'VIEWER']).default('MEMBER'),
});

const createNoteSchema = z.object({
  articleId: z.string(),
  title: z.string().min(1).max(200),
  content: z.string(),
});

// GET /api/workspaces - List user's workspaces
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: req.user!.id },
      include: {
        workspace: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
    });

    res.json(memberships.map(m => ({
      ...m.workspace,
      role: m.role,
      memberCount: m.workspace._count.members,
    })));
  } catch (error) {
    next(error);
  }
});

// POST /api/workspaces - Create workspace
router.post('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = createWorkspaceSchema.parse(req.body);

    // Generate slug
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check slug uniqueness
    const existing = await prisma.workspace.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError('Workspace name already taken', 400, 'SLUG_EXISTS');
    }

    // Create workspace and add creator as admin
    const workspace = await prisma.workspace.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        companyName: data.companyName,
        members: {
          create: {
            userId: req.user!.id,
            role: 'WORKSPACE_ADMIN',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
      },
    });

    res.status(201).json(workspace);
  } catch (error) {
    next(error);
  }
});

// GET /api/workspaces/:workspaceId - Get workspace details
router.get('/:workspaceId', authenticate, requireWorkspaceMember, async (req: AuthRequest, res: Response, next) => {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.workspaceId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: { annotations: true, workspaceNotes: true },
        },
      },
    });

    res.json(workspace);
  } catch (error) {
    next(error);
  }
});

// POST /api/workspaces/:workspaceId/invite - Invite member
router.post('/:workspaceId/invite', authenticate, requireWorkspaceMember, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = inviteMemberSchema.parse(req.body);

    // Check if inviter is admin
    const inviterMembership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: req.workspaceId!,
          userId: req.user!.id,
        },
      },
    });

    if (inviterMembership?.role !== 'WORKSPACE_ADMIN') {
      throw new AppError('Only admins can invite members', 403, 'NOT_ADMIN');
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check if already member
    const existingMembership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: req.workspaceId!,
          userId: user.id,
        },
      },
    });

    if (existingMembership) {
      throw new AppError('User is already a member', 400, 'ALREADY_MEMBER');
    }

    // Add member
    const membership = await prisma.workspaceMember.create({
      data: {
        workspaceId: req.workspaceId!,
        userId: user.id,
        role: data.role,
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'WORKSPACE_INVITE',
        title: 'Workspace Invitation',
        message: `You have been invited to join workspace "${req.workspaceId}"`,
        linkType: 'workspace',
        linkId: req.workspaceId,
      },
    });

    res.status(201).json(membership);
  } catch (error) {
    next(error);
  }
});

// GET /api/workspaces/:workspaceId/notes - Get workspace notes
router.get('/:workspaceId/notes', authenticate, requireWorkspaceMember, async (req: AuthRequest, res: Response, next) => {
  try {
    const articleId = req.query.articleId as string;

    const where: any = { workspaceId: req.workspaceId };
    if (articleId) {
      where.articleId = articleId;
    }

    const notes = await prisma.workspaceNote.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    res.json(notes);
  } catch (error) {
    next(error);
  }
});

// POST /api/workspaces/:workspaceId/notes - Create workspace note
router.post('/:workspaceId/notes', authenticate, requireWorkspaceMember, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = createNoteSchema.parse(req.body);

    // Verify membership role allows creating notes
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: req.workspaceId!,
          userId: req.user!.id,
        },
      },
    });

    if (membership?.role === 'VIEWER') {
      throw new AppError('Viewers cannot create notes', 403, 'INSUFFICIENT_ROLE');
    }

    const note = await prisma.workspaceNote.create({
      data: {
        workspaceId: req.workspaceId!,
        articleId: data.articleId,
        title: data.title,
        content: data.content,
        createdById: req.user!.id,
      },
    });

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

export default router;
