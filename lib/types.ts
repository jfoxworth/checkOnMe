// Core data types for the CheckOnMe app - Single Table DynamoDB Design

export interface User {
  // DynamoDB Keys: PK = USER#{userId}, SK = PROFILE
  PK: string; // USER#{userId}
  SK: string; // PROFILE
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
  // Credit system
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
  // Subscription info
  subscriptionStatus?: 'free' | 'active' | 'expired';
  lastPurchaseDate?: string;
}

export interface CheckIn {
  // DynamoDB Keys: PK = USER#{userId}, SK = CHECKIN#{checkInId}
  PK: string; // USER#{userId}
  SK: string; // CHECKIN#{checkInId}
  id: string;
  userId: string;
  title?: string;
  description?: string;
  status: 'scheduled' | 'active' | 'acknowledged' | 'escalated' | 'missed' | 'cancelled';
  type?: 'hiking' | 'date' | 'road-trip' | 'solo-activity' | 'work' | 'other';
  
  // Timing - Critical for the alarm workflow
  scheduledTime: string; // ISO string - when the activity starts
  responseDeadline: string; // ISO string - when user must check in
  intervalMinutes: number; // Duration in minutes between scheduled time and deadline
  acknowledgedAt?: string; // ISO string - when user confirmed safety
  escalatedAt?: string; // ISO string - when emergency contacts were notified
  createdAt: string;
  updatedAt: string;
  
  // Location
  location?: {
    latitude: number;
    longitude: number;
  };
  startLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: string;
  };
  
  // Emergency escalation
  contacts: string[]; // Array of contact IDs for simplified API
  escalationContacts?: string[]; // Array of contact PKs
  escalationLevel?: number; // 0 = none, 1 = first reminder, 2 = emergency contacts, etc.
  
  // User confirmation code
  confirmationCode: string; // 4-digit code for user to enter
  
  // Settings
  checkInInterval?: number; // minutes
  gracePeriod?: number; // minutes after responseDeadline before escalation
  autoCancel?: boolean;
  
  // Metadata
  deviceInfo?: {
    platform: string;
    version: string;
  };
}export interface EmergencyContact {
  // DynamoDB Keys: PK = USER#{userId}, SK = CONTACT#{contactId}
  PK: string; // USER#{userId}
  SK: string; // CONTACT#{contactId}
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  relationship: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Contact preferences
  notificationMethods: ('sms' | 'email' | 'call')[];
  timeZone?: string;
}

// Alias for simplified API
export type Contact = EmergencyContact;

export interface CheckInPlan {
  // DynamoDB Keys: PK = PLAN#{planId}, SK = DETAILS
  PK: string; // PLAN#{planId}
  SK: string; // DETAILS
  id: string;
  name: string;
  description: string;
  checkIns: number;
  price: number; // in dollars
  features: string[];
  isActive: boolean;
  sortOrder: number;
  popular?: boolean; // for highlighting popular plans
}

export interface PurchaseTransaction {
  // DynamoDB Keys: PK = USER#{userId}, SK = TRANSACTION#{transactionId}
  PK: string; // USER#{userId}
  SK: string; // TRANSACTION#{transactionId}
  id: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionDate: string;
  creditsAdded: number;
  
  // Payment gateway info
  paymentIntentId?: string;
  receiptUrl?: string;
}

// For the GSI query to find unacknowledged check-ins
export interface EscalationQuery {
  userId: string;
  checkInId: string;
  scheduledTime: string;
  responseDeadline: string;
  confirmationCode: string;
  contacts: string[];
}

export interface UserUsage {
  userId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  checkInsUsed: number;
  checkInsRemaining: number;
  totalCheckIns: number;
  lastCheckInDate?: string;
  isLoggedIn: boolean;
}

// Local storage types for mobile app
export interface LocalCheckIn {
  id: string;
  userId: string;
  title: string;
  scheduledTime: string;
  responseDeadline: string;
  confirmationCode: string;
  notificationId: string; // Local notification ID
  isActive: boolean;
  isSynced: boolean; // Whether it's been saved to backend
}

// Notification workflow types
export interface NotificationPayload {
  checkInId: string;
  title: string;
  body: string;
  confirmationCode: string;
  responseDeadline: string;
}

export interface AlarmSettings {
  enableNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationTime: number; // minutes before responseDeadline
  gracePeriod: number; // minutes after responseDeadline
}
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  error?: string;
}

// Request types
export interface CreateCheckInRequest {
  title: string;
  description?: string;
  type: CheckIn['type'];
  scheduledTime: string;
  checkInTime: string;
  emergencyContacts: string[];
  startLocation?: CheckIn['startLocation'];
  checkInInterval?: number;
  gracePeriod?: number;
  autoCancel?: boolean;
}

export interface UpdateCheckInRequest {
  title?: string;
  description?: string;
  status?: CheckIn['status'];
  checkInTime?: string;
  currentLocation?: CheckIn['currentLocation'];
  escalationLevel?: number;
}

export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  relationship: string;
  isPrimary?: boolean;
  notificationMethods: EmergencyContact['notificationMethods'];
  timeZone?: string;
}

export interface PurchasePlanRequest {
  planId: string;
  paymentMethodId: string;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  error?: string;
}
