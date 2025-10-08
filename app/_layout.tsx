// Minimal polyfills for React Native - must be imported first
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import '../global.css';
import React, { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import { UserDataProvider } from '@/lib/contexts/UserDataContext';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { BackendProvider } from '@/lib/contexts/BackendContext';
import { AuthGuard } from '@/lib/contexts/AuthGuard';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import useThemedNavigation from './hooks/useThemedNavigation';
import { Platform } from 'react-native';
import { initializeApp } from '@/lib/init';
import { configureCognito } from '@/lib/aws-config';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

NativeWindStyleSheet.setOutput({
  default: 'native',
});

function ThemedLayout() {
  const { ThemedStatusBar, screenOptions } = useThemedNavigation();
  const isInitializedRef = useRef(false);

  // Initialize app data and configuration
  useEffect(() => {
    const initialize = async () => {
      if (isInitializedRef.current) return;
      isInitializedRef.current = true;

      // Configure Amplify/Cognito first
      configureCognito();

      await initializeApp();
    };

    // Listen for notification responses
    const notificationSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        if (data?.type === 'checkin_alarm' && data?.checkInId) {
          // Navigate to challenge screen
          router.push(`/screens/checkin-challenge?checkInId=${data.checkInId}`);
        }
      }
    );

    initialize().catch(console.error);

    return () => {
      notificationSubscription.remove();
    };
  }, []);

  return (
    <>
      <ThemedStatusBar />
      <AuthGuard>
        <Stack screenOptions={screenOptions}>
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        </Stack>
      </AuthGuard>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView
      className={`bg-light-primary dark:bg-dark-primary ${Platform.OS === 'ios' ? 'pb-0 ' : ''}`}
      style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <BackendProvider>
            <UserDataProvider>
              <ThemedLayout />
            </UserDataProvider>
          </BackendProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
