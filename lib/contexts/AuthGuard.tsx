import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router, useSegments } from 'expo-router';
import { useAuth } from './AuthContext';
import ThemedText from '@/components/ThemedText';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return; // Wait for auth state to be determined

    const inAuthGroup =
      segments[0] === 'screens' &&
      segments.length > 1 &&
      ['login', 'signup', 'onboarding', 'welcome'].includes(segments[1] || '');
    const inProtectedGroup = segments[0] === '(drawer)' || segments[0] === '(tabs)';

    if (!isAuthenticated && inProtectedGroup) {
      // User is not authenticated but trying to access protected routes
      router.replace('/screens/login');
    } else if (isAuthenticated && inAuthGroup) {
      // User is authenticated but on auth screens, redirect to main app
      router.replace('/(drawer)/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  // Show loading screen while determining auth state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-light-primary dark:bg-dark-primary">
        <ActivityIndicator size="large" className="mb-4" />
        <ThemedText className="text-center">Loading...</ThemedText>
      </View>
    );
  }

  return <>{children}</>;
};
