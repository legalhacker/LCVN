// ============================================================================
// AI-NATIVE API — /api/ai/*
// ============================================================================
// Returns pure structured JSON. No HTML fields exposed.
// Designed for: RAG pipelines, AI agent tool calling, legal graph traversal.
// Human reading is handled by /documents/:slug (HTML rendering layer).
// ============================================================================

import { Router, Request, Response } from 'express';
import { prisma } from '../../services/prisma.js';

const router = Router();

// Clause shape returned by all AI endpoints
function formatClause(c: {
  semanticId: string;
  clauseNumber: number;
  legalText: string;
  plainSummary: string | null;
  normType: string | null;
  riskLevel: string | null;
  appliesTo: string[];
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
}) {
  return {
    semanticId: c.semanticId,
    clauseNumber: c.clauseNumber,
    legalText: c.legalText,
    plainSummary: c.plainSummary,
    normType: c.normType,
    riskLevel: c.riskLevel,
    appliesTo: c.appliesTo,
    effectiveFrom: c.effectiveFrom,
    effectiveTo: c.effectiveTo,
  };
}

// Article shape returned by all AI endpoints (no contentHtml)
function formatArticle(a: {
  id: string;
  semanticId: string | null;
  articleNumber: string;
  articleId: string;
  title: string | null;
  content: string;
  chapterNumber: string | null;
  chapterTitle: string | null;
  sectionNumber: string | null;
  sectionTitle: string | null;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  legalTopics: string[];
  articleType: string | null;
  subjectMatter: string | null;
  importance: number;
  clauses: Parameters<typeof formatClause>[0][];
}) {
  return {
    id: a.id,
    semanticId: a.semanticId,
    articleNumber: a.articleNumber,
    articleId: a.articleId,
    title: a.title,
    content: a.content, // plain text — AI-consumable without HTML parsing
    chapterNumber: a.chapterNumber,
    chapterTitle: a.chapterTitle,
    sectionNumber: a.sectionNumber,
    sectionTitle: a.sectionTitle,
    effectiveFrom: a.effectiveFrom,
    effectiveTo: a.effectiveTo,
    legalTopics: a.legalTopics,
    articleType: a.articleType,
    subjectMatter: a.subjectMatter,
    importance: a.importance,
    clauses: a.clauses.map(formatClause),
  };
}

// ── GET /api/ai/documents/:slug ──────────────────────────────────────────────
// Full document: metadata + all articles + clauses.
// Use this for RAG ingestion or full document context.
router.get('/documents/:slug', async (req: Request, res: Response, next) => {
  try {
    const doc = await prisma.document.findUnique({
      where: { titleSlug: req.params.slug },
      include: {
        articles: {
          orderBy: { orderIndex: 'asc' },
          include: { clauses: { orderBy: { clauseNumber: 'asc' } } },
        },
      },
    });

    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    res.json({
      semanticId: doc.semanticId,
      documentNumber: doc.documentNumber,
      title: doc.title,
      titleSlug: doc.titleSlug,
      documentType: doc.documentType,
      issuingBody: doc.issuingBody,
      jurisdiction: doc.jurisdiction,
      issuedDate: doc.issuedDate,
      effectiveDate: doc.effectiveDate,
      expirationDate: doc.expirationDate,
      status: doc.status,
      legalDomains: doc.legalDomains,
      applicableEntities: doc.applicableEntities,
      keywords: doc.keywords,
      legalSummary: doc.legalSummary,
      summary: doc.summary,
      articleCount: doc.articles.length,
      articles: doc.articles.map(formatArticle),
    });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/ai/documents/:slug/articles/:number ─────────────────────────────
// Single article with clauses. :number is the article number string (e.g. "2", "12a").
router.get('/documents/:slug/articles/:number', async (req: Request, res: Response, next) => {
  try {
    const doc = await prisma.document.findUnique({
      where: { titleSlug: req.params.slug },
      select: { id: true },
    });

    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const article = await prisma.article.findFirst({
      where: { documentId: doc.id, articleNumber: req.params.number },
      include: {
        clauses: { orderBy: { clauseNumber: 'asc' } },
        document: {
          select: {
            semanticId: true, documentNumber: true, title: true,
            titleSlug: true, status: true, effectiveDate: true,
          },
        },
      },
    });

    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    res.json({
      ...formatArticle(article),
      document: article.document,
    });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/ai/clauses/:semanticId ──────────────────────────────────────────
// Single clause by its stable semantic ID. Enables fine-grained agent tool calls.
router.get('/clauses/:semanticId', async (req: Request, res: Response, next) => {
  try {
    const clause = await prisma.clause.findUnique({
      where: { semanticId: req.params.semanticId },
      include: {
        article: {
          select: {
            id: true, semanticId: true, articleNumber: true, articleId: true, title: true,
            document: {
              select: {
                semanticId: true, documentNumber: true, title: true,
                titleSlug: true, status: true,
              },
            },
          },
        },
      },
    });

    if (!clause) {
      res.status(404).json({ error: 'Clause not found' });
      return;
    }

    res.json({
      ...formatClause(clause),
      article: {
        id: clause.article.id,
        semanticId: clause.article.semanticId,
        articleNumber: clause.article.articleNumber,
        articleId: clause.article.articleId,
        title: clause.article.title,
        document: clause.article.document,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
