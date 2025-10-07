import React, { useState } from 'react';
import { View, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Header from '@/components/Header';
import Icon from '@/components/Icon';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useBackend } from '@/lib/contexts/BackendContext';

interface SupportFormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

const supportCategories = [
  { value: 'technical', label: 'Technical Issue' },
  { value: 'billing', label: 'Billing & Payment' },
  { value: 'account', label: 'Account Help' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'other', label: 'Other' },
];

const priorities = [
  { value: 'low', label: 'Low', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-red-600' },
];

const SupportScreen = () => {
  const { user } = useAuth();
  const { createContact } = useBackend();
  const [formData, setFormData] = useState<SupportFormData>({
    name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
    email: user?.email || '',
    subject: '',
    category: 'technical',
    message: '',
    priority: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<SupportFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<SupportFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create a support contact entry in the backend
      const supportContactData = {
        name: `Support Request: ${formData.subject}`,
        relationship: 'Support Request',
        email: formData.email,
        phone: '', // Optional for support requests
        preferredMethod: 'email' as const,
        // Add support-specific data in notes or additional fields
        notes: JSON.stringify({
          category: formData.category,
          priority: formData.priority,
          message: formData.message,
          submitterName: formData.name,
          submittedAt: new Date().toISOString(),
        }),
      };

      const response = await createContact(supportContactData);

      if (response.success) {
        Alert.alert(
          'Support Request Submitted',
          'Thank you for contacting us! We will get back to you within 24 hours.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        throw new Error(response.error || 'Failed to submit support request');
      }
    } catch (error) {
      console.error('Error submitting support request:', error);
      Alert.alert(
        'Error',
        'There was a problem submitting your support request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof SupportFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <>
      <Header />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView className="flex-1 bg-white dark:bg-black">
          <View className="p-4">
            {/* Header */}
            <View className="mb-6">
              <ThemedText className="mb-2 text-2xl font-bold">Contact Support</ThemedText>
              <ThemedText className="text-gray-600 dark:text-gray-400">
                Get help with your account, report issues, or share feedback
              </ThemedText>
            </View>

            {/* Contact Info */}
            <View className="mb-6 rounded-lg border border-blue-300 bg-blue-50 p-4 dark:border-blue-600 dark:bg-blue-900/20">
              <View className="mb-2 flex-row items-center">
                <Icon name="Clock" size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
                <ThemedText className="font-semibold text-blue-800 dark:text-blue-300">
                  Response Time
                </ThemedText>
              </View>
              <ThemedText className="text-blue-700 dark:text-blue-400">
                We typically respond within 24 hours. For urgent safety issues, please contact
                emergency services directly.
              </ThemedText>
            </View>

            {/* Support Form */}
            <View className="space-y-4">
              {/* Name */}
              <View>
                <ThemedText className="mb-2 text-base font-semibold">Name *</ThemedText>
                <TextInput
                  value={formData.name}
                  onChangeText={(text) => updateFormData('name', text)}
                  placeholder="Your full name"
                  className={`rounded-lg border px-3 py-3 dark:bg-gray-800 dark:text-white ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.name && (
                  <ThemedText className="mt-1 text-sm text-red-500">{errors.name}</ThemedText>
                )}
              </View>

              {/* Email */}
              <View>
                <ThemedText className="mb-2 text-base font-semibold">Email *</ThemedText>
                <TextInput
                  value={formData.email}
                  onChangeText={(text) => updateFormData('email', text)}
                  placeholder="your.email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className={`rounded-lg border px-3 py-3 dark:bg-gray-800 dark:text-white ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.email && (
                  <ThemedText className="mt-1 text-sm text-red-500">{errors.email}</ThemedText>
                )}
              </View>

              {/* Category */}
              <View>
                <ThemedText className="mb-2 text-base font-semibold">Category</ThemedText>
                <View className="flex-row flex-wrap gap-2">
                  {supportCategories.map((category) => (
                    <Button
                      key={category.value}
                      title={category.label}
                      onPress={() => updateFormData('category', category.value)}
                      variant={formData.category === category.value ? 'primary' : 'outline'}
                      size="small"
                    />
                  ))}
                </View>
              </View>

              {/* Priority */}
              <View>
                <ThemedText className="mb-2 text-base font-semibold">Priority</ThemedText>
                <View className="flex-row gap-2">
                  {priorities.map((priority) => (
                    <Button
                      key={priority.value}
                      title={priority.label}
                      onPress={() => updateFormData('priority', priority.value)}
                      variant={formData.priority === priority.value ? 'primary' : 'outline'}
                      size="small"
                    />
                  ))}
                </View>
              </View>

              {/* Subject */}
              <View>
                <ThemedText className="mb-2 text-base font-semibold">Subject *</ThemedText>
                <TextInput
                  value={formData.subject}
                  onChangeText={(text) => updateFormData('subject', text)}
                  placeholder="Brief description of your issue or request"
                  className={`rounded-lg border px-3 py-3 dark:bg-gray-800 dark:text-white ${
                    errors.subject ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.subject && (
                  <ThemedText className="mt-1 text-sm text-red-500">{errors.subject}</ThemedText>
                )}
              </View>

              {/* Message */}
              <View>
                <ThemedText className="mb-2 text-base font-semibold">Message *</ThemedText>
                <TextInput
                  value={formData.message}
                  onChangeText={(text) => updateFormData('message', text)}
                  placeholder="Please provide details about your issue, question, or feedback..."
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  className={`rounded-lg border px-3 py-3 dark:bg-gray-800 dark:text-white ${
                    errors.message ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.message && (
                  <ThemedText className="mt-1 text-sm text-red-500">{errors.message}</ThemedText>
                )}
                <ThemedText className="mt-1 text-sm text-gray-500">
                  {formData.message.length}/500 characters
                </ThemedText>
              </View>
            </View>

            {/* Submit Button */}
            <View className="mb-8 mt-8">
              <Button
                title={loading ? 'Submitting...' : 'Submit Support Request'}
                onPress={handleSubmit}
                disabled={loading}
                className="mb-3"
              />
              <Button title="Cancel" variant="outline" onPress={() => router.back()} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default SupportScreen;
