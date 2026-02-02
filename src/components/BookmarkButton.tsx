import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { bookmarksStorage } from '@/services/storage';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface BookmarkButtonProps {
  articleUrl: string;
  article: {
    url: string;
    title: string;
    description?: string;
    urlToImage?: string;
    source?: { name: string };
    author?: string;
    publishedAt: string;
  };
  size?: number;
  style?: any;
}

export function BookmarkButton({
  articleUrl,
  article,
  size = 24,
  style,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      const bookmarked = await bookmarksStorage.isBookmarked(articleUrl);
      setIsBookmarked(bookmarked);
    };
    checkBookmarkStatus();
  }, [articleUrl]);

  const handlePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate
    scale.value = withSequence(
      withSpring(1.3),
      withSpring(1)
    );
    rotation.value = withSequence(
      withSpring(15),
      withSpring(0)
    );

    if (isBookmarked) {
      await bookmarksStorage.remove(articleUrl);
      setIsBookmarked(false);
    } else {
      await bookmarksStorage.add({
        ...article,
        bookmarkedAt: new Date().toISOString(),
      });
      setIsBookmarked(true);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <AnimatedTouchable
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.button, animatedStyle, style]}
    >
      <MaterialIcons
        name={isBookmarked ? 'bookmark' : 'bookmark-border'}
        size={size}
        color={isBookmarked ? (isDark ? '#FBBF24' : '#F59E0B') : (isDark ? '#9BA1A6' : '#687076')}
      />
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});

