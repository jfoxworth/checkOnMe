import { View } from 'react-native';
import React, { useState } from 'react';
import Header from '@/components/Header';
import ThemedScroller from '@/components/ThemeScroller';
import { Chip } from '@/components/Chip';
import SkeletonLoader from '@/components/SkeletonLoader';
import List from '@/components/layout/List';
import ListItem from '@/components/layout/ListItem';
import { Link } from 'expo-router';
import ThemedText from '@/components/ThemedText';
import TabScreenWrapper from '@/components/TabScreenWrapper';
import Icon, { IconName } from '@/components/Icon';

type NotificationType = 'checkin' | 'alert' | 'success' | 'reminder' | 'all';

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: IconName;
}

export default function NotificationsScreen() {
  const [selectedType, setSelectedType] = useState<NotificationType>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading data
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const notifications: Notification[] = [
    {
      id: 1,
      type: 'checkin',
      title: 'Check-in Reminder',
      message: 'Your hiking trip check-in is due in 30 minutes',
      time: '2 min ago',
      read: false,
      icon: 'Clock',
    },
    {
      id: 2,
      type: 'alert',
      title: 'Emergency Alert Sent',
      message: 'Emergency contacts notified for missed check-in',
      time: '1 hour ago',
      read: true,
      icon: 'AlertTriangle',
    },
    {
      id: 3,
      type: 'success',
      title: 'Check-in Completed',
      message: 'Your date night check-in was successful',
      time: '2 hours ago',
      read: false,
      icon: 'CheckCircle',
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Safety Tip',
      message: 'Remember to share your location for road trips',
      time: '1 day ago',
      read: true,
      icon: 'MapPin',
    },
    {
      id: 5,
      type: 'checkin',
      title: 'Upcoming Check-in',
      message: 'Road trip check-in scheduled for tomorrow',
      time: '2 days ago',
      read: false,
      icon: 'Calendar',
    },
    {
      id: 6,
      type: 'success',
      title: 'Check-in Successful',
      message: 'Your solo hiking check-in was completed',
      time: '3 days ago',
      read: true,
      icon: 'CheckCircle',
    },
    {
      id: 7,
      type: 'alert',
      title: 'Contact Updated',
      message: 'Emergency contact information updated',
      time: '4 days ago',
      read: false,
      icon: 'User',
    },
    {
      id: 8,
      type: 'reminder',
      title: 'Safety Features',
      message: 'Explore new safety features in the app',
      time: '5 days ago',
      read: true,
      icon: 'Shield',
    },
    {
      id: 9,
      type: 'checkin',
      title: 'Check-in Created',
      message: 'Your first date check-in has been scheduled',
      time: '6 days ago',
      read: false,
      icon: 'Plus',
    },
    {
      id: 10,
      type: 'success',
      title: 'Welcome!',
      message: 'Welcome to CheckOnMe - Stay safe out there',
      time: '1 week ago',
      read: true,
      icon: 'Heart',
    },
  ];

  const filteredNotifications = notifications.filter((notification) =>
    selectedType === 'all' ? true : notification.type === selectedType
  );

  const renderNotification = (notification: Notification) => (
    <Link href={`/screens/notifications/${notification.id}`} asChild>
      <ListItem
        leading={
          <View className="h-10 w-10 items-center justify-center rounded-full bg-light-secondary/30 dark:bg-dark-subtext/30">
            <Icon name={notification.icon} size={20} />
          </View>
        }
        title={<ThemedText className="font-bold">{notification.title}</ThemedText>}
        subtitle={notification.message}
        trailing={
          <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
            {notification.time}
          </ThemedText>
        }
        className={`py-4 ${!notification.read ? 'bg-light-secondary/5 dark:bg-dark-secondary/5' : ''}`}
      />
    </Link>
  );

  return (
    <>
      <Header showBackButton title="Notifications" />
      <View className="flex-1 bg-light-primary dark:bg-dark-primary">
        <View className="flex-row gap-1 p-4">
          <Chip
            label="All"
            isSelected={selectedType === 'all'}
            onPress={() => setSelectedType('all')}
          />
          <Chip
            label="Check-ins"
            isSelected={selectedType === 'checkin'}
            onPress={() => setSelectedType('checkin')}
          />
          <Chip
            label="Alerts"
            isSelected={selectedType === 'alert'}
            onPress={() => setSelectedType('alert')}
          />
          <Chip
            label="Success"
            isSelected={selectedType === 'success'}
            onPress={() => setSelectedType('success')}
          />
          <Chip
            label="Reminders"
            isSelected={selectedType === 'reminder'}
            onPress={() => setSelectedType('reminder')}
          />
        </View>

        <ThemedScroller>
          <TabScreenWrapper animation="fadeIn" duration={300} delay={0}>
            {isLoading ? (
              <SkeletonLoader variant="list" count={6} />
            ) : (
              <List variant="divided">
                {filteredNotifications.map((notification) => (
                  <View key={notification.id}>{renderNotification(notification)}</View>
                ))}
              </List>
            )}
          </TabScreenWrapper>
        </ThemedScroller>
      </View>
    </>
  );
}
