import {
  User,
  CheckInPlan,
  UserUsage,
  ApiResponse,
  CheckIn,
  Contact,
  EscalationQuery,
} from './types';
import { dynamoService, TABLE_NAMES, createKeys } from './dynamodb';

// Utility functions
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generate4DigitCode = () => Math.floor(1000 + Math.random() * 9000).toString();
const getCurrentTimestamp = () => new Date().toISOString();

// Simplified API for the single-table design
export const api = {
  // User operations
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      const user = await dynamoService.getItem<User>(TABLE_NAMES.MAIN, createKeys.user(userId));

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      return { success: true, data: user };
    } catch (error) {
      console.error('Get user error:', error);
      return { success: false, error: 'Failed to get user' };
    }
  },

  async getUserUsage(userId: string): Promise<ApiResponse<UserUsage>> {
    try {
      const userResponse = await this.getUserById(userId);
      if (!userResponse.success || !userResponse.data) {
        return { success: false, error: 'User not found' };
      }

      const user = userResponse.data;
      const usage: UserUsage = {
        userId,
        currentPeriodStart: user.createdAt,
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        checkInsUsed: user.usedCredits,
        checkInsRemaining: user.availableCredits,
        totalCheckIns: user.totalCredits,
        isLoggedIn: true,
      };

      return { success: true, data: usage };
    } catch (error) {
      console.error('Get user usage error:', error);
      return { success: false, error: 'Failed to get user usage' };
    }
  },

  // Check-in purchase options - Individual purchases, not subscriptions
  async getCheckInPurchaseOptions(): Promise<ApiResponse<CheckInPlan[]>> {
    try {
      const purchaseOptions = await dynamoService.scanItems<CheckInPlan>(
        TABLE_NAMES.MAIN,
        'begins_with(PK, :pk) AND SK = :sk AND #isActive = :isActive',
        { ':pk': 'PLAN#', ':sk': 'DETAILS', ':isActive': true },
        { '#isActive': 'isActive' }
      );

      // Sort by sortOrder (price/value)
      purchaseOptions.sort((a, b) => a.sortOrder - b.sortOrder);

      return { success: true, data: purchaseOptions };
    } catch (error) {
      console.error('Get purchase options error:', error);
      return { success: false, error: 'Failed to get purchase options' };
    }
  },

  async getPurchaseOptionById(purchaseId: string): Promise<ApiResponse<CheckInPlan>> {
    try {
      const purchaseOption = await dynamoService.getItem<CheckInPlan>(
        TABLE_NAMES.MAIN,
        createKeys.plan(purchaseId)
      );

      if (!purchaseOption) {
        return { success: false, error: 'Purchase option not found' };
      }

      return { success: true, data: purchaseOption };
    } catch (error) {
      console.error('Get purchase option error:', error);
      return { success: false, error: 'Failed to get purchase option' };
    }
  },

  // Check-in operations - New single-table implementation
  async createCheckIn(
    userId: string,
    data: {
      scheduledTime: string;
      intervalMinutes: number;
      contacts: string[];
      location?: { latitude: number; longitude: number };
    }
  ): Promise<ApiResponse<CheckIn>> {
    try {
      // Check if user has available credits
      const userResponse = await this.getUserById(userId);
      if (!userResponse.success || !userResponse.data) {
        return { success: false, error: 'User not found' };
      }

      const user = userResponse.data;
      if (user.availableCredits <= 0) {
        return { success: false, error: 'No check-in credits available' };
      }

      // Create check-in
      const checkInId = generateId();
      const responseDeadline = new Date(
        new Date(data.scheduledTime).getTime() + data.intervalMinutes * 60 * 1000
      ).toISOString();

      const checkIn: CheckIn = {
        ...createKeys.checkIn(userId, checkInId),
        id: checkInId,
        userId,
        status: 'scheduled',
        scheduledTime: data.scheduledTime,
        responseDeadline,
        intervalMinutes: data.intervalMinutes,
        confirmationCode: generate4DigitCode(),
        contacts: data.contacts,
        location: data.location,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      };

      // Save check-in
      await dynamoService.putItem(TABLE_NAMES.MAIN, checkIn);

      // Update user credits
      const updatedUser = {
        ...user,
        usedCredits: user.usedCredits + 1,
        availableCredits: user.availableCredits - 1,
        updatedAt: getCurrentTimestamp(),
      };
      await dynamoService.putItem(TABLE_NAMES.MAIN, updatedUser);

      return { success: true, data: checkIn };
    } catch (error) {
      console.error('Create check-in error:', error);
      return { success: false, error: 'Failed to create check-in' };
    }
  },

  async acknowledgeCheckIn(
    userId: string,
    checkInId: string,
    confirmationCode: string
  ): Promise<ApiResponse<CheckIn>> {
    try {
      // Get check-in
      const checkIn = await dynamoService.getItem<CheckIn>(
        TABLE_NAMES.MAIN,
        createKeys.checkIn(userId, checkInId)
      );

      if (!checkIn) {
        return { success: false, error: 'Check-in not found' };
      }

      if (checkIn.status !== 'scheduled') {
        return { success: false, error: 'Check-in is not in scheduled status' };
      }

      if (checkIn.confirmationCode !== confirmationCode) {
        return { success: false, error: 'Invalid confirmation code' };
      }

      // Update check-in status
      const updatedCheckIn = {
        ...checkIn,
        status: 'acknowledged' as const,
        acknowledgedAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      };

      await dynamoService.putItem(TABLE_NAMES.MAIN, updatedCheckIn);

      return { success: true, data: updatedCheckIn };
    } catch (error) {
      console.error('Acknowledge check-in error:', error);
      return { success: false, error: 'Failed to acknowledge check-in' };
    }
  },

  async getUserCheckIns(userId: string): Promise<ApiResponse<CheckIn[]>> {
    try {
      const checkIns = await dynamoService.queryItems<CheckIn>(
        TABLE_NAMES.MAIN,
        'PK = :pk AND begins_with(SK, :sk)',
        { ':pk': `USER#${userId}`, ':sk': 'CHECKIN#' }
      );

      // Sort by scheduled time, most recent first
      checkIns.sort(
        (a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
      );

      return { success: true, data: checkIns };
    } catch (error) {
      console.error('Get user check-ins error:', error);
      return { success: false, error: 'Failed to get check-ins' };
    }
  },

  // Escalation queries for backend Lambda
  async getCheckInsForEscalation(): Promise<ApiResponse<EscalationQuery[]>> {
    try {
      // Query GSI for scheduled check-ins that need escalation
      const items = await dynamoService.queryGSI<CheckIn>(
        TABLE_NAMES.MAIN,
        'EscalationIndex',
        '#status = :status AND responseDeadline <= :now',
        { ':status': 'scheduled', ':now': getCurrentTimestamp() },
        { '#status': 'status' }
      );

      const escalationQueries: EscalationQuery[] = items.map((checkIn) => ({
        userId: checkIn.userId,
        checkInId: checkIn.id,
        scheduledTime: checkIn.scheduledTime,
        responseDeadline: checkIn.responseDeadline,
        confirmationCode: checkIn.confirmationCode,
        contacts: checkIn.contacts,
      }));

      return { success: true, data: escalationQueries };
    } catch (error) {
      console.error('Get escalation queries error:', error);
      return { success: false, error: 'Failed to get escalation queries' };
    }
  },

  async escalateCheckIn(userId: string, checkInId: string): Promise<ApiResponse<CheckIn>> {
    try {
      // Get check-in
      const checkIn = await dynamoService.getItem<CheckIn>(
        TABLE_NAMES.MAIN,
        createKeys.checkIn(userId, checkInId)
      );

      if (!checkIn) {
        return { success: false, error: 'Check-in not found' };
      }

      // Update status to escalated
      const updatedCheckIn = {
        ...checkIn,
        status: 'escalated' as const,
        escalatedAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      };

      await dynamoService.putItem(TABLE_NAMES.MAIN, updatedCheckIn);

      return { success: true, data: updatedCheckIn };
    } catch (error) {
      console.error('Escalate check-in error:', error);
      return { success: false, error: 'Failed to escalate check-in' };
    }
  },

  // Contact operations
  async getUserContacts(userId: string): Promise<ApiResponse<Contact[]>> {
    try {
      const contacts = await dynamoService.queryItems<Contact>(
        TABLE_NAMES.MAIN,
        'PK = :pk AND begins_with(SK, :sk)',
        { ':pk': `USER#${userId}`, ':sk': 'CONTACT#' }
      );

      return { success: true, data: contacts };
    } catch (error) {
      console.error('Get user contacts error:', error);
      return { success: false, error: 'Failed to get contacts' };
    }
  },

  async createContact(
    userId: string,
    contactData: Omit<Contact, 'PK' | 'SK' | 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Contact>> {
    try {
      const contactId = generateId();
      const contact: Contact = {
        ...createKeys.contact(userId, contactId),
        id: contactId,
        userId,
        ...contactData,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      };

      await dynamoService.putItem(TABLE_NAMES.MAIN, contact);

      return { success: true, data: contact };
    } catch (error) {
      console.error('Create contact error:', error);
      return { success: false, error: 'Failed to create contact' };
    }
  },
};

// For backward compatibility, export individual services
export const userService = api;
export const purchaseService = api; // Changed from planService to purchaseService
export const billingService = {
  async purchaseCheckInCredits(
    userId: string,
    purchaseData: { purchaseId: string; paymentMethodId: string }
  ): Promise<ApiResponse<{ id: string; status: string }>> {
    try {
      // In a real implementation, this would:
      // 1. Process payment via Stripe/payment processor
      // 2. Add credits to user account
      // 3. Create transaction record
      // 4. Return transaction details

      return {
        success: true,
        data: { id: generateId(), status: 'completed' },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to process payment',
      };
    }
  },
};
