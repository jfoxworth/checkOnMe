import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Input from '@/components/forms/Input';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function ConfirmSignupScreen() {
  const insets = useSafeAreaInsets();
  const { email: emailParam } = useLocalSearchParams<{ email: string }>();
  const { confirmSignUp, resendConfirmationCode, isLoading } = useAuth();
  const [email, setEmail] = useState(emailParam || '');
  const [code, setCode] = useState('');
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateCode = (code: string) => {
    if (!code) {
      setCodeError('Verification code is required');
      return false;
    } else if (code.length !== 6) {
      setCodeError('Verification code must be 6 digits');
      return false;
    }
    setCodeError('');
    return true;
  };

  const handleConfirm = async () => {
    const isEmailValid = validateEmail(email);
    const isCodeValid = validateCode(code);

    if (isEmailValid && isCodeValid) {
      try {
        await confirmSignUp(email, code);
        Alert.alert(
          'Email Verified',
          'Your email has been verified successfully. You can now sign in.',
          [
            {
              text: 'Sign In',
              onPress: () => router.replace('/screens/login'),
            },
          ]
        );
      } catch (error: any) {
        Alert.alert(
          'Verification Failed',
          error.message || 'Invalid verification code. Please try again.'
        );
      }
    }
  };

  const handleResendCode = async () => {
    if (email) {
      try {
        await resendConfirmationCode(email);
        Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
      } catch (error: any) {
        Alert.alert(
          'Error',
          error.message || 'Failed to resend verification code. Please try again.'
        );
      }
    }
  };

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-light-primary p-6 dark:bg-dark-primary">
      <View className="mt-10">
        <ThemedText className="mb-14 font-outfit-bold text-4xl">
          Check On Me<ThemedText className="text-sky-500">.</ThemedText>
        </ThemedText>
        <ThemedText className="mb-1 text-3xl font-bold">Verify your email</ThemedText>
        <ThemedText className="mb-14 text-light-subtext dark:text-dark-subtext">
          {email
            ? `We've sent a verification code to ${email}`
            : 'Enter your email and the verification code sent to it'}
        </ThemedText>

        {!emailParam && (
          <Input
            label="Email Address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) validateEmail(text);
            }}
            error={emailError}
            keyboardType="email-address"
            placeholder="your@email.com"
            autoComplete="email"
            className="mb-4"
          />
        )}

        <Input
          label="Verification Code"
          value={code}
          onChangeText={(text) => {
            setCode(text);
            if (codeError) validateCode(text);
          }}
          error={codeError}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="000000"
          autoComplete="one-time-code"
        />

        <Button
          title="Verify Email"
          onPress={handleConfirm}
          loading={isLoading}
          size="large"
          className="mb-4"
        />

        <Button
          title="Resend Code"
          onPress={handleResendCode}
          variant="ghost"
          size="large"
          className="mb-6"
        />

        <Button
          title="Back to Login"
          onPress={() => router.replace('/screens/login')}
          variant="outline"
          size="large"
        />
      </View>
    </View>
  );
}
