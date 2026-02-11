import { Router, Request, Response } from 'express';
import speechToTextService from '../services/speechToText';
import {
  upload,
  validateFileUpload,
  handleMulterError,
} from '../middleware/validateFile';
import { catchAsync } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/transcription/transcribe
 * Transcribes an audio file using Google Speech-to-Text
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

    console.log(`Transcribing audio: ${req.file.originalname} (${mimeType})`);

    // Determine which transcription method to use based on file size
    // Files under 10MB use synchronous recognition
    // Files over 10MB would need async recognition (not implemented in this basic version)
    const fileSizeInMB = audioBuffer.length / (1024 * 1024);

    let transcription: string;

    if (fileSizeInMB > 10) {
      return res.status(413).json({
        status: 'fail',
        message: 'File too large. Maximum size is 10MB for synchronous transcription.',
      });
    }

    // Perform transcription
    transcription = await speechToTextService.transcribeAudio(
      audioBuffer,
      mimeType
    );

    // Check if transcription is empty
    if (!transcription || transcription.trim().length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'No speech detected in the audio file',
        transcription: '',
      });
    }

    // Return successful transcription
    res.status(200).json({
      status: 'success',
      transcription: transcription,
      metadata: {
        originalName: req.file.originalname,
        mimeType: mimeType,
        fileSize: audioBuffer.length,
        duration: null, // Could be added with additional audio processing
      },
    });
  })
);

/**
 * GET /api/transcription/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Transcription service is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
