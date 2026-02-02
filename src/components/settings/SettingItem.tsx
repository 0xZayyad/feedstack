import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface SettingItemProps {
  icon?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  style?: any;
}

export function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  showChevron = true,
  style,
}: SettingItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const content = (
    <View style={[styles.container, style]}>
      {icon && (
        <MaterialIcons
          name={icon as any}
          size={24}
          color={isDark ? '#9BA1A6' : '#687076'}
          style={styles.icon}
        />
      )}
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: isDark ? '#9BA1A6' : '#6B7280' }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      {showChevron && onPress && (
        <MaterialIcons
          name="chevron-right"
          size={24}
          color={isDark ? '#6B7280' : '#9CA3AF'}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[
          styles.touchable,
          {
            backgroundColor: isDark ? '#1F2937' : '#fff',
            borderBottomColor: isDark ? '#374151' : '#E5E7EB',
          },
        ]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.touchable,
        {
          backgroundColor: isDark ? '#1F2937' : '#fff',
          borderBottomColor: isDark ? '#374151' : '#E5E7EB',
        },
      ]}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  touchable: {
    borderBottomWidth: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  rightElement: {
    marginRight: 8,
  },
});

