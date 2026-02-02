import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

interface OnboardingPaginationProps {
  total: number;
  current: number;
}

export function OnboardingPagination({ total, current }: OnboardingPaginationProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor:
                index === current
                  ? isDark
                    ? '#fff'
                    : '#0a7ea4'
                  : isDark
                  ? '#374151'
                  : '#D1D5DB',
              width: index === current ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s',
  },
});

