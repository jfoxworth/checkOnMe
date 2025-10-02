import React, { useState, useEffect } from 'react';
import { View, TextInput, ScrollView, Alert, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Icon from '@/components/Icon';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Header from '@/components/Header';
import { Chip } from '@/components/Chip';
import DateTimePicker from '@react-native-community/datetimepicker';

// Types
interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: 'email' | 'sms' | 'both';
}

interface SelectedContact extends Contact {
  notificationType: 'email' | 'sms' | 'both';
}

interface CustomContact {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: 'email' | 'sms';
}

interface Location {
  id: number;
  location: string;
  dateTime: Date;
}

interface Companion {
  id: number;
  name: string;
  contact: string;
}

interface FormData {
  title: string;
  type: string;
  checkInDateTime: Date;
  selectedContacts: SelectedContact[];
  customContacts: CustomContact[];
  locations: Location[];
  companions: Companion[];
}

// Mock data - should come from contacts store/context
const availableContacts: Contact[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    type: 'both',
  },
  { id: 2, name: 'Mike Chen', email: 'mike.chen@gmail.com', phone: '', type: 'email' },
  { id: 3, name: 'Mom', email: '', phone: '+1 (555) 987-6543', type: 'sms' },
];

const checkInTypes = [
  { id: 'hiking', label: 'Hiking', icon: 'Mountain' },
  { id: 'fishing', label: 'Fishing', icon: 'Fish' },
  { id: 'date', label: 'Date', icon: 'Heart' },
  { id: 'road-trip', label: 'Road Trip', icon: 'Car' },
  { id: 'work', label: 'Work', icon: 'Briefcase' },
  { id: 'other', label: 'Other', icon: 'Clock' },
];

// Mock data for editing - in a real app, this would come from your store/database
const mockCheckIns = [
  {
    id: 1,
    title: 'Hiking Trip - Blue Ridge',
    status: 'active',
    checkInDateTime: new Date('2024-10-01T18:00:00'),
    type: 'hiking',
    selectedContacts: [
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
        type: 'both' as const,
        notificationType: 'both' as const,
      },
      {
        id: 3,
        name: 'Mom',
        email: '',
        phone: '+1 (555) 987-6543',
        type: 'sms' as const,
        notificationType: 'sms' as const,
      },
    ],
    customContacts: [],
    locations: [
      {
        id: 1,
        location: 'Blue Ridge Trail Head',
        dateTime: new Date('2024-10-01T08:00:00'),
      },
      {
        id: 2,
        location: 'Summit Camp',
        dateTime: new Date('2024-10-01T15:00:00'),
      },
    ],
    companions: [
      {
        id: 1,
        name: 'Alex Martinez',
        contact: '+1 (555) 234-5678',
      },
    ],
  },
  {
    id: 3,
    title: 'Road Trip - Coast Highway',
    status: 'scheduled',
    checkInDateTime: new Date('2024-10-02T20:00:00'),
    type: 'road-trip',
    selectedContacts: [
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
        type: 'both' as const,
        notificationType: 'both' as const,
      },
    ],
    customContacts: [
      {
        id: 1,
        name: 'roadtrip@example.com',
        email: 'roadtrip@example.com',
        phone: '',
        type: 'email' as const,
      },
    ],
    locations: [
      {
        id: 1,
        location: 'Starting Point - Home',
        dateTime: new Date('2024-10-02T09:00:00'),
      },
      {
        id: 2,
        location: 'Lunch Stop - Coastal Town',
        dateTime: new Date('2024-10-02T13:00:00'),
      },
      {
        id: 3,
        location: 'Hotel - Seaside Resort',
        dateTime: new Date('2024-10-02T18:00:00'),
      },
    ],
    companions: [
      {
        id: 1,
        name: 'Jamie Wilson',
        contact: 'jamie.wilson@email.com',
      },
      {
        id: 2,
        name: 'Casey Brown',
        contact: '+1 (555) 345-6789',
      },
    ],
  },
];

const CreateCheckInScreen = () => {
  const { edit, id } = useLocalSearchParams();
  const isEditing = edit === 'true';
  const editingId = id ? parseInt(id as string) : null;

  const [formData, setFormData] = useState<FormData>({
    title: '',
    type: '',
    checkInDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
    selectedContacts: [],
    customContacts: [],
    locations: [{ id: 1, location: '', dateTime: new Date() }],
    companions: [{ id: 1, name: '', contact: '' }],
  });

  // Load existing check-in data when editing
  useEffect(() => {
    if (isEditing && editingId) {
      const existingCheckIn = mockCheckIns.find((c) => c.id === editingId);
      if (existingCheckIn) {
        setFormData({
          title: existingCheckIn.title,
          type: existingCheckIn.type,
          checkInDateTime: existingCheckIn.checkInDateTime,
          selectedContacts: existingCheckIn.selectedContacts,
          customContacts: existingCheckIn.customContacts,
          locations: existingCheckIn.locations,
          companions: existingCheckIn.companions,
        });
      }
    }
  }, [isEditing, editingId]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showLocationDatePicker, setShowLocationDatePicker] = useState<number | null>(null);
  const [showLocationTimePicker, setShowLocationTimePicker] = useState<number | null>(null);
  const [newCustomContact, setNewCustomContact] = useState<{
    email: string;
    phone: string;
    type: 'email' | 'sms';
  }>({
    email: '',
    phone: '',
    type: 'email',
  });

  const [customContactErrors, setCustomContactErrors] = useState<{
    email?: string;
    phone?: string;
  }>({});

  const validateEmail = (email: string) => {
    if (!email) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? '' : 'Please enter a valid email address';
  };

  const validatePhone = (phone: string) => {
    if (!phone) return '';
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    // Check if it has at least 10 digits (US standard)
    if (digitsOnly.length < 10) {
      return 'Phone number must have at least 10 digits';
    }
    if (digitsOnly.length > 15) {
      return 'Phone number is too long';
    }
    return '';
  };

  const updateCustomContactField = (field: 'email' | 'phone', value: string) => {
    setNewCustomContact((prev) => ({ ...prev, [field]: value }));

    // Validate immediately as user types
    let error = '';
    if (field === 'email') {
      error = validateEmail(value);
    } else if (field === 'phone') {
      error = validatePhone(value);
    }

    setCustomContactErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateCustomContactField = (field: 'email' | 'phone', value: string) => {
    console.log(`Validating ${field}:`, value);
    let error = '';
    if (field === 'email') {
      error = validateEmail(value);
    } else if (field === 'phone') {
      error = validatePhone(value);
    }
    console.log(`Validation result for ${field}:`, error);

    setCustomContactErrors((prev) => ({ ...prev, [field]: error }));
  };

  const addCustomContact = () => {
    const emailError = validateEmail(newCustomContact.email);
    const phoneError = validatePhone(newCustomContact.phone);

    // Update errors
    setCustomContactErrors({
      email: emailError,
      phone: phoneError,
    });

    if (!newCustomContact.email.trim() && !newCustomContact.phone.trim()) {
      Alert.alert('Error', 'Please enter either an email or phone number');
      return;
    }

    if (emailError || phoneError) {
      Alert.alert('Error', 'Please fix the validation errors before adding the contact');
      return;
    }

    const contact: CustomContact = {
      id: Date.now(),
      ...newCustomContact,
      name: newCustomContact.email || newCustomContact.phone,
    };

    setFormData((prev) => ({
      ...prev,
      customContacts: [...prev.customContacts, contact],
    }));

    setNewCustomContact({ email: '', phone: '', type: 'email' });
    setCustomContactErrors({});
  };

  const removeCustomContact = (contactId: number) => {
    setFormData((prev) => ({
      ...prev,
      customContacts: prev.customContacts.filter((c) => c.id !== contactId),
    }));
  };

  const toggleSelectedContact = (contact: Contact) => {
    setFormData((prev) => {
      const isSelected = prev.selectedContacts.find((c) => c.id === contact.id);
      if (isSelected) {
        return {
          ...prev,
          selectedContacts: prev.selectedContacts.filter((c) => c.id !== contact.id),
        };
      } else {
        return {
          ...prev,
          selectedContacts: [
            ...prev.selectedContacts,
            { ...contact, notificationType: contact.type },
          ],
        };
      }
    });
  };

  const updateContactNotificationType = (contactId: number, type: 'email' | 'sms' | 'both') => {
    setFormData((prev) => ({
      ...prev,
      selectedContacts: prev.selectedContacts.map((c) =>
        c.id === contactId ? { ...c, notificationType: type } : c
      ),
    }));
  };

  const addLocation = () => {
    const newLocation: Location = {
      id: Date.now(),
      location: '',
      dateTime: new Date(),
    };
    setFormData((prev) => ({
      ...prev,
      locations: [...prev.locations, newLocation],
    }));
  };

  const updateLocation = (
    locationId: number,
    field: keyof Omit<Location, 'id'>,
    value: string | Date
  ) => {
    setFormData((prev) => ({
      ...prev,
      locations: prev.locations.map((loc) =>
        loc.id === locationId ? { ...loc, [field]: value } : loc
      ),
    }));
  };

  const removeLocation = (locationId: number) => {
    if (formData.locations.length > 1) {
      setFormData((prev) => ({
        ...prev,
        locations: prev.locations.filter((loc) => loc.id !== locationId),
      }));
    }
  };

  const addCompanion = () => {
    const newCompanion: Companion = { id: Date.now(), name: '', contact: '' };
    setFormData((prev) => ({
      ...prev,
      companions: [...prev.companions, newCompanion],
    }));
  };

  const updateCompanion = (
    companionId: number,
    field: keyof Omit<Companion, 'id'>,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      companions: prev.companions.map((comp) =>
        comp.id === companionId ? { ...comp, [field]: value } : comp
      ),
    }));
  };

  const removeCompanion = (companionId: number) => {
    setFormData((prev) => ({
      ...prev,
      companions: prev.companions.filter((comp) => comp.id !== companionId),
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your check-in');
      return false;
    }
    if (!formData.type) {
      Alert.alert('Error', 'Please select a check-in type');
      return false;
    }
    if (formData.selectedContacts.length === 0 && formData.customContacts.length === 0) {
      Alert.alert('Error', 'Please select at least one emergency contact');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (isEditing) {
      // Here you would update the existing check-in data
      console.log('Updating check-in:', formData);
      Alert.alert('Success', 'Check-in updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      // Here you would save the new check-in data
      console.log('Creating check-in:', formData);
      Alert.alert('Success', 'Check-in created successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  return (
    <>
      <Header />
      <ScrollView className="flex-1 bg-white dark:bg-black">
        <View className="p-4">
          {/* Header */}
          <View className="mb-6">
            <ThemedText className="text-2xl font-bold">
              {isEditing ? 'Edit Check-in' : 'Create New Check-in'}
            </ThemedText>
            {isEditing && (
              <ThemedText className="mt-1 text-gray-600 dark:text-gray-400">
                Update your check-in details
              </ThemedText>
            )}
          </View>

          {/* Title */}
          <View className="mb-6">
            <ThemedText className="mb-2 text-lg font-bold">Check-in Title</ThemedText>
            <TextInput
              value={formData.title}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, title: text }))}
              placeholder="Enter a title for this check-in"
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Type Selection */}
          <View className="mb-6">
            <ThemedText className="mb-3 text-lg font-bold">Check-in Type</ThemedText>
            <View className="flex-row flex-wrap gap-2">
              {checkInTypes.map((type) => (
                <Chip
                  key={type.id}
                  label={type.label}
                  onPress={() => setFormData((prev) => ({ ...prev, type: type.id }))}
                  className={
                    formData.type === type.id ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                  }
                />
              ))}
            </View>
          </View>

          {/* Check-in Date & Time */}
          <View className="mb-6">
            <ThemedText className="mb-2 text-lg font-bold">Check-in Date & Time</ThemedText>
            <View className="rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <ThemedText className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Date
                  </ThemedText>
                  <Pressable
                    onPress={() => setShowDatePicker(true)}
                    className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-3 dark:border-gray-600 dark:bg-gray-700">
                    <ThemedText className="text-center text-base">
                      {formData.checkInDateTime.toLocaleDateString()}
                    </ThemedText>
                  </Pressable>
                </View>
                <View className="flex-1">
                  <ThemedText className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Time
                  </ThemedText>
                  <Pressable
                    onPress={() => setShowTimePicker(true)}
                    className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-3 dark:border-gray-600 dark:bg-gray-700">
                    <ThemedText className="text-center text-base">
                      {formData.checkInDateTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={formData.checkInDateTime}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    // Preserve the current time when changing date
                    const newDateTime = new Date(selectedDate);
                    newDateTime.setHours(formData.checkInDateTime.getHours());
                    newDateTime.setMinutes(formData.checkInDateTime.getMinutes());
                    setFormData((prev) => ({ ...prev, checkInDateTime: newDateTime }));
                  }
                }}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={formData.checkInDateTime}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) {
                    // Preserve the current date when changing time
                    const newDateTime = new Date(formData.checkInDateTime);
                    newDateTime.setHours(selectedTime.getHours());
                    newDateTime.setMinutes(selectedTime.getMinutes());
                    setFormData((prev) => ({ ...prev, checkInDateTime: newDateTime }));
                  }
                }}
              />
            )}
          </View>

          {/* Check-in Contacts */}
          <View className="mb-6">
            <ThemedText className="mb-3 text-lg font-bold">Check-in Contacts</ThemedText>

            {/* Existing Contacts */}
            <ThemedText className="mb-2 text-base font-semibold">
              Select from your contacts:
            </ThemedText>
            {availableContacts.map((contact) => {
              const isSelected = formData.selectedContacts.find((c) => c.id === contact.id);
              return (
                <View
                  key={contact.id}
                  className="mb-3 rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-800">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <ThemedText className="font-semibold">{contact.name}</ThemedText>
                      {contact.email && (
                        <ThemedText className="text-sm text-gray-600">{contact.email}</ThemedText>
                      )}
                      {contact.phone && (
                        <ThemedText className="text-sm text-gray-600">{contact.phone}</ThemedText>
                      )}
                    </View>
                    <Button
                      title={isSelected ? 'Selected' : 'Select'}
                      onPress={() => toggleSelectedContact(contact)}
                      variant={isSelected ? 'primary' : 'outline'}
                      size="small"
                    />
                  </View>

                  {isSelected && (
                    <View className="mt-3 flex-row gap-2">
                      <ThemedText className="text-sm">Notify via:</ThemedText>
                      {contact.email && (
                        <Chip
                          label="Email"
                          onPress={() => updateContactNotificationType(contact.id, 'email')}
                          className={
                            isSelected.notificationType === 'email'
                              ? 'bg-blue-500'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }
                        />
                      )}
                      {contact.phone && (
                        <Chip
                          label="SMS"
                          onPress={() => updateContactNotificationType(contact.id, 'sms')}
                          className={
                            isSelected.notificationType === 'sms'
                              ? 'bg-blue-500'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }
                        />
                      )}
                      {contact.email && contact.phone && (
                        <Chip
                          label="Both"
                          onPress={() => updateContactNotificationType(contact.id, 'both')}
                          className={
                            isSelected.notificationType === 'both'
                              ? 'bg-blue-500'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }
                        />
                      )}
                    </View>
                  )}
                </View>
              );
            })}

            {/* Add Custom Contact */}
            <View className="mt-4">
              <ThemedText className="mb-2 text-base font-semibold">Add new contact:</ThemedText>
              <View className="rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-800">
                <View className="mb-2">
                  <TextInput
                    value={newCustomContact.email}
                    onChangeText={(text) => updateCustomContactField('email', text)}
                    onBlur={() => validateCustomContactField('email', newCustomContact.email)}
                    placeholder="Email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className={`rounded border px-3 py-2 dark:bg-gray-700 dark:text-white ${
                      customContactErrors.email
                        ? 'border-red-500'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                    placeholderTextColor="#9CA3AF"
                  />
                  {customContactErrors.email && (
                    <ThemedText className="mt-1 text-sm text-red-500">
                      {customContactErrors.email}
                    </ThemedText>
                  )}
                </View>
                <View className="mb-3">
                  <TextInput
                    value={newCustomContact.phone}
                    onChangeText={(text) => updateCustomContactField('phone', text)}
                    onBlur={() => validateCustomContactField('phone', newCustomContact.phone)}
                    placeholder="Phone number (e.g., +1 555-123-4567)"
                    keyboardType="phone-pad"
                    className={`rounded border px-3 py-2 dark:bg-gray-700 dark:text-white ${
                      customContactErrors.phone
                        ? 'border-red-500'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                    placeholderTextColor="#9CA3AF"
                  />
                  {customContactErrors.phone && (
                    <ThemedText className="mt-1 text-sm text-red-500">
                      {customContactErrors.phone}
                    </ThemedText>
                  )}
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row gap-2">
                    <Chip
                      label="Email"
                      onPress={() => setNewCustomContact((prev) => ({ ...prev, type: 'email' }))}
                      className={newCustomContact.type === 'email' ? 'bg-blue-500' : 'bg-gray-200'}
                    />
                    <Chip
                      label="SMS"
                      onPress={() => setNewCustomContact((prev) => ({ ...prev, type: 'sms' }))}
                      className={newCustomContact.type === 'sms' ? 'bg-blue-500' : 'bg-gray-200'}
                    />
                  </View>
                  <Button title="Add" onPress={addCustomContact} size="small" />
                </View>
              </View>

              {/* Display Added Custom Contacts */}
              {formData.customContacts.map((contact) => (
                <View
                  key={contact.id}
                  className="mt-2 rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <ThemedText className="font-semibold">{contact.name}</ThemedText>
                      <ThemedText className="text-sm text-gray-600">
                        Type: {contact.type.toUpperCase()}
                      </ThemedText>
                    </View>
                    <Button
                      title="Remove"
                      onPress={() => removeCustomContact(contact.id)}
                      variant="outline"
                      size="small"
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Locations */}
          <View className="mb-6">
            <ThemedText className="mb-3 text-lg font-bold">Locations & Timeline</ThemedText>
            {formData.locations.map((location, index) => (
              <View
                key={location.id}
                className="mb-3 rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-800">
                <View className="mb-2 flex-row items-center justify-between">
                  <ThemedText className="font-semibold">Location {index + 1}</ThemedText>
                  {formData.locations.length > 1 && (
                    <Button
                      title="Remove"
                      onPress={() => removeLocation(location.id)}
                      variant="outline"
                      size="small"
                    />
                  )}
                </View>
                <TextInput
                  value={location.location}
                  onChangeText={(text) => updateLocation(location.id, 'location', text)}
                  placeholder="Enter location description"
                  className="mb-3 rounded border border-gray-200 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholderTextColor="#9CA3AF"
                />

                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <ThemedText className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                      Date
                    </ThemedText>
                    <Pressable
                      onPress={() => setShowLocationDatePicker(location.id)}
                      className="rounded border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                      <ThemedText className="text-center text-sm">
                        {location.dateTime.toLocaleDateString()}
                      </ThemedText>
                    </Pressable>
                  </View>
                  <View className="flex-1">
                    <ThemedText className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                      Time
                    </ThemedText>
                    <Pressable
                      onPress={() => setShowLocationTimePicker(location.id)}
                      className="rounded border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                      <ThemedText className="text-center text-sm">
                        {location.dateTime.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>

                {showLocationDatePicker === location.id && (
                  <DateTimePicker
                    value={location.dateTime}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowLocationDatePicker(null);
                      if (selectedDate) {
                        // Preserve the current time when changing date
                        const newDateTime = new Date(selectedDate);
                        newDateTime.setHours(location.dateTime.getHours());
                        newDateTime.setMinutes(location.dateTime.getMinutes());
                        updateLocation(location.id, 'dateTime', newDateTime);
                      }
                    }}
                  />
                )}

                {showLocationTimePicker === location.id && (
                  <DateTimePicker
                    value={location.dateTime}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                      setShowLocationTimePicker(null);
                      if (selectedTime) {
                        // Preserve the current date when changing time
                        const newDateTime = new Date(location.dateTime);
                        newDateTime.setHours(selectedTime.getHours());
                        newDateTime.setMinutes(selectedTime.getMinutes());
                        updateLocation(location.id, 'dateTime', newDateTime);
                      }
                    }}
                  />
                )}
              </View>
            ))}
            <Button title="Add Location" onPress={addLocation} variant="outline" />
          </View>

          {/* Companions */}
          <View className="mb-6">
            <ThemedText className="mb-3 text-lg font-bold">People You're With</ThemedText>
            {formData.companions.map((companion, index) => (
              <View
                key={companion.id}
                className="mb-3 rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-800">
                <View className="mb-2 flex-row items-center justify-between">
                  <ThemedText className="font-semibold">Person {index + 1}</ThemedText>
                  <Button
                    title="Remove"
                    onPress={() => removeCompanion(companion.id)}
                    variant="outline"
                    size="small"
                  />
                </View>
                <TextInput
                  value={companion.name}
                  onChangeText={(text) => updateCompanion(companion.id, 'name', text)}
                  placeholder="Name"
                  className="mb-2 rounded border border-gray-200 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput
                  value={companion.contact}
                  onChangeText={(text) => updateCompanion(companion.id, 'contact', text)}
                  placeholder="Phone, email, or social media handle"
                  className="rounded border border-gray-200 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            ))}
            <Button title="Add Person" onPress={addCompanion} variant="outline" />
          </View>

          {/* Submit Buttons */}
          <View className="mb-8 flex-row gap-3">
            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="outline"
              className="flex-1"
            />
            <Button
              title={isEditing ? 'Update Check-in' : 'Create Check-in'}
              onPress={handleSubmit}
              className="flex-1"
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default CreateCheckInScreen;
