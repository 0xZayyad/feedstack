import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

function TabBarIcon({ name, focused }: { name: string; focused: boolean }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.1 : 1) }],
  }));

  return (
    <AnimatedView style={animatedStyle}>
      <MaterialIcons
        name={name as any}
        size={24}
        color={
          focused
            ? isDark
              ? '#fff'
              : '#0a7ea4'
            : isDark
              ? '#9BA1A6'
              : '#687076'
        }
      />
    </AnimatedView>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#fff' : '#0a7ea4',
        tabBarInactiveTintColor: isDark ? '#9BA1A6' : '#687076',
        tabBarStyle: {
          backgroundColor: isDark ? '#1F2937' : '#fff',
          borderTopColor: isDark ? '#374151' : '#E5E7EB',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarShowLabel: false
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'explore' : 'explore'}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'bookmark' : 'bookmark-border'}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'settings' : 'settings'}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
