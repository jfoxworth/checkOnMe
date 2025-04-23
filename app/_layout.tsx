import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform, StatusBar as RNStatusBar } from 'react-native';
import { NativeWindStyleSheet } from 'nativewind';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrawerProvider } from '@/app/contexts/DrawerContext';

// Configure NativeWind
NativeWindStyleSheet.setOutput({
  default: 'native',
});

// Component to update StatusBar based on theme.
function ThemedStatusBar() {
  const { isDark } = useTheme();

  // Android-specific status bar and navigation bar styling
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Set navigation bar color
      NavigationBar.setBackgroundColorAsync(isDark ? '#0A0A0A' : '#FFFFFF');
      NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');

      // Set status bar styling directly using the native StatusBar API
      RNStatusBar.setBackgroundColor(isDark ? '#0A0A0A' : '#FFFFFF', true);
      RNStatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);

      // Prevent translucency which can cause dimming
      RNStatusBar.setTranslucent(false);
    } else {
      // iOS style updates
      RNStatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
    }
  }, [isDark]);

  return (
    <StatusBar
      style={isDark ? 'light' : 'dark'}
      backgroundColor={isDark ? '#0A0A0A' : '#FFFFFF'}
      translucent={false}
    />
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView className='bg-light-primary dark:bg-dark-primary' style={{ flex: 1 }}>
      <ThemeProvider>
        <DrawerProvider>
          <ThemedStatusBar />
          <SafeAreaView className="flex-1 bg-light-primary dark:bg-dark-primary">
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen
                name="(drawer)"
                options={{ headerShown: false }}
              />
              {/*<Stack.Screen
                name="screens/product-detail" // or the file name like `[id].tsx`
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                  headerShown: false, // Optional
                }}
              />*/}
            </Stack>
          </SafeAreaView>
        </DrawerProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
