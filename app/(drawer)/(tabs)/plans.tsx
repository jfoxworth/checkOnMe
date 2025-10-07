import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import Header from '@/components/Header';
import Icon from '@/components/Icon';
import ThemedText from '@/components/ThemedText';
import ThemedScroller from '@/components/ThemeScroller';
import { Button } from '@/components/Button';
import Section from '@/components/layout/Section';
import { UserUsage } from '@/lib/types';
import { useAuth } from '@/lib/contexts/AuthContext';

const PlansScreen = () => {
  // Get auth context
  const { user, isAuthenticated } = useAuth();

  // State for user data
  const [userUsage, setUserUsage] = useState<UserUsage>({
    checkInsUsed: 3,
    checkInsRemaining: 7,
    totalCheckIns: 10,
    isLoggedIn: true, // Force logged in state for now
    userId: user?.id || 'demo-user',
    currentPeriodStart: '',
    currentPeriodEnd: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, simulate logged in state with demo data
      setUserUsage({
        checkInsUsed: 3,
        checkInsRemaining: 7,
        totalCheckIns: 10,
        isLoggedIn: true,
        userId: user?.id || 'demo-user',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = () => {
    // Navigate to billing/checkout for 10 check-ins at $10
    router.push('/screens/billing?purchase=checkins');
  };

  const usagePercentage = userUsage.isLoggedIn
    ? (userUsage.checkInsUsed / userUsage.totalCheckIns) * 100
    : 0;

  return (
    <>
      <Header title="Check-in Credits" />

      {loading ? (
        <View className="flex-1 items-center justify-center p-4">
          <ThemedText className="text-lg">Loading plans...</ThemedText>
          <ThemedText className="mt-2 text-center text-gray-600 dark:text-gray-400">
            Please wait while we fetch your check-in options
          </ThemedText>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-4">
          <Icon name="AlertTriangle" size={48} className="mb-4 text-red-500" />
          <ThemedText className="text-lg font-semibold text-red-600 dark:text-red-400">
            Something went wrong
          </ThemedText>
          <ThemedText className="mt-2 text-center text-gray-600 dark:text-gray-400">
            {error}
          </ThemedText>
          <Button title="Try Again" onPress={loadData} className="mt-4" variant="outline" />
        </View>
      ) : (
        <ThemedScroller>
          {/* Current Usage Section */}
          <Section>
            <View className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <ThemedText className="mb-3 text-lg font-bold">Your Check-in Credits</ThemedText>

              {!userUsage.isLoggedIn ? (
                // Not logged in state
                <View>
                  <View className="mb-3 flex-row items-center">
                    <Icon name="Gift" size={20} className="mr-2 text-green-500" />
                    <ThemedText className="font-semibold text-green-600 dark:text-green-400">
                      New accounts get 5 free check-ins!
                    </ThemedText>
                  </View>
                  <View className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                    <ThemedText className="text-sm text-green-700 dark:text-green-300">
                      Sign up or log in to claim your 5 free check-ins and start using our safety
                      service.
                    </ThemedText>
                  </View>
                  <View className="mt-4 flex-row gap-3">
                    <Button
                      title="Sign Up"
                      className="flex-1"
                      onPress={() => router.push('/screens/signup')}
                    />
                    <Button
                      title="Log In"
                      variant="outline"
                      className="flex-1"
                      onPress={() => router.push('/screens/login')}
                    />
                  </View>
                </View>
              ) : (
                // Logged in state
                <View>
                  <View className="mb-3 flex-row items-center justify-between">
                    <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                      Credits Available
                    </ThemedText>
                    <View className="flex-row items-center">
                      <Icon name="Shield" size={16} className="mr-1" />
                      <ThemedText className="text-sm font-medium">
                        {userUsage.checkInsRemaining} remaining
                      </ThemedText>
                    </View>
                  </View>

                  {/* Usage Progress Bar */}
                  <View className="mb-3">
                    <View className="mb-1 flex-row justify-between">
                      <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                        Used: {userUsage.checkInsUsed} of {userUsage.totalCheckIns}
                      </ThemedText>
                      <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                        {Math.round(usagePercentage)}%
                      </ThemedText>
                    </View>
                    <View className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <View
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${usagePercentage}%` }}
                      />
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <ThemedText className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {userUsage.checkInsRemaining}
                      </ThemedText>
                      <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                        Credits left
                      </ThemedText>
                    </View>
                    <View className="flex-1 items-center">
                      <ThemedText className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {userUsage.checkInsUsed}
                      </ThemedText>
                      <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                        Used
                      </ThemedText>
                    </View>
                    <View className="flex-1 items-end">
                      <ThemedText className="text-2xl font-bold">
                        {userUsage.totalCheckIns}
                      </ThemedText>
                      <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                        Total owned
                      </ThemedText>
                    </View>
                  </View>

                  {userUsage.checkInsRemaining <= 2 && (
                    <View className="mt-3 rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
                      <ThemedText className="text-sm text-orange-700 dark:text-orange-300">
                        <Icon name="AlertTriangle" size={14} className="mr-1" />
                        Running low on check-ins! Purchase more below to continue using our service.
                      </ThemedText>
                    </View>
                  )}
                </View>
              )}
            </View>
          </Section>

          {/* Plans Section */}
          <Section>
            <ThemedText className="mb-4 text-xl font-bold">
              {userUsage.isLoggedIn ? 'Buy More Check-ins' : 'Check-in Bundles'}
            </ThemedText>

            {/* Simple 10 Check-ins Offer */}
            <View className="mb-4 rounded-lg border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <View className="mb-3 flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                  <ThemedText className="text-lg font-bold">10 Check-ins</ThemedText>
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                    Perfect for regular adventurers and safety-conscious individuals
                  </ThemedText>
                </View>
                <View className="flex-shrink-0 items-end">
                  <ThemedText className="text-2xl font-bold" numberOfLines={1}>
                    $10
                  </ThemedText>
                  <ThemedText
                    className="text-sm text-gray-600 dark:text-gray-400"
                    numberOfLines={1}>
                    10 check-ins
                  </ThemedText>
                </View>
              </View>

              <View className="mb-4 space-y-2">
                <View className="flex-row items-center">
                  <Icon name="Check" size={16} className="mr-2 text-green-500" />
                  <ThemedText className="text-sm text-gray-700 dark:text-gray-300">
                    10 safety check-ins for any activity
                  </ThemedText>
                </View>
                <View className="flex-row items-center">
                  <Icon name="Check" size={16} className="mr-2 text-green-500" />
                  <ThemedText className="text-sm text-gray-700 dark:text-gray-300">
                    Emergency contact notifications
                  </ThemedText>
                </View>
                <View className="flex-row items-center">
                  <Icon name="Check" size={16} className="mr-2 text-green-500" />
                  <ThemedText className="text-sm text-gray-700 dark:text-gray-300">
                    Location sharing and safety features
                  </ThemedText>
                </View>
                <View className="flex-row items-center">
                  <Icon name="Check" size={16} className="mr-2 text-green-500" />
                  <ThemedText className="text-sm text-gray-700 dark:text-gray-300">
                    No expiration date
                  </ThemedText>
                </View>
              </View>

              <Button
                title="Purchase 10 Check-ins - $10"
                onPress={handlePurchase}
                size="large"
                className="w-full"
              />
            </View>
          </Section>

          {/* Bottom spacing */}
          <View className="h-20" />
        </ThemedScroller>
      )}
    </>
  );
};

export default PlansScreen;
