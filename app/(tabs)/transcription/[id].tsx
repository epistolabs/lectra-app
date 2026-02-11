import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranscription } from '../../hooks/useTranscriptions';
import { useDeleteTranscriptionMutation } from '../../hooks/useTranscriptionMutation';
import { AudioPlayer } from '../../components/AudioPlayer';
import { ExportModal } from '../../components/ExportModal';
import { formatDateTime } from '../../utils/dateHelpers';
import { formatFileSize, formatDuration } from '../../utils/audioHelpers';
import { getLanguageName } from '../../constants/languages';
import * as Haptics from 'expo-haptics';

export default function TranscriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { data, isLoading, isError, error } = useTranscription(id);
  const deleteMutation = useDeleteTranscriptionMutation();
  const [exportModalVisible, setExportModalVisible] = React.useState(false);

  const transcription = data?.data;

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/transcription/${id}/edit`);
  };

  const handleExport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExportModalVisible(true);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Transcription',
      'Are you sure you want to delete this transcription? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteMutation.mutateAsync(id);
            router.back();
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#f2f2f7' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#007aff'} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !transcription) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#f2f2f7' }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: '#ff3b30' }]}>
            {error?.message || 'Failed to load transcription'}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.button, { backgroundColor: '#007aff' }]}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#f2f2f7' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={{ fontSize: 28, color: isDark ? '#007aff' : '#007aff' }}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
            Transcription
          </Text>
          <View style={styles.backButton} />
        </View>

        {/* Audio Player */}
        {transcription.audio_file_url && (
          <AudioPlayer audioUrl={transcription.audio_file_url} />
        )}

        {/* Metadata */}
        <View style={[styles.metadataCard, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}>
          <View style={styles.metadataRow}>
            <Text style={[styles.metadataLabel, { color: isDark ? '#8e8e93' : '#636366' }]}>
              Date
            </Text>
            <Text style={[styles.metadataValue, { color: isDark ? '#ffffff' : '#000000' }]}>
              {formatDateTime(transcription.created_at)}
            </Text>
          </View>

          {transcription.audio_duration_seconds && (
            <View style={styles.metadataRow}>
              <Text style={[styles.metadataLabel, { color: isDark ? '#8e8e93' : '#636366' }]}>
                Duration
              </Text>
              <Text style={[styles.metadataValue, { color: isDark ? '#ffffff' : '#000000' }]}>
                {formatDuration(transcription.audio_duration_seconds)}
              </Text>
            </View>
          )}

          {transcription.audio_file_size_bytes && (
            <View style={styles.metadataRow}>
              <Text style={[styles.metadataLabel, { color: isDark ? '#8e8e93' : '#636366' }]}>
                File Size
              </Text>
              <Text style={[styles.metadataValue, { color: isDark ? '#ffffff' : '#000000' }]}>
                {formatFileSize(transcription.audio_file_size_bytes)}
              </Text>
            </View>
          )}

          <View style={styles.metadataRow}>
            <Text style={[styles.metadataLabel, { color: isDark ? '#8e8e93' : '#636366' }]}>
              Language
            </Text>
            <Text style={[styles.metadataValue, { color: isDark ? '#ffffff' : '#000000' }]}>
              {getLanguageName(transcription.language_code)}
            </Text>
          </View>

          {transcription.word_count && (
            <View style={styles.metadataRow}>
              <Text style={[styles.metadataLabel, { color: isDark ? '#8e8e93' : '#636366' }]}>
                Word Count
              </Text>
              <Text style={[styles.metadataValue, { color: isDark ? '#ffffff' : '#000000' }]}>
                {transcription.word_count}
              </Text>
            </View>
          )}
        </View>

        {/* Transcription Text */}
        <View style={[styles.textCard, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}>
          <Text style={[styles.textLabel, { color: isDark ? '#8e8e93' : '#636366' }]}>
            Transcription
          </Text>
          <Text style={[styles.transcriptionText, { color: isDark ? '#ffffff' : '#000000' }]}>
            {transcription.transcription_text}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleEdit}
            style={[styles.actionButton, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}
          >
            <Text style={styles.actionIcon}>✏️</Text>
            <Text style={[styles.actionText, { color: isDark ? '#ffffff' : '#000000' }]}>
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleExport}
            style={[styles.actionButton, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}
          >
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={[styles.actionText, { color: isDark ? '#ffffff' : '#000000' }]}>
              Export
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.actionButton, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}
          >
            <Text style={styles.actionIcon}>🗑️</Text>
            <Text style={[styles.actionText, { color: '#ff3b30' }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Export Modal */}
      {transcription && (
        <ExportModal
          visible={exportModalVisible}
          onClose={() => setExportModalVisible(false)}
          transcription={transcription}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  metadataCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  metadataLabel: {
    fontSize: 15,
  },
  metadataValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  textCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  textLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  transcriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
