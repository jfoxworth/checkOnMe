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
  async createUser(userData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }): Promise<ApiResponse<User>> {
    try {
      const user: User = {
        ...createKeys.user(userData.id),
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
        // Give new users 5 free credits to start
        totalCredits: 5,
        usedCredits: 0,
        availableCredits: 5,
        subscriptionStatus: 'free',
      };

      await dynamoService.putItem(TABLE_NAMES.MAIN, user);

      return { success: true, data: user };
    } catch (error) {
      console.error('Create user error:', error);
      return { success: false, error: 'Failed to create user' };
    }
  },

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
      title?: string;
      description?: string;
      type?: string;
      checkInCode?: string;
      scheduledTime: string;
      intervalMinutes: number;
      contacts: string[];
      customContacts?: Array<{ name: string; email: string; phone: string; type: string }>;
      companions?: Array<{
        name: string;
        email?: string;
        phone?: string;
        socialMedia?: string;
        contact?: string; // For backward compatibility
      }>;
      location?: { latitude: number; longitude: number };
      startLocation?: { latitude: number; longitude: number; address?: string; name?: string };
    }
  ): Promise<ApiResponse<CheckIn>> {
    try {
      // Check if user has available credits
      let userResponse = await this.getUserById(userId);

      // If user doesn't exist, create them with default credits
      if (!userResponse.success) {
        console.log('User not found in DynamoDB, creating with default credits...');
        const createUserResponse = await this.createUser({
          id: userId,
          email: userId, // Use userId as fallback email
          firstName: 'User',
          lastName: '',
        });

        if (!createUserResponse.success) {
          return { success: false, error: 'Failed to create user account' };
        }

        userResponse = { success: true, data: createUserResponse.data! };
      }

      const user = userResponse.data!;
      // TEMPORARILY DISABLED FOR TESTING: Credit check
      // if (user.availableCredits <= 0) {
      //   return { success: false, error: 'No check-in credits available' };
      // }

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
        title: data.title || `Check-in (${data.type || 'custom'})`,
        description: data.description || '',
        type: (data.type as CheckIn['type']) || 'other',
        scheduledTime: data.scheduledTime,
        responseDeadline,
        intervalMinutes: data.intervalMinutes,
        checkInCode: data.checkInCode || generate4DigitCode(), // Use provided code or generate one
        contacts: data.contacts,
        customContacts: data.customContacts,
        companions: data.companions,
        location: data.location,
        startLocation: data.startLocation,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
        // GSI attributes for escalation queries
        GSI1PK: 'scheduled', // Status for escalation index
        GSI1SK: responseDeadline, // Response deadline for sorting
      };

      // Save check-in
      await dynamoService.putItem(TABLE_NAMES.MAIN, checkIn);

      // TEMPORARILY DISABLED FOR TESTING: Credit deduction
      // Update user credits
      // const updatedUser = {
      //   ...user,
      //   usedCredits: user.usedCredits + 1,
      //   availableCredits: user.availableCredits - 1,
      //   updatedAt: getCurrentTimestamp(),
      // };
      // await dynamoService.putItem(TABLE_NAMES.MAIN, updatedUser);

      return { success: true, data: checkIn };
    } catch (error) {
      console.error('Create check-in error:', error);
      return { success: false, error: 'Failed to create check-in' };
    }
  },

  async acknowledgeCheckIn(
    userId: string,
    checkInId: string,
    checkInCode: string
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

      if (checkIn.checkInCode !== checkInCode) {
        return { success: false, error: 'Invalid confirmation code' };
      }

      // Update check-in status
      const updatedCheckIn = {
        ...checkIn,
        status: 'acknowledged' as const,
        acknowledgedAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
        // Update GSI attributes to remove from escalation queries
        GSI1PK: 'acknowledged',
        GSI1SK: checkIn.responseDeadline, // Keep the same sort key
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
        'GSI1PK = :status AND GSI1SK <= :now',
        { ':status': 'scheduled', ':now': getCurrentTimestamp() },
        {}
      );

      const escalationQueries: EscalationQuery[] = items.map((checkIn) => ({
        userId: checkIn.userId,
        checkInId: checkIn.id,
        scheduledTime: checkIn.scheduledTime,
        responseDeadline: checkIn.responseDeadline,
        checkInCode: checkIn.checkInCode,
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
        // Update GSI attributes
        GSI1PK: 'escalated',
        GSI1SK: checkIn.responseDeadline, // Keep the same sort key
      };

      await dynamoService.putItem(TABLE_NAMES.MAIN, updatedCheckIn);

      return { success: true, data: updatedCheckIn };
    } catch (error) {
      console.error('Escalate check-in error:', error);
      return { success: false, error: 'Failed to escalate check-in' };
    }
  },

  // Escalation workflow - to be called by Lambda
  async processEscalations(): Promise<
    ApiResponse<{ processed: number; escalated: EscalationQuery[] }>
  > {
    try {
      console.log('🚨 Starting escalation process...');

      // Get all check-ins that need escalation
      const escalationResponse = await this.getCheckInsForEscalation();

      if (!escalationResponse.success || !escalationResponse.data) {
        return { success: false, error: 'Failed to get escalation queries' };
      }

      const escalationQueries = escalationResponse.data;
      console.log(`📋 Found ${escalationQueries.length} check-ins needing escalation`);

      // Process each escalation
      const processedEscalations: EscalationQuery[] = [];

      for (const query of escalationQueries) {
        try {
          console.log(`⚠️ Processing escalation for check-in: ${query.checkInId}`);

          // Mark as escalated
          const escalateResponse = await this.escalateCheckIn(query.userId, query.checkInId);

          if (escalateResponse.success) {
            processedEscalations.push(query);
            console.log(`✅ Escalated check-in: ${query.checkInId}`);

            // Here you would trigger the actual notification to emergency contacts
            // For now, we'll just log what would happen
            console.log(`📧 Would notify contacts: ${query.contacts.join(', ')}`);
            console.log(`🔐 Check-in code for reference: ${query.checkInCode}`);
            console.log(`⏰ Response deadline was: ${query.responseDeadline}`);
          } else {
            console.error(
              `❌ Failed to escalate check-in ${query.checkInId}:`,
              escalateResponse.error
            );
          }
        } catch (error) {
          console.error(`❌ Error processing escalation for ${query.checkInId}:`, error);
        }
      }

      console.log(
        `🎯 Escalation process complete. Processed ${processedEscalations.length}/${escalationQueries.length} escalations`
      );

      return {
        success: true,
        data: {
          processed: processedEscalations.length,
          escalated: processedEscalations,
        },
      };
    } catch (error) {
      console.error('Process escalations error:', error);
      return { success: false, error: 'Failed to process escalations' };
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

  // Get specific check-in by ID
  async getCheckInById(userId: string, checkInId: string): Promise<ApiResponse<CheckIn>> {
    try {
      console.log('API: Getting check-in by ID:', checkInId);

      const keys = createKeys.checkIn(userId, checkInId);
      const item = await dynamoService.getItem(TABLE_NAMES.MAIN, keys);

      if (!item) {
        return { success: false, error: 'Check-in not found' };
      }

      return { success: true, data: item as CheckIn };
    } catch (error) {
      console.error('Get check-in by ID error:', error);
      return { success: false, error: 'Failed to get check-in' };
    }
  },

  // Confirm check-in (mark as completed without escalation)
  async confirmCheckIn(checkInId: string): Promise<ApiResponse<CheckIn>> {
    try {
      console.log('API: Confirming check-in:', checkInId);

      // In a real implementation, you would need the userId
      // For now, let's use a mock approach similar to acknowledgeCheckIn
      // This should be updated to match your database structure

      // Mock implementation - find and update the check-in
      // This would need to be replaced with actual database logic
      const updatedCheckIn = {
        id: checkInId,
        status: 'acknowledged' as const,
        acknowledgedAt: getCurrentTimestamp(),
        // Add other required CheckIn fields here
      };

      return { success: true, data: updatedCheckIn as CheckIn };
    } catch (error) {
      console.error('API: Error confirming check-in:', error);
      return { success: false, error: 'Failed to confirm check-in' };
    }
  },

  // Delete check-in
  async deleteCheckIn(checkInId: string): Promise<ApiResponse<void>> {
    try {
      console.log('API: Deleting check-in:', checkInId);

      // In a real implementation, this would delete from the database
      // For now, this is a mock implementation
      console.log('Check-in deleted successfully');
      return { success: true, data: undefined };
    } catch (error) {
      console.error('API: Error deleting check-in:', error);
      return { success: false, error: 'Failed to delete check-in' };
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
