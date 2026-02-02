import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { OnboardingSlide } from '@/components/onboarding/OnboardingSlide';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { OnboardingPagination } from '@/components/onboarding/OnboardingPagination';
import { Select } from '@/components/ui/Select';
import { onboardingStorage, preferencesStorage } from '@/utils/storage';
import { requestPermissions } from '@/utils/notifications';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const countries = [
  { label: "🇺🇸 United States", value: "us" },
  { label: "🇬🇧 United Kingdom", value: "gb" },
  { label: "🇨🇦 Canada", value: "ca" },
  { label: "🇦🇺 Australia", value: "au" },
  { label: "🇳🇬 Nigeria", value: "ng" },
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

const languages = [
  { label: "🇬🇧 English", value: "en" },
  { label: "🇫🇷 French", value: "fr" },
  { label: "🇪🇸 Spanish", value: "es" },
  { label: "🇩🇪 German", value: "de" },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [country, setCountry] = useState('us');
  const [category, setCategory] = useState('technology');
  const [language, setLanguage] = useState('en');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const slides = [
    {
      icon: 'newspaper',
      title: 'Welcome to FeedStack',
      description:
        'Stay informed with the latest news from around the world. Get personalized news feeds tailored to your interests.',
    },
    {
      icon: 'notifications',
      title: 'Stay Updated',
      description:
        'Enable notifications to receive breaking news alerts and stay informed about topics that matter to you.',
      children: (
        <OnboardingButton
          title="Enable Notifications"
          variant="primary"
          onPress={async () => {
            await requestPermissions();
          }}
        />
      ),
    },
    {
      icon: 'tune',
      title: 'Customize Your Feed',
      description: 'Set your preferences to get news that matches your interests.',
      children: (
        <View style={styles.preferencesContainer}>
          <Select
            value={country}
            onValueChange={setCountry}
            options={countries}
            label="Country"
            style={styles.select}
          />
          <Select
            value={category}
            onValueChange={setCategory}
            options={categories}
            label="Category"
            style={styles.select}
          />
          <Select
            value={language}
            onValueChange={setLanguage}
            options={languages}
            label="Language"
            style={styles.select}
          />
        </View>
      ),
    },
    {
      icon: 'bookmark',
      title: 'Save Articles',
      description:
        'Bookmark articles you want to read later. Access them anytime from your bookmarks tab.',
    },
    {
      icon: 'check-circle',
      title: "You're All Set!",
      description:
        'Start exploring the latest news and stay informed. You can always change your preferences in settings.',
    },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentSlide + 1) * width,
        animated: true,
      });
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  const handleComplete = async () => {
    // Save preferences
    await preferencesStorage.setDefaultCountry(country);
    await preferencesStorage.setDefaultCategory(category);
    await preferencesStorage.setDefaultLanguage(language);

    // Mark onboarding as completed
    await onboardingStorage.setCompleted(true);

    // Navigate to main app
    router.replace('/(tabs)');
  };

  const scrollViewRef = React.useRef<ScrollView>(null);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => (
          <Animated.View
            key={index}
            entering={FadeIn}
            exiting={FadeOut}
            style={[styles.slide, { width }]}
          >
            <OnboardingSlide
              icon={slide.icon}
              title={slide.title}
              description={slide.description}
            >
              {slide.children}
            </OnboardingSlide>
          </Animated.View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <OnboardingPagination total={slides.length} current={currentSlide} />
        <View style={styles.buttons}>
          {currentSlide < slides.length - 1 ? (
            <>
              <OnboardingButton
                title="Skip"
                variant="secondary"
                onPress={handleSkip}
                style={styles.buttonHalf}
              />
              <OnboardingButton
                title="Next"
                variant="primary"
                onPress={handleNext}
                style={styles.buttonHalf}
              />
            </>
          ) : (
            <OnboardingButton
              title="Get Started"
              variant="primary"
              onPress={handleComplete}
              style={styles.buttonFull}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    paddingTop: 24,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 24,
  },
  buttonHalf: {
    flex: 1,
  },
  buttonFull: {
    width: '100%',
  },
  preferencesContainer: {
    width: '100%',
    gap: 16,
  },
  select: {
    marginBottom: 0,
  },
});

