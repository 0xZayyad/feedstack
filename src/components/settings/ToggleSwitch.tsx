import React from 'react';
import { Switch, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ToggleSwitch({
  value,
  onValueChange,
  disabled = false,
}: ToggleSwitchProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: isDark ? '#374151' : '#D1D5DB',
        true: isDark ? '#0a7ea4' : '#0a7ea4',
      }}
      thumbColor={value ? '#fff' : '#f4f3f4'}
      ios_backgroundColor={isDark ? '#374151' : '#D1D5DB'}
    />
  );
}

