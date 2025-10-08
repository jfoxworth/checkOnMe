import React, { useState, useEffect } from 'react';
import { View, TextInput, Alert, BackHandler } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Header from '@/components/Header';
import { useBackend } from '@/lib/contexts/BackendContext';
import Icon from '@/components/Icon';

const CheckInChallengeScreen = () => {
  const { checkInId } = useLocalSearchParams<{ checkInId: string }>();
  const [enteredCode, setEnteredCode] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [checkIn, setCheckIn] = useState<any>(null);
  const { getCheckInById, acknowledgeCheckIn } = useBackend();

  useEffect(() => {
    loadCheckIn();

    // Prevent back button on Android
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert('Check-in Required', 'You must complete the check-in verification to continue.', [
        { text: 'OK' },
      ]);
      return true; // Prevent default behavior
    });

    return () => backHandler.remove();
  }, []);

  const loadCheckIn = async () => {
    try {
      if (checkInId) {
        console.log('🔍 Loading check-in with ID:', checkInId);
        const result = await getCheckInById(checkInId);
        console.log('📄 Loaded check-in:', result);
        console.log('📄 Check-in object keys:', Object.keys(result || {}));
        console.log('📄 Full check-in data:', JSON.stringify(result, null, 2));
        setCheckIn(result);

        if (result?.checkInCode) {
          console.log('🔐 Check-in code found:', result.checkInCode);
          console.log('🔐 Check-in code type:', typeof result.checkInCode);
          console.log('🔐 Check-in code length:', result.checkInCode?.length);
        } else {
          console.warn('⚠️ No check-in code found in loaded data');
          console.log('⚠️ Available fields:', Object.keys(result || {}));
        }
      }
    } catch (error) {
      console.error('Failed to load check-in:', error);
      Alert.alert('Error', 'Failed to load check-in details');
    }
  };

  const handleCodeSubmit = async () => {
    if (enteredCode.length !== 4) {
      Alert.alert('Invalid Code', 'Please enter a 4-digit code');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Code verification attempt:');
      console.log('   Entered code:', enteredCode);
      console.log('   Expected code:', checkIn?.checkInCode);

      // Send code to backend for verification
      const response = await acknowledgeCheckIn(checkInId, enteredCode);

      if (response.success) {
        console.log('✅ Code verified successfully!');
        Alert.alert(
          'Check-in Successful! ✅',
          'You have successfully confirmed your safety. Your emergency contacts will not be notified.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/'),
            },
          ]
        );
      } else {
        console.log('❌ Code verification failed:', response.error);
        // Wrong code
        const newAttemptsLeft = attemptsLeft - 1;
        setAttemptsLeft(newAttemptsLeft);
        setEnteredCode('');

        if (newAttemptsLeft === 0) {
          // No attempts left - escalate
          Alert.alert(
            'Check-in Failed ❌',
            'Maximum attempts exceeded. Emergency contacts will be notified immediately.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/'),
              },
            ]
          );
          // The backend will handle escalation when no confirmation is received
        } else {
          Alert.alert(
            'Incorrect Code',
            `Wrong code. You have ${newAttemptsLeft} attempt${newAttemptsLeft === 1 ? '' : 's'} remaining.`
          );
        }
      }
    } catch (error) {
      console.error('Check-in confirmation failed:', error);
      Alert.alert('Error', 'Failed to confirm check-in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCode = (code: string) => {
    return code.replace(/\D/g, '').substring(0, 4);
  };

  if (!checkIn) {
    return (
      <>
        <Header title="Check-in Challenge" />
        <View className="flex-1 items-center justify-center p-4">
          <ThemedText>Loading check-in details...</ThemedText>
        </View>
      </>
    );
  }

  return (
    <>
      <Header title="Safety Check-in Required" />
      <View className="flex-1 bg-white p-4 dark:bg-black">
        {/* Alert Section */}
        <View className="mb-8 items-center rounded-lg bg-red-50 p-6 dark:bg-red-900/20">
          <Icon name="AlertTriangle" size={48} className="mb-4 text-red-500" />
          <ThemedText className="mb-2 text-center text-xl font-bold text-red-700 dark:text-red-400">
            🚨 Check-in Time!
          </ThemedText>
          <ThemedText className="text-center text-red-600 dark:text-red-300">
            Enter your 4-digit safety code to confirm you're okay
          </ThemedText>
        </View>

        {/* Check-in Info */}
        <View className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <ThemedText className="mb-1 font-semibold">{checkIn.title}</ThemedText>
          <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
            Scheduled: {new Date(checkIn.scheduledTime).toLocaleString()}
          </ThemedText>
        </View>

        {/* Code Input */}
        <View className="mb-6">
          <ThemedText className="mb-3 text-center text-lg font-semibold">
            Enter Your 4-Digit Safety Code
          </ThemedText>

          <TextInput
            value={enteredCode}
            onChangeText={(text) => setEnteredCode(formatCode(text))}
            onSubmitEditing={handleCodeSubmit}
            placeholder="1234"
            keyboardType="numeric"
            maxLength={4}
            className="mb-4 rounded-lg border border-gray-300 bg-white p-4 text-center font-mono text-2xl tracking-widest dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            autoFocus
            selectTextOnFocus
            returnKeyType="done"
          />

          <View className="mb-4 flex-row items-center justify-center">
            <Icon name="Shield" size={16} className="mr-2 text-gray-500" />
            <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
              Attempts remaining: {attemptsLeft}
            </ThemedText>
          </View>

          {enteredCode.length < 4 && (
            <ThemedText className="mb-2 text-center text-sm text-gray-500 dark:text-gray-400">
              Enter all 4 digits to activate verification button
            </ThemedText>
          )}

          <Button
            title={isLoading ? 'Verifying...' : 'Confirm Safety'}
            onPress={handleCodeSubmit}
            disabled={enteredCode.length !== 4 || isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
            size="large"
          />
        </View>

        {/* Warning */}
        <View className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <View className="flex-row items-start">
            <Icon name="AlertCircle" size={20} className="mr-3 mt-1 text-yellow-600" />
            <View className="flex-1">
              <ThemedText className="mb-1 font-semibold text-yellow-800 dark:text-yellow-200">
                Important
              </ThemedText>
              <ThemedText className="text-sm text-yellow-700 dark:text-yellow-300">
                If you fail to enter the correct code within 5 attempts, your emergency contacts
                will be automatically notified that you may need assistance.
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

export default CheckInChallengeScreen;
