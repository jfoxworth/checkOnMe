import React, { useState } from 'react';
import { View, Pressable, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import Input from '@/components/forms/Input';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import useThemeColors from '@/lib/contexts/ThemeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { signUpWithEmail, signInWithGoogle, signInWithFacebook, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthText, setStrengthText] = useState('');

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

  const validateName = (name: string) => {
    if (!name.trim()) {
      setNameError('Name is required');
      return false;
    }
    setNameError('');
    return true;
  };

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    let feedback = [];

    // Length check
    if (password.length >= 8) {
      strength += 25;
    } else {
      feedback.push('At least 8 characters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      strength += 25;
    } else {
      feedback.push('Add uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      strength += 25;
    } else {
      feedback.push('Add lowercase letter');
    }

    // Numbers or special characters check
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength += 25;
    } else {
      feedback.push('Add number or special character');
    }

    setPasswordStrength(strength);
    setStrengthText(feedback.join(' • ') || 'Strong password!');
    return strength >= 75;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    checkPasswordStrength(password);
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleSignup = async () => {
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid) {
      try {
        await signUpWithEmail(email, password, name);
        Alert.alert(
          'Sign Up Successful',
          'Please check your email to verify your account before signing in.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/screens/login'),
            },
          ]
        );
      } catch (error: any) {
        Alert.alert(
          'Sign Up Failed',
          error.message || 'An error occurred during sign up. Please try again.'
        );
      }
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
      router.replace('/(drawer)/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Google Sign Up Failed',
        error.message || 'An error occurred during Google sign up. Please try again.'
      );
    }
  };

  const handleFacebookSignup = async () => {
    try {
      await signInWithFacebook();
      router.replace('/(drawer)/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Facebook Sign Up Failed',
        error.message || 'An error occurred during Facebook sign up. Please try again.'
      );
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-light-primary p-6 dark:bg-dark-primary">
      <View className="mt-10">
        <ThemedText className="mb-14 font-outfit-bold text-4xl">
          Check On Me<ThemedText className="text-sky-500">.</ThemedText>
        </ThemedText>
        <ThemedText className="mb-1 text-3xl font-bold">Create account</ThemedText>
        <ThemedText className="mb-14 text-light-subtext dark:text-dark-subtext">
          Sign up to get started
        </ThemedText>

        <Input
          label="Full Name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (nameError) validateName(text);
          }}
          error={nameError}
          autoCapitalize="words"
          autoComplete="name"
        />

        <Input
          label="Email"
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
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) validatePassword(text);
          }}
          error={passwordError}
          isPassword={true}
          autoCapitalize="none"
        />

        {password ? (
          <View className="mb-4">
            <View className="mb-2 flex-row items-center">
              <View className="bg-light-border dark:bg-dark-border mr-2 h-2 flex-1 rounded-full">
                <View
                  className={`h-2 rounded-full ${getStrengthColor()}`}
                  style={{ width: `${passwordStrength}%` }}
                />
              </View>
              <ThemedText className="text-xs">
                {passwordStrength <= 25
                  ? 'Weak'
                  : passwordStrength <= 50
                    ? 'Fair'
                    : passwordStrength <= 75
                      ? 'Good'
                      : 'Strong'}
              </ThemedText>
            </View>
            {strengthText && passwordStrength < 100 && (
              <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                {strengthText}
              </ThemedText>
            )}
          </View>
        ) : null}

        <Input
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (confirmPasswordError) validateConfirmPassword(text);
          }}
          error={confirmPasswordError}
          isPassword={true}
          autoCapitalize="none"
        />

        <Button
          title="Create Account"
          onPress={handleSignup}
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
          onPress={handleGoogleSignup}
          variant="outline"
          size="large"
          className="mb-3"
        />

        <Button
          title="Continue with Facebook"
          onPress={handleFacebookSignup}
          variant="outline"
          size="large"
          className="mb-6"
        />

        <View className="flex-row justify-center">
          <ThemedText className="text-light-subtext dark:text-dark-subtext">
            Already have an account?{' '}
          </ThemedText>
          <Link href="/screens/login" asChild>
            <Pressable>
              <ThemedText className="underline">Sign in</ThemedText>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}
