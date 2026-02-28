import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { config } from './config/index.js';
import { errorHandler } from './api/middleware/errorHandler.js';

// Route imports
import documentRoutes from './api/routes/documents.js';
import articleRoutes from './api/routes/articles.js';
import searchRoutes from './api/routes/search.js';
import authRoutes from './api/routes/auth.js';
import workspaceRoutes from './api/routes/workspaces.js';
import annotationRoutes from './api/routes/annotations.js';
import notificationRoutes from './api/routes/notifications.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.isDev
    ? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003']
    : config.cors.frontendUrl,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/annotations', annotationRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server (skip in serverless environments like Vercel)
if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
}

export default app;
