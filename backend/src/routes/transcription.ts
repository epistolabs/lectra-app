import { Router, Request, Response } from 'express';
import speechToTextService from '../services/speechToText';
import storageService from '../services/storageService';
import transcriptionModel from '../models/Transcription';
import { isValidLanguageCode } from '../constants/languages';
import {
  upload,
  validateFileUpload,
  handleMulterError,
} from '../middleware/validateFile';
import { catchAsync } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/transcription/transcribe
 * Transcribes an audio file using Google Speech-to-Text and saves to database
 */
router.post(
  '/transcribe',
  upload.single('audio'),
  handleMulterError,
  validateFileUpload,
  catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No audio file provided',
      });
    }

    const audioBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    const languageCode = (req.body.language_code as string) || 'en-US';

    // Validate language code
    if (!isValidLanguageCode(languageCode)) {
      return res.status(400).json({
        status: 'fail',
        message: `Invalid language code: ${languageCode}`,
      });
    }

    console.log(`Transcribing audio: ${req.file.originalname} (${mimeType}, ${languageCode})`);

    // Check file size (max 10MB for synchronous transcription)
    const fileSizeInMB = audioBuffer.length / (1024 * 1024);
    if (fileSizeInMB > 10) {
      return res.status(413).json({
        status: 'fail',
        message: 'File too large. Maximum size is 10MB for synchronous transcription.',
      });
    }

    // Perform transcription
    const transcriptionText = await speechToTextService.transcribeAudio(
      audioBuffer,
      mimeType,
      languageCode
    );

    // Check if transcription is empty
    if (!transcriptionText || transcriptionText.trim().length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'No speech detected in the audio file',
        transcription: '',
      });
    }

    // Upload audio to Supabase Storage
    const audioUrl = await storageService.uploadAudio(
      audioBuffer,
      req.file.originalname,
      mimeType
    );

    // Save transcription to database
    const transcription = await transcriptionModel.create({
      audio_file_name: req.file.originalname,
      audio_file_url: audioUrl,
      audio_mime_type: mimeType,
      audio_file_size_bytes: audioBuffer.length,
      transcription_text: transcriptionText,
      language_code: languageCode,
      status: 'completed',
    });

    if (!transcription) {
      console.error('Failed to save transcription to database');
      // Still return success since transcription worked
      return res.status(200).json({
        status: 'success',
        transcription: transcriptionText,
        metadata: {
          originalName: req.file.originalname,
          mimeType: mimeType,
          fileSize: audioBuffer.length,
          languageCode: languageCode,
        },
        warning: 'Transcription succeeded but could not be saved to database',
      });
    }

    // Return successful transcription with database ID
    return res.status(200).json({
      status: 'success',
      transcription: transcriptionText,
      id: transcription.id,
      audioUrl: audioUrl,
      metadata: {
        originalName: req.file.originalname,
        mimeType: mimeType,
        fileSize: audioBuffer.length,
        languageCode: languageCode,
        wordCount: transcription.word_count,
        createdAt: transcription.created_at,
      },
    });
  })
);

/**
 * GET /api/transcription/health
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Transcription service is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/transcription/history
 * Gets paginated list of transcriptions
 */
router.get(
  '/history',
  catchAsync(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    // Validate pagination parameters
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        status: 'fail',
        message: 'Limit must be between 1 and 100',
      });
    }

    if (offset < 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Offset must be non-negative',
      });
    }

    const { transcriptions, total } = await transcriptionModel.findAll(
      limit,
      offset
    );

    return res.status(200).json({
      status: 'success',
      data: transcriptions,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
    });
  })
);

/**
 * GET /api/transcription/:id
 * Gets a single transcription by ID
 */
router.get(
  '/:id',
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const transcription = await transcriptionModel.findById(id);

    if (!transcription) {
      return res.status(404).json({
        status: 'fail',
        message: 'Transcription not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: transcription,
    });
  })
);

/**
 * PUT /api/transcription/:id
 * Updates a transcription (text, language, etc.)
 */
router.put(
  '/:id',
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { transcription_text, language_code, status } = req.body;

    // Validate at least one field is provided
    if (!transcription_text && !language_code && !status) {
      return res.status(400).json({
        status: 'fail',
        message: 'At least one field must be provided for update',
      });
    }

    // Validate language code if provided
    if (language_code && !isValidLanguageCode(language_code)) {
      return res.status(400).json({
        status: 'fail',
        message: `Invalid language code: ${language_code}`,
      });
    }

    const updateData: any = {};
    if (transcription_text !== undefined) updateData.transcription_text = transcription_text;
    if (language_code !== undefined) updateData.language_code = language_code;
    if (status !== undefined) updateData.status = status;

    const transcription = await transcriptionModel.update(id, updateData);

    if (!transcription) {
      return res.status(404).json({
        status: 'fail',
        message: 'Transcription not found or could not be updated',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: transcription,
    });
  })
);

/**
 * DELETE /api/transcription/:id
 * Soft deletes a transcription
 */
router.delete(
  '/:id',
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    // First get the transcription to get audio URL
    const transcription = await transcriptionModel.findById(id);
    if (!transcription) {
      return res.status(404).json({
        status: 'fail',
        message: 'Transcription not found',
      });
    }

    // Soft delete from database
    const success = await transcriptionModel.softDelete(id);

    if (!success) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to delete transcription',
      });
    }

    // Optionally delete audio file from storage
    // Commented out to preserve audio files even after soft delete
    // if (transcription.audio_file_url) {
    //   await storageService.deleteAudio(transcription.audio_file_url);
    // }

    return res.status(200).json({
      status: 'success',
      message: 'Transcription deleted successfully',
    });
  })
);

export default router;
