import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { TranscriptionAPI } from '../services/api';
import type {
  Transcription,
  TranscriptionHistoryResponse,
  TranscriptionDetailResponse,
} from '../types/api';

// Query keys for cache management
export const transcriptionKeys = {
  all: ['transcriptions'] as const,
  lists: () => [...transcriptionKeys.all, 'list'] as const,
  list: (filters: { limit?: number; offset?: number }) =>
    [...transcriptionKeys.lists(), filters] as const,
  details: () => [...transcriptionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transcriptionKeys.details(), id] as const,
};

/**
 * Hook to fetch paginated transcription history
 * @param limit - Number of items per page
 * @param offset - Offset for pagination
 */
export function useTranscriptionHistory(limit: number = 20, offset: number = 0) {
  return useQuery({
    queryKey: transcriptionKeys.list({ limit, offset }),
    queryFn: () => TranscriptionAPI.getHistory(limit, offset),
    staleTime: 1000 * 60 * 2, // Fresh for 2 minutes
  });
}

/**
 * Hook to fetch infinite scrolling transcription history
 * Better for long lists with pagination
 */
export function useInfiniteTranscriptionHistory(limit: number = 20) {
  return useInfiniteQuery<TranscriptionHistoryResponse>({
    queryKey: [...transcriptionKeys.lists(), 'infinite', limit],
    queryFn: ({ pageParam = 0 }) =>
      TranscriptionAPI.getHistory(limit, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { offset, limit, hasMore } = lastPage.pagination;
      return hasMore ? offset + limit : undefined;
    },
  });
}

/**
 * Hook to fetch a single transcription by ID
 * @param id - Transcription ID
 * @param enabled - Whether the query should run
 */
export function useTranscription(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: transcriptionKeys.detail(id),
    queryFn: () => TranscriptionAPI.getTranscription(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5, // Fresh for 5 minutes
  });
}

/**
 * Hook to check backend health
 */
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => TranscriptionAPI.healthCheck(),
    staleTime: 1000 * 60, // Fresh for 1 minute
    retry: 3,
  });
}
