import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage keys for AsyncStorage
 */
export const StorageKeys = {
  // User preferences
  PREFERENCES: '@feedstack:preferences',
  DEFAULT_COUNTRY: '@feedstack:default_country',
  DEFAULT_CATEGORY: '@feedstack:default_category',
  DEFAULT_LANGUAGE: '@feedstack:default_language',
  DEFAULT_SORT_BY: '@feedstack:default_sort_by',
  
  // Cache
  CACHE_PREFIX: '@feedstack:cache:',
  CACHE_METADATA: '@feedstack:cache_metadata',
  
  // Bookmarks
  BOOKMARKS: '@feedstack:bookmarks',
  
  // Settings
  DARK_MODE: '@feedstack:dark_mode',
  NOTIFICATIONS_ENABLED: '@feedstack:notifications_enabled',
  NOTIFICATION_CATEGORIES: '@feedstack:notification_categories',
  
  // Onboarding
  ONBOARDING_COMPLETED: '@feedstack:onboarding_completed',
} as const;

/**
 * Generic storage operations
 */
export const storage = {
  /**
   * Store a value
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw error;
    }
  },

  /**
   * Retrieve a value
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  },

  /**
   * Remove a value
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  },

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },

  /**
   * Get all keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  },

  /**
   * Get multiple items
   */
  async multiGet<T>(keys: string[]): Promise<[string, T | null][]> {
    try {
      const items = await AsyncStorage.multiGet(keys);
      return items.map(([key, value]) => [
        key,
        value != null ? JSON.parse(value) : null,
      ]) as [string, T | null][];
    } catch (error) {
      console.error('Error multi-getting items:', error);
      return keys.map((key) => [key, null]) as [string, T | null][];
    }
  },

  /**
   * Remove multiple items
   */
  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error multi-removing items:', error);
      throw error;
    }
  },
};

/**
 * User preferences storage
 */
export const preferencesStorage = {
  async getPreferences(): Promise<{
    country?: string;
    category?: string;
    language?: string;
    sortBy?: string;
  } | null> {
    return storage.getItem(StorageKeys.PREFERENCES);
  },

  async savePreferences(preferences: {
    country?: string;
    category?: string;
    language?: string;
    sortBy?: string;
  }): Promise<void> {
    await storage.setItem(StorageKeys.PREFERENCES, preferences);
  },

  async getDefaultCountry(): Promise<string | null> {
    return storage.getItem<string>(StorageKeys.DEFAULT_COUNTRY);
  },

  async setDefaultCountry(country: string): Promise<void> {
    await storage.setItem(StorageKeys.DEFAULT_COUNTRY, country);
  },

  async getDefaultCategory(): Promise<string | null> {
    return storage.getItem<string>(StorageKeys.DEFAULT_CATEGORY);
  },

  async setDefaultCategory(category: string): Promise<void> {
    await storage.setItem(StorageKeys.DEFAULT_CATEGORY, category);
  },

  async getDefaultLanguage(): Promise<string | null> {
    return storage.getItem<string>(StorageKeys.DEFAULT_LANGUAGE);
  },

  async setDefaultLanguage(language: string): Promise<void> {
    await storage.setItem(StorageKeys.DEFAULT_LANGUAGE, language);
  },

  async getDefaultSortBy(): Promise<string | null> {
    return storage.getItem<string>(StorageKeys.DEFAULT_SORT_BY);
  },

  async setDefaultSortBy(sortBy: string): Promise<void> {
    await storage.setItem(StorageKeys.DEFAULT_SORT_BY, sortBy);
  },
};

/**
 * Bookmarks storage
 */
export interface Bookmark {
  url: string;
  title: string;
  description?: string;
  urlToImage?: string;
  source?: { name: string };
  author?: string;
  publishedAt: string;
  bookmarkedAt: string;
}

export const bookmarksStorage = {
  async getAll(): Promise<Bookmark[]> {
    const bookmarks = await storage.getItem<Bookmark[]>(StorageKeys.BOOKMARKS);
    return bookmarks || [];
  },

  async add(article: Bookmark): Promise<void> {
    const bookmarks = await this.getAll();
    const exists = bookmarks.some((b) => b.url === article.url);
    
    if (!exists) {
      const bookmark: Bookmark = {
        ...article,
        bookmarkedAt: new Date().toISOString(),
      };
      bookmarks.push(bookmark);
      await storage.setItem(StorageKeys.BOOKMARKS, bookmarks);
    }
  },

  async remove(url: string): Promise<void> {
    const bookmarks = await this.getAll();
    const filtered = bookmarks.filter((b) => b.url !== url);
    await storage.setItem(StorageKeys.BOOKMARKS, filtered);
  },

  async isBookmarked(url: string): Promise<boolean> {
    const bookmarks = await this.getAll();
    return bookmarks.some((b) => b.url === url);
  },

  async clear(): Promise<void> {
    await storage.removeItem(StorageKeys.BOOKMARKS);
  },
};

/**
 * Settings storage
 */
export const settingsStorage = {
  async getDarkMode(): Promise<boolean | null> {
    return storage.getItem<boolean>(StorageKeys.DARK_MODE);
  },

  async setDarkMode(enabled: boolean): Promise<void> {
    await storage.setItem(StorageKeys.DARK_MODE, enabled);
  },

  async getNotificationsEnabled(): Promise<boolean> {
    const enabled = await storage.getItem<boolean>(StorageKeys.NOTIFICATIONS_ENABLED);
    return enabled ?? true; // Default to true
  },

  async setNotificationsEnabled(enabled: boolean): Promise<void> {
    await storage.setItem(StorageKeys.NOTIFICATIONS_ENABLED, enabled);
  },

  async getNotificationCategories(): Promise<string[]> {
    const categories = await storage.getItem<string[]>(StorageKeys.NOTIFICATION_CATEGORIES);
    return categories || [];
  },

  async setNotificationCategories(categories: string[]): Promise<void> {
    await storage.setItem(StorageKeys.NOTIFICATION_CATEGORIES, categories);
  },
};

/**
 * Onboarding storage
 */
export const onboardingStorage = {
  async isCompleted(): Promise<boolean> {
    const completed = await storage.getItem<boolean>(StorageKeys.ONBOARDING_COMPLETED);
    return completed ?? false;
  },

  async setCompleted(completed: boolean): Promise<void> {
    await storage.setItem(StorageKeys.ONBOARDING_COMPLETED, completed);
  },
};

