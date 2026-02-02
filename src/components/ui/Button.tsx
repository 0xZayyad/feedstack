import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    if (variant === 'primary') {
      baseStyle.push(isDark ? styles.primaryDark : styles.primaryLight);
    } else if (variant === 'secondary') {
      baseStyle.push(isDark ? styles.secondaryDark : styles.secondaryLight);
    } else {
      baseStyle.push(isDark ? styles.outlineDark : styles.outlineLight);
    }
    if (disabled) baseStyle.push(styles.disabled);
    if (style) baseStyle.push(style);
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}`]];
    if (variant === 'primary') {
      baseStyle.push(isDark ? styles.textPrimaryDark : styles.textPrimaryLight);
    } else if (variant === 'secondary') {
      baseStyle.push(isDark ? styles.textSecondaryDark : styles.textSecondaryLight);
    } else {
      baseStyle.push(isDark ? styles.textOutlineDark : styles.textOutlineLight);
    }
    return baseStyle;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={getButtonStyle()}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' && !isDark ? '#fff' : variant === 'primary' && isDark ? '#000' : isDark ? '#fff' : '#000'}
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  md: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  lg: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  primaryLight: {
    backgroundColor: '#0a7ea4',
  },
  primaryDark: {
    backgroundColor: '#fff',
  },
  secondaryLight: {
    backgroundColor: '#E5E7EB',
  },
  secondaryDark: {
    backgroundColor: '#374151',
  },
  outlineLight: {
    borderWidth: 2,
    borderColor: '#0a7ea4',
    backgroundColor: 'transparent',
  },
  outlineDark: {
    borderWidth: 2,
    borderColor: '#6B7280',
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  textSm: {
    fontSize: 14,
  },
  textMd: {
    fontSize: 16,
  },
  textLg: {
    fontSize: 18,
  },
  textPrimaryLight: {
    color: '#fff',
  },
  textPrimaryDark: {
    color: '#000',
  },
  textSecondaryLight: {
    color: '#111827',
  },
  textSecondaryDark: {
    color: '#fff',
  },
  textOutlineLight: {
    color: '#0a7ea4',
  },
  textOutlineDark: {
    color: '#fff',
  },
});
