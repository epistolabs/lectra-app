import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  useColorScheme,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useInfiniteTranscriptionHistory } from '../hooks/useTranscriptions';
import { TranscriptionListItem } from '../components/TranscriptionListItem';
import { EmptyState } from '../components/EmptyState';
import { TranscriptionListSkeleton } from '../components/SkeletonLoader';
import type { Transcription } from '../types/api';

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useInfiniteTranscriptionHistory(20);

  // Flatten pages into single array of transcriptions
  const transcriptions = React.useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data]);

  // Filter transcriptions by search query (client-side)
  const filteredTranscriptions = React.useMemo(() => {
    if (!searchQuery.trim()) return transcriptions;
    const query = searchQuery.toLowerCase();
    return transcriptions.filter((t) =>
      t.transcription_text.toLowerCase().includes(query)
    );
  }, [transcriptions, searchQuery]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderItem = ({ item }: { item: Transcription }) => (
    <TranscriptionListItem transcription={item} />
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <TranscriptionListSkeleton />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View>
          <TranscriptionListSkeleton />
          <TranscriptionListSkeleton />
          <TranscriptionListSkeleton />
        </View>
      );
    }

    if (isError) {
      return (
        <EmptyState
          icon="⚠️"
          title="Error Loading History"
          message={error?.message || 'Failed to load transcriptions. Pull to retry.'}
        />
      );
    }

    if (searchQuery && filteredTranscriptions.length === 0) {
      return (
        <EmptyState
          icon="🔍"
          title="No Results Found"
          message={`No transcriptions match "${searchQuery}"`}
        />
      );
    }

    return (
      <EmptyState
        icon="📝"
        title="No Transcriptions Yet"
        message="Record and transcribe your first audio to see it here"
      />
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? '#000000' : '#f2f2f7' }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>
          History
        </Text>

        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
              color: isDark ? '#ffffff' : '#000000',
            },
          ]}
          placeholder="Search transcriptions..."
          placeholderTextColor={isDark ? '#8e8e93' : '#c7c7cc'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={filteredTranscriptions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={isDark ? '#ffffff' : '#000000'}
          />
        }
        contentContainerStyle={
          filteredTranscriptions.length === 0 ? styles.emptyContent : styles.content
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 12,
  },
  searchInput: {
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    paddingVertical: 8,
  },
  emptyContent: {
    flexGrow: 1,
  },
  footer: {
    paddingVertical: 16,
  },
});
