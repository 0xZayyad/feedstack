import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface OnboardingSlideProps {
  icon?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function OnboardingSlide({
  icon,
  title,
  description,
  children,
}: OnboardingSlideProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {icon && (
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={icon as any}
            size={80}
            color={isDark ? '#0a7ea4' : '#0a7ea4'}
          />
        </View>
      )}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: isDark ? '#9BA1A6' : '#6B7280' }]}>
        {description}
      </Text>
      {children && <View style={styles.children}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  children: {
    width: '100%',
    marginTop: 24,
  },
});

