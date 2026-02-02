import axios from 'axios';
import { getNewsApiKey } from '@/constants/Config';

const API_BASE_URL = 'https://newsapi.org';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const apiKey = getNewsApiKey();
  if (!apiKey) {
    throw new Error('News API key is not configured. Please set EXPO_PUBLIC_NEWS_API_KEY in your .env file.');
  }
  config.headers['X-Api-Key'] = apiKey;
  return config;
});

// api.interceptors.response.use(
//   async (response) => {
//     const setCookieHeader = response.headers['set-cookie'];
//     if (setCookieHeader) {
//       const sessionCookie = setCookieHeader.find((cookie: string) =>
//         cookie.startsWith('PHPSESSID')
//       );
//       if (sessionCookie) {
//         const sessionId = sessionCookie.split(';')[0].split('=')[1];
//         await AsyncStorage.setItem('PHPSESSID', sessionId);
//       }
//     }
//     return response;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

export default api;
