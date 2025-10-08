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

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Check-in Required',
          body: `Time to check in for: ${title}`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            checkInId,
            type: 'checkin_alarm',
            requiresCode: true,
          },
        },
        trigger: { date: checkInTime } as any,
      });

      console.log(
        `Scheduled check-in alarm for ${checkInTime.toISOString()}, ID: ${notificationId}`
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
}
