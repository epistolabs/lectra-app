import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { Mic, Square } from 'lucide-react-native'; // Removed 'Save'/'Play' for now to keep it simple
import { HelloWave } from '@/components/hello-wave';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  const [recording, setRecording] = useState<Audio.Recording | undefined>(undefined);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Lectra</ThemedText>
        <ThemedText style={styles.subtitle}>AI Note Maker</ThemedText>
      </View>

      <View style={styles.recordContainer}>
        {/* Dynamic Status Text */}
        <Text style={styles.statusText}>
          {isRecording ? "Recording in progress..." : (audioUri ? "Ready to Upload" : "Tap to Record")}
        </Text>

        {/* The Big Red Button */}
        <TouchableOpacity 
          style={[styles.recordButton, isRecording && styles.recordingActive]} 
          onPress={handleRecordPress}
        >
          {isRecording ? (
            <Square color="white" size={40} fill="white" />
          ) : (
            <Mic color="white" size={40} />
          )}
        </TouchableOpacity>

        {/* File Preview Section */}
        {audioUri && !isRecording && (
          <View style={styles.fileInfo}>
            <Text style={styles.fileText}>File saved locally!</Text>
            <Text style={styles.uriText}>{audioUri.split('/').pop()}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Changed to white for simplicity in light mode
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 100, // Adjusted for safe area
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginTop: 4,
  },
  recordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 18,
    color: '#4a5568',
    marginBottom: 30,
    fontWeight: '500',
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e53e3e',
    alignItems: 'center',
    justifyContent: 'center',
    // Shadows work differently on Web vs Native
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
    width: '80%',
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
  }
});
