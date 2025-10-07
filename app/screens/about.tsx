import React from 'react';
import { View, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import ThemedText from '@/components/ThemedText';
import Header from '@/components/Header';
import Icon from '@/components/Icon';
import { Button } from '@/components/Button';

const AboutScreen = () => {
  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <>
      <Header />
      <ScrollView className="flex-1 bg-white dark:bg-black">
        <View className="p-4">
          {/* Header */}
          <View className="mb-6 items-center">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Icon name="Shield" size={40} className="text-blue-600 dark:text-blue-400" />
            </View>
            <ThemedText className="mb-2 text-2xl font-bold">About CheckOnMe</ThemedText>
            <ThemedText className="text-center text-gray-600 dark:text-gray-400">
              Your personal safety companion for peace of mind
            </ThemedText>
          </View>

          {/* Mission Statement */}
          <View className="mb-6 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
            <View className="mb-3 flex-row items-center">
              <Icon name="Heart" size={20} className="mr-2 text-red-500" />
              <ThemedText className="text-lg font-bold">Our Mission</ThemedText>
            </View>
            <ThemedText className="text-gray-700 dark:text-gray-300">
              CheckOnMe was created to provide peace of mind for people engaging in solo activities,
              first dates, hiking trips, and other situations where safety is a concern and you want
              to protect yourself without worrying your friends and family. We believe everyone
              deserves to feel secure while living their life to the fullest.
            </ThemedText>
          </View>

          {/* How It Works */}
          <View className="mb-6 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
            <View className="mb-3 flex-row items-center">
              <Icon name="Clock" size={20} className="mr-2 text-blue-500" />
              <ThemedText className="text-lg font-bold">How It Works</ThemedText>
            </View>
            <View className="space-y-3">
              <View className="flex-row">
                <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <ThemedText className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    1
                  </ThemedText>
                </View>
                <View className="flex-1">
                  <ThemedText className="font-semibold">Set Your Activity</ThemedText>
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                    Tell us what you're doing and when you expect us to check in on you
                  </ThemedText>
                </View>
              </View>
              <View className="flex-row">
                <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <ThemedText className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    2
                  </ThemedText>
                </View>
                <View className="flex-1">
                  <ThemedText className="font-semibold">Choose Who to Contact</ThemedText>
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                    Select who should be notified if you don not respond to the check in
                  </ThemedText>
                </View>
              </View>
              <View className="flex-row">
                <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <ThemedText className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    3
                  </ThemedText>
                </View>
                <View className="flex-1">
                  <ThemedText className="font-semibold">Stay Safe</ThemedText>
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                    We check in on you at the desired time and alert your contacts if needed
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          {/* Team */}
          <View className="mb-6 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
            <View className="mb-3 flex-row items-center">
              <Icon name="Users" size={20} className="mr-2 text-green-500" />
              <ThemedText className="text-lg font-bold">Who We Are</ThemedText>
            </View>
            <ThemedText className="mb-3 text-gray-700 dark:text-gray-300">
              We are a small team of developers and safety advocates who understand the importance
              of staying connected with loved ones. Our app was born from personal experiences where
              having a safety net would have provided invaluable peace of mind.
            </ThemedText>
          </View>

          {/* Privacy & Security */}
          <View className="mb-6 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
            <View className="mb-3 flex-row items-center">
              <Icon name="Lock" size={20} className="mr-2 text-purple-500" />
              <ThemedText className="text-lg font-bold">Privacy & Security</ThemedText>
            </View>
            <View className="space-y-2">
              <View className="flex-row items-center">
                <Icon name="Check" size={16} className="mr-2 text-green-500" />
                <ThemedText className="text-sm text-gray-700 dark:text-gray-300">
                  Your data is secure
                </ThemedText>
              </View>
              <View className="flex-row items-center">
                <Icon name="Check" size={16} className="mr-2 text-green-500" />
                <ThemedText className="text-sm text-gray-700 dark:text-gray-300">
                  We never share your information with third parties
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Contact & Legal */}
          <View className="mb-6 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
            <View className="mb-3 flex-row items-center">
              <Icon name="Mail" size={20} className="mr-2 text-blue-500" />
              <ThemedText className="text-lg font-bold">Contact & Legal</ThemedText>
            </View>
            <View className="space-y-3">
              <TouchableOpacity
                onPress={() => openLink('mailto:support@checkonme.app')}
                className="flex-row items-center">
                <Icon name="Mail" size={16} className="mr-2 text-gray-500" />
                <ThemedText className="text-blue-600 dark:text-blue-400">
                  support@checkonme.app
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => openLink('https://checkonme.app/terms')}
                className="flex-row items-center">
                <Icon name="FileText" size={16} className="mr-2 text-gray-500" />
                <ThemedText className="text-blue-600 dark:text-blue-400">
                  Terms of Service
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Version Info */}
          <View className="mb-8 items-center">
            <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
              Version 1.0.0
            </ThemedText>
            <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 CheckOnMe. All rights reserved.
            </ThemedText>
          </View>

          {/* Action Buttons */}
          <View className="space-y-3">
            <Button
              title="Contact Support"
              onPress={() => router.push('/screens/support')}
              variant="outline"
            />
            <Button
              title="Rate CheckOnMe"
              onPress={() => openLink('https://apps.apple.com/app/checkonme')}
              variant="outline"
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default AboutScreen;
