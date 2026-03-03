import { Router } from 'express';
import statsRouter from './stats.js';
import documentsRouter from './documents.js';
import articlesRouter from './articles.js';
import articleRelationsRouter from './article-relations.js';
import articleAnnotationsRouter from './article-annotations.js';
import relationsRouter from './relations.js';
import pagesRouter from './pages.js';
import updatesRouter from './updates.js';

const router = Router();

router.use('/stats', statsRouter);
router.use('/documents', documentsRouter);
router.use('/articles', articlesRouter);
router.use('/article-relations', articleRelationsRouter);
router.use('/article-annotations', articleAnnotationsRouter);
router.use('/relations', relationsRouter);
router.use('/pages', pagesRouter);
router.use('/updates', updatesRouter);

export default router;
