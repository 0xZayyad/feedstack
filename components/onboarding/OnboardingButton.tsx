import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface OnboardingButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

export function OnboardingButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: OnboardingButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        style,
        {
          backgroundColor:
            variant === 'primary'
              ? isDark
                ? '#fff'
                : '#0a7ea4'
              : 'transparent',
          borderWidth: variant === 'secondary' ? 2 : 0,
          borderColor: isDark ? '#6B7280' : '#9CA3AF',
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' && !isDark ? '#fff' : variant === 'primary' && isDark ? '#000' : isDark ? '#fff' : '#000'}
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color:
                variant === 'primary'
                  ? isDark
                    ? '#000'
                    : '#fff'
                  : isDark
                  ? '#fff'
                  : '#111827',
            },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

