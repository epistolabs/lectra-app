import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranscription } from '../../../hooks/useTranscriptions';
import { useUpdateTranscriptionMutation } from '../../../hooks/useTranscriptionMutation';
import * as Haptics from 'expo-haptics';

export default function EditTranscriptionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { data, isLoading } = useTranscription(id);
  const updateMutation = useUpdateTranscriptionMutation();

  const [text, setText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize text when data loads
  useEffect(() => {
    if (data?.data) {
      setText(data.data.transcription_text);
    }
  }, [data]);

  // Track changes
  useEffect(() => {
    if (data?.data) {
      setHasChanges(text !== data.data.transcription_text);
    }
  }, [text, data]);

  const handleSave = async () => {
    if (!hasChanges || !text.trim()) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateMutation.mutateAsync({ id, text: text.trim() });
      router.back();
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Save error:', error);
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (hasChanges) {
      // Could add a confirmation dialog here
      router.back();
    } else {
      router.back();
    }
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

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const characterCount = text.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#f2f2f7' }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Text style={[styles.cancelText, { color: isDark ? '#007aff' : '#007aff' }]}>
              Cancel
            </Text>
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
            Edit Transcription
          </Text>

          <TouchableOpacity
            onPress={handleSave}
            style={styles.headerButton}
            disabled={!hasChanges || updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <ActivityIndicator size="small" color="#007aff" />
            ) : (
              <Text
                style={[
                  styles.saveText,
                  {
                    color: hasChanges ? '#007aff' : isDark ? '#3a3a3c' : '#c7c7cc',
                    fontWeight: hasChanges ? '600' : '400',
                  },
                ]}
              >
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Text Editor */}
        <View style={styles.editorContainer}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                color: isDark ? '#ffffff' : '#000000',
              },
            ]}
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
            placeholder="Enter transcription text..."
            placeholderTextColor={isDark ? '#8e8e93' : '#c7c7cc'}
            textAlignVertical="top"
          />

          {/* Character Count */}
          <View style={styles.statsContainer}>
            <Text style={[styles.statsText, { color: isDark ? '#8e8e93' : '#636366' }]}>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </Text>
            <Text style={[styles.statsText, { color: isDark ? '#8e8e93' : '#636366' }]}>
              {characterCount} {characterCount === 1 ? 'character' : 'characters'}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3a3a3c',
  },
  headerButton: {
    minWidth: 70,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelText: {
    fontSize: 17,
  },
  saveText: {
    fontSize: 17,
    textAlign: 'right',
  },
  editorContainer: {
    flex: 1,
    padding: 16,
  },
  textInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  statsText: {
    fontSize: 13,
  },
});
