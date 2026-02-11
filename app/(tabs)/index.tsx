import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { Mic, Square, FileText, RotateCcw } from 'lucide-react-native';
import { HelloWave } from '@/components/hello-wave';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TranscriptionAPI } from '@/app/services/api';
import { TranscriptionStatus } from '@/app/types/transcription';

export default function HomeScreen() {
  const [recording, setRecording] = useState<Audio.Recording | undefined>(undefined);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [status, setStatus] = useState<TranscriptionStatus>(TranscriptionStatus.IDLE);

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
      const { recording } = await Audio.Recording.createAsync( 
         Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert("Error", "Could not start recording.");
    }
  }

  // Stop Recording
  async function stopRecording() {
    console.log('Stopping recording..');
    if (!recording) return;

    setRecording(undefined);
    setIsRecording(false);
    
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI(); 
    setAudioUri(uri);
    console.log('Recording stopped and stored at', uri);
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
      Alert.alert('Error', 'No audio file available to transcribe');
      return;
    }

    setIsTranscribing(true);
    setStatus(TranscriptionStatus.TRANSCRIBING);

    try {
      console.log('Starting transcription for:', audioUri);
      const result = await TranscriptionAPI.transcribeAudio(audioUri);

      console.log('Transcription result:', result);

      if (result.transcription && result.transcription.trim().length > 0) {
        setTranscription(result.transcription);
        setStatus(TranscriptionStatus.COMPLETED);
        Alert.alert('Success', 'Audio transcribed successfully!');
      } else {
        setTranscription('');
        setStatus(TranscriptionStatus.COMPLETED);
        Alert.alert('Info', result.message || 'No speech detected in the audio file');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setStatus(TranscriptionStatus.ERROR);
      Alert.alert(
        'Transcription Error',
        error instanceof Error ? error.message : 'Failed to transcribe audio. Please try again.'
      );
    } finally {
      setIsTranscribing(false);
    }
  }

  // Reset to start a new recording
  function handleNewRecording() {
    setRecording(undefined);
    setAudioUri(null);
    setTranscription(null);
    setIsRecording(false);
    setIsTranscribing(false);
    setStatus(TranscriptionStatus.IDLE);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Lectra</ThemedText>
        <ThemedText style={styles.subtitle}>AI Note Maker</ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.recordContainer}>
          {/* Dynamic Status Text */}
          <Text style={styles.statusText}>
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
            <View style={styles.fileInfo}>
              <Text style={styles.fileText}>Recording saved!</Text>
              <Text style={styles.uriText}>{audioUri.split('/').pop()}</Text>
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
              <ActivityIndicator size="large" color="#3182ce" />
              <Text style={styles.loadingText}>Transcribing your audio...</Text>
              <Text style={styles.loadingSubtext}>This may take a few moments</Text>
            </View>
          )}

          {/* Transcription Display */}
          {transcription && (
            <View style={styles.transcriptionContainer}>
              <View style={styles.transcriptionHeader}>
                <FileText color="#3182ce" size={24} />
                <Text style={styles.transcriptionTitle}>Transcription</Text>
              </View>
              <ScrollView style={styles.transcriptionScroll}>
                <Text style={styles.transcriptionText}>{transcription}</Text>
              </ScrollView>
            </View>
          )}

          {/* New Recording Button */}
          {(audioUri || transcription) && !isRecording && !isTranscribing && (
            <TouchableOpacity
              style={styles.newRecordingButton}
              onPress={handleNewRecording}
            >
              <RotateCcw color="#e53e3e" size={20} style={styles.buttonIcon} />
              <Text style={styles.newRecordingButtonText}>New Recording</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginTop: 4,
  },
  recordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  statusText: {
    fontSize: 18,
    color: '#4a5568',
    marginBottom: 30,
    fontWeight: '500',
    textAlign: 'center',
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e53e3e',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#e53e3e',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 10px 15px rgba(229, 62, 62, 0.3)',
      }
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
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    alignItems: 'center',
    width: '90%',
  },
  fileText: {
    fontWeight: 'bold',
    color: '#2b6cb0',
    marginBottom: 5,
  },
  uriText: {
    color: '#a0aec0',
    fontSize: 12,
    textAlign: 'center',
  },
  transcribeButton: {
    marginTop: 30,
    backgroundColor: '#3182ce',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#3182ce',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 4px 8px rgba(49, 130, 206, 0.3)',
      }
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
    color: '#3182ce',
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#718096',
  },
  transcriptionContainer: {
    marginTop: 30,
    width: '95%',
    maxWidth: 600,
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  transcriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  transcriptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
    marginLeft: 10,
  },
  transcriptionScroll: {
    maxHeight: 400,
  },
  transcriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2d3748',
  },
  newRecordingButton: {
    marginTop: 20,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e53e3e',
  },
  newRecordingButtonText: {
    color: '#e53e3e',
    fontSize: 16,
    fontWeight: '600',
  },
});
