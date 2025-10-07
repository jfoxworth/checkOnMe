import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Header from '@/components/Header';
import Icon from '@/components/Icon';
import { Chip } from '@/components/Chip';
import { useBackend } from '@/lib/contexts/BackendContext';

// Types
interface SelectedContact {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  notificationType: 'email' | 'sms' | 'both';
  isCustom?: boolean; // Flag to indicate if this is a custom contact specific to this check-in
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
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  dateTime: Date;
}

interface Companion {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  socialMedia?: string;
  contact?: string; // For backward compatibility
}

interface Resolution {
  type: 'acknowledged' | 'emergency_action';
  timestamp: Date;
  action?: {
    method: 'email' | 'phone' | 'sms' | 'in_person';
    contact: string;
    details: string;
  };
  notes?: string;
}

interface CheckIn {
  id: number;
  title: string;
  status: 'active' | 'completed' | 'scheduled';
  checkInDateTime: Date;
  type: string;
  selectedContacts: SelectedContact[];
  customContacts: CustomContact[];
  locations: Location[];
  companions: Companion[];
  resolution?: Resolution;
}

// Mock data - in a real app, this would come from your store/database
const mockCheckIns: CheckIn[] = [
  {
    id: 1,
    title: 'Hiking Trip - Blue Ridge',
    status: 'completed',
    checkInDateTime: new Date('2024-10-01T18:00:00'),
    type: 'hiking',
    selectedContacts: [
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
        notificationType: 'both',
      },
      {
        id: 3,
        name: 'Mom',
        phone: '+1 (555) 987-6543',
        notificationType: 'sms',
      },
    ],
    customContacts: [],
    locations: [
      {
        id: 1,
        name: 'Blue Ridge Trail Head',
        address: '123 Mountain Trail Road, Blue Ridge, NC',
        dateTime: new Date('2024-10-01T08:00:00'),
      },
      {
        id: 2,
        name: 'Summit Camp',
        address: 'Blue Ridge Summit, NC',
        latitude: 35.8875,
        longitude: -82.3248,
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
    resolution: {
      type: 'emergency_action',
      timestamp: new Date('2024-10-01T18:30:00'),
      action: {
        method: 'sms',
        contact: 'Mom (+1 555-987-6543)',
        details:
          'Sent SMS to emergency contact after 30-minute delay. User responded via text that they were delayed but safe.',
      },
      notes: 'User was delayed due to weather but confirmed safe. Check-in completed late.',
    },
  },
  {
    id: 2,
    title: 'First Date - Downtown',
    status: 'completed',
    checkInDateTime: new Date('2024-09-30T22:00:00'),
    type: 'date',
    selectedContacts: [
      {
        id: 2,
        name: 'Mike Chen',
        email: 'mike.chen@gmail.com',
        notificationType: 'email',
      },
    ],
    customContacts: [],
    locations: [
      {
        id: 1,
        name: 'Downtown Restaurant District',
        address: '456 Main Street, Charlotte, NC',
        latitude: 35.2271,
        longitude: -80.8431,
        dateTime: new Date('2024-09-30T19:00:00'),
      },
    ],
    companions: [],
    resolution: {
      type: 'acknowledged',
      timestamp: new Date('2024-09-30T22:15:00'),
      notes: 'User confirmed safe arrival at home via app',
    },
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
        notificationType: 'both',
      },
    ],
    customContacts: [
      {
        id: 1,
        name: 'roadtrip@example.com',
        email: 'roadtrip@example.com',
        phone: '',
        type: 'email',
      },
    ],
    locations: [
      {
        id: 1,
        name: 'Starting Point - Home',
        address: '789 Elm Street, Charlotte, NC',
        dateTime: new Date('2024-10-02T09:00:00'),
      },
      {
        id: 2,
        name: 'Lunch Stop - Coastal Town',
        address: 'Wilmington, NC',
        latitude: 34.2104,
        longitude: -77.8868,
        dateTime: new Date('2024-10-02T13:00:00'),
      },
      {
        id: 3,
        name: 'Hotel - Seaside Resort',
        address: 'Outer Banks, NC',
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
  {
    id: 4,
    title: 'Solo Camping - Mountain Lake',
    status: 'completed',
    checkInDateTime: new Date('2024-09-28T20:00:00'),
    type: 'hiking',
    selectedContacts: [
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
        notificationType: 'both',
      },
    ],
    customContacts: [],
    locations: [
      {
        id: 1,
        name: 'Mountain Lake Campground',
        address: 'Blue Ridge Parkway, Asheville, NC',
        latitude: 35.6009,
        longitude: -82.554,
        dateTime: new Date('2024-09-28T15:00:00'),
      },
    ],
    companions: [],
    resolution: {
      type: 'emergency_action',
      timestamp: new Date('2024-09-28T20:45:00'),
      action: {
        method: 'phone',
        contact: 'Sarah Johnson (+1 555-123-4567)',
        details:
          'Called emergency contact after no response. User was found safe but phone battery died.',
      },
      notes: 'Emergency contact confirmed user was safe. Phone battery had died during hike.',
    },
  },
  {
    id: 5,
    title: 'Evening Run - City Park',
    status: 'active',
    checkInDateTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    type: 'other',
    selectedContacts: [
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
        notificationType: 'both',
      },
    ],
    customContacts: [],
    locations: [
      {
        id: 1,
        name: 'City Park Main Trail',
        address: 'Charlotte City Park, Charlotte, NC',
        dateTime: new Date(Date.now() - 30 * 60 * 1000), // Started 30 minutes ago
      },
    ],
    companions: [],
    // No resolution yet - this is an active, ongoing check-in
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'hiking':
      return 'Mountain';
    case 'date':
      return 'Heart';
    case 'road-trip':
      return 'Car';
    case 'fishing':
      return 'Fish';
    case 'work':
      return 'Briefcase';
    default:
      return 'Clock';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'hiking':
      return 'Hiking';
    case 'date':
      return 'Date';
    case 'road-trip':
      return 'Road Trip';
    case 'fishing':
      return 'Fishing';
    case 'work':
      return 'Work';
    default:
      return 'Other';
  }
};

const CheckInDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const { userCheckIns, userContacts, isLoadingCheckIns, acknowledgeCheckIn } = useBackend();
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [loading, setLoading] = useState(true);
  const [originalId, setOriginalId] = useState<string>(''); // Store original ID for editing

  useEffect(() => {
    if (id) {
      const checkInIdStr = id as string;
      const checkInIdNum = parseInt(checkInIdStr);

      setOriginalId(checkInIdStr); // Store original ID

      // First try to find in mock data (for examples) using numeric ID
      let foundCheckIn = mockCheckIns.find((c) => c.id === checkInIdNum);

      // If not found in mock data, look in user check-ins using string ID
      if (!foundCheckIn && userCheckIns.length > 0) {
        const userCheckIn = userCheckIns.find((c) => c.id === checkInIdStr);
        if (userCheckIn) {
          // Convert backend check-in to display format
          const mapStatus = (
            backendStatus: typeof userCheckIn.status
          ): 'scheduled' | 'active' | 'completed' => {
            switch (backendStatus) {
              case 'acknowledged':
              case 'escalated':
              case 'missed':
              case 'cancelled':
                return 'completed';
              case 'active':
                return 'active';
              default:
                return 'scheduled';
            }
          };

          // Map contacts from backend to display format
          const selectedContactsForDisplay = userCheckIn.contacts
            ? userCheckIn.contacts.map((contactId) => {
                // Try to find the actual contact details
                const actualContact = userContacts.find((c) => c.id === contactId);
                if (actualContact) {
                  return {
                    id: parseInt(actualContact.id) || Date.now(),
                    name:
                      `${actualContact.firstName} ${actualContact.lastName}`.trim() || 'Contact',
                    email: actualContact.email || '',
                    phone: actualContact.phoneNumber || '',
                    notificationType:
                      actualContact.notificationMethods.includes('email') &&
                      actualContact.notificationMethods.includes('sms')
                        ? ('both' as const)
                        : actualContact.notificationMethods.includes('email')
                          ? ('email' as const)
                          : ('sms' as const),
                    isCustom: false, // This is a permanent contact
                  };
                } else {
                  // Fallback for contacts that aren't found
                  return {
                    id: parseInt(contactId) || Date.now(),
                    name: `Contact (${contactId})`,
                    email: '',
                    phone: '',
                    notificationType: 'both' as const,
                    isCustom: false,
                  };
                }
              })
            : [];

          // Add custom contacts to the display
          const customContactsForDisplay = userCheckIn.customContacts
            ? userCheckIn.customContacts.map((customContact, index) => ({
                id: Date.now() + index, // Generate unique ID for display
                name: customContact.name,
                email: customContact.email || '',
                phone: customContact.phone || '',
                notificationType: customContact.type as 'email' | 'sms' | 'both',
                isCustom: true, // Mark as custom contact
              }))
            : [];

          // Combine permanent and custom contacts
          const allContactsForDisplay = [
            ...selectedContactsForDisplay,
            ...customContactsForDisplay,
          ];

          foundCheckIn = {
            id: parseInt(userCheckIn.id) || Date.now(), // Convert to number for display compatibility
            title: userCheckIn.title || `Check-in (${userCheckIn.type || 'custom'})`,
            status: mapStatus(userCheckIn.status),
            checkInDateTime: new Date(userCheckIn.scheduledTime),
            type: userCheckIn.type || 'other',
            selectedContacts: allContactsForDisplay,
            customContacts: [],
            locations: userCheckIn.location
              ? [
                  {
                    id: 1,
                    name: (userCheckIn.location as any).name || 'Check-in Location',
                    address: (userCheckIn.location as any).address || undefined,
                    latitude: userCheckIn.location.latitude,
                    longitude: userCheckIn.location.longitude,
                    dateTime: new Date(userCheckIn.scheduledTime),
                  },
                ]
              : [],
            companions: userCheckIn.companions
              ? userCheckIn.companions.map((companion, index) => {
                  // Type cast for backward compatibility
                  const dbCompanion = companion as any;
                  return {
                    id: index + 1,
                    name: dbCompanion.name,
                    email:
                      dbCompanion.email ||
                      (dbCompanion.contact && dbCompanion.contact.includes('@')
                        ? dbCompanion.contact
                        : undefined),
                    phone:
                      dbCompanion.phone ||
                      (dbCompanion.contact && !dbCompanion.contact.includes('@')
                        ? dbCompanion.contact
                        : undefined),
                    socialMedia: dbCompanion.socialMedia,
                    contact: dbCompanion.contact, // Keep for backward compatibility
                  };
                })
              : [],
            // Mock resolution data for user check-ins
            resolution:
              userCheckIn.status === 'acknowledged'
                ? {
                    type: 'acknowledged' as const,
                    timestamp: new Date(userCheckIn.acknowledgedAt || userCheckIn.updatedAt),
                    notes: 'User confirmed safety via app',
                  }
                : undefined,
          };
        }
      }

      setCheckIn(foundCheckIn || null);
      setLoading(false);
    }
  }, [id, userCheckIns]);

  if (loading || isLoadingCheckIns) {
    return (
      <>
        <Header />
        <View className="flex-1 items-center justify-center bg-white dark:bg-black">
          <ThemedText>Loading check-in details...</ThemedText>
        </View>
      </>
    );
  }

  if (!checkIn) {
    return (
      <>
        <Header />
        <View className="flex-1 items-center justify-center bg-white p-4 dark:bg-black">
          <Icon name="AlertCircle" size={48} className="mb-4 text-red-500" />
          <ThemedText className="mb-2 text-xl font-bold">Check-in not found</ThemedText>
          <ThemedText className="mb-4 px-4 text-center text-gray-600 dark:text-gray-400">
            The check-in you're looking for could not be found. It may have been deleted or doesn't
            exist.
          </ThemedText>
          <Button title="Go Back" onPress={() => router.back()} variant="outline" />
        </View>
      </>
    );
  }

  const canEdit = checkIn.status === 'scheduled';
  const isPast = checkIn.checkInDateTime < new Date();

  const handleEdit = () => {
    // Navigate to create-checkin with pre-filled data using the original ID
    router.push(`/screens/create-checkin?edit=true&id=${originalId}`);
  };

  const handleMarkComplete = () => {
    Alert.alert('Mark as Complete', 'Are you sure you want to mark this check-in as completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: () => {
          // Here you would update the check-in status
          Alert.alert('Success', 'Check-in marked as completed!');
          router.back();
        },
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Check-in',
      'Are you sure you want to cancel this check-in? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            // Here you would delete or cancel the check-in
            Alert.alert('Cancelled', 'Check-in has been cancelled.');
            router.back();
          },
        },
      ]
    );
  };

  return (
    <>
      <Header />
      <ScrollView className="flex-1 bg-white dark:bg-black">
        <View className="p-4">
          {/* Header */}
          <View className="mb-6">
            <View className="mb-2 flex-row items-center">
              <Icon name={getTypeIcon(checkIn.type)} size={24} className="mr-3" />
              <ThemedText className="flex-1 text-2xl font-bold">{checkIn.title}</ThemedText>
            </View>
            <View className="flex-row items-center justify-between">
              <View className={`rounded-full px-3 py-1 ${getStatusColor(checkIn.status)}`}>
                <ThemedText className="text-sm font-medium capitalize">{checkIn.status}</ThemedText>
              </View>
              <Chip label={getTypeLabel(checkIn.type)} className="bg-gray-200 dark:bg-gray-700" />
            </View>
          </View>

          {/* Check-in Time */}
          <View className="mb-6 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
            <ThemedText className="mb-2 text-lg font-bold">Check-in Time</ThemedText>
            <View className="flex-row items-center">
              <Icon name="Clock" size={16} className="mr-2" />
              <ThemedText className="text-base">
                {checkIn.checkInDateTime.toLocaleDateString()} at{' '}
                {checkIn.checkInDateTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </ThemedText>
            </View>
            {isPast && checkIn.status !== 'completed' && (
              <ThemedText className="mt-2 text-sm text-orange-600 dark:text-orange-400">
                ⚠️ This check-in time has passed
              </ThemedText>
            )}
          </View>

          {/* Check-in Code */}
          <View className="mb-6 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
            <ThemedText className="mb-2 text-lg font-bold">Check-in Code</ThemedText>
            <View className="flex-row items-center">
              <Icon name="Lock" size={16} className="mr-2" />
              <View className="rounded-lg bg-white p-3 dark:bg-gray-700">
                <ThemedText className="text-2xl font-bold tracking-widest">
                  {checkIn.checkInCode || '****'}
                </ThemedText>
              </View>
            </View>
            <ThemedText className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Enter this code when prompted to confirm your safety
            </ThemedText>
          </View>

          {/* Check-in Contacts */}
          <View className="mb-6">
            <ThemedText className="mb-3 text-lg font-bold">Check-in Contacts</ThemedText>

            {/* Selected Contacts */}
            {checkIn.selectedContacts && checkIn.selectedContacts.length > 0
              ? checkIn.selectedContacts.map((contact) => (
                  <View
                    key={contact.id}
                    className={`mb-3 rounded-lg border p-3 ${
                      contact.isCustom
                        ? 'border-orange-300 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/20'
                        : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
                    }`}>
                    <View className="flex-row items-center justify-between">
                      <ThemedText className="font-semibold">{contact.name}</ThemedText>
                      {contact.isCustom && (
                        <Chip label="Check-in Only" className="bg-orange-200 dark:bg-orange-700" />
                      )}
                    </View>
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
                    <View className="mt-2">
                      <Chip
                        label={`Notify via: ${contact.notificationType.toUpperCase()}`}
                        className="bg-blue-100 dark:bg-blue-900/20"
                      />
                    </View>
                  </View>
                ))
              : null}

            {!checkIn.selectedContacts || checkIn.selectedContacts.length === 0 ? (
              <ThemedText className="text-gray-500 dark:text-gray-400">
                No contacts assigned to this check-in
              </ThemedText>
            ) : null}
          </View>

          {/* Locations */}
          <View className="mb-6">
            <ThemedText className="mb-3 text-lg font-bold">Locations & Timeline</ThemedText>
            {checkIn.locations && checkIn.locations.length > 0 ? (
              <>
                {checkIn.locations.map((location, index) => (
                  <View
                    key={location.id}
                    className="mb-3 rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-800">
                    <View className="mb-1 flex-row items-center">
                      <Icon name="MapPin" size={16} className="mr-2" />
                      <ThemedText className="font-semibold">
                        {location.name || 'Location'}
                      </ThemedText>
                    </View>
                    {location.address && (
                      <ThemedText className="mb-2 text-base">{location.address}</ThemedText>
                    )}
                    <View className="flex-row items-center">
                      <Icon name="Clock" size={14} className="mr-1" />
                      <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                        {location.dateTime.toLocaleDateString()} at{' '}
                        {location.dateTime.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <ThemedText className="text-gray-500 dark:text-gray-400">
                No location information available
              </ThemedText>
            )}
          </View>

          {/* Companions */}
          {checkIn.companions.length > 0 && (
            <View className="mb-6">
              <ThemedText className="mb-3 text-lg font-bold">People You're With</ThemedText>
              {checkIn.companions.map((companion, index) => (
                <View
                  key={companion.id}
                  className="mb-3 rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-800">
                  <ThemedText className="font-semibold">{companion.name}</ThemedText>
                  {companion.phone && (
                    <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                      Text: {companion.phone}
                    </ThemedText>
                  )}
                  {companion.email && (
                    <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                      Email: {companion.email}
                    </ThemedText>
                  )}
                  {companion.socialMedia && (
                    <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                      Social Media: {companion.socialMedia}
                    </ThemedText>
                  )}
                  {/* Fallback for backward compatibility */}
                  {companion.contact &&
                    !companion.phone &&
                    !companion.email &&
                    !companion.socialMedia && (
                      <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                        Contact: {companion.contact}
                      </ThemedText>
                    )}
                </View>
              ))}
            </View>
          )}

          {/* Resolution - Only show for completed check-ins or past due */}
          {(checkIn.status === 'completed' || (isPast && checkIn.status !== 'scheduled')) && (
            <View className="mb-6">
              <ThemedText className="mb-3 text-lg font-bold">Resolution</ThemedText>

              {checkIn.resolution ? (
                <View className="rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
                  <View className="mb-3 flex-row items-center">
                    <Icon
                      name={
                        checkIn.resolution.type === 'acknowledged' ? 'CheckCircle' : 'AlertTriangle'
                      }
                      size={20}
                      className="mr-2"
                    />
                    <ThemedText className="text-base font-semibold">
                      {checkIn.resolution.type === 'acknowledged'
                        ? 'User Acknowledged Check-in'
                        : 'Emergency Action Taken'}
                    </ThemedText>
                  </View>

                  <View className="mb-2 flex-row items-center">
                    <Icon name="Clock" size={16} className="mr-2" />
                    <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                      Resolved: {checkIn.resolution.timestamp.toLocaleDateString()} at{' '}
                      {checkIn.resolution.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </ThemedText>
                  </View>

                  {checkIn.resolution.type === 'emergency_action' && checkIn.resolution.action && (
                    <View className="mb-3 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                      <ThemedText className="mb-1 text-sm font-medium">Action Taken:</ThemedText>
                      <ThemedText className="mb-1 text-sm">
                        <ThemedText className="font-medium">Method:</ThemedText>{' '}
                        {checkIn.resolution.action.method.toUpperCase()}
                      </ThemedText>
                      <ThemedText className="mb-1 text-sm">
                        <ThemedText className="font-medium">Contact:</ThemedText>{' '}
                        {checkIn.resolution.action.contact}
                      </ThemedText>
                      <ThemedText className="text-sm">
                        <ThemedText className="font-medium">Details:</ThemedText>{' '}
                        {checkIn.resolution.action.details}
                      </ThemedText>
                    </View>
                  )}

                  {checkIn.resolution.notes && (
                    <View className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                      <ThemedText className="mb-1 text-sm font-medium">Notes:</ThemedText>
                      <ThemedText className="text-sm">{checkIn.resolution.notes}</ThemedText>
                    </View>
                  )}
                </View>
              ) : (
                <View className="rounded-lg border border-orange-300 bg-orange-50 p-4 dark:border-orange-600 dark:bg-orange-900/20">
                  <View className="flex-row items-center">
                    <Icon name="AlertTriangle" size={20} className="mr-2" />
                    <ThemedText className="font-semibold text-orange-800 dark:text-orange-300">
                      No Response Received
                    </ThemedText>
                  </View>
                  <ThemedText className="mt-2 text-sm text-orange-700 dark:text-orange-400">
                    This check-in time has passed but no confirmation was received from the user.
                  </ThemedText>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View className="mb-8 gap-3">
            {canEdit && <Button title="Edit Check-in" onPress={handleEdit} />}

            {checkIn.status === 'active' && (
              <Button title="Mark as Complete" onPress={handleMarkComplete} variant="outline" />
            )}

            {(checkIn.status === 'scheduled' || checkIn.status === 'active') && (
              <Button
                title="Cancel Check-in"
                onPress={handleCancel}
                variant="outline"
                className="border-red-500 dark:border-red-400"
              />
            )}

            <Button title="Back to Check-ins" onPress={() => router.back()} variant="outline" />
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default CheckInDetailScreen;
