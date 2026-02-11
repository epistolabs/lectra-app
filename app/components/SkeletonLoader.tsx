import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useColorScheme } from 'react-native';

interface SkeletonLoaderProps {
  height?: number;
  width?: number | string;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({
  height = 20,
  width = '100%',
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          height,
          width,
          borderRadius,
          backgroundColor: isDark ? '#2c2c2e' : '#e5e5ea',
          opacity,
        },
        style,
      ]}
    />
  );
}

export function TranscriptionListSkeleton() {
  return (
    <View style={styles.listItem}>
      <SkeletonLoader height={20} width="80%" style={{ marginBottom: 8 }} />
      <SkeletonLoader height={16} width="60%" style={{ marginBottom: 4 }} />
      <SkeletonLoader height={14} width="40%" />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  listItem: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
  },
});
