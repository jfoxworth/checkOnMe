import React, { useState } from 'react';
import { View, ScrollView, Switch, Alert } from 'react-native';
import Header from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Icon from '@/components/Icon';
import { useAuth } from '@/lib/contexts/AuthContext';

interface NotificationSettings {
  checkInReminders: boolean;
  emergencyAlerts: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

interface PrivacySettings {
  shareLocation: boolean;
  dataRetention: 'minimal' | 'standard' | 'extended';
  analyticsOptOut: boolean;
}

interface AppSettings {
  defaultCheckInDuration: number; // in minutes
  autoCancel: boolean;
  emergencyGracePeriod: number; // in minutes
  darkMode: 'auto' | 'light' | 'dark';
}

export default function SettingsScreen() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<NotificationSettings>({
    checkInReminders: true,
    emergencyAlerts: true,
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    shareLocation: true,
    dataRetention: 'standard',
    analyticsOptOut: false,
  });

  const [appSettings, setAppSettings] = useState<AppSettings>({
    defaultCheckInDuration: 60,
    autoCancel: false,
    emergencyGracePeriod: 15,
    darkMode: 'auto',
  });

  const updateNotificationSetting = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  const updatePrivacySetting = (key: keyof PrivacySettings, value: any) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  };

  const updateAppSetting = (key: keyof AppSettings, value: any) => {
    setAppSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    Alert.alert('Settings Saved', 'Your preferences have been updated successfully.');
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setNotifications({
              checkInReminders: true,
              emergencyAlerts: true,
              emailNotifications: true,
              smsNotifications: true,
              pushNotifications: true,
            });
            setPrivacy({
              shareLocation: true,
              dataRetention: 'standard',
              analyticsOptOut: false,
            });
            setAppSettings({
              defaultCheckInDuration: 60,
              autoCancel: false,
              emergencyGracePeriod: 15,
              darkMode: 'auto',
            });
            Alert.alert('Reset Complete', 'Settings have been restored to defaults.');
          },
        },
      ]
    );
  };

  return (
    <>
      <Header />
      <ScrollView className="flex-1 bg-white dark:bg-black">
        <View className="p-4">
          {/* Header */}
          <View className="mb-6">
            <ThemedText className="mb-2 text-2xl font-bold">Settings</ThemedText>
            <ThemedText className="text-gray-600 dark:text-gray-400">
              Manage your app preferences, notifications, and privacy settings
            </ThemedText>
          </View>

          {/* Notification Settings */}
          <View className="mb-6 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
            <View className="mb-4 flex-row items-center">
              <Icon name="Bell" size={20} className="mr-2 text-blue-500" />
              <ThemedText className="text-lg font-bold">Notifications</ThemedText>
            </View>

            <View className="space-y-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <ThemedText className="font-semibold">Check-in Reminders</ThemedText>
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified before your check-in time
                  </ThemedText>
                </View>
                <Switch
                  value={notifications.checkInReminders}
                  onValueChange={(value) => updateNotificationSetting('checkInReminders', value)}
                />
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <ThemedText className="font-semibold">Emergency Alerts</ThemedText>
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                    Critical safety notifications
                  </ThemedText>
                </View>
                <Switch
                  value={notifications.emergencyAlerts}
                  onValueChange={(value) => updateNotificationSetting('emergencyAlerts', value)}
                />
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <ThemedText className="font-semibold">Email Notifications</ThemedText>
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                    Receive updates via email
                  </ThemedText>
                </View>
                <Switch
                  value={notifications.emailNotifications}
                  onValueChange={(value) => updateNotificationSetting('emailNotifications', value)}
                />
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <ThemedText className="font-semibold">SMS Notifications</ThemedText>
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                    Receive text message alerts
                  </ThemedText>
                </View>
                <Switch
                  value={notifications.smsNotifications}
                  onValueChange={(value) => updateNotificationSetting('smsNotifications', value)}
                />
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <ThemedText className="font-semibold">Push Notifications</ThemedText>
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                    App notifications on your device
                  </ThemedText>
                </View>
                <Switch
                  value={notifications.pushNotifications}
                  onValueChange={(value) => updateNotificationSetting('pushNotifications', value)}
                />
              </View>
            </View>
          </View>

          {/* Privacy Settings */}
          <View className="mb-6 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
            <View className="mb-4 flex-row items-center">
              <Icon name="Lock" size={20} className="mr-2 text-purple-500" />
              <ThemedText className="text-lg font-bold">Privacy</ThemedText>
            </View>

            <View className="space-y-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <ThemedText className="font-semibold">Share Location</ThemedText>
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                    Allow emergency contacts to see your location
                  </ThemedText>
                </View>
                <Switch
                  value={privacy.shareLocation}
                  onValueChange={(value) => updatePrivacySetting('shareLocation', value)}
                />
              </View>

              <View>
                <ThemedText className="mb-2 font-semibold">Data Retention</ThemedText>
                <ThemedText className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  How long to keep your check-in data
                </ThemedText>
                <View className="flex-row gap-2">
                  {['minimal', 'standard', 'extended'].map((option) => (
                    <Button
                      key={option}
                      title={option.charAt(0).toUpperCase() + option.slice(1)}
                      onPress={() => updatePrivacySetting('dataRetention', option)}
                      variant={privacy.dataRetention === option ? 'primary' : 'outline'}
                      size="small"
                    />
                  ))}
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <ThemedText className="font-semibold">Opt Out of Analytics</ThemedText>
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                    Don't share usage data for app improvement
                  </ThemedText>
                </View>
                <Switch
                  value={privacy.analyticsOptOut}
                  onValueChange={(value) => updatePrivacySetting('analyticsOptOut', value)}
                />
              </View>
            </View>
          </View>

          {/* App Preferences */}
          <View className="mb-6 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
            <View className="mb-4 flex-row items-center">
              <Icon name="Settings" size={20} className="mr-2 text-green-500" />
              <ThemedText className="text-lg font-bold">App Preferences</ThemedText>
            </View>

            <View className="space-y-4">
              <View>
                <ThemedText className="mb-2 font-semibold">Default Check-in Duration</ThemedText>
                <ThemedText className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  Default time window for check-ins (minutes)
                </ThemedText>
                <View className="flex-row gap-2">
                  {[30, 60, 120, 240].map((duration) => (
                    <Button
                      key={duration}
                      title={`${duration}m`}
                      onPress={() => updateAppSetting('defaultCheckInDuration', duration)}
                      variant={
                        appSettings.defaultCheckInDuration === duration ? 'primary' : 'outline'
                      }
                      size="small"
                    />
                  ))}
                </View>
              </View>

              <View>
                <ThemedText className="mb-2 font-semibold">Emergency Grace Period</ThemedText>
                <ThemedText className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  Extra time before alerting emergency contacts (minutes)
                </ThemedText>
                <View className="flex-row gap-2">
                  {[5, 15, 30, 60].map((period) => (
                    <Button
                      key={period}
                      title={`${period}m`}
                      onPress={() => updateAppSetting('emergencyGracePeriod', period)}
                      variant={appSettings.emergencyGracePeriod === period ? 'primary' : 'outline'}
                      size="small"
                    />
                  ))}
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <ThemedText className="font-semibold">Auto-Cancel Late Check-ins</ThemedText>
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically cancel overdue check-ins
                  </ThemedText>
                </View>
                <Switch
                  value={appSettings.autoCancel}
                  onValueChange={(value) => updateAppSetting('autoCancel', value)}
                />
              </View>
            </View>
          </View>

          {/* Account Management */}
          <View className="mb-8 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
            <View className="mb-4 flex-row items-center">
              <Icon name="User" size={20} className="mr-2 text-orange-500" />
              <ThemedText className="text-lg font-bold">Account</ThemedText>
            </View>

            <View className="space-y-3">
              <View className="flex-row items-center">
                <Icon name="Mail" size={16} className="mr-2 text-gray-500" />
                <ThemedText className="text-gray-700 dark:text-gray-300">
                  {user?.email || 'No email address'}
                </ThemedText>
              </View>

              <View className="flex-row gap-2">
                <Button title="Change Password" variant="outline" size="small" className="flex-1" />
                <Button title="Update Email" variant="outline" size="small" className="flex-1" />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mb-8 space-y-3">
            <Button title="Save Settings" onPress={handleSaveSettings} />
            <Button title="Reset to Defaults" variant="outline" onPress={handleResetSettings} />
          </View>
        </View>
      </ScrollView>
    </>
  );
}
