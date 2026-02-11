import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configure React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default query options
      staleTime: 1000 * 60 * 5, // Data fresh for 5 minutes
      gcTime: 1000 * 60 * 30, // Cache for 30 minutes (formerly cacheTime)
      retry: 2, // Retry failed requests twice
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch when internet reconnects
    },
    mutations: {
      // Default mutation options
      retry: 1,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { queryClient };
