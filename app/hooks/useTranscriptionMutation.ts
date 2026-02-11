import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TranscriptionAPI } from '../services/api';
import { transcriptionKeys } from './useTranscriptions';
import Toast from 'react-native-toast-message';

/**
 * Hook to create a new transcription
 * Automatically invalidates transcription list queries on success
 */
export function useTranscribeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ audioUri, languageCode }: { audioUri: string; languageCode?: string }) =>
      TranscriptionAPI.transcribeAudio(audioUri, languageCode),
    onSuccess: () => {
      // Invalidate and refetch transcription lists
      queryClient.invalidateQueries({ queryKey: transcriptionKeys.lists() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Audio transcribed successfully',
      });
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: 'Transcription Failed',
        text2: error.message,
      });
    },
  });
}

/**
 * Hook to update a transcription's text
 * Uses optimistic updates for better UX
 */
export function useUpdateTranscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      TranscriptionAPI.updateTranscription(id, text),
    // Optimistic update
    onMutate: async ({ id, text }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: transcriptionKeys.detail(id) });

      // Snapshot previous value
      const previousTranscription = queryClient.getQueryData(transcriptionKeys.detail(id));

      // Optimistically update
      queryClient.setQueryData(transcriptionKeys.detail(id), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            transcription_text: text,
            updated_at: new Date().toISOString(),
          },
        };
      });

      return { previousTranscription };
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousTranscription) {
        queryClient.setQueryData(
          transcriptionKeys.detail(variables.id),
          context.previousTranscription
        );
      }
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.message,
      });
    },
    onSuccess: (data, variables) => {
      // Update cache with server response
      queryClient.setQueryData(transcriptionKeys.detail(variables.id), data);
      // Also invalidate list queries to show updated data
      queryClient.invalidateQueries({ queryKey: transcriptionKeys.lists() });
      Toast.show({
        type: 'success',
        text1: 'Updated',
        text2: 'Transcription updated successfully',
      });
    },
  });
}

/**
 * Hook to delete a transcription
 * Automatically removes from cache and invalidates queries
 */
export function useDeleteTranscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TranscriptionAPI.deleteTranscription(id),
    onSuccess: (data, id) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: transcriptionKeys.detail(id) });
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: transcriptionKeys.lists() });
      Toast.show({
        type: 'success',
        text1: 'Deleted',
        text2: 'Transcription deleted successfully',
      });
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: 'Delete Failed',
        text2: error.message,
      });
    },
  });
}
