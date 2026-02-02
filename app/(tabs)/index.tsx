import Article from "@/components/Article";
import { ArticleSkeleton } from "@/components/ArticleSkeleton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ArticleType, Category, Country, NewsApi } from "@/misc/utils";
import { articleCache, cache } from "@/utils/cache";
import { preferencesStorage } from "@/utils/storage";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedView = Animated.createAnimatedComponent(View);

const countries = [
  { label: "🇺🇸 United States", value: "us" },
  { label: "🇬🇧 United Kingdom", value: "gb" },
  { label: "🇨🇦 Canada", value: "ca" },
  { label: "🇦🇺 Australia", value: "au" },
  { label: "🇳🇬 Nigeria", value: "ng" },
  { label: "🇫🇷 France", value: "fr" },
  { label: "🇩🇪 Germany", value: "de" },
  { label: "🇯🇵 Japan", value: "jp" },
];

const categories = [
  { label: "📰 General", value: "general" },
  { label: "💼 Business", value: "business" },
  { label: "🎬 Entertainment", value: "entertainment" },
  { label: "🏥 Health", value: "health" },
  { label: "🔬 Science", value: "science" },
  { label: "⚽ Sports", value: "sports" },
  { label: "💻 Technology", value: "technology" },
];

export default function HomeScreen() {
  const [articles, setArticles] = useState<ArticleType[] | null>(null);
  const [query, setQuery] = useState<string>("");
  const [country, setCountry] = useState<string>("us");
  const [category, setCategory] = useState<string>("technology");
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === "dark";

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      const defaultCountry = await preferencesStorage.getDefaultCountry();
      const defaultCategory = await preferencesStorage.getDefaultCategory();
      if (defaultCountry) setCountry(defaultCountry);
      if (defaultCategory) setCategory(defaultCategory);
    };
    loadPreferences();
  }, []);

  // Load cached data on mount
  useEffect(() => {
    const loadCachedData = async () => {
      const cachedArticles = await articleCache.getTopHeadlines(country, category, query);
      if (cachedArticles && cachedArticles.length > 0) {
        setArticles(cachedArticles);
        const timestamp = await articleCache.getCacheTimestamp(country, category, query);
        setLastUpdated(timestamp);
      }
      setIsInitialLoad(false);
    };
    loadCachedData();
  }, []);

  // Clear expired cache on mount
  useEffect(() => {
    cache.clearExpired();
  }, []);

  const fetchArticles = useCallback(async (isRefresh = false) => {
    // If not refreshing, try to load from cache first
    if (!isRefresh && !isInitialLoad) {
      const cachedArticles = await articleCache.getTopHeadlines(country, category, query);
      if (cachedArticles && cachedArticles.length > 0) {
        setArticles(cachedArticles);
        const timestamp = await articleCache.getCacheTimestamp(country, category, query);
        setLastUpdated(timestamp);
      }
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await NewsApi.top_headlines({
        country: country as Country,
        category: category as Category,
        ...(query ? { q: query } : {}),
      });
      const fetchedArticles = response.data.articles || [];
      setArticles(fetchedArticles);
      
      // Cache the articles
      await articleCache.cacheTopHeadlines(country, category, query, fetchedArticles);
      const timestamp = Date.now();
      setLastUpdated(timestamp);
      
      // Save preferences
      await preferencesStorage.setDefaultCountry(country);
      await preferencesStorage.setDefaultCategory(category);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load articles. Please try again."
      );
      // Keep cached articles if available on error
      if (!articles) {
        setArticles([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsInitialLoad(false);
    }
  }, [country, category, query, isInitialLoad, articles]);

  useEffect(() => {
    if (!isInitialLoad) {
      fetchArticles();
    }
  }, [country, category]);

  const onRefresh = useCallback(() => {
    fetchArticles(true);
  }, [fetchArticles]);

  const handleSearch = () => {
    fetchArticles();
  };

  const formatLastUpdated = (timestamp: number): string => {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const renderArticle = ({ item, index }: { item: ArticleType; index: number }) => (
    <AnimatedView entering={FadeInDown.delay(index * 50)}>
      <Article {...item} />
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

    if (error) {
      return (
        <AnimatedView
          entering={FadeIn}
          style={[styles.emptyState, { backgroundColor: colors.background }]}
        >
          <MaterialIcons
            name="error-outline"
            size={64}
            color={isDark ? "#9BA1A6" : "#687076"}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Oops! Something went wrong
          </Text>
          <Text style={[styles.emptyText, { color: isDark ? "#9BA1A6" : "#6B7280" }]}>
            {error}
          </Text>
          <Button title="Try Again" onPress={() => fetchArticles()} />
        </AnimatedView>
      );
    }

    return (
      <AnimatedView
        entering={FadeIn}
        style={[styles.emptyState, { backgroundColor: colors.background }]}
      >
        <MaterialIcons
          name="article"
          size={64}
          color={isDark ? "#9BA1A6" : "#687076"}
        />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No articles found
        </Text>
        <Text style={[styles.emptyText, { color: isDark ? "#9BA1A6" : "#6B7280" }]}>
          Try adjusting your filters or search query
        </Text>
      </AnimatedView>
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
    <View style={[{ backgroundColor: isDark ? "#111827" : "#F9FAFB" }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? "#1F2937" : "#fff",
            borderBottomColor: isDark ? "#374151" : "#E5E7EB",
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              FeedStack
            </Text>
            {lastUpdated && (
              <Text style={[styles.lastUpdated, { color: isDark ? "#9BA1A6" : "#6B7280" }]}>
                Updated {formatLastUpdated(lastUpdated)}
              </Text>
            )}
          </View>
          <Button
            title={showFilters ? "Hide Filters" : "Filters"}
            variant="outline"
            size="sm"
            onPress={() => setShowFilters(!showFilters)}
          />
        </View>

        {showFilters && (
          <AnimatedView entering={FadeInDown} style={styles.filtersContainer}>
            <Input
              value={query}
              onChangeText={setQuery}
              placeholder="Search articles..."
              label="Search"
            />
            <View style={styles.filtersRow}>
              <View style={styles.filterHalf}>
                <Select
                  value={country}
                  onValueChange={setCountry}
                  options={countries}
                  label="Country"
                />
              </View>
              <View style={styles.filterHalf}>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  options={categories}
                  label="Category"
                />
              </View>
            </View>
            <Button
              title="Apply Filters"
              onPress={handleSearch}
              style={styles.applyButton}
            />
          </AnimatedView>
        )}
      </View>

      <FlatList
        data={articles || []}
        renderItem={renderArticle}
        keyExtractor={(item, index) => item.url + index}
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
    </View></SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  lastUpdated: {
    fontSize: 12,
    marginTop: 2,
  },
  filtersContainer: {
    marginTop: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterHalf: {
    flex: 1,
  },
  applyButton: {
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
});
