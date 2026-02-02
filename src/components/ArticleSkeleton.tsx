import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export function ArticleSkeleton() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1F2937' : '#fff',
          borderColor: isDark ? '#374151' : '#E5E7EB',
        },
      ]}
    >
      <Animated.View
        style={[
          styles.skeleton,
          {
            backgroundColor: isDark ? '#374151' : '#E5E7EB',
            height: 192,
            marginBottom: 16,
          },
          animatedStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.skeleton,
          {
            backgroundColor: isDark ? '#374151' : '#E5E7EB',
            height: 24,
            marginBottom: 8,
          },
          animatedStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.skeleton,
          {
            backgroundColor: isDark ? '#374151' : '#E5E7EB',
            height: 24,
            width: '75%',
            marginBottom: 8,
          },
          animatedStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.skeleton,
          {
            backgroundColor: isDark ? '#374151' : '#E5E7EB',
            height: 16,
            marginBottom: 8,
          },
          animatedStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.skeleton,
          {
            backgroundColor: isDark ? '#374151' : '#E5E7EB',
            height: 16,
            width: '83%',
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  skeleton: {
    borderRadius: 8,
  },
});
