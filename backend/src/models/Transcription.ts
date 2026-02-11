import { supabase } from '../config/database';

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

export interface CreateTranscriptionData {
  audio_file_name: string;
  audio_file_url?: string | null;
  audio_mime_type?: string | null;
  audio_duration_seconds?: number | null;
  audio_file_size_bytes?: number | null;
  transcription_text: string;
  language_code?: string;
  status?: string;
  word_count?: number | null;
  confidence_score?: number | null;
}

export interface UpdateTranscriptionData {
  transcription_text?: string;
  language_code?: string;
  status?: string;
  word_count?: number | null;
  confidence_score?: number | null;
}

export class TranscriptionModel {
  /**
   * Creates a new transcription record
   */
  async create(data: CreateTranscriptionData): Promise<Transcription | null> {
    try {
      const { data: transcription, error } = await supabase
        .from('transcriptions')
        .insert([
          {
            ...data,
            word_count: data.transcription_text
              ? data.transcription_text.split(/\s+/).filter(Boolean).length
              : 0,
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Create transcription error:', error);
        return null;
      }

      return transcription;
    } catch (error) {
      console.error('Create transcription exception:', error);
      return null;
    }
  }

  /**
   * Gets a single transcription by ID (excluding soft-deleted)
   */
  async findById(id: string): Promise<Transcription | null> {
    try {
      const { data, error } = await supabase
        .from('transcriptions')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Find transcription error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Find transcription exception:', error);
      return null;
    }
  }

  /**
   * Gets paginated list of transcriptions (excluding soft-deleted)
   */
  async findAll(
    limit: number = 20,
    offset: number = 0
  ): Promise<{ transcriptions: Transcription[]; total: number }> {
    try {
      // Get total count
      const { count } = await supabase
        .from('transcriptions')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      // Get paginated data
      const { data, error } = await supabase
        .from('transcriptions')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Find all transcriptions error:', error);
        return { transcriptions: [], total: 0 };
      }

      return {
        transcriptions: data || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('Find all transcriptions exception:', error);
      return { transcriptions: [], total: 0 };
    }
  }

  /**
   * Updates a transcription
   */
  async update(
    id: string,
    data: UpdateTranscriptionData
  ): Promise<Transcription | null> {
    try {
      const updateData: any = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      // Recalculate word count if text is updated
      if (data.transcription_text) {
        updateData.word_count = data.transcription_text
          .split(/\s+/)
          .filter(Boolean).length;
      }

      const { data: transcription, error } = await supabase
        .from('transcriptions')
        .update(updateData)
        .eq('id', id)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        console.error('Update transcription error:', error);
        return null;
      }

      return transcription;
    } catch (error) {
      console.error('Update transcription exception:', error);
      return null;
    }
  }

  /**
   * Soft deletes a transcription
   */
  async softDelete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transcriptions')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .is('deleted_at', null);

      if (error) {
        console.error('Soft delete transcription error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Soft delete transcription exception:', error);
      return false;
    }
  }

  /**
   * Hard deletes a transcription (permanent)
   */
  async hardDelete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transcriptions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Hard delete transcription error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Hard delete transcription exception:', error);
      return false;
    }
  }

  /**
   * Searches transcriptions by text content
   */
  async search(
    searchTerm: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ transcriptions: Transcription[]; total: number }> {
    try {
      const { data, error, count } = await supabase
        .from('transcriptions')
        .select('*', { count: 'exact' })
        .is('deleted_at', null)
        .ilike('transcription_text', `%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Search transcriptions error:', error);
        return { transcriptions: [], total: 0 };
      }

      return {
        transcriptions: data || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('Search transcriptions exception:', error);
      return { transcriptions: [], total: 0 };
    }
  }
}

export default new TranscriptionModel();
