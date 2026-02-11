import { useState, useEffect, useRef } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';

export type PlaybackSpeed = 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0;

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  position: number;
  playbackSpeed: PlaybackSpeed;
  error: string | null;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setSpeed: (speed: PlaybackSpeed) => Promise<void>;
  unload: () => Promise<void>;
}

export function useAudioPlayer(audioUrl: string | null): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1.0);
  const [error, setError] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Load audio file
  useEffect(() => {
    if (!audioUrl) return;

    const loadAudio = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Configure audio mode
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        // Create and load sound
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: false, rate: playbackSpeed },
          onPlaybackStatusUpdate
        );

        soundRef.current = sound;
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load audio:', err);
        setError('Failed to load audio file');
        setIsLoading(false);
      }
    };

    loadAudio();

    // Cleanup
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [audioUrl]);

  // Playback status update handler
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error('Playback error:', status.error);
        setError(`Playback error: ${status.error}`);
      }
      return;
    }

    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis);
    setDuration(status.durationMillis || 0);

    // Auto-stop at end
    if (status.didJustFinish) {
      setIsPlaying(false);
      setPosition(0);
    }
  };

  const play = async () => {
    try {
      if (!soundRef.current) return;
      await soundRef.current.playAsync();
    } catch (err) {
      console.error('Play error:', err);
      setError('Failed to play audio');
    }
  };

  const pause = async () => {
    try {
      if (!soundRef.current) return;
      await soundRef.current.pauseAsync();
    } catch (err) {
      console.error('Pause error:', err);
      setError('Failed to pause audio');
    }
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  };

  const seekTo = async (newPosition: number) => {
    try {
      if (!soundRef.current) return;
      await soundRef.current.setPositionAsync(newPosition);
    } catch (err) {
      console.error('Seek error:', err);
      setError('Failed to seek');
    }
  };

  const setSpeed = async (speed: PlaybackSpeed) => {
    try {
      if (!soundRef.current) return;
      await soundRef.current.setRateAsync(speed, true);
      setPlaybackSpeed(speed);
    } catch (err) {
      console.error('Set speed error:', err);
      setError('Failed to change playback speed');
    }
  };

  const unload = async () => {
    try {
      if (!soundRef.current) return;
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    } catch (err) {
      console.error('Unload error:', err);
    }
  };

  return {
    isPlaying,
    isLoading,
    duration,
    position,
    playbackSpeed,
    error,
    play,
    pause,
    togglePlayPause,
    seekTo,
    setSpeed,
    unload,
  };
}
