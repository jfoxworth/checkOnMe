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

type NotificationType = 'order' | 'promotion' | 'stock' | 'shipping' | 'all';

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
      type: 'order',
      title: 'Order Confirmed',
      message: 'Your order #12345 has been confirmed and is being processed',
      time: '2 min ago',
      read: false,
      icon: 'ShoppingBag'
    },
    {
      id: 2,
      type: 'shipping',
      title: 'Order Shipped',
      message: 'Your order #12344 has been shipped via UPS',
      time: '1 hour ago',
      read: true,
      icon: 'Truck'
    },
    {
      id: 3,
      type: 'promotion',
      title: 'Flash Sale!',
      message: '24-hour sale! 50% off all summer items',
      time: '2 hours ago',
      read: false,
      icon: 'Percent'
    },
    {
      id: 4,
      type: 'stock',
      title: 'Back In Stock',
      message: 'Nike Air Max 90 is back in stock in your size',
      time: '1 day ago',
      read: true,
      icon: 'Package'
    },
    {
      id: 5,
      type: 'promotion',
      title: 'New Collection',
      message: 'Fall collection 2024 just arrived',
      time: '2 days ago',
      read: false,
      icon: 'Sparkles'
    },
    {
      id: 6,
      type: 'order',
      title: 'Order Delivered',
      message: 'Your order #12340 has been delivered',
      time: '3 days ago',
      read: true,
      icon: 'PackageCheck'
    },
    {
      id: 7,
      type: 'shipping',
      title: 'Shipping Update',
      message: 'Your package is delayed by 1 day',
      time: '4 days ago',
      read: false,
      icon: 'AlertTriangle'
    },
    {
      id: 8,
      type: 'stock',
      title: 'Price Drop',
      message: 'Adidas Ultraboost is now 30% off',
      time: '5 days ago',
      read: true,
      icon: 'ArrowDown'
    },
    {
      id: 9,
      type: 'promotion',
      title: 'Special Offer',
      message: 'Buy one, get one 50% off on all accessories',
      time: '6 days ago',
      read: false,
      icon: 'Tag'
    },
    {
      id: 10,
      type: 'order',
      title: 'Order Issue',
      message: 'There was an issue processing your payment',
      time: '1 week ago',
      read: true,
      icon: 'AlertCircle'
    },
    {
      id: 11,
      type: 'shipping',
      title: 'Shipment Arrived',
      message: 'Your package has arrived at the local facility',
      time: '1 week ago',
      read: false,
      icon: 'MapPin'
    },
    {
      id: 12,
      type: 'stock',
      title: 'Wishlist Item Available',
      message: 'Levi\'s 501 jeans are now available in your size',
      time: '2 weeks ago',
      read: true,
      icon: 'Heart'
    }
  ];

  const filteredNotifications = notifications.filter(notification =>
    selectedType === 'all' ? true : notification.type === selectedType
  );

  const renderNotification = (notification: Notification) => (
    <Link href={`/screens/notifications/${notification.id}`} asChild>
      <ListItem
        leading={
          <View className="bg-light-secondary/30 dark:bg-dark-subtext/30 w-10 h-10 rounded-full items-center justify-center">
            <Icon name={notification.icon} size={20} />
          </View>
        }
        title={
          <ThemedText className="font-bold">{notification.title}</ThemedText>
        }
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
      <Header 
        showBackButton 
        title="Notifications" 
      />
      <View className="flex-1 bg-light-primary dark:bg-dark-primary">
        <View className="p-4 flex-row gap-1">
          <Chip
            label="All"
            isSelected={selectedType === 'all'}
            onPress={() => setSelectedType('all')}
          />
          <Chip
            label="Orders"
            isSelected={selectedType === 'order'}
            onPress={() => setSelectedType('order')}
          />
          <Chip
            label="Shipping"
            isSelected={selectedType === 'shipping'}
            onPress={() => setSelectedType('shipping')}
          />
          <Chip
            label="Promotions"
            isSelected={selectedType === 'promotion'}
            onPress={() => setSelectedType('promotion')}
          />
          <Chip
            label="Stock"
            isSelected={selectedType === 'stock'}
            onPress={() => setSelectedType('stock')}
          />
        </View>

        <ThemedScroller>
          <TabScreenWrapper animation="fadeIn" duration={300} delay={0}>
            {isLoading ? (
              <SkeletonLoader variant="list" count={6} />
            ) : (
              <List variant="divided">
                {filteredNotifications.map((notification) => (
                  <View key={notification.id}>
                    {renderNotification(notification)}
                  </View>
                ))}
              </List>
            )}
          </TabScreenWrapper>
        </ThemedScroller>
      </View>
    </>
  );
}