import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Transcription } from '../types/api';
import { formatListItemDate } from '../utils/dateHelpers';
import { formatFileSize, formatDuration } from '../utils/audioHelpers';
import { getLanguageName } from '../constants/languages';
import * as Haptics from 'expo-haptics';

interface TranscriptionListItemProps {
  transcription: Transcription;
}

export function TranscriptionListItem({ transcription }: TranscriptionListItemProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/transcription/${transcription.id}`);
  };

  // Preview text (first 100 characters)
  const previewText = transcription.transcription_text.length > 100
    ? `${transcription.transcription_text.substring(0, 100)}...`
    : transcription.transcription_text;

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.container,
        { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' },
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text
          style={[styles.previewText, { color: isDark ? '#ffffff' : '#000000' }]}
          numberOfLines={2}
        >
          {previewText}
        </Text>

        <View style={styles.metadata}>
          <Text style={[styles.metadataText, { color: isDark ? '#8e8e93' : '#636366' }]}>
            {formatListItemDate(transcription.created_at)}
          </Text>

          {transcription.word_count && (
            <>
              <Text style={[styles.separator, { color: isDark ? '#8e8e93' : '#636366' }]}>
                •
              </Text>
              <Text style={[styles.metadataText, { color: isDark ? '#8e8e93' : '#636366' }]}>
                {transcription.word_count} words
              </Text>
            </>
          )}

          {transcription.audio_duration_seconds && (
            <>
              <Text style={[styles.separator, { color: isDark ? '#8e8e93' : '#636366' }]}>
                •
              </Text>
              <Text style={[styles.metadataText, { color: isDark ? '#8e8e93' : '#636366' }]}>
                {formatDuration(transcription.audio_duration_seconds)}
              </Text>
            </>
          )}

          {transcription.language_code !== 'en-US' && (
            <>
              <Text style={[styles.separator, { color: isDark ? '#8e8e93' : '#636366' }]}>
                •
              </Text>
              <Text style={[styles.metadataText, { color: isDark ? '#8e8e93' : '#636366' }]}>
                {getLanguageName(transcription.language_code).split(' ')[0]}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.chevron}>
        <Text style={{ color: isDark ? '#8e8e93' : '#c7c7cc', fontSize: 20 }}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  previewText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
    fontWeight: '500',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metadataText: {
    fontSize: 13,
  },
  separator: {
    marginHorizontal: 6,
    fontSize: 13,
  },
  chevron: {
    marginLeft: 8,
  },
});
