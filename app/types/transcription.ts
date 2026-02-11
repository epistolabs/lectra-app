/**
 * TypeScript types for transcription functionality
 */

export interface TranscriptionRequest {
  audioUri: string;
}

export interface TranscriptionResponse {
  status: 'success' | 'fail' | 'error';
  transcription: string;
  message?: string;
  metadata?: TranscriptionMetadata;
}

export interface TranscriptionMetadata {
  originalName: string;
  mimeType: string;
  fileSize: number;
  duration: number | null;
}

export interface TranscriptionError {
  status: 'fail' | 'error';
  message: string;
  stack?: string;
}

export enum TranscriptionStatus {
  IDLE = 'idle',
  RECORDING = 'recording',
  RECORDED = 'recorded',
  TRANSCRIBING = 'transcribing',
  COMPLETED = 'completed',
  ERROR = 'error',
}
