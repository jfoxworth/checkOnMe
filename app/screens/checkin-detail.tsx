import React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Header from '@/components/Header';
import Icon from '@/components/Icon';
import { Chip } from '@/components/Chip';

// Types
interface SelectedContact {
  id: number;
  name: string;
  email?: string;
  phone?: string;
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
        location: 'Downtown Restaurant District',
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
        location: 'Mountain Lake Campground',
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
        location: 'City Park Main Trail',
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
  const checkInId = parseInt(id as string);
  const checkIn = mockCheckIns.find((c) => c.id === checkInId);

  if (!checkIn) {
    return (
      <>
        <Header />
        <View className="flex-1 items-center justify-center bg-white p-4 dark:bg-black">
          <ThemedText className="text-lg font-bold">Check-in not found</ThemedText>
          <Button title="Go Back" onPress={() => router.back()} className="mt-4" />
        </View>
      </>
    );
  }

  const canEdit = checkIn.status === 'scheduled';
  const isPast = checkIn.checkInDateTime < new Date();

  const handleEdit = () => {
    // Navigate to create-checkin with pre-filled data
    router.push(`/screens/create-checkin?edit=true&id=${checkIn.id}`);
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

          {/* Check-in Contacts */}
          <View className="mb-6">
            <ThemedText className="mb-3 text-lg font-bold">Check-in Contacts</ThemedText>

            {/* Selected Contacts */}
            {checkIn.selectedContacts.map((contact) => (
              <View
                key={contact.id}
                className="mb-3 rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-800">
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
                <View className="mt-2">
                  <Chip
                    label={`Notify via: ${contact.notificationType.toUpperCase()}`}
                    className="bg-blue-100 dark:bg-blue-900/20"
                  />
                </View>
              </View>
            ))}

            {/* Custom Contacts */}
            {checkIn.customContacts.map((contact) => (
              <View
                key={contact.id}
                className="mb-3 rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                <ThemedText className="font-semibold">{contact.name}</ThemedText>
                <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                  Type: {contact.type.toUpperCase()}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Locations */}
          <View className="mb-6">
            <ThemedText className="mb-3 text-lg font-bold">Locations & Timeline</ThemedText>
            {checkIn.locations.map((location, index) => (
              <View
                key={location.id}
                className="mb-3 rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-800">
                <View className="mb-1 flex-row items-center">
                  <Icon name="MapPin" size={16} className="mr-2" />
                  <ThemedText className="font-semibold">Location {index + 1}</ThemedText>
                </View>
                <ThemedText className="mb-2 text-base">{location.location}</ThemedText>
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
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                    {companion.contact}
                  </ThemedText>
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
