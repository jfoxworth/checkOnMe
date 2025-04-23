import '../global.css';
import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeWindStyleSheet } from 'nativewind';
import { ThemeProvider } from './contexts/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrawerProvider } from '@/app/contexts/DrawerContext';
import useThemedNavigation from './hooks/useThemedNavigation';

// Configure NativeWind
NativeWindStyleSheet.setOutput({
  default: 'native',
});

// This component must be used inside ThemeProvider
function ThemedLayout() {
  // Use our custom hook for themed navigation
  const { ThemedStatusBar, screenOptions } = useThemedNavigation();
  
  return (
    <>
      <ThemedStatusBar />
      <SafeAreaView className='bg-light-primary dark:bg-dark-primary' style={{ flex: 1 }}>
        <Stack screenOptions={screenOptions}>
          <Stack.Screen
            name="(drawer)"
            options={{ headerShown: false }}
          />
        </Stack>
      </SafeAreaView>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView className='bg-light-primary dark:bg-dark-primary' style={{ flex: 1 }}>
      <ThemeProvider>
        <DrawerProvider>
          <ThemedLayout />
        </DrawerProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
