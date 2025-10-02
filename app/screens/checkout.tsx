import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import ThemedScroller from '@/components/ThemeScroller';
import { Button } from '@/components/Button';
import Icon from '@/components/Icon';
import Selectable from '@/components/forms/Selectable';
import { CheckInPlan } from '@/lib/types';
import { purchaseService, billingService } from '@/lib/api';

type CheckoutStep = 'plan-review' | 'payment' | 'success';

const CheckoutScreen = () => {
  const { plan } = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('plan-review');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<CheckInPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock user ID - in a real app, this would come from your auth context
  const MOCK_USER_ID = 'user-john-doe';

  // Load plan data
  useEffect(() => {
    loadPlanData();
  }, [plan]);

  const loadPlanData = async () => {
    if (!plan || typeof plan !== 'string') {
      setError('Plan not specified');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await purchaseService.getPurchaseOptionById(plan);

      if (response.success && response.data) {
        setSelectedPlan(response.data);
      } else {
        setError('Plan not found');
      }
    } catch (err) {
      console.error('Error loading plan:', err);
      setError('Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Checkout" />
        <View className="flex-1 items-center justify-center p-4">
          <ThemedText className="text-lg">Loading plan details...</ThemedText>
        </View>
      </>
    );
  }

  if (error || !selectedPlan) {
    return (
      <>
        <Header title="Checkout" />
        <View className="flex-1 items-center justify-center p-4">
          <Icon name="AlertTriangle" size={48} className="mb-4 text-red-500" />
          <ThemedText className="text-center text-lg font-semibold text-red-600 dark:text-red-400">
            {error || 'Plan not found'}
          </ThemedText>
          <ThemedText className="mt-2 text-center text-gray-600 dark:text-gray-400">
            Please go back and select a plan.
          </ThemedText>
          <Button title="Back to Plans" onPress={() => router.back()} className="mt-4" />
        </View>
      </>
    );
  }

  // Payment methods
  const paymentMethods = [
    { id: 'card1', type: 'card', label: 'Visa ending in 4242', last4: '4242' },
    { id: 'card2', type: 'card', label: 'Mastercard ending in 5678', last4: '5678' },
    { id: 'apple', type: 'apple', label: 'Apple Pay' },
    { id: 'google', type: 'google', label: 'Google Pay' },
  ];

  const handleNext = async () => {
    if (currentStep === 'plan-review') {
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      if (!selectedPayment) {
        Alert.alert('Error', 'Please select a payment method');
        return;
      }

      // Process payment
      try {
        setLoading(true);
        const purchaseResponse = await billingService.purchaseCheckInCredits(MOCK_USER_ID, {
          purchaseId: selectedPlan.id,
          paymentMethodId: selectedPayment,
        });

        if (purchaseResponse.success) {
          setCurrentStep('success');
        } else {
          Alert.alert('Payment Failed', purchaseResponse.error || 'Payment could not be processed');
        }
      } catch (err) {
        console.error('Payment error:', err);
        Alert.alert('Payment Error', 'An unexpected error occurred during payment');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('plan-review');
    } else if (currentStep === 'plan-review') {
      router.back();
    }
  };

  const handleComplete = () => {
    Alert.alert('Success!', `Your ${selectedPlan.name} has been activated!`, [
      { text: 'OK', onPress: () => router.push('/(drawer)/(tabs)/checkins') },
    ]);
  };

  const renderPlanReviewStep = () => (
    <View className="flex-1 p-4">
      <View className="mb-6">
        <ThemedText className="mb-2 text-2xl font-bold">Review Your Plan</ThemedText>
        <ThemedText className="text-gray-600 dark:text-gray-400">
          Confirm your check-in plan selection
        </ThemedText>
      </View>

      <View className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <ThemedText className="text-xl font-bold">{selectedPlan.name}</ThemedText>
            <ThemedText className="text-gray-600 dark:text-gray-400">
              {selectedPlan.checkIns} check-ins included
            </ThemedText>
          </View>
          <View className="items-end">
            <ThemedText className="text-2xl font-bold">
              {selectedPlan.price === 0 ? 'FREE' : `$${selectedPlan.price}`}
            </ThemedText>
            {selectedPlan.price > 0 && (
              <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                one-time purchase
              </ThemedText>
            )}
          </View>
        </View>

        <View className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <ThemedText className="mb-3 font-semibold">Included Features:</ThemedText>
          {selectedPlan.features.map((feature, index) => (
            <View key={index} className="mb-2 flex-row items-center">
              <Icon name="Check" size={16} className="mr-3 text-green-500" />
              <ThemedText className="text-sm">{feature}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      {selectedPlan.price > 0 && (
        <View className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <ThemedText className="text-sm text-blue-700 dark:text-blue-300">
            <Icon name="Info" size={14} className="mr-1" />
            You'll be charged ${selectedPlan.price} for this bundle. Check-ins never expire once
            purchased.
          </ThemedText>
        </View>
      )}
    </View>
  );

  const renderPaymentStep = () => (
    <View className="flex-1 p-4">
      <View className="mb-6">
        <ThemedText className="mb-2 text-2xl font-bold">Payment Method</ThemedText>
        <ThemedText className="text-gray-600 dark:text-gray-400">
          Choose how you'd like to pay
        </ThemedText>
      </View>

      {paymentMethods.map((method) => (
        <Selectable
          key={method.id}
          title={method.label}
          icon={
            method.type === 'card' ? 'CreditCard' : method.type === 'apple' ? 'Smartphone' : 'Globe'
          }
          selected={selectedPayment === method.id}
          onPress={() => setSelectedPayment(method.id)}
          containerClassName="mb-3"
        />
      ))}

      <Button
        title="Add New Card"
        iconStart="Plus"
        variant="outline"
        className="mt-4"
        onPress={() => {
          Alert.alert('Add Card', 'This would open the add card modal');
        }}
      />

      <View className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <View className="flex-row items-center justify-between">
          <ThemedText className="font-semibold">Total:</ThemedText>
          <ThemedText className="text-xl font-bold">
            {selectedPlan.price === 0 ? 'FREE' : `$${selectedPlan.price}`}
          </ThemedText>
        </View>
        {selectedPlan.price > 0 && (
          <ThemedText className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            One-time purchase
          </ThemedText>
        )}
      </View>
    </View>
  );

  const renderSuccessStep = () => (
    <View className="flex-1 items-center justify-center p-4">
      <View className="mb-6 rounded-full bg-green-100 p-6 dark:bg-green-900/30">
        <Icon name="CheckCircle" size={48} className="text-green-600 dark:text-green-400" />
      </View>

      <ThemedText className="mb-2 text-center text-2xl font-bold">
        Welcome to {selectedPlan.name}!
      </ThemedText>

      <ThemedText className="mb-6 text-center text-gray-600 dark:text-gray-400">
        Your plan has been activated successfully. You now have {selectedPlan.checkIns} check-ins
        available.
      </ThemedText>

      <View className="mb-6 w-full rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <ThemedText className="mb-3 font-semibold">What's Next?</ThemedText>
        <View className="space-y-2">
          <View className="mb-2 flex-row items-center">
            <Icon name="Plus" size={16} className="mr-3 text-blue-500" />
            <ThemedText className="text-sm">Create your first check-in</ThemedText>
          </View>
          <View className="mb-2 flex-row items-center">
            <Icon name="Users" size={16} className="mr-3 text-blue-500" />
            <ThemedText className="text-sm">Add emergency contacts</ThemedText>
          </View>
          <View className="mb-2 flex-row items-center">
            <Icon name="Settings" size={16} className="mr-3 text-blue-500" />
            <ThemedText className="text-sm">Customize your preferences</ThemedText>
          </View>
        </View>
      </View>

      <Button
        title="Start Using Check-ins"
        onPress={handleComplete}
        size="large"
        className="w-full"
      />
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 'plan-review':
        return renderPlanReviewStep();
      case 'payment':
        return renderPaymentStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderPlanReviewStep();
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'plan-review':
        return 'Review Plan';
      case 'payment':
        return 'Payment';
      case 'success':
        return 'Complete';
      default:
        return 'Checkout';
    }
  };

  return (
    <>
      <Header
        title={getStepTitle()}
        onBackPress={currentStep !== 'success' ? handleBack : undefined}
      />

      {currentStep !== 'success' && (
        <View className="bg-gray-50 px-4 py-3 dark:bg-gray-900">
          <View className="flex-row items-center justify-center">
            <View className="h-1 flex-1 rounded bg-blue-500" />
            <View className="mx-2">
              <ThemedText className="text-center text-xs">1</ThemedText>
            </View>
            <View
              className={`h-1 flex-1 rounded ${currentStep === 'payment' ? 'bg-blue-500' : 'bg-gray-300'}`}
            />
            <View className="mx-2">
              <ThemedText className="text-center text-xs">2</ThemedText>
            </View>
            <View className="h-1 flex-1 rounded bg-gray-300" />
          </View>
        </View>
      )}

      <ThemedScroller>{renderStep()}</ThemedScroller>

      {currentStep !== 'success' && (
        <View className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <View className="flex-row gap-3">
            <Button
              title={currentStep === 'plan-review' ? 'Cancel' : 'Back'}
              variant="outline"
              onPress={handleBack}
              className="flex-1"
            />
            <Button
              title={currentStep === 'plan-review' ? 'Continue' : 'Complete Purchase'}
              onPress={handleNext}
              className="flex-1"
            />
          </View>
        </View>
      )}
    </>
  );
};

export default CheckoutScreen;
