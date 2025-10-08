import React, { useState, useEffect, useMemo } from 'react';
import { View, TextInput, ScrollView, Alert, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Icon from '@/components/Icon';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Header from '@/components/Header';
import { Chip } from '@/components/Chip';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useBackend } from '@/lib/contexts/BackendContext';
import { NotificationService } from '@/lib/notifications';

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
  type: 'email' | 'sms' | 'both';
}

interface Location {
  id: number;
  name: string; // User-friendly name for the location
  address?: string; // Optional address description
  latitude?: number; // Optional latitude
  longitude?: number; // Optional longitude
  dateTime: Date;
}

interface Companion {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  socialMedia?: string;
}

interface FormData {
  title: string;
  type: string;
  checkInCode: string;
  checkInDateTime: Date;
  selectedContacts: SelectedContact[];
  customContacts: CustomContact[];
  locations: Location[];
  companions: Companion[];
}

// Mock data - should come from contacts store/context
// (Now using availableContacts from component state)

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
    checkInCode: '1234',
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
    checkInCode: '5678',
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
  const editingId = id as string; // Keep as string to handle both numeric and string IDs
  const { createCheckIn, updateCheckIn, isLoadingCheckIns, userContacts, userCheckIns } =
    useBackend();

  // Memoize example contacts since they're static
  const exampleContacts: Contact[] = useMemo(
    () => [
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
        type: 'both',
      },
      { id: 2, name: 'Mike Chen', email: 'mike.chen@gmail.com', phone: '', type: 'email' },
      { id: 3, name: 'Mom', email: '', phone: '+1 (555) 987-6543', type: 'sms' },
    ],
    []
  );

  // Memoize user contacts formatting to prevent infinite loops
  const userContactsFormatted: Contact[] = useMemo(() => {
    return userContacts.map((contact) => ({
      id: parseInt(contact.id) + 1000, // Offset to avoid ID conflicts
      name: `${contact.firstName} ${contact.lastName}`.trim() || contact.firstName,
      email: contact.email || '',
      phone: contact.phoneNumber || '',
      type:
        contact.notificationMethods.includes('email') && contact.notificationMethods.includes('sms')
          ? 'both'
          : contact.notificationMethods.includes('email')
            ? 'email'
            : 'sms',
    }));
  }, [userContacts]);

  // Memoize available contacts to prevent infinite loops
  const availableContacts = useMemo(() => {
    return [...exampleContacts, ...userContactsFormatted];
  }, [userContactsFormatted]);

  // Memoize initial form data to prevent unnecessary re-renders
  const initialFormData = useMemo(
    () => ({
      title: '',
      type: '',
      checkInCode: Math.floor(1000 + Math.random() * 9000).toString(), // Generate random 4-digit code
      checkInDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
      selectedContacts: [],
      customContacts: [],
      locations: [{ id: 1, name: '', address: '', dateTime: new Date() }],
      companions: [{ id: 1, name: '', email: '', phone: '', socialMedia: '' }],
    }),
    []
  );

  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Load existing check-in data when editing
  useEffect(() => {
    if (isEditing && editingId) {
      let existingCheckIn = null;

      // First try to find in mock data (for examples) using numeric conversion
      const numericId = parseInt(editingId);
      if (!isNaN(numericId)) {
        existingCheckIn = mockCheckIns.find((c) => c.id === numericId);
      }

      // If not found in mock data, look in user check-ins using string ID
      if (!existingCheckIn && userCheckIns.length > 0) {
        const userCheckIn = userCheckIns.find((c) => c.id === editingId);
        if (userCheckIn) {
          // Convert backend check-in to form format
          // Map backend contact IDs to available contacts - recalculate here to avoid dependency issues
          const currentUserContactsFormatted: Contact[] = userContacts.map((contact) => ({
            id: parseInt(contact.id) + 1000, // Offset to avoid ID conflicts
            name: `${contact.firstName} ${contact.lastName}`.trim() || contact.firstName,
            email: contact.email || '',
            phone: contact.phoneNumber || '',
            type:
              contact.notificationMethods.includes('email') &&
              contact.notificationMethods.includes('sms')
                ? 'both'
                : contact.notificationMethods.includes('email')
                  ? 'email'
                  : 'sms',
          }));

          const currentAvailableContacts = [...exampleContacts, ...currentUserContactsFormatted];

          const selectedContactsFromBackend = userCheckIn.contacts
            ? (userCheckIn.contacts
                .map((contactId) => {
                  // First check if it's an example contact (numeric ID < 1000)
                  const exampleContact = currentAvailableContacts.find(
                    (c) => c.id < 1000 && c.id.toString() === contactId
                  );
                  if (exampleContact) {
                    return {
                      ...exampleContact,
                      notificationType: exampleContact.type,
                    } as SelectedContact;
                  }

                  // Then check if it's a user contact (need to find the offset version)
                  const userContact = userContacts.find((uc) => uc.id === contactId);
                  if (userContact) {
                    const displayContact = currentAvailableContacts.find(
                      (c) => c.id === parseInt(userContact.id) + 1000
                    );
                    if (displayContact) {
                      return {
                        ...displayContact,
                        notificationType: displayContact.type,
                      } as SelectedContact;
                    }
                  }

                  return null;
                })
                .filter(Boolean) as SelectedContact[])
            : [];

          existingCheckIn = {
            title: userCheckIn.title || '',
            type: userCheckIn.type || '',
            checkInDateTime: new Date(userCheckIn.scheduledTime),
            selectedContacts: selectedContactsFromBackend,
            customContacts: [],
            locations: userCheckIn.location
              ? [
                  {
                    id: 1,
                    name: 'Check-in Location',
                    address: `Lat: ${userCheckIn.location.latitude}, Lng: ${userCheckIn.location.longitude}`,
                    latitude: userCheckIn.location.latitude,
                    longitude: userCheckIn.location.longitude,
                    dateTime: new Date(userCheckIn.scheduledTime),
                  },
                ]
              : [{ id: 1, name: '', address: '', dateTime: new Date() }],
            companions:
              userCheckIn.companions && userCheckIn.companions.length > 0
                ? userCheckIn.companions.map((companion, index) => {
                    // Type cast for backward compatibility
                    const dbCompanion = companion as any;
                    return {
                      id: index + 1,
                      name: dbCompanion.name || '',
                      email:
                        dbCompanion.email ||
                        (dbCompanion.contact && dbCompanion.contact.includes('@')
                          ? dbCompanion.contact
                          : '') ||
                        '',
                      phone:
                        dbCompanion.phone ||
                        (dbCompanion.contact && !dbCompanion.contact.includes('@')
                          ? dbCompanion.contact
                          : '') ||
                        '',
                      socialMedia: dbCompanion.socialMedia || '',
                    };
                  })
                : [{ id: 1, name: '', email: '', phone: '', socialMedia: '' }],
          };
        }
      }

      if (existingCheckIn) {
        setFormData({
          title: existingCheckIn.title,
          type: existingCheckIn.type,
          checkInCode:
            existingCheckIn.checkInCode || Math.floor(1000 + Math.random() * 9000).toString(), // Use existing code or generate new one
          checkInDateTime: existingCheckIn.checkInDateTime,
          selectedContacts: existingCheckIn.selectedContacts,
          customContacts: existingCheckIn.customContacts,
          locations: existingCheckIn.locations,
          companions: existingCheckIn.companions,
        });
      }
    }
  }, [isEditing, editingId, userCheckIns, userContacts]); // Now safe dependencies

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showLocationDatePicker, setShowLocationDatePicker] = useState<number | null>(null);
  const [showLocationTimePicker, setShowLocationTimePicker] = useState<number | null>(null);
  const [newCustomContact, setNewCustomContact] = useState<{
    name: string;
    email: string;
    phone: string;
    type: 'email' | 'sms' | 'both';
  }>({
    name: '',
    email: '',
    phone: '',
    type: 'both',
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

  const updateCustomContactField = (field: 'name' | 'email' | 'phone', value: string) => {
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

    if (!newCustomContact.name.trim()) {
      Alert.alert('Error', 'Please enter a name for the contact');
      return;
    }

    // Validate based on contact type
    if (newCustomContact.type === 'email' && !newCustomContact.email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (newCustomContact.type === 'sms' && !newCustomContact.phone.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    if (
      newCustomContact.type === 'both' &&
      (!newCustomContact.email.trim() || !newCustomContact.phone.trim())
    ) {
      Alert.alert('Error', 'Please enter both email and phone number');
      return;
    }

    if (emailError || phoneError) {
      Alert.alert('Error', 'Please fix the validation errors before adding the contact');
      return;
    }

    const contact: CustomContact = {
      id: Date.now(),
      ...newCustomContact,
      name: newCustomContact.name || newCustomContact.email || newCustomContact.phone,
    };

    setFormData((prev) => ({
      ...prev,
      customContacts: [...prev.customContacts, contact],
    }));

    setNewCustomContact({ name: '', email: '', phone: '', type: 'email' });
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
      name: '',
      address: '',
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
    const newCompanion: Companion = {
      id: Date.now(),
      name: '',
      email: '',
      phone: '',
      socialMedia: '',
    };
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
    if (!formData.checkInCode || formData.checkInCode.length !== 4) {
      Alert.alert('Error', 'Please enter a 4-digit check-in code');
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // No longer create custom contacts as permanent contacts
      // They will be stored directly in the check-in data

      // Map display contact IDs back to backend contact IDs (only for existing user contacts)
      const selectedContactIds = formData.selectedContacts
        .map((selectedContact) => {
          console.log('Processing selectedContact:', selectedContact);
          // If the ID is > 1000, it's a user contact with offset
          if (selectedContact.id > 1000) {
            // Find the original contact in userContacts and return its original ID
            const originalUserContact = userContacts.find(
              (uc) => parseInt(uc.id) + 1000 === selectedContact.id
            );
            const result = originalUserContact ? originalUserContact.id : null;
            console.log('User contact mapping result:', result);
            return result;
          } else {
            // It's an example contact - skip these as they shouldn't be saved to DB
            console.log('Skipping example contact with ID:', selectedContact.id);
            return null;
          }
        })
        .filter((id) => id !== null && id !== undefined && id !== '') as string[]; // More explicit filtering

      // Custom contacts will be stored as customContacts in the check-in, not as permanent contacts
      const customContactsForCheckIn = formData.customContacts.map((customContact) => ({
        name: customContact.name,
        email: customContact.email,
        phone: customContact.phone,
        type: customContact.type,
      }));

      console.log('Form data before submission:', {
        selectedContacts: formData.selectedContacts,
        customContacts: formData.customContacts,
        selectedContactIds,
        customContactsForCheckIn,
        companions: formData.companions,
      });

      console.log('FINAL CONTACT IDS BEING SENT TO BACKEND:', selectedContactIds);
      console.log('CUSTOM CONTACTS BEING SENT TO BACKEND:', customContactsForCheckIn);

      if (isEditing) {
        // Cancel existing alarms before updating
        // TODO: In a production app, we would store the specific notificationId with each check-in
        // For now, we'll cancel all check-in alarms and reschedule them
        console.log('Cancelling existing alarms before updating check-in...');
        await NotificationService.cancelAllCheckInAlarms();

        // Prepare check-in data for backend
        const response = await updateCheckIn(editingId, {
          title: formData.title,
          description: `${formData.type} check-in`,
          type: formData.type as any,
          checkInCode: formData.checkInCode,
          scheduledTime: formData.checkInDateTime.toISOString(),
          intervalMinutes: 60, // Default 1 hour check-in window
          contacts: selectedContactIds,
          customContacts: customContactsForCheckIn,
          companions: formData.companions
            .filter(
              (c) =>
                c.name.trim() !== '' &&
                (c.email?.trim() || c.phone?.trim() || c.socialMedia?.trim())
            )
            .map((c) => ({
              name: c.name,
              email: c.email || '',
              phone: c.phone || '',
              socialMedia: c.socialMedia || '',
            })),
          // Add location if available from first location that has name or address
          location:
            formData.locations[0]?.name?.trim() || formData.locations[0]?.address?.trim()
              ? {
                  latitude: 0,
                  longitude: 0,
                  name: formData.locations[0].name || '',
                  address: formData.locations[0].address || '',
                }
              : undefined,
        });

        if (response.success) {
          // Schedule new alarm for the updated check-in
          const notificationId = await NotificationService.scheduleCheckInAlarm(
            editingId,
            formData.checkInDateTime,
            formData.title
          );

          if (notificationId) {
            console.log('Check-in alarm rescheduled after update:', notificationId);
          }

          // Re-schedule alarms for all other active check-ins
          try {
            console.log('Re-scheduling alarms for other active check-ins...');
            await NotificationService.rescheduleActiveCheckIns(userCheckIns);
          } catch (error) {
            console.error('Error re-scheduling other check-ins:', error);
            // Don't show error to user as the main update was successful
          }

          Alert.alert('Success', 'Check-in updated and alarm rescheduled successfully!', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        } else {
          Alert.alert('Error', response.error || 'Failed to update check-in');
        }
      } else {
        // Prepare check-in data for backend
        const response = await createCheckIn({
          title: formData.title,
          description: `${formData.type} check-in`,
          type: formData.type as any,
          checkInCode: formData.checkInCode,
          scheduledTime: formData.checkInDateTime.toISOString(),
          intervalMinutes: 60, // Default 1 hour check-in window
          contacts: selectedContactIds,
          customContacts: customContactsForCheckIn,
          companions: formData.companions
            .filter(
              (c) =>
                c.name.trim() !== '' &&
                (c.email?.trim() || c.phone?.trim() || c.socialMedia?.trim())
            )
            .map((c) => ({
              name: c.name,
              email: c.email || '',
              phone: c.phone || '',
              socialMedia: c.socialMedia || '',
            })),
          // Add location if available from first location that has name or address
          location:
            formData.locations[0]?.name?.trim() || formData.locations[0]?.address?.trim()
              ? {
                  latitude: 0,
                  longitude: 0,
                  name: formData.locations[0].name || '',
                  address: formData.locations[0].address || '',
                }
              : undefined,
        });

        if (response.success && response.data) {
          // Schedule the check-in alarm
          const notificationId = await NotificationService.scheduleCheckInAlarm(
            response.data.id,
            formData.checkInDateTime,
            formData.title
          );

          if (notificationId) {
            console.log('Check-in alarm scheduled:', notificationId);

            // Test notification disabled for now to avoid confusion
            // TODO: Add a dedicated test button for debugging notifications
            // if (__DEV__) {
            //   await NotificationService.scheduleTestNotification(response.data.id, formData.title);
            //   console.log('🧪 Test notification scheduled for 5 seconds');

            //   // List all scheduled notifications for debugging
            //   setTimeout(() => {
            //     NotificationService.listScheduledNotifications();
            //   }, 1000);
            // }
          }

          Alert.alert('Success', 'Check-in created successfully!', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        } else {
          Alert.alert('Error', response.error || 'Failed to create check-in');
        }
      }
    } catch (error) {
      console.error('Error with check-in operation:', error);
      Alert.alert('Error', 'An unexpected error occurred');
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

          {/* Check-in Code */}
          <View className="mb-6">
            <View className="mb-2 flex-row items-center justify-between">
              <ThemedText className="text-lg font-bold">Check-in Code</ThemedText>
              <Pressable
                onPress={() => {
                  const newCode = Math.floor(1000 + Math.random() * 9000).toString();
                  setFormData((prev) => ({ ...prev, checkInCode: newCode }));
                }}
                className="flex-row items-center rounded-lg bg-blue-100 px-3 py-1 dark:bg-blue-900/20">
                <Icon
                  name="RefreshCw"
                  size={16}
                  className="mr-1 text-blue-600 dark:text-blue-400"
                />
                <ThemedText className="text-sm text-blue-600 dark:text-blue-400">
                  Generate New
                </ThemedText>
              </Pressable>
            </View>
            <View className="flex-row items-center space-x-3">
              <TextInput
                value={formData.checkInCode}
                onChangeText={(text) => {
                  // Only allow 4 digits
                  const numericText = text.replace(/[^0-9]/g, '').slice(0, 4);
                  setFormData((prev) => ({ ...prev, checkInCode: numericText }));
                }}
                placeholder="0000"
                keyboardType="numeric"
                maxLength={4}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-2xl font-bold tracking-widest dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholderTextColor="#9CA3AF"
              />
              <View className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                <Icon name="Lock" size={20} className="text-gray-500" />
              </View>
            </View>
            <ThemedText className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              You'll enter this 4-digit code to confirm your safety when prompted
            </ThemedText>
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
            {availableContacts
              .filter((contact) => contact.id > 1000) // Only show user contacts, not example contacts
              .map((contact) => {
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
                    value={newCustomContact.name}
                    onChangeText={(text) => updateCustomContactField('name', text)}
                    placeholder="Contact name"
                    className="rounded border border-gray-200 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                {(newCustomContact.type === 'email' || newCustomContact.type === 'both') && (
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
                )}
                {(newCustomContact.type === 'sms' || newCustomContact.type === 'both') && (
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
                )}
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
                    <Chip
                      label="Both"
                      onPress={() => setNewCustomContact((prev) => ({ ...prev, type: 'both' }))}
                      className={newCustomContact.type === 'both' ? 'bg-blue-500' : 'bg-gray-200'}
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
                    <View className="flex-1">
                      <ThemedText className="font-semibold">{contact.name}</ThemedText>
                      {contact.email && (
                        <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                          📧 {contact.email}
                        </ThemedText>
                      )}
                      {contact.phone && (
                        <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                          📱 {contact.phone}
                        </ThemedText>
                      )}
                      <ThemedText className="text-xs text-gray-500 dark:text-gray-500">
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
                  value={location.name}
                  onChangeText={(text) => updateLocation(location.id, 'name', text)}
                  placeholder="Enter location name/title"
                  className="mb-3 rounded border border-gray-200 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput
                  value={location.address || ''}
                  onChangeText={(text) => updateLocation(location.id, 'address', text)}
                  placeholder="Enter address (optional)"
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
                  value={companion.email || ''}
                  onChangeText={(text) => updateCompanion(companion.id, 'email', text)}
                  placeholder="Email address (optional)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="mb-2 rounded border border-gray-200 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput
                  value={companion.phone || ''}
                  onChangeText={(text) => updateCompanion(companion.id, 'phone', text)}
                  placeholder="Phone number (optional)"
                  keyboardType="phone-pad"
                  className="mb-2 rounded border border-gray-200 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput
                  value={companion.socialMedia || ''}
                  onChangeText={(text) => updateCompanion(companion.id, 'socialMedia', text)}
                  placeholder="Social media handle/link (optional)"
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
              title={
                isLoadingCheckIns
                  ? 'Creating...'
                  : isEditing
                    ? 'Update Check-in'
                    : 'Create Check-in'
              }
              onPress={handleSubmit}
              className="flex-1"
              disabled={isLoadingCheckIns}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default CreateCheckInScreen;
