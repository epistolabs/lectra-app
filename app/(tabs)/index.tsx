import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator, ScrollView, useColorScheme } from 'react-native';
import { Audio } from 'expo-av';
import { Mic, Square, FileText, RotateCcw, History } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { TranscriptionAPI } from '@/app/services/api';
import { TranscriptionStatus } from '@/app/types/transcription';
import { LanguageSelector } from '@/app/components/LanguageSelector';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [recording, setRecording] = useState<Audio.Recording | undefined>(undefined);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [transcriptionId, setTranscriptionId] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [status, setStatus] = useState<TranscriptionStatus>(TranscriptionStatus.IDLE);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');

  // Start Recording
  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const { recording } = await Audio.Recording.createAsync(
         Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      console.log('Recording started');
      Toast.show({
        type: 'info',
        text1: 'Recording',
        text2: 'Recording started',
      });
    } catch (err) {
      console.error('Failed to start recording', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not start recording',
      });
    }
  }

  // Stop Recording
  async function stopRecording() {
    console.log('Stopping recording..');
    if (!recording) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRecording(undefined);
    setIsRecording(false);

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setAudioUri(uri);
    console.log('Recording stopped and stored at', uri);
    Toast.show({
      type: 'success',
      text1: 'Recording Saved',
      text2: 'Ready to transcribe',
    });
  }

  // Handle the big button press
  const handleRecordPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Handle transcription
  async function handleTranscribe() {
    if (!audioUri) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No audio file available to transcribe',
      });
      return;
    }

    setIsTranscribing(true);
    setStatus(TranscriptionStatus.TRANSCRIBING);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      console.log('Starting transcription for:', audioUri, 'with language:', selectedLanguage);
      const result = await TranscriptionAPI.transcribeAudio(audioUri, selectedLanguage);

      console.log('Transcription result:', result);

      if (result.transcription && result.transcription.trim().length > 0) {
        setTranscription(result.transcription);
        setTranscriptionId(result.id || null);
        setStatus(TranscriptionStatus.COMPLETED);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Audio transcribed successfully!',
        });
      } else {
        setTranscription('');
        setStatus(TranscriptionStatus.COMPLETED);
        Toast.show({
          type: 'info',
          text1: 'No Speech Detected',
          text2: result.message || 'No speech detected in the audio file',
        });
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setStatus(TranscriptionStatus.ERROR);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: 'error',
        text1: 'Transcription Error',
        text2: error instanceof Error ? error.message : 'Failed to transcribe audio',
      });
    } finally {
      setIsTranscribing(false);
    }
  }

  // Reset to start a new recording
  function handleNewRecording() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRecording(undefined);
    setAudioUri(null);
    setTranscription(null);
    setTranscriptionId(null);
    setIsRecording(false);
    setIsTranscribing(false);
    setStatus(TranscriptionStatus.IDLE);
  }

  // Navigate to history
  function handleViewHistory() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/history');
  }

  // View transcription detail
  function handleViewTranscription() {
    if (transcriptionId) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/(tabs)/transcription/${transcriptionId}`);
    }
  }

  const backgroundColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#2d3748';
  const subtleTextColor = isDark ? '#8e8e93' : '#718096';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Lectra</Text>
        <Text style={[styles.subtitle, { color: subtleTextColor }]}>AI Note Maker</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.recordContainer}>
          {/* Language Selector - Show when idle or ready to transcribe */}
          {!isRecording && !isTranscribing && !transcription && (
            <View style={styles.languageSelectorContainer}>
              <LanguageSelector
                selectedLanguageCode={selectedLanguage}
                onLanguageSelect={setSelectedLanguage}
              />
            </View>
          )}

          {/* Dynamic Status Text */}
          <Text style={[styles.statusText, { color: subtleTextColor }]}>
            {isRecording
              ? "Recording in progress..."
              : isTranscribing
              ? "Transcribing audio..."
              : transcription
              ? "Transcription completed!"
              : audioUri
              ? "Ready to transcribe"
              : "Tap to record"}
          </Text>

          {/* The Big Red Button - Only show when no transcription yet */}
          {!transcription && (
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordingActive]}
              onPress={handleRecordPress}
              disabled={isTranscribing}
            >
              {isRecording ? (
                <Square color="white" size={40} fill="white" />
              ) : (
                <Mic color="white" size={40} />
              )}
            </TouchableOpacity>
          )}

          {/* File Preview Section */}
          {audioUri && !isRecording && !transcription && (
            <View style={[styles.fileInfo, { backgroundColor: isDark ? '#1c1c1e' : '#f7fafc' }]}>
              <Text style={[styles.fileText, { color: isDark ? '#007aff' : '#2b6cb0' }]}>
                Recording saved!
              </Text>
              <Text style={[styles.uriText, { color: subtleTextColor }]}>
                {audioUri.split('/').pop()}
              </Text>
            </View>
          )}

          {/* Transcribe Button */}
          {audioUri && !isRecording && !transcription && !isTranscribing && (
            <TouchableOpacity
              style={styles.transcribeButton}
              onPress={handleTranscribe}
            >
              <FileText color="white" size={24} style={styles.buttonIcon} />
              <Text style={styles.transcribeButtonText}>Transcribe Audio</Text>
            </TouchableOpacity>
          )}

          {/* Loading Indicator */}
          {isTranscribing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007aff" />
              <Text style={[styles.loadingText, { color: '#007aff' }]}>
                Transcribing your audio...
              </Text>
              <Text style={[styles.loadingSubtext, { color: subtleTextColor }]}>
                This may take a few moments
              </Text>
            </View>
          )}

          {/* Transcription Display */}
          {transcription && (
            <View style={[styles.transcriptionContainer, { backgroundColor: isDark ? '#1c1c1e' : '#f7fafc', borderColor: isDark ? '#2c2c2e' : '#e2e8f0' }]}>
              <View style={styles.transcriptionHeader}>
                <FileText color="#007aff" size={24} />
                <Text style={[styles.transcriptionTitle, { color: textColor }]}>
                  Transcription
                </Text>
              </View>
              <ScrollView style={styles.transcriptionScroll}>
                <Text style={[styles.transcriptionText, { color: textColor }]}>
                  {transcription}
                </Text>
              </ScrollView>

              {/* View Detail Button */}
              {transcriptionId && (
                <TouchableOpacity
                  style={[styles.viewDetailButton, { backgroundColor: '#007aff' }]}
                  onPress={handleViewTranscription}
                >
                  <Text style={styles.viewDetailButtonText}>View Full Details</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Action Buttons */}
          {(audioUri || transcription) && !isRecording && !isTranscribing && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.newRecordingButton, { borderColor: '#ff3b30' }]}
                onPress={handleNewRecording}
              >
                <RotateCcw color="#ff3b30" size={20} style={styles.buttonIcon} />
                <Text style={[styles.newRecordingButtonText, { color: '#ff3b30' }]}>
                  New Recording
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.historyButton, { borderColor: '#007aff' }]}
                onPress={handleViewHistory}
              >
                <History color="#007aff" size={20} style={styles.buttonIcon} />
                <Text style={[styles.historyButtonText, { color: '#007aff' }]}>
                  View History
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  recordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  languageSelectorContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 18,
    marginBottom: 30,
    fontWeight: '500',
    textAlign: 'center',
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ff3b30',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#ff3b30',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  recordingActive: {
    backgroundColor: '#c53030',
    transform: [{ scale: 1.1 }],
    borderWidth: 4,
    borderColor: '#feb2b2',
  },
  fileInfo: {
    marginTop: 40,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '90%',
  },
  fileText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  uriText: {
    fontSize: 12,
    textAlign: 'center',
  },
  transcribeButton: {
    marginTop: 30,
    backgroundColor: '#007aff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#007aff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  transcribeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 10,
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
  },
  transcriptionContainer: {
    marginTop: 30,
    width: '95%',
    maxWidth: 600,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
  },
  transcriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  transcriptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 10,
  },
  transcriptionScroll: {
    maxHeight: 400,
  },
  transcriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  viewDetailButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewDetailButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
    width: '90%',
  },
  newRecordingButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  newRecordingButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  historyButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
