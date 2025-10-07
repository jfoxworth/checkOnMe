import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Text, Alert } from 'react-native';
import { Stack, Link, router } from 'expo-router';
import Input from '@/components/forms/Input';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Icon from '@/components/Icon';
import useThemeColors from '@/lib/contexts/ThemeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signInWithEmail, signInWithGoogle, signInWithFacebook, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      try {
        await signInWithEmail(email, password);
        router.replace('/(drawer)/(tabs)');
      } catch (error: any) {
        // Check if the error is due to unconfirmed email
        if (
          error.name === 'UserNotConfirmedException' ||
          error.message?.includes('not confirmed') ||
          error.message?.includes('not verified')
        ) {
          Alert.alert(
            'Email Not Verified',
            'Your email address needs to be verified before you can sign in. Would you like to verify it now?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Verify Email',
                onPress: () =>
                  router.push(`/screens/confirm-signup?email=${encodeURIComponent(email)}`),
              },
            ]
          );
        } else {
          Alert.alert(
            'Login Failed',
            error.message || 'An error occurred during login. Please try again.'
          );
        }
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      router.replace('/(drawer)/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Google Login Failed',
        error.message || 'An error occurred during Google login. Please try again.'
      );
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await signInWithFacebook();
      router.replace('/(drawer)/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Facebook Login Failed',
        error.message || 'An error occurred during Facebook login. Please try again.'
      );
    }
  };

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-light-primary p-6 dark:bg-dark-primary">
      <View className="mt-10">
        <ThemedText className="mb-14 font-outfit-bold text-4xl">
          Check On Me<Text className="text-sky-500">.</Text>
        </ThemedText>
        <ThemedText className="mb-1 text-3xl font-bold">Welcome back</ThemedText>
        <ThemedText className="mb-14 text-light-subtext dark:text-dark-subtext">
          Sign in to your account
        </ThemedText>

        <Input
          label="Email"
          //leftIcon="mail"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) validateEmail(text);
          }}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Input
          label="Password"
          //leftIcon="lock"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) validatePassword(text);
          }}
          error={passwordError}
          isPassword={true}
          autoCapitalize="none"
        />

        <Link
          className="mb-4 text-sm text-black underline dark:text-white"
          href="/screens/forgot-password">
          Forgot Password?
        </Link>

        <Button
          title="Login"
          onPress={handleLogin}
          loading={isLoading}
          size="large"
          className="mb-6"
        />

        <View className="mb-6 flex-row items-center">
          <View className="bg-light-border dark:bg-dark-border h-px flex-1" />
          <ThemedText className="mx-4 text-light-subtext dark:text-dark-subtext">OR</ThemedText>
          <View className="bg-light-border dark:bg-dark-border h-px flex-1" />
        </View>

        <Button
          title="Continue with Google"
          onPress={handleGoogleLogin}
          variant="outline"
          size="large"
          className="mb-3"
        />

        <Button
          title="Continue with Facebook"
          onPress={handleFacebookLogin}
          variant="outline"
          size="large"
          className="mb-6"
        />

        <View className="flex-row justify-center">
          <ThemedText className="text-light-subtext dark:text-dark-subtext">
            Don't have an account?{' '}
          </ThemedText>
          <Link href="/screens/signup" asChild>
            <Pressable>
              <ThemedText className="underline">Sign up</ThemedText>
            </Pressable>
          </Link>
        </View>

        <View className="mt-4 flex-row justify-center">
          <ThemedText className="text-light-subtext dark:text-dark-subtext">
            Need to verify your email?{' '}
          </ThemedText>
          <Link href="/screens/confirm-signup" asChild>
            <Pressable>
              <ThemedText className="underline">Verify here</ThemedText>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  googleIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#4285F4',
    borderRadius: 2,
  },
});
