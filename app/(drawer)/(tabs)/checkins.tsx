import React from 'react';
import { View, Pressable } from 'react-native';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Section from '@/components/layout/Section';
import { Link, router } from 'expo-router';
import ThemeScroller from '@/components/ThemeScroller';
import { Placeholder } from '@/components/Placeholder';
import Header from '@/components/Header';
import Icon from '@/components/Icon';

// Mock data for check-ins
const checkIns = [
  {
    id: 1,
    title: 'Hiking Trip - Blue Ridge',
    status: 'completed',
    checkInTime: '6:00 PM',
    date: 'Today',
    type: 'hiking',
  },
  {
    id: 2,
    title: 'First Date - Downtown',
    status: 'completed',
    checkInTime: '10:00 PM',
    date: 'Yesterday',
    type: 'date',
  },
  {
    id: 3,
    title: 'Road Trip - Coast Highway',
    status: 'scheduled',
    checkInTime: '8:00 PM',
    date: 'Tomorrow',
    type: 'road-trip',
  },
  {
    id: 4,
    title: 'Solo Camping - Mountain Lake',
    status: 'completed',
    checkInTime: '8:00 PM',
    date: '3 days ago',
    type: 'hiking',
  },
  {
    id: 5,
    title: 'Evening Run - City Park',
    status: 'active',
    checkInTime: '7:30 PM',
    date: 'Today',
    type: 'other',
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
    default:
      return 'Clock';
  }
};

const CheckInsScreen = () => {
  return (
    <>
      <Header />
      <ThemeScroller>
        <Section
          titleSize="3xl"
          className="mt-16 pb-10"
          title="Check Ins"
          subtitle={`${checkIns.length} check-ins scheduled`}
        />

        {checkIns.length > 0 ? (
          <>
            {checkIns.map((checkIn) => (
              <View
                key={checkIn.id}
                className="mx-4 mb-4 rounded-lg border border-light-secondary bg-white p-4 dark:border-dark-secondary dark:bg-neutral-900">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="mb-2 flex-row items-center">
                      <Icon name={getTypeIcon(checkIn.type)} size={16} className="mr-2" />
                      <ThemedText className="text-lg font-bold">{checkIn.title}</ThemedText>
                    </View>

                    <View className="mb-2 flex-row items-center">
                      <Icon name="Clock" size={14} className="mr-1" />
                      <ThemedText className="text-light-subtext dark:text-dark-subtext">
                        {checkIn.date} at {checkIn.checkInTime}
                      </ThemedText>
                    </View>

                    <View
                      className={`inline-block rounded-full px-2 py-1 ${getStatusColor(checkIn.status)}`}>
                      <ThemedText className="text-xs font-medium capitalize">
                        {checkIn.status}
                      </ThemedText>
                    </View>
                  </View>

                  <View className="ml-4">
                    <Button
                      title="View"
                      variant="outline"
                      size="small"
                      onPress={() => {
                        console.log('Navigating to checkin detail for ID:', checkIn.id);
                        router.push(`/screens/checkin-detail?id=${checkIn.id}`);
                      }}
                    />
                  </View>
                </View>
              </View>
            ))}

            <View className="mx-4 mt-6">
              <Button
                title="Create New Check-In"
                onPress={() => router.push('/screens/create-checkin')}
                className="w-full"
              />
            </View>
          </>
        ) : (
          <Placeholder
            title="No check-ins scheduled"
            subtitle="Create your first check-in to get started"
          />
        )}
      </ThemeScroller>
    </>
  );
};

export default CheckInsScreen;
