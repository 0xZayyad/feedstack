import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { setupNotificationListeners } from '@/services/notifications';
import { onboardingStorage } from '@/services/storage';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await onboardingStorage.isCompleted();

        if (loaded) {
          if (!completed && segments[0] !== 'onboarding') {
            router.replace('/onboarding');
          } else if (completed && segments[0] === 'onboarding') {
            router.replace('/(tabs)');
          }
          setOnboardingChecked(true);
          await SplashScreen.hideAsync();
        }
      } catch (error) {
        console.error('Failed to check onboarding:', error);
        setOnboardingChecked(true);
      }
    };

    checkOnboarding();
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
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}

