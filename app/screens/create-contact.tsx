import React, { useState } from 'react';
import { View, TextInput, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Header from '@/components/Header';
import { Chip } from '@/components/Chip';

interface ContactFormData {
  name: string;
  relation: string;
  phone: string;
  email: string;
  preferredMethod: 'text' | 'email' | 'both';
}

interface FormErrors {
  name?: string;
  relation?: string;
  phone?: string;
  email?: string;
  preferredMethod?: string;
}

const CreateContactScreen = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    relation: '',
    phone: '',
    email: '',
    preferredMethod: 'both',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim() && !formData.email.trim()) {
      newErrors.phone = 'Either phone or email is required';
      newErrors.email = 'Either phone or email is required';
    }

    // Basic email validation
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Basic phone validation (allowing various formats)
    if (
      formData.phone.trim() &&
      !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))
    ) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Check if preferred method is available
    if (formData.preferredMethod === 'text' && !formData.phone.trim()) {
      newErrors.preferredMethod = 'Phone number required for text notifications';
    }
    if (formData.preferredMethod === 'email' && !formData.email.trim()) {
      newErrors.preferredMethod = 'Email address required for email notifications';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    // Here you would save the contact data to your store/database
    console.log('Creating contact:', formData);

    Alert.alert('Success', 'Contact created successfully!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const isFormValid = () => {
    // Name is required
    if (!formData.name.trim()) return false;

    // At least one contact method is required
    if (!formData.phone.trim() && !formData.email.trim()) return false;

    // If email is provided, it must be valid
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) return false;

    // If phone is provided, it must be valid
    if (formData.phone.trim() && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, '')))
      return false;

    // Check if preferred method matches available contact info
    if (formData.preferredMethod === 'text' && !formData.phone.trim()) return false;
    if (formData.preferredMethod === 'email' && !formData.email.trim()) return false;

    return true;
  };

  const validateField = (field: keyof ContactFormData, value: string) => {
    const newErrors: FormErrors = {};

    if (field === 'name' && !value.trim()) {
      newErrors.name = 'Name is required';
    }

    if (field === 'email' && value.trim() && !/\S+@\S+\.\S+/.test(value)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (
      field === 'phone' &&
      value.trim() &&
      !/^\+?[\d\s\-\(\)]{10,}$/.test(value.replace(/\s/g, ''))
    ) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors((prev) => ({ ...prev, [field]: newErrors[field] || '' }));
  };

  const updateField = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <>
      <Header />
      <ScrollView className="flex-1 bg-white dark:bg-black">
        <View className="p-4">
          {/* Header */}
          <View className="mb-6">
            <ThemedText className="text-2xl font-bold">Add New Contact</ThemedText>
            <ThemedText className="mt-1 text-gray-600 dark:text-gray-400">
              Create a new check-in contact for your check-ins
            </ThemedText>
          </View>

          {/* Name */}
          <View className="mb-6">
            <ThemedText className="mb-2 text-lg font-bold">
              Name <ThemedText className="text-red-500">*</ThemedText>
            </ThemedText>
            <TextInput
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              onBlur={() => validateField('name', formData.name)}
              placeholder="Enter contact's full name"
              className={`rounded-lg border bg-white px-4 py-3 text-base dark:bg-gray-800 dark:text-white ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholderTextColor="#9CA3AF"
            />
            {errors.name && (
              <ThemedText className="mt-1 text-sm text-red-500">{errors.name}</ThemedText>
            )}
          </View>

          {/* Relation */}
          <View className="mb-6">
            <ThemedText className="mb-2 text-lg font-bold">Relationship</ThemedText>
            <TextInput
              value={formData.relation}
              onChangeText={(text) => updateField('relation', text)}
              placeholder="e.g., Spouse, Parent, Friend, Coworker"
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholderTextColor="#9CA3AF"
            />
            {errors.relation && (
              <ThemedText className="mt-1 text-sm text-red-500">{errors.relation}</ThemedText>
            )}
          </View>

          {/* Phone */}
          <View className="mb-6">
            <ThemedText className="mb-2 text-lg font-bold">Phone Number</ThemedText>
            <TextInput
              value={formData.phone}
              onChangeText={(text) => updateField('phone', text)}
              onBlur={() => validateField('phone', formData.phone)}
              placeholder="+1 (555) 123-4567"
              keyboardType="phone-pad"
              className={`rounded-lg border bg-white px-4 py-3 text-base dark:bg-gray-800 dark:text-white ${
                errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholderTextColor="#9CA3AF"
            />
            {errors.phone && (
              <ThemedText className="mt-1 text-sm text-red-500">{errors.phone}</ThemedText>
            )}
          </View>

          {/* Email */}
          <View className="mb-6">
            <ThemedText className="mb-2 text-lg font-bold">Email Address</ThemedText>
            <TextInput
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              onBlur={() => validateField('email', formData.email)}
              placeholder="contact@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className={`rounded-lg border bg-white px-4 py-3 text-base dark:bg-gray-800 dark:text-white ${
                errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholderTextColor="#9CA3AF"
            />
            {errors.email && (
              <ThemedText className="mt-1 text-sm text-red-500">{errors.email}</ThemedText>
            )}
          </View>

          {/* Preferred Contact Method */}
          <View className="mb-6">
            <ThemedText className="mb-3 text-lg font-bold">Preferred Contact Method</ThemedText>
            <View className="flex-row gap-3">
              <Chip
                label="Text Message"
                onPress={() => {
                  if (formData.phone.trim()) {
                    setFormData((prev) => ({ ...prev, preferredMethod: 'text' }));
                  }
                }}
                className={
                  formData.preferredMethod === 'text'
                    ? 'bg-blue-500'
                    : formData.phone.trim()
                      ? 'bg-gray-200 dark:bg-gray-700'
                      : 'bg-gray-100 opacity-50 dark:bg-gray-800'
                }
              />
              <Chip
                label="Email"
                onPress={() => {
                  if (formData.email.trim()) {
                    setFormData((prev) => ({ ...prev, preferredMethod: 'email' }));
                  }
                }}
                className={
                  formData.preferredMethod === 'email'
                    ? 'bg-blue-500'
                    : formData.email.trim()
                      ? 'bg-gray-200 dark:bg-gray-700'
                      : 'bg-gray-100 opacity-50 dark:bg-gray-800'
                }
              />
              <Chip
                label="Both"
                onPress={() => {
                  if (formData.phone.trim() || formData.email.trim()) {
                    setFormData((prev) => ({ ...prev, preferredMethod: 'both' }));
                  }
                }}
                className={
                  formData.preferredMethod === 'both'
                    ? 'bg-blue-500'
                    : formData.phone.trim() || formData.email.trim()
                      ? 'bg-gray-200 dark:bg-gray-700'
                      : 'bg-gray-100 opacity-50 dark:bg-gray-800'
                }
              />
            </View>
            {errors.preferredMethod && (
              <ThemedText className="mt-2 text-sm text-red-500">
                {errors.preferredMethod}
              </ThemedText>
            )}
            <ThemedText className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Note: You must provide at least a phone number or email address
            </ThemedText>
          </View>

          {/* Contact Information Summary */}
          {(formData.name || formData.phone || formData.email) && (
            <View className="mb-6 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
              <ThemedText className="mb-2 text-lg font-semibold">Contact Preview</ThemedText>
              {formData.name && (
                <ThemedText className="mb-1">
                  <ThemedText className="font-medium">Name:</ThemedText> {formData.name}
                </ThemedText>
              )}
              {formData.relation && (
                <ThemedText className="mb-1">
                  <ThemedText className="font-medium">Relationship:</ThemedText> {formData.relation}
                </ThemedText>
              )}
              {formData.phone && (
                <ThemedText className="mb-1">
                  <ThemedText className="font-medium">Phone:</ThemedText> {formData.phone}
                </ThemedText>
              )}
              {formData.email && (
                <ThemedText className="mb-1">
                  <ThemedText className="font-medium">Email:</ThemedText> {formData.email}
                </ThemedText>
              )}
              <ThemedText className="mb-1">
                <ThemedText className="font-medium">Preferred Contact:</ThemedText>{' '}
                {formData.preferredMethod === 'text' && 'Text Message'}
                {formData.preferredMethod === 'email' && 'Email'}
                {formData.preferredMethod === 'both' && 'Text & Email'}
              </ThemedText>
            </View>
          )}

          {/* Submit Buttons */}
          <View className="mb-8 flex-row gap-3">
            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="outline"
              className="flex-1"
            />
            <Button
              title="Create Contact"
              onPress={handleSubmit}
              className="flex-1"
              disabled={!isFormValid()}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default CreateContactScreen;
