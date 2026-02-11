import * as FileSystem from 'expo-file-system';
import ENV from '../config/environment';
import {
  TranscriptionResponse,
  TranscriptionHistoryResponse,
  TranscriptionDetailResponse,
  TranscriptionUpdateResponse,
  TranscriptionDeleteResponse,
  ApiError,
} from '../types/api';

export class TranscriptionAPI {
  private static readonly BASE_URL = ENV.apiUrl;
  private static readonly TIMEOUT = 30000; // 30 seconds

  /**
   * Transcribes an audio file by uploading it to the backend
   * @param audioUri - Local URI of the audio file
   * @param languageCode - Language code for transcription (e.g., 'en-US', 'es-ES')
   * @returns Transcription response
   */
  static async transcribeAudio(
    audioUri: string,
    languageCode: string = 'en-US'
  ): Promise<TranscriptionResponse> {
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
        parameters: {
          language_code: languageCode,
        },
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
   * Gets paginated list of transcriptions
   * @param limit - Number of items per page (default: 20)
   * @param offset - Offset for pagination (default: 0)
   * @returns Transcription history response
   */
  static async getHistory(
    limit: number = 20,
    offset: number = 0
  ): Promise<TranscriptionHistoryResponse> {
    try {
      const url = `${this.BASE_URL}/transcription/history?limit=${limit}&offset=${offset}`;
      console.log('Fetching history:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to fetch transcription history');
      }

      return data;
    } catch (error) {
      console.error('Get history error:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch history');
    }
  }

  /**
   * Gets a single transcription by ID
   * @param id - Transcription ID
   * @returns Transcription detail response
   */
  static async getTranscription(id: string): Promise<TranscriptionDetailResponse> {
    try {
      const url = `${this.BASE_URL}/transcription/${id}`;
      console.log('Fetching transcription:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to fetch transcription');
      }

      return data;
    } catch (error) {
      console.error('Get transcription error:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch transcription');
    }
  }

  /**
   * Updates a transcription's text
   * @param id - Transcription ID
   * @param text - New transcription text
   * @returns Updated transcription response
   */
  static async updateTranscription(
    id: string,
    text: string
  ): Promise<TranscriptionUpdateResponse> {
    try {
      const url = `${this.BASE_URL}/transcription/${id}`;
      console.log('Updating transcription:', url);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcription_text: text,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to update transcription');
      }

      return data;
    } catch (error) {
      console.error('Update transcription error:', error);
      throw error instanceof Error ? error : new Error('Failed to update transcription');
    }
  }

  /**
   * Deletes a transcription (soft delete)
   * @param id - Transcription ID
   * @returns Delete response
   */
  static async deleteTranscription(id: string): Promise<TranscriptionDeleteResponse> {
    try {
      const url = `${this.BASE_URL}/transcription/${id}`;
      console.log('Deleting transcription:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to delete transcription');
      }

      return data;
    } catch (error) {
      console.error('Delete transcription error:', error);
      throw error instanceof Error ? error : new Error('Failed to delete transcription');
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
