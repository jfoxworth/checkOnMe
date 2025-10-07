import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Header from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Icon from '@/components/Icon';
import { useAuth } from '@/lib/contexts/AuthContext';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: '', // Not available from user object yet
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Implement API call to update user profile
      // await api.updateUserProfile(user.id, profileData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: '', // Not available from user object yet
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/screens/login');
          } catch (error) {
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <>
      <Header />
      <ScrollView className="flex-1 bg-white dark:bg-black">
        <View className="p-4">
          {/* Header */}
          <View className="mb-6">
            <ThemedText className="mb-2 text-2xl font-bold">Profile</ThemedText>
            <ThemedText className="text-gray-600 dark:text-gray-400">
              Manage your account information and preferences
            </ThemedText>
          </View>

          {/* Profile Picture */}
          <View className="mb-6 items-center">
            <TouchableOpacity onPress={pickImage} className="relative mb-4" activeOpacity={0.9}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  className="h-24 w-24 rounded-full border-2 border-gray-200 dark:border-gray-600"
                />
              ) : (
                <View className="h-24 w-24 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                  <Icon name="User" size={40} className="text-gray-500" />
                </View>
              )}
              <View className="absolute -bottom-2 -right-2 h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                <Icon name="Camera" size={16} className="text-white" />
              </View>
            </TouchableOpacity>
            <Button
              title={profileImage ? 'Change Photo' : 'Add Photo'}
              onPress={pickImage}
              variant="outline"
              size="small"
            />
            {profileImage && (
              <Button
                title="Remove Photo"
                onPress={() => setProfileImage(null)}
                variant="ghost"
                size="small"
                className="mt-2"
              />
            )}
          </View>

          {/* Profile Information */}
          <View className="mb-6 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
            <View className="mb-4 flex-row items-center justify-between">
              <ThemedText className="text-lg font-bold">Personal Information</ThemedText>
              {!isEditing && (
                <Button
                  title="Edit"
                  onPress={() => setIsEditing(true)}
                  variant="outline"
                  size="small"
                />
              )}
            </View>

            <View className="space-y-4">
              {/* First Name */}
              <View>
                <ThemedText className="mb-2 text-base font-semibold">First Name</ThemedText>
                {isEditing ? (
                  <TextInput
                    value={profileData.firstName}
                    onChangeText={(text) =>
                      setProfileData((prev) => ({ ...prev, firstName: text }))
                    }
                    placeholder="Enter your first name"
                    className="rounded-lg border border-gray-300 px-3 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholderTextColor="#9CA3AF"
                  />
                ) : (
                  <ThemedText className="text-gray-700 dark:text-gray-300">
                    {profileData.firstName || 'Not set'}
                  </ThemedText>
                )}
              </View>

              {/* Last Name */}
              <View>
                <ThemedText className="mb-2 text-base font-semibold">Last Name</ThemedText>
                {isEditing ? (
                  <TextInput
                    value={profileData.lastName}
                    onChangeText={(text) => setProfileData((prev) => ({ ...prev, lastName: text }))}
                    placeholder="Enter your last name"
                    className="rounded-lg border border-gray-300 px-3 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholderTextColor="#9CA3AF"
                  />
                ) : (
                  <ThemedText className="text-gray-700 dark:text-gray-300">
                    {profileData.lastName || 'Not set'}
                  </ThemedText>
                )}
              </View>

              {/* Email */}
              <View>
                <ThemedText className="mb-2 text-base font-semibold">Email Address</ThemedText>
                <View className="flex-row items-center">
                  <ThemedText className="flex-1 text-gray-700 dark:text-gray-300">
                    {profileData.email || 'Not set'}
                  </ThemedText>
                  {user?.emailVerified && (
                    <View className="flex-row items-center">
                      <Icon name="CheckCircle" size={16} className="mr-1 text-green-500" />
                      <ThemedText className="text-sm text-green-500">Verified</ThemedText>
                    </View>
                  )}
                </View>
                {!isEditing && (
                  <ThemedText className="mt-1 text-sm text-gray-500">
                    Contact support to change your email address
                  </ThemedText>
                )}
              </View>

              {/* Phone Number */}
              <View>
                <ThemedText className="mb-2 text-base font-semibold">Phone Number</ThemedText>
                {isEditing ? (
                  <TextInput
                    value={profileData.phoneNumber}
                    onChangeText={(text) =>
                      setProfileData((prev) => ({ ...prev, phoneNumber: text }))
                    }
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    className="rounded-lg border border-gray-300 px-3 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholderTextColor="#9CA3AF"
                  />
                ) : (
                  <ThemedText className="text-gray-700 dark:text-gray-300">
                    {profileData.phoneNumber || 'Not set'}
                  </ThemedText>
                )}
              </View>
            </View>

            {/* Edit Actions */}
            {isEditing && (
              <View className="mt-6 flex-row gap-3">
                <Button
                  title={saving ? 'Saving...' : 'Save Changes'}
                  onPress={handleSave}
                  disabled={saving}
                  className="flex-1"
                />
                <Button
                  title="Cancel"
                  onPress={handleCancel}
                  variant="outline"
                  className="flex-1"
                />
              </View>
            )}
          </View>

          {/* Account Actions */}
          <View className="mb-6 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
            <ThemedText className="mb-4 text-lg font-bold">Account Actions</ThemedText>
            <View className="space-y-3">
              <Button
                title="Change Password"
                onPress={() =>
                  Alert.alert(
                    'Change Password',
                    'Password change functionality will be implemented soon.'
                  )
                }
                variant="outline"
                iconStart="Lock"
              />
              <Button
                title="Delete Account"
                onPress={() =>
                  Alert.alert(
                    'Delete Account',
                    'Account deletion functionality will be implemented soon.'
                  )
                }
                variant="outline"
                iconStart="Trash"
                className="border-red-500 dark:border-red-400"
                textClassName="text-red-500 dark:text-red-400"
              />
            </View>
          </View>

          {/* Logout */}
          <View className="mb-8">
            <Button
              title="Logout"
              onPress={handleLogout}
              variant="outline"
              iconStart="LogOut"
              className="border-red-500 dark:border-red-400"
              textClassName="text-red-500 dark:text-red-400"
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}
