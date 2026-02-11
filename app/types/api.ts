// API Response Types for Lectra Backend

export interface Transcription {
  id: string;
  audio_file_name: string;
  audio_file_url: string | null;
  audio_mime_type: string | null;
  audio_duration_seconds: number | null;
  audio_file_size_bytes: number | null;
  transcription_text: string;
  language_code: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  word_count: number | null;
  confidence_score: number | null;
}

export interface TranscriptionResponse {
  status: string;
  transcription: string;
  id?: string;
  audioUrl?: string | null;
  message?: string;
  metadata?: {
    originalName: string;
    mimeType: string;
    fileSize: number;
    duration?: number | null;
    languageCode?: string;
    wordCount?: number | null;
    createdAt?: string;
  };
  warning?: string;
}

export interface TranscriptionHistoryResponse {
  status: string;
  data: Transcription[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface TranscriptionDetailResponse {
  status: string;
  data: Transcription;
}

export interface TranscriptionUpdateResponse {
  status: string;
  data: Transcription;
}

export interface TranscriptionDeleteResponse {
  status: string;
  message: string;
}

export interface ApiError {
  status: string;
  message: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}
