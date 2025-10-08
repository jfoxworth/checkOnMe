import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push notification permissions');
      return false;
    }

    return true;
  }

  static async scheduleCheckInAlarm(
    checkInId: string,
    checkInTime: Date,
    title: string
  ): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Notification permissions not granted');
      }

      // Ensure the check-in time is in the future
      const now = new Date();
      if (checkInTime <= now) {
        console.warn('Cannot schedule alarm for past time:', checkInTime.toISOString());
        return null;
      }

      console.log('Scheduling alarm for:', checkInTime.toISOString());
      console.log('Current time:', now.toISOString());
      console.log(
        'Time until alarm (minutes):',
        (checkInTime.getTime() - now.getTime()) / (1000 * 60)
      );

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Check-in Required',
          body: `Time to check in for: ${title}`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'checkin',
          data: {
            checkInId,
            type: 'checkin_alarm',
            requiresCode: true,
            scheduledFor: checkInTime.toISOString(),
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: checkInTime,
        },
      });

      console.log(
        `✅ Scheduled check-in alarm for ${checkInTime.toISOString()}, ID: ${notificationId}`
      );
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule check-in alarm:', error);
      return null;
    }
  }

  static async cancelCheckInAlarm(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`Cancelled check-in alarm: ${notificationId}`);
    } catch (error) {
      console.error('Failed to cancel alarm:', error);
    }
  }

  static async cancelAllCheckInAlarms(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Cancelled all scheduled notifications');
    } catch (error) {
      console.error('Failed to cancel all alarms:', error);
    }
  }

  static async rescheduleActiveCheckIns(
    checkIns: Array<{
      id: string;
      scheduledTime: string;
      title?: string;
      status: string;
    }>
  ): Promise<void> {
    try {
      console.log('Rescheduling active check-ins...');
      let scheduledCount = 0;

      for (const checkIn of checkIns) {
        if (checkIn.status === 'scheduled') {
          const checkInTime = new Date(checkIn.scheduledTime);
          // Only reschedule if the check-in is in the future
          if (checkInTime > new Date()) {
            const notificationId = await this.scheduleCheckInAlarm(
              checkIn.id,
              checkInTime,
              checkIn.title || 'Check-in'
            );
            if (notificationId) {
              scheduledCount++;
            }
          }
        }
      }

      console.log(`Successfully rescheduled ${scheduledCount} check-in alarms`);
    } catch (error) {
      console.error('Failed to reschedule check-ins:', error);
    }
  }

  // Test function to schedule an immediate notification (for debugging)
  static async scheduleTestNotification(checkInId: string, title: string): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Notification permissions not granted');
      }

      // Schedule for 5 seconds from now
      const testTime = new Date(Date.now() + 5000);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test Check-in (5 sec)',
          body: `Test notification for: ${title}`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            checkInId,
            type: 'checkin_alarm',
            requiresCode: true,
            isTest: true,
            scheduledFor: testTime.toISOString(),
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: testTime,
        },
      });

      console.log(`🧪 Scheduled TEST alarm for ${testTime.toISOString()}, ID: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule test alarm:', error);
      return null;
    }
  }

  // Debug function to list all scheduled notifications
  static async listScheduledNotifications(): Promise<void> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('📅 Scheduled notifications count:', notifications.length);

      notifications.forEach((notification, index) => {
        const trigger = notification.trigger as any;
        const data = notification.content.data;
        console.log(`${index + 1}. ID: ${notification.identifier}`);
        console.log(`   Title: ${notification.content.title}`);
        console.log(`   Scheduled for: ${trigger.date || trigger.dateComponents || 'Unknown'}`);
        console.log(`   Type: ${data?.type || 'Unknown'}`);
        console.log(`   CheckInId: ${data?.checkInId || 'None'}`);
        console.log('   ---');
      });
    } catch (error) {
      console.error('Failed to list notifications:', error);
    }
  }
}
