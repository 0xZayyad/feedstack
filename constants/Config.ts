import Constants from 'expo-constants';

/**
 * Get the News API key from environment variables
 * Falls back to a default key if not set (for development only)
 */
export const getNewsApiKey = (): string => {
  const apiKey = 
    Constants.expoConfig?.extra?.newsApiKey ||
    process.env.EXPO_PUBLIC_NEWS_API_KEY ||
    Constants.expoConfig?.extra?.EXPO_PUBLIC_NEWS_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    console.warn('⚠️ News API key not found in environment variables. Using fallback key.');
    // Fallback to the current hardcoded key for backward compatibility
    return '';
  }

  return apiKey;
};

/**
 * Validate that API key is configured
 */
export const validateApiKey = (): boolean => {
  const apiKey = getNewsApiKey();
  return apiKey !== 'your_api_key_here' && apiKey.length > 0;
};

