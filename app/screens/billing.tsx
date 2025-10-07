import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, TextInput } from 'react-native';
import { router } from 'expo-router';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Header from '@/components/Header';
import Icon from '@/components/Icon';
import { Chip } from '@/components/Chip';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useBackend } from '@/lib/contexts/BackendContext';

interface PurchaseOption {
  id: string;
  credits: number;
  price: number;
  popular?: boolean;
  description: string;
}

const purchaseOptions: PurchaseOption[] = [
  {
    id: 'basic',
    credits: 10,
    price: 4.99,
    description: 'Perfect for occasional users',
  },
  {
    id: 'popular',
    credits: 25,
    price: 9.99,
    popular: true,
    description: 'Most popular choice',
  },
  {
    id: 'premium',
    credits: 50,
    price: 17.99,
    description: 'Best value for regular users',
  },
  {
    id: 'unlimited',
    credits: 100,
    price: 29.99,
    description: 'For heavy users',
  },
];

const BillingScreen = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!user?.id) return;

    try {
      // Mock user data for now - replace with actual API call
      setUserData({
        availableCredits: 25, // Mock data
        subscriptionStatus: 'free',
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (option: PurchaseOption) => {
    setPurchasing(option.id);

    // Simulate purchase process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    Alert.alert(
      'Purchase Complete',
      `Successfully purchased ${option.credits} credits for $${option.price}!`,
      [{ text: 'OK' }]
    );

    setPurchasing(null);
    // Refresh user data
    loadUserData();
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Subscription Cancelled', 'Your subscription has been cancelled.');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <View className="flex-1 items-center justify-center bg-white dark:bg-black">
          <ThemedText>Loading billing information...</ThemedText>
        </View>
      </>
    );
  }

  return (
    <>
      <Header />
      <ScrollView className="flex-1 bg-white dark:bg-black">
        <View className="p-4">
          {/* Header */}
          <View className="mb-6">
            <ThemedText className="mb-2 text-2xl font-bold">Payment & Billing</ThemedText>
            <ThemedText className="text-gray-600 dark:text-gray-400">
              Manage your credits, subscription, and payment methods
            </ThemedText>
          </View>

          {/* Current Credits */}
          <View className="mb-6 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
            <View className="flex-row items-center justify-between">
              <View>
                <ThemedText className="text-lg font-bold">Available Credits</ThemedText>
                <ThemedText className="text-gray-600 dark:text-gray-400">
                  Use credits to create check-ins
                </ThemedText>
              </View>
              <View className="items-end">
                <ThemedText className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {userData?.availableCredits || 0}
                </ThemedText>
                <ThemedText className="text-sm text-gray-500">credits remaining</ThemedText>
              </View>
            </View>
          </View>

          {/* Billing History */}
          <View className="mb-8">
            <ThemedText className="mb-4 text-lg font-bold">Billing History</ThemedText>
            <View className="rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
              <View className="mb-3 flex-row items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-600">
                <View>
                  <ThemedText className="font-semibold">25 Credits</ThemedText>
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                    Oct 1, 2025
                  </ThemedText>
                </View>
                <View className="items-end">
                  <ThemedText className="font-bold">$9.99</ThemedText>
                  <ThemedText className="text-sm text-green-600 dark:text-green-400">
                    Completed
                  </ThemedText>
                </View>
              </View>
              <Button title="View All Transactions" variant="outline" size="small" />
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default BillingScreen;
