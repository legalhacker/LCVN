import { Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from './auth.js';

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  authenticate(req, res, () => {
    if (!req.user?.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }
    next();
  });
};
