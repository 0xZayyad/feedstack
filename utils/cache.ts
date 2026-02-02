import { storage, StorageKeys } from './storage';
import { ArticleType } from '@/misc/utils';

export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheMetadata {
  [key: string]: {
    timestamp: number;
    expiresAt: number;
    size: number;
  };
}

const DEFAULT_CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Cache management utilities
 */
export const cache = {
  /**
   * Generate cache key from parameters
   */
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${params[key]}`)
      .join('|');
    return `${StorageKeys.CACHE_PREFIX}${prefix}:${sortedParams}`;
  },

  /**
   * Store data in cache
   */
  async set<T>(
    key: string,
    data: T,
    duration: number = DEFAULT_CACHE_DURATION
  ): Promise<void> {
    try {
      const now = Date.now();
      const cachedData: CachedData<T> = {
        data,
        timestamp: now,
        expiresAt: now + duration,
      };

      await storage.setItem(key, cachedData);

      // Update metadata
      const metadata = await this.getMetadata();
      const dataSize = JSON.stringify(cachedData).length;
      metadata[key] = {
        timestamp: now,
        expiresAt: now + duration,
        size: dataSize,
      };
      await storage.setItem(StorageKeys.CACHE_METADATA, metadata);
    } catch (error) {
      console.error(`Error caching ${key}:`, error);
    }
  },

  /**
   * Retrieve data from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cachedData = await storage.getItem<CachedData<T>>(key);
      
      if (!cachedData) {
        return null;
      }

      // Check if cache is expired
      if (Date.now() > cachedData.expiresAt) {
        await this.remove(key);
        return null;
      }

      return cachedData.data;
    } catch (error) {
      console.error(`Error retrieving cache ${key}:`, error);
      return null;
    }
  },

  /**
   * Remove cached data
   */
  async remove(key: string): Promise<void> {
    try {
      await storage.removeItem(key);
      
      // Update metadata
      const metadata = await this.getMetadata();
      delete metadata[key];
      await storage.setItem(StorageKeys.CACHE_METADATA, metadata);
    } catch (error) {
      console.error(`Error removing cache ${key}:`, error);
    }
  },

  /**
   * Check if cache exists and is valid
   */
  async isValid(key: string): Promise<boolean> {
    const cachedData = await storage.getItem<CachedData<any>>(key);
    if (!cachedData) {
      return false;
    }
    return Date.now() <= cachedData.expiresAt;
  },

  /**
   * Get cache metadata
   */
  async getMetadata(): Promise<CacheMetadata> {
    const metadata = await storage.getItem<CacheMetadata>(StorageKeys.CACHE_METADATA);
    return metadata || {};
  },

  /**
   * Clear expired cache entries
   */
  async clearExpired(): Promise<void> {
    try {
      const metadata = await this.getMetadata();
      const now = Date.now();
      const expiredKeys: string[] = [];

      for (const [key, meta] of Object.entries(metadata)) {
        if (now > meta.expiresAt) {
          expiredKeys.push(key);
        }
      }

      if (expiredKeys.length > 0) {
        await storage.multiRemove(expiredKeys);
        expiredKeys.forEach((key) => delete metadata[key]);
        await storage.setItem(StorageKeys.CACHE_METADATA, metadata);
      }
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  },

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    try {
      const metadata = await this.getMetadata();
      const cacheKeys = Object.keys(metadata);
      
      if (cacheKeys.length > 0) {
        await storage.multiRemove(cacheKeys);
      }
      
      await storage.removeItem(StorageKeys.CACHE_METADATA);
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  },

  /**
   * Get cache size
   */
  async getSize(): Promise<number> {
    try {
      const metadata = await this.getMetadata();
      return Object.values(metadata).reduce((total, meta) => total + meta.size, 0);
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  },

  /**
   * Cleanup old cache if size exceeds limit
   */
  async cleanup(): Promise<void> {
    try {
      const size = await this.getSize();
      if (size <= MAX_CACHE_SIZE) {
        return;
      }

      const metadata = await this.getMetadata();
      const entries = Object.entries(metadata).sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      let currentSize = size;
      const keysToRemove: string[] = [];

      for (const [key, meta] of entries) {
        if (currentSize <= MAX_CACHE_SIZE * 0.8) {
          break; // Keep cache at 80% of max size
        }
        keysToRemove.push(key);
        currentSize -= meta.size;
      }

      if (keysToRemove.length > 0) {
        await storage.multiRemove(keysToRemove);
        keysToRemove.forEach((key) => delete metadata[key]);
        await storage.setItem(StorageKeys.CACHE_METADATA, metadata);
      }
    } catch (error) {
      console.error('Error cleaning up cache:', error);
    }
  },
};

/**
 * Article-specific cache helpers
 */
export const articleCache = {
  /**
   * Cache articles for top headlines
   */
  async cacheTopHeadlines(
    country: string,
    category: string,
    query: string | undefined,
    articles: ArticleType[]
  ): Promise<void> {
    const key = cache.generateKey('top_headlines', { country, category, query: query || '' });
    await cache.set(key, articles);
  },

  /**
   * Get cached top headlines
   */
  async getTopHeadlines(
    country: string,
    category: string,
    query: string | undefined
  ): Promise<ArticleType[] | null> {
    const key = cache.generateKey('top_headlines', { country, category, query: query || '' });
    return cache.get<ArticleType[]>(key);
  },

  /**
   * Cache articles for search
   */
  async cacheSearch(
    query: string,
    language: string,
    sortBy: string,
    articles: ArticleType[]
  ): Promise<void> {
    const key = cache.generateKey('search', { query, language, sortBy });
    await cache.set(key, articles);
  },

  /**
   * Get cached search results
   */
  async getSearch(
    query: string,
    language: string,
    sortBy: string
  ): Promise<ArticleType[] | null> {
    const key = cache.generateKey('search', { query, language, sortBy });
    return cache.get<ArticleType[]>(key);
  },

  /**
   * Get cache timestamp for display
   */
  async getCacheTimestamp(
    country: string,
    category: string,
    query: string | undefined
  ): Promise<number | null> {
    const key = cache.generateKey('top_headlines', { country, category, query: query || '' });
    const cachedData = await storage.getItem<CachedData<ArticleType[]>>(key);
    return cachedData?.timestamp || null;
  },

  /**
   * Generate cache key (exposed for use in components)
   */
  generateKey(prefix: string, params: Record<string, any>): string {
    return cache.generateKey(prefix, params);
  },
};

