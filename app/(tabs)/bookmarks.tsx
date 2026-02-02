import React, { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { bookmarksStorage, type Bookmark } from "@/utils/storage";
import Article from "@/components/Article";
import { ArticleSkeleton } from "@/components/ArticleSkeleton";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedView = Animated.createAnimatedComponent(View);

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === "dark";

  const loadBookmarks = useCallback(async () => {
    try {
      const allBookmarks = await bookmarksStorage.getAll();
      setBookmarks(allBookmarks);
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBookmarks();
  }, [loadBookmarks]);

  const handleRemoveBookmark = async (url: string) => {
    await bookmarksStorage.remove(url);
    loadBookmarks();
  };

  const renderArticle = ({ item, index }: { item: Bookmark; index: number }) => (
    <AnimatedView entering={FadeInDown.delay(index * 50)}>
      <View style={styles.articleWrapper}>
        <Article {...item} />
        <TouchableOpacity
          style={[
            styles.removeButton,
            { backgroundColor: isDark ? "#374151" : "#FEE2E2" },
          ]}
          onPress={() => handleRemoveBookmark(item.url)}
        >
          <MaterialIcons
            name="delete-outline"
            size={20}
            color={isDark ? "#EF4444" : "#DC2626"}
          />
          <Text
            style={[
              styles.removeButtonText,
              { color: isDark ? "#EF4444" : "#DC2626" },
            ]}
          >
            Remove
          </Text>
        </TouchableOpacity>
      </View>
    </AnimatedView>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          {[...Array(3)].map((_, i) => (
            <ArticleSkeleton key={i} />
          ))}
        </View>
      );
    }

    return (
      <AnimatedView
        entering={FadeIn}
        style={[styles.emptyState, { backgroundColor: colors.background }]}
      >
        <MaterialIcons
          name="bookmark-border"
          size={64}
          color={isDark ? "#9BA1A6" : "#687076"}
        />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No bookmarks yet
        </Text>
        <Text style={[styles.emptyText, { color: isDark ? "#9BA1A6" : "#6B7280" }]}>
          Bookmark articles you want to read later by tapping the bookmark icon
        </Text>
      </AnimatedView>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: isDark ? "#111827" : "#F9FAFB" }]}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: isDark ? "#1F2937" : "#fff",
              borderBottomColor: isDark ? "#374151" : "#E5E7EB",
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Bookmarks
          </Text>
          {bookmarks.length > 0 && (
            <Text style={[styles.count, { color: isDark ? "#9BA1A6" : "#6B7280" }]}>
              {bookmarks.length} {bookmarks.length === 1 ? "article" : "articles"}
            </Text>
          )}
        </View>

        <FlatList
          data={bookmarks}
          renderItem={renderArticle}
          keyExtractor={(item) => item.url}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? "#fff" : "#0a7ea4"}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  count: {
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  articleWrapper: {
    marginBottom: 16,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
});

