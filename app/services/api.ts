import * as FileSystem from 'expo-file-system';
import ENV from '../config/environment';

export interface TranscriptionResponse {
  status: string;
  transcription: string;
  message?: string;
  metadata?: {
    originalName: string;
    mimeType: string;
    fileSize: number;
    duration: number | null;
  };
}

export interface ApiError {
  status: string;
  message: string;
}

export class TranscriptionAPI {
  private static readonly BASE_URL = ENV.apiUrl;
  private static readonly TIMEOUT = 30000; // 30 seconds

  /**
   * Transcribes an audio file by uploading it to the backend
   * @param audioUri - Local URI of the audio file
   * @returns Transcription response
   */
  static async transcribeAudio(audioUri: string): Promise<TranscriptionResponse> {
    try {
      console.log('Uploading audio file:', audioUri);

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw new Error('Audio file does not exist');
      }

      console.log('File size:', fileInfo.size, 'bytes');

      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (fileInfo.size && fileInfo.size > maxSize) {
        throw new Error(
          `File too large (${(fileInfo.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB.`
        );
      }

      // Upload file using FileSystem.uploadAsync
      const uploadUrl = `${this.BASE_URL}/transcription/transcribe`;
      console.log('Upload URL:', uploadUrl);

      const response = await FileSystem.uploadAsync(uploadUrl, audioUri, {
        fieldName: 'audio',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      });

      console.log('Response status:', response.status);
      console.log('Response body:', response.body);

      // Parse response
      if (response.status !== 200) {
        const errorData: ApiError = JSON.parse(response.body);
        throw new Error(errorData.message || 'Transcription failed');
      }

      const data: TranscriptionResponse = JSON.parse(response.body);

      if (data.status !== 'success') {
        throw new Error(data.message || 'Transcription failed');
      }

      return data;
    } catch (error) {
      console.error('Transcription API error:', error);

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Failed to transcribe audio. Please try again.');
    }
  }

  /**
   * Checks if the backend server is reachable
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/transcription/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}
