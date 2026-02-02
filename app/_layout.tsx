import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { setupNotificationListeners } from '@/utils/notifications';
import { onboardingStorage } from '@/utils/storage';
import { StatusBar } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await onboardingStorage.isCompleted();
      setOnboardingChecked(true);
      
      if (!completed && segments[0] !== 'onboarding') {
        router.replace('/onboarding');
      }
    };
    
    if (loaded) {
      checkOnboarding();
      SplashScreen.hideAsync();
    }
  }, [loaded, segments]);

  // Setup notification listeners
  useEffect(() => {
    const listeners = setupNotificationListeners(
      (notification) => {
        console.log('Notification received:', notification);
      },
      (response) => {
        console.log('Notification tapped:', response);
      }
    );

    return () => {
      listeners.remove();
    };
  }, []);

  if (!loaded || !onboardingChecked) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar barStyle={colorScheme === "dark" ? "light-content": "dark-content"}/>
      <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
