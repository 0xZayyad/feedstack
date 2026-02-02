import { ArticleType, NewsApi } from "@/api/news";
import Article from "@/components/Article";
import { ArticleSkeleton } from "@/components/ArticleSkeleton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { articleCache, cache, type CachedData } from "@/services/cache";
import { preferencesStorage } from "@/services/storage";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedView = Animated.createAnimatedComponent(View);

const languages = [
  { label: "🇬🇧 English", value: "en" },
  { label: "🇫🇷 French", value: "fr" },
  { label: "🇪🇸 Spanish", value: "es" },
  { label: "🇩🇪 German", value: "de" },
  { label: "🇮🇹 Italian", value: "it" },
  { label: "🇵🇹 Portuguese", value: "pt" },
];

const sortOptions = [
  { label: "🔍 Relevancy", value: "relevancy" },
  { label: "🔥 Popularity", value: "popularity" },
  { label: "📅 Published Date", value: "publishedAt" },
];

export default function ExploreScreen() {
  const [articles, setArticles] = useState<ArticleType[] | null>(null);
  const [query, setQuery] = useState<string>("");
  const [language, setLanguage] = useState<string>("en");
  const [sortBy, setSortBy] = useState<"relevancy" | "popularity" | "publishedAt">("relevancy");
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === "dark";
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      const defaultLanguage = await preferencesStorage.getDefaultLanguage();
      const defaultSortBy = await preferencesStorage.getDefaultSortBy();
      if (defaultLanguage) setLanguage(defaultLanguage);
      if (defaultSortBy) setSortBy(defaultSortBy as "relevancy" | "popularity" | "publishedAt");
    };
    loadPreferences();
  }, []);

  // Clear expired cache on mount
  useEffect(() => {
    cache.clearExpired();
  }, []);

  const fetchArticles = useCallback(
    async (isRefresh = false, searchQuery?: string) => {
      const searchTerm = searchQuery !== undefined ? searchQuery : query;
      if (!searchTerm.trim()) {
        setArticles([]);
        return;
      }

      // If not refreshing, try to load from cache first
      if (!isRefresh && !isInitialLoad) {
        const cachedArticles = await articleCache.getSearch(searchTerm, language, sortBy);
        if (cachedArticles && cachedArticles.length > 0) {
          setArticles(cachedArticles);
          // Get cache timestamp
          const key = articleCache.generateKey('search', { query: searchTerm, language, sortBy });
          const cachedData = await cache.get<CachedData<ArticleType[]>>(key);
          if (cachedData) {
            setLastUpdated(cachedData.timestamp);
          }
        }
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const response = await NewsApi.everything({
          q: searchTerm,
          language: language,
          sortBy: sortBy,
        });
        const fetchedArticles = response.data.articles || [];
        setArticles(fetchedArticles);

        // Cache the articles
        await articleCache.cacheSearch(searchTerm, language, sortBy, fetchedArticles);
        const timestamp = Date.now();
        setLastUpdated(timestamp);

        // Save preferences
        await preferencesStorage.setDefaultLanguage(language);
        await preferencesStorage.setDefaultSortBy(sortBy);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
          "Failed to search articles. Please try again."
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
    },
    [query, language, sortBy, isInitialLoad, articles]
  );

  useEffect(() => {
    if (!isInitialLoad) {
      fetchArticles();
    }
  }, [language, sortBy]);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (query.trim()) {
        fetchArticles(false, query);
      }
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  useEffect(() => {
    const filters = [];
    if (query) filters.push(`Search: "${query}"`);
    if (language !== "en") filters.push(`Language: ${languages.find(l => l.value === language)?.label}`);
    if (sortBy !== "relevancy") filters.push(`Sort: ${sortOptions.find(s => s.value === sortBy)?.label}`);
    setActiveFilters(filters);
  }, [query, language, sortBy]);

  const onRefresh = useCallback(() => {
    fetchArticles(true);
  }, [fetchArticles]);

  const clearFilters = () => {
    setQuery("");
    setLanguage("en");
    setSortBy("relevancy");
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

    if (!query.trim()) {
      return (
        <AnimatedView
          entering={FadeIn}
          style={[styles.emptyState, { backgroundColor: colors.background }]}
        >
          <MaterialIcons
            name="search"
            size={64}
            color={isDark ? "#9BA1A6" : "#687076"}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Start Exploring
          </Text>
          <Text style={[styles.emptyText, { color: isDark ? "#9BA1A6" : "#6B7280" }]}>
            Enter a search query to find articles
          </Text>
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
          Try a different search query or adjust your filters
        </Text>
      </AnimatedView>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
                Explore
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

          <View style={styles.searchContainer}>
            <Input
              value={query}
              onChangeText={setQuery}
              placeholder="Search articles..."
              style={styles.searchInput}
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery("")}
                style={styles.clearButton}
              >
                <MaterialIcons
                  name="clear"
                  size={20}
                  color={isDark ? "#9BA1A6" : "#687076"}
                />
              </TouchableOpacity>
            )}
          </View>

          {activeFilters.length > 0 && (
            <View style={styles.filtersChips}>
              {activeFilters.map((filter, index) => (
                <View
                  key={index}
                  style={[
                    styles.filterChip,
                    { backgroundColor: isDark ? "#374151" : "#E5E7EB" },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: isDark ? "#D1D5DB" : "#374151" },
                    ]}
                  >
                    {filter}
                  </Text>
                </View>
              ))}
              <TouchableOpacity
                onPress={clearFilters}
                style={[
                  styles.filterChip,
                  { backgroundColor: isDark ? "#374151" : "#E5E7EB" },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isDark ? "#D1D5DB" : "#374151" },
                  ]}
                >
                  Clear all
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {showFilters && (
            <AnimatedView entering={FadeInDown} style={styles.filtersContainer}>
              <View style={styles.filtersRow}>
                <View style={styles.filterHalf}>
                  <Select
                    value={language}
                    onValueChange={(val) => setLanguage(val)}
                    options={languages}
                    label="Language"
                  />
                </View>
                <View style={styles.filterHalf}>
                  <Select
                    value={sortBy}
                    onValueChange={(val) =>
                      setSortBy(val as "relevancy" | "popularity" | "publishedAt")
                    }
                    options={sortOptions}
                    label="Sort By"
                  />
                </View>
              </View>
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
  searchContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  searchInput: {
    marginBottom: 0,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  filtersChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChipText: {
    fontSize: 12,
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
  },
});
