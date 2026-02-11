import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ApiError } from './errorHandler';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File size limit: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed audio MIME types
const ALLOWED_MIME_TYPES = [
  'audio/wav',
  'audio/x-wav',
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/ogg',
  'audio/webm',
  'audio/flac',
  'audio/3gpp',
  'audio/3gpp2',
  'audio/aac',
  'audio/x-caf',
];

// File filter function
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check MIME type
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error: any = new Error(
      `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
    );
    error.statusCode = 400;
    cb(error, false);
  }
};

// Configure multer upload
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: fileFilter,
});

/**
 * Middleware to validate that file was uploaded
 */
export const validateFileUpload = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.file) {
    const error: ApiError = new Error('No audio file uploaded');
    error.statusCode = 400;
    error.status = 'fail';
    return next(error);
  }

  // Validate file has content
  if (!req.file.buffer || req.file.buffer.length === 0) {
    const error: ApiError = new Error('Uploaded file is empty');
    error.statusCode = 400;
    error.status = 'fail';
    return next(error);
  }

  next();
};

/**
 * Multer error handler
 */
export const handleMulterError = (
  err: any,
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const error: ApiError = new Error(
        `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
      );
      error.statusCode = 413;
      error.status = 'fail';
      return next(error);
    }

    const error: ApiError = new Error(`File upload error: ${err.message}`);
    error.statusCode = 400;
    error.status = 'fail';
    return next(error);
  }

  next(err);
};
