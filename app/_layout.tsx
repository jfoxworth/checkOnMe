import '../global.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserDataProvider, useUserData } from './contexts/UserDataContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import useThemedNavigation from './hooks/useThemedNavigation';
import { Platform } from 'react-native';
import { initializeApp } from '@/lib/init';

NativeWindStyleSheet.setOutput({
  default: 'native',
});

function ThemedLayout() {
  const { ThemedStatusBar, screenOptions } = useThemedNavigation();
  const { initializeUserData } = useUserData();

  // Initialize app data and configuration
  useEffect(() => {
    const initialize = async () => {
      await initializeApp();
      
      // Initialize with sample user after app setup
      // In a real app, you'd get this from login/auth
      const sampleUserId = 'sample-user-123';
      await initializeUserData(sampleUserId);
    };
    
    initialize().catch(console.error);
  }, [initializeUserData]);

  return (
    <>
      <ThemedStatusBar />
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView
      className={`bg-light-primary dark:bg-dark-primary ${Platform.OS === 'ios' ? 'pb-0 ' : ''}`}
      style={{ flex: 1 }}>
      <ThemeProvider>
        <UserDataProvider>
          <ThemedLayout />
        </UserDataProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
