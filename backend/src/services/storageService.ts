import { supabase } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'audio-recordings';

export class StorageService {
  /**
   * Uploads an audio file to Supabase Storage
   * @param audioBuffer - Audio file buffer
   * @param fileName - Desired file name
   * @param mimeType - Audio MIME type
   * @returns Public URL of the uploaded file
   */
  async uploadAudio(
    audioBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<string | null> {
    try {
      // Generate unique file name with timestamp
      const timestamp = Date.now();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${timestamp}-${sanitizedFileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(uniqueFileName, audioBuffer, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Storage upload error:', error);
        return null;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Upload audio error:', error);
      return null;
    }
  }

  /**
   * Deletes an audio file from Supabase Storage
   * @param fileUrl - Public URL of the file to delete
   * @returns Success status
   */
  async deleteAudio(fileUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const fileName = this.extractFileNameFromUrl(fileUrl);
      if (!fileName) {
        console.error('Could not extract file name from URL');
        return false;
      }

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([fileName]);

      if (error) {
        console.error('Storage delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete audio error:', error);
      return false;
    }
  }

  /**
   * Extracts file name from Supabase Storage public URL
   */
  private extractFileNameFromUrl(url: string): string | null {
    try {
      const parts = url.split('/');
      return parts[parts.length - 1] || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Gets the storage bucket name
   */
  getBucketName(): string {
    return STORAGE_BUCKET;
  }
}

export default new StorageService();
