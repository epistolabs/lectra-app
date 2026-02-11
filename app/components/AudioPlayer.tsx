import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useAudioPlayer, PlaybackSpeed } from '../hooks/useAudioPlayer';
import { formatDurationMs } from '../utils/audioHelpers';
import * as Haptics from 'expo-haptics';

interface AudioPlayerProps {
  audioUrl: string | null;
}

export function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    isPlaying,
    isLoading,
    duration,
    position,
    playbackSpeed,
    error,
    togglePlayPause,
    seekTo,
    setSpeed,
  } = useAudioPlayer(audioUrl);

  const handleSpeedChange = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const speeds: PlaybackSpeed[] = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    await setSpeed(speeds[nextIndex]);
  };

  if (!audioUrl) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7' }]}>
        <Text style={[styles.errorText, { color: isDark ? '#8e8e93' : '#636366' }]}>
          No audio available
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7' }]}>
        <Text style={[styles.errorText, { color: '#ff3b30' }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7' }]}>
      {/* Progress Slider */}
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={seekTo}
          minimumTrackTintColor={isDark ? '#007aff' : '#007aff'}
          maximumTrackTintColor={isDark ? '#3a3a3c' : '#c7c7cc'}
          thumbTintColor={isDark ? '#007aff' : '#007aff'}
          disabled={isLoading || !duration}
        />
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: isDark ? '#8e8e93' : '#636366' }]}>
            {formatDurationMs(position)}
          </Text>
          <Text style={[styles.timeText, { color: isDark ? '#8e8e93' : '#636366' }]}>
            {formatDurationMs(duration)}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Playback Speed Button */}
        <TouchableOpacity
          onPress={handleSpeedChange}
          style={[styles.speedButton, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}
          disabled={isLoading}
        >
          <Text style={[styles.speedText, { color: isDark ? '#ffffff' : '#000000' }]}>
            {playbackSpeed}x
          </Text>
        </TouchableOpacity>

        {/* Play/Pause Button */}
        <TouchableOpacity
          onPress={togglePlayPause}
          style={[styles.playButton, { backgroundColor: '#007aff' }]}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          )}
        </TouchableOpacity>

        {/* Spacer to balance layout */}
        <View style={styles.speedButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 13,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  playIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  speedButton: {
    width: 50,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
  },
});
