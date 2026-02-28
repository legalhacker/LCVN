import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Safely log error without crashing on circular references
  console.error('Error:', err.message || 'Unknown error');
  if (err.stack) {
    console.error(err.stack);
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Custom app errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as Error & { code?: string; meta?: { target?: string[] } };
    // P2002 = unique constraint violation
    if (prismaErr.code === 'P2002') {
      const fields = prismaErr.meta?.target?.join(', ') || 'unknown field';
      return res.status(409).json({
        error: `Đã tồn tại văn bản với ${fields} này`,
        code: 'UNIQUE_CONSTRAINT',
        fields: prismaErr.meta?.target,
      });
    }
    return res.status(400).json({
      error: 'Database operation failed',
      code: prismaErr.code,
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error',
  });
};
