import { SectionHeader } from "@/components/settings/SectionHeader";
import { SettingItem } from "@/components/settings/SettingItem";
import { ToggleSwitch } from "@/components/settings/ToggleSwitch";
import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { cache } from "@/services/cache";
import { sendTestNotification } from "@/services/notifications";
import {
  onboardingStorage,
  preferencesStorage,
  settingsStorage,
  storage,
} from "@/services/storage";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const [darkModeOverride, setDarkModeOverride] = useState<boolean | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [storageKeys, setStorageKeys] = useState<string[]>([]);

  useEffect(() => {
    loadSettings();
    loadCacheInfo();
  }, []);

  const loadSettings = async () => {
    const darkMode = await settingsStorage.getDarkMode();
    const notifications = await settingsStorage.getNotificationsEnabled();
    setDarkModeOverride(darkMode);
    setNotificationsEnabled(notifications);
  };

  const loadCacheInfo = async () => {
    const size = await cache.getSize();
    setCacheSize(size);
    const keys = await storage.getAllKeys();
    setStorageKeys(keys);
  };

  const handleDarkModeToggle = async (value: boolean) => {
    await settingsStorage.setDarkMode(value);
    setDarkModeOverride(value);
    // Note: Actual theme change would require app restart or theme context update
  };

  const handleNotificationsToggle = async (value: boolean) => {
    await settingsStorage.setNotificationsEnabled(value);
    setNotificationsEnabled(value);
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "Are you sure you want to clear all cached articles? This will not delete your bookmarks or settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await cache.clearAll();
            await loadCacheInfo();
            Alert.alert("Success", "Cache cleared successfully");
          },
        },
      ]
    );
  };

  const handleResetDefaults = () => {
    Alert.alert(
      "Reset to Defaults",
      "This will reset all your preferences to default values. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await preferencesStorage.savePreferences({});
            await settingsStorage.setDarkMode(false);
            Alert.alert("Success", "Preferences reset to defaults");
            loadSettings();
          },
        },
      ]
    );
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const appVersion = Constants.expoConfig?.version || "1.0.0";

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#111827" : "#F9FAFB" },
        ]}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: isDark ? "#1F2937" : "#fff",
              borderBottomColor: isDark ? "#374151" : "#E5E7EB",
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SectionHeader title="Appearance" />
          <SettingItem
            icon="dark-mode"
            title="Dark Mode"
            subtitle={
              darkModeOverride === null
                ? "Follow system"
                : darkModeOverride
                  ? "Enabled"
                  : "Disabled"
            }
            rightElement={
              <ToggleSwitch
                value={darkModeOverride ?? false}
                onValueChange={handleDarkModeToggle}
              />
            }
            showChevron={false}
          />

          <SectionHeader title="Preferences" />
          <SettingItem
            icon="language"
            title="Default Language"
            subtitle="Set your preferred language"
            onPress={() => {
              // Navigate to language selection
              Alert.alert("Coming Soon", "Language selection will be available soon");
            }}
          />
          <SettingItem
            icon="public"
            title="Default Country"
            subtitle="Set your default country for news"
            onPress={() => {
              Alert.alert("Coming Soon", "Country selection will be available soon");
            }}
          />
          <SettingItem
            icon="category"
            title="Default Category"
            subtitle="Set your default news category"
            onPress={() => {
              Alert.alert("Coming Soon", "Category selection will be available soon");
            }}
          />

          <SectionHeader title="Notifications" />
          <SettingItem
            icon="notifications"
            title="Enable Notifications"
            subtitle="Receive breaking news alerts"
            rightElement={
              <ToggleSwitch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
              />
            }
            showChevron={false}
          />
          {notificationsEnabled && (
            <>
              <SettingItem
                icon="tune"
                title="Notification Categories"
                subtitle="Choose which categories to receive"
                onPress={() => {
                  Alert.alert("Coming Soon", "Category selection will be available soon");
                }}
              />
              <SettingItem
                icon="notifications-active"
                title="Test Notification"
                subtitle="Send a test notification"
                onPress={async () => {
                  try {
                    await sendTestNotification();
                    Alert.alert("Success", "Test notification sent!");
                  } catch (error: any) {
                    Alert.alert("Error", error.message || "Failed to send test notification");
                  }
                }}
              />
            </>
          )}

          <SectionHeader title="Data" />
          <SettingItem
            icon="storage"
            title="Cache Size"
            subtitle={formatBytes(cacheSize)}
            onPress={handleClearCache}
          />
          <SettingItem
            icon="delete-outline"
            title="Clear Cache"
            subtitle="Remove all cached articles"
            onPress={handleClearCache}
          />
          <SettingItem
            icon="info-outline"
            title="Storage Info"
            subtitle={`${storageKeys.length} items stored`}
            showChevron={false}
          />

          <SectionHeader title="About" />
          <SettingItem
            icon="info"
            title="App Version"
            subtitle={`Version ${appVersion}`}
            showChevron={false}
          />
          <SettingItem
            icon="code"
            title="Source Code"
            subtitle="View on GitHub"
            onPress={() => {
              Linking.openURL("https://github.com/0xZayyad/feedstack");
            }}
          />
          <SettingItem
            icon="privacy-tip"
            title="Privacy Policy"
            subtitle="Read our privacy policy"
            onPress={() => {
              Alert.alert("Privacy Policy", "Privacy policy will be available soon");
            }}
          />

          <SectionHeader title="Onboarding" />
          <SettingItem
            icon="school"
            title="Show Onboarding Again"
            subtitle="Replay the onboarding experience"
            onPress={async () => {
              await onboardingStorage.setCompleted(false);
              router.push('/onboarding');
            }}
          />

          <View style={styles.resetSection}>
            <Button
              title="Reset to Defaults"
              variant="outline"
              onPress={handleResetDefaults}
              style={styles.resetButton}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  resetSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    marginTop: 16,
  },
  resetButton: {
    marginTop: 8,
  },
});

