import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Stack, router, Link } from 'expo-router';
import Header, { HeaderIcon } from '@/components/Header';
import Icon from '@/components/Icon';
import ThemedText from '@/components/ThemedText';
import ThemedScroller from '@/components/ThemeScroller';
import ConfirmationModal from '@/components/ConfirmationModal';
import { ActionSheetRef } from 'react-native-actions-sheet';
import { CardScroller } from '@/components/CardScroller';
import Card from '@/components/Card';
import { Button } from '@/components/Button';
import Section from '@/components/layout/Section';
import AnimatedView from '@/components/AnimatedView';
import { CheckInPlan, UserUsage } from '@/lib/types';
import { purchaseService, userService } from '@/lib/api';

const CartScreen = () => {
  // State for plans and user data from API
  const [plans, setPlans] = useState<CheckInPlan[]>([]);
  const [userUsage, setUserUsage] = useState<UserUsage>({
    checkInsUsed: 0,
    checkInsRemaining: 0,
    totalCheckIns: 0,
    isLoggedIn: false,
    userId: '',
    currentPeriodStart: '',
    currentPeriodEnd: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock user ID - in a real app, this would come from your auth context
  const MOCK_USER_ID = 'user-john-doe';

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load plans
      const plansResponse = await purchaseService.getCheckInPurchaseOptions();
      if (plansResponse.success && plansResponse.data) {
        setPlans(plansResponse.data);
      }

      // Load user usage (if logged in)
      // For demo purposes, we'll simulate being logged in
      try {
        const usageResponse = await userService.getUserUsage(MOCK_USER_ID);
        if (usageResponse.success && usageResponse.data) {
          setUserUsage({
            ...usageResponse.data,
            isLoggedIn: true,
          });
        } else {
          // User not found or not logged in
          setUserUsage((prev) => ({
            ...prev,
            isLoggedIn: false,
          }));
        }
      } catch (userError) {
        // User doesn't exist or not logged in - show logged out state
        setUserUsage((prev) => ({
          ...prev,
          isLoggedIn: false,
        }));
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handlePurchase = () => {
    if (!selectedPlan) {
      return;
    }
    // Navigate to checkout with selected plan
    router.push(`/screens/checkout?plan=${selectedPlan}`);
  };

  const usagePercentage = userUsage.isLoggedIn
    ? (userUsage.checkInsUsed / userUsage.totalCheckIns) * 100
    : 0;

  return (
    <>
      <Header
        title="Check-in Credits"
        rightComponents={[
          selectedPlan && plans.find((p) => p.id === selectedPlan)?.price !== 0 && (
            <Button title="Purchase" onPress={handlePurchase} size="small" />
          ),
        ]}
      />

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

            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              const isFreePlan = plan.price === 0;

              return (
                <Pressable
                  key={plan.id}
                  onPress={() => handleSelectPlan(plan.id)}
                  className={`mb-4 rounded-lg border-2 p-4 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                  } ${isFreePlan && userUsage.isLoggedIn ? 'opacity-60' : ''}`}
                  disabled={isFreePlan && userUsage.isLoggedIn}>
                  {plan.popular && (
                    <View className="absolute -top-2 left-4">
                      <View className="rounded-full bg-blue-500 px-3 py-1">
                        <ThemedText className="text-xs font-bold text-white">Best Value</ThemedText>
                      </View>
                    </View>
                  )}

                  <View className="mb-3 flex-row items-center justify-between">
                    <View>
                      <ThemedText className="text-lg font-bold">{plan.name}</ThemedText>
                      <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                        {plan.description}
                      </ThemedText>
                    </View>
                    <View className="items-end">
                      <ThemedText className="text-2xl font-bold">
                        {plan.price === 0 ? 'FREE' : `$${plan.price}`}
                      </ThemedText>
                      <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                        {plan.checkIns} check-ins
                      </ThemedText>
                    </View>
                  </View>

                  <View className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <View key={index} className="flex-row items-center">
                        <Icon name="Check" size={16} className="mr-2 text-green-500" />
                        <ThemedText className="text-sm text-gray-700 dark:text-gray-300">
                          {feature}
                        </ThemedText>
                      </View>
                    ))}
                  </View>

                  {isFreePlan && userUsage.isLoggedIn && (
                    <View className="mt-3 rounded bg-gray-100 p-2 dark:bg-gray-700">
                      <ThemedText className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Free starter bundle already claimed
                      </ThemedText>
                    </View>
                  )}

                  {isSelected && !isFreePlan && (
                    <View className="mt-3 flex-row items-center justify-center">
                      <Icon name="CheckCircle" size={20} className="mr-2 text-blue-500" />
                      <ThemedText className="font-medium text-blue-600 dark:text-blue-400">
                        Selected
                      </ThemedText>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </Section>

          {/* Bottom spacing for floating button */}
          <View className="h-20" />
        </ThemedScroller>
      )}

      {/* Floating Purchase Button */}
      {selectedPlan && plans.find((p) => p.id === selectedPlan)?.price !== 0 && (
        <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <Button
            title={`Purchase ${plans.find((p) => p.id === selectedPlan)?.name} - $${plans.find((p) => p.id === selectedPlan)?.price}`}
            onPress={handlePurchase}
            size="large"
            className="w-full"
          />
        </View>
      )}
    </>
  );
};

export default CartScreen;
