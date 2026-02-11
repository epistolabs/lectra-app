import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  status?: string;
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  res.status(statusCode).json({
    status: status,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error: ApiError = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  error.status = 'fail';
  next(error);
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};
