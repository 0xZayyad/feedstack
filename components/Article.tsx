import React from 'react';
import { ArticleType } from "@/misc/utils";
import { Text, View, TouchableOpacity, Linking, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BookmarkButton } from './BookmarkButton';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Article = React.memo((article: ArticleType) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = async () => {
    opacity.value = withTiming(0.7, { duration: 100 }, () => {
      opacity.value = withTiming(1, { duration: 100 });
    });
    if (article.url) {
      await Linking.openURL(article.url);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? '#1F2937' : '#fff',
            borderColor: isDark ? '#374151' : '#E5E7EB',
          },
        ]}
      >
        {article.urlToImage && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: article.urlToImage }}
              style={styles.image}
              contentFit="cover"
              transition={200}
              placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
            />
            <View style={styles.imageOverlay} />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={2}
            >
              {article.title}
            </Text>
            <BookmarkButton
              articleUrl={article.url}
              article={article}
              size={24}
            />
          </View>

          {article.description && (
            <Text
              style={[styles.description, { color: isDark ? '#D1D5DB' : '#6B7280' }]}
              numberOfLines={3}
            >
              {article.description}
            </Text>
          )}

          <View style={styles.metadata}>
            {article.source?.name && (
              <View style={styles.metadataItem}>
                <MaterialIcons
                  name="source"
                  size={16}
                  color={isDark ? '#9BA1A6' : '#687076'}
                />
                <Text style={[styles.metadataText, { color: isDark ? '#9BA1A6' : '#6B7280' }]}>
                  {article.source.name}
                </Text>
              </View>
            )}

            {article.author && (
              <View style={styles.metadataItem}>
                <MaterialIcons
                  name="person"
                  size={16}
                  color={isDark ? '#9BA1A6' : '#687076'}
                />
                <Text
                  style={[styles.metadataText, { color: isDark ? '#9BA1A6' : '#6B7280' }]}
                  numberOfLines={1}
                >
                  {article.author.length > 20
                    ? `${article.author.substring(0, 20)}...`
                    : article.author}
                </Text>
              </View>
            )}

            <View style={styles.metadataItem}>
              <MaterialIcons
                name="schedule"
                size={16}
                color={isDark ? '#9BA1A6' : '#687076'}
              />
              <Text style={[styles.metadataText, { color: isDark ? '#9BA1A6' : '#6B7280' }]}>
                {formatDate(article.publishedAt)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
            style={[
              styles.readMoreButton,
              {
                backgroundColor: isDark ? '#374151' : '#EFF6FF',
              },
            ]}
          >
            <Text
              style={[
                styles.readMoreText,
                { color: isDark ? '#fff' : '#0a7ea4' },
              ]}
            >
              Read more
            </Text>
            <MaterialIcons
              name="arrow-forward"
              size={16}
              color={isDark ? '#fff' : '#0a7ea4'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedPressable>
  );
});

Article.displayName = 'Article';

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: 192,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
    flex: 1,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 12,
    marginLeft: 4,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default Article;
