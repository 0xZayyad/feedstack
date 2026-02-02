import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  style?: any;
  multiline?: boolean;
  numberOfLines?: number;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  style,
  multiline = false,
  numberOfLines = 1,
}: InputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: isDark ? '#D1D5DB' : '#374151' }]}>
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#9BA1A6' : '#687076'}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: error ? '#EF4444' : isDark ? '#4B5563' : '#D1D5DB',
            backgroundColor: isDark ? '#1F2937' : '#fff',
            minHeight: multiline ? 100 : undefined,
          },
        ]}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  errorText: {
    marginTop: 4,
    fontSize: 14,
    color: '#EF4444',
  },
});
