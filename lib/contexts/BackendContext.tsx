import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api';
import { useAuth } from './AuthContext';
import { Contact, CheckIn, ApiResponse } from '../types';
import { NotificationService } from '../notifications';

// Types for backend integration
export interface CreateContactData {
  name: string;
  relationship?: string;
  phone?: string;
  email?: string;
  preferredMethod: 'email' | 'sms' | 'both';
}

export interface CreateCheckInData {
  title: string;
  description?: string;
  type: 'hiking' | 'date' | 'road-trip' | 'solo' | 'work' | 'other';
  checkInCode?: string;
  scheduledTime: string;
  intervalMinutes: number;
  contacts: string[]; // Changed from contactIds to contacts to match API
  customContacts?: Array<{ name: string; email: string; phone: string; type: string }>;
  companions?: Array<{
    name: string;
    email?: string;
    phone?: string;
    socialMedia?: string;
    contact?: string; // For backward compatibility
  }>;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    name?: string;
  };
}

// Context interface
interface BackendContextType {
  // Loading states
  isLoadingContacts: boolean;
  isLoadingCheckIns: boolean;

  // Data
  userContacts: Contact[];
  userCheckIns: CheckIn[];

  // User operations
  createUserIfNeeded: (userData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }) => Promise<ApiResponse<any>>;

  // Contact operations
  createContact: (contactData: CreateContactData) => Promise<ApiResponse<Contact>>;
  fetchUserContacts: () => Promise<void>;
  deleteContact: (contactId: string) => Promise<ApiResponse<void>>;

  // Check-in operations
  createCheckIn: (checkInData: CreateCheckInData) => Promise<ApiResponse<CheckIn>>;
  updateCheckIn: (
    checkInId: string,
    checkInData: CreateCheckInData
  ) => Promise<ApiResponse<CheckIn>>;
  fetchUserCheckIns: () => Promise<void>;
  updateCheckInStatus: (
    checkInId: string,
    status: CheckIn['status']
  ) => Promise<ApiResponse<CheckIn>>;
  acknowledgeCheckIn: (checkInId: string, checkInCode: string) => Promise<ApiResponse<CheckIn>>;
  getCheckInById: (checkInId: string) => Promise<CheckIn | null>;
  confirmCheckIn: (checkInId: string) => Promise<ApiResponse<CheckIn>>;
  deleteCheckIn: (checkInId: string) => Promise<ApiResponse<void>>;

  // Escalation operations
  processEscalations: () => Promise<ApiResponse<{ processed: number; escalated: any[] }>>;

  // Combined operations
  refreshAll: () => Promise<void>;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

export interface BackendProviderProps {
  children: ReactNode;
}

export const BackendProvider: React.FC<BackendProviderProps> = ({ children }) => {
  const { user, isAuthenticated, refreshSession } = useAuth();
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingCheckIns, setIsLoadingCheckIns] = useState(false);
  const [userContacts, setUserContacts] = useState<Contact[]>([]);
  const [userCheckIns, setUserCheckIns] = useState<CheckIn[]>([]);

  // Helper function to handle API calls with automatic token refresh
  const withTokenRefresh = async <T,>(
    apiCall: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> => {
    try {
      const result = await apiCall();
      return result;
    } catch (error: any) {
      // Check if it's a token expiration error
      if (error?.name === 'NotAuthorizedException' && error?.message?.includes('expired')) {
        console.log('Token expired, attempting to refresh and retry...');
        try {
          await refreshSession();
          // Retry the API call after token refresh
          return await apiCall();
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          // Return the original error if refresh fails
          return {
            success: false,
            error: 'Session expired. Please log in again.',
            data: null,
          } as ApiResponse<T>;
        }
      }
      // Re-throw other errors
      throw error;
    }
  };

  // Auto-fetch data when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      initializeUserInBackend();
    } else {
      // Clear data when user logs out
      setUserContacts([]);
      setUserCheckIns([]);
    }
  }, [isAuthenticated, user?.id]);

  // Initialize user in backend (create if needed, then fetch data)
  const initializeUserInBackend = async () => {
    if (!user?.id) return;

    try {
      // Extract name parts from user object
      const firstName =
        user.firstName || user.name?.split(' ')[0] || user.email?.split('@')[0] || 'User';
      const lastName = user.lastName || user.name?.split(' ').slice(1).join(' ') || '';

      // Ensure user exists in DynamoDB
      await createUserIfNeeded({
        id: user.id,
        email: user.email,
        firstName,
        lastName,
        phoneNumber: user.attributes?.phone_number,
      });

      // Now fetch user data
      await refreshAll();
    } catch (error) {
      console.error('Error initializing user in backend:', error);
    }
  };

  // User operations
  const createUserIfNeeded = async (userData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }): Promise<ApiResponse<any>> => {
    try {
      // First check if user exists
      const existingUser = await withTokenRefresh(() => api.getUserById(userData.id));
      if (existingUser.success) {
        // User already exists
        return { success: true, data: existingUser.data };
      }

      // User doesn't exist, create them
      console.log('Creating new user in DynamoDB:', userData.email);
      const response = await withTokenRefresh(() => api.createUser(userData));

      if (response.success) {
        console.log('User created successfully with 5 free credits');
      }

      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: 'Failed to create user' };
    }
  };

  // Contact operations
  const createContact = async (contactData: CreateContactData): Promise<ApiResponse<Contact>> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setIsLoadingContacts(true);

      // Map frontend data to backend format
      const nameParts = contactData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const backendContactData = {
        firstName,
        lastName,
        relationship: contactData.relationship || 'Emergency Contact',
        phoneNumber: contactData.phone || '',
        email: contactData.email || '',
        isPrimary: false,
        isActive: true,
        notificationMethods: (contactData.preferredMethod === 'email'
          ? ['email']
          : contactData.preferredMethod === 'sms'
            ? ['sms']
            : ['email', 'sms']) as ('sms' | 'email' | 'call')[],
      };

      const response = await withTokenRefresh(() => api.createContact(user.id, backendContactData));

      if (response.success && response.data) {
        // Add to local state immediately
        setUserContacts((prev) => [response.data!, ...prev]);
      }

      return response;
    } catch (error) {
      console.error('Error creating contact:', error);
      return { success: false, error: 'Failed to create contact' };
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const fetchUserContacts = async (): Promise<void> => {
    if (!user?.id) return;

    try {
      setIsLoadingContacts(true);
      const response = await withTokenRefresh(() => api.getUserContacts(user.id));

      if (response.success && response.data) {
        setUserContacts(response.data);
      } else {
        console.error('Failed to fetch contacts:', response.error);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const deleteContact = async (contactId: string): Promise<ApiResponse<void>> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setIsLoadingContacts(true);

      // For now, we'll implement a soft delete by updating the contact
      // In a real backend, you'd have a proper delete endpoint
      const response = await api.createContact(user.id, {
        name: 'DELETED',
        isActive: false,
      } as any);

      if (response.success) {
        // Remove from local state
        setUserContacts((prev) => prev.filter((contact) => contact.id !== contactId));
      }

      return { success: response.success, error: response.error };
    } catch (error) {
      console.error('Error deleting contact:', error);
      return { success: false, error: 'Failed to delete contact' };
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // Check-in operations
  const createCheckIn = async (checkInData: CreateCheckInData): Promise<ApiResponse<CheckIn>> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setIsLoadingCheckIns(true);

      console.log('Creating check-in for user:', user.id);
      console.log('Check-in data:', checkInData);
      console.log('Contact IDs being sent to backend:', checkInData.contacts);
      console.log('Companions being sent to backend:', checkInData.companions);

      // Map frontend data to backend format
      const backendCheckInData = {
        title: checkInData.title,
        description: checkInData.description,
        type: checkInData.type,
        scheduledTime: checkInData.scheduledTime,
        intervalMinutes: checkInData.intervalMinutes,
        contacts: checkInData.contacts,
        customContacts: checkInData.customContacts,
        companions: checkInData.companions,
        location: checkInData.location,
      };

      const response = await withTokenRefresh(() => api.createCheckIn(user.id, backendCheckInData));

      if (response.success && response.data) {
        console.log('Check-in created successfully:', response.data.id);
        // Add to local state immediately
        setUserCheckIns((prev) =>
          [response.data!, ...prev].sort(
            (a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
          )
        );
      } else {
        console.error('Failed to create check-in:', response.error);
      }

      return response;
    } catch (error) {
      console.error('Error creating check-in:', error);
      return { success: false, error: 'Failed to create check-in' };
    } finally {
      setIsLoadingCheckIns(false);
    }
  };

  const updateCheckIn = async (
    checkInId: string,
    checkInData: CreateCheckInData
  ): Promise<ApiResponse<CheckIn>> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setIsLoadingCheckIns(true);

      console.log('Updating check-in:', checkInId, checkInData);
      console.log('Contact IDs being updated:', checkInData.contacts);

      // For now, simulate the update since the API might not have a direct update endpoint
      // In practice, you'd call api.updateCheckIn or similar
      const existingCheckIn = userCheckIns.find((c) => c.id === checkInId);
      if (!existingCheckIn) {
        return { success: false, error: 'Check-in not found' };
      }

      // Create updated check-in object
      const updatedCheckIn = {
        ...existingCheckIn,
        title: checkInData.title,
        description: checkInData.description,
        type: (checkInData.type as CheckIn['type']) || existingCheckIn.type,
        scheduledTime: checkInData.scheduledTime,
        intervalMinutes: checkInData.intervalMinutes,
        contacts: checkInData.contacts, // Update contacts properly
        location: checkInData.location,
        updatedAt: new Date().toISOString(),
      };

      // Update local state
      setUserCheckIns((prev) =>
        prev
          .map((c) => (c.id === checkInId ? updatedCheckIn : c))
          .sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime())
      );

      console.log('Check-in updated successfully');
      return { success: true, data: updatedCheckIn };
    } catch (error) {
      console.error('Error updating check-in:', error);
      return { success: false, error: 'Failed to update check-in' };
    } finally {
      setIsLoadingCheckIns(false);
    }
  };

  const fetchUserCheckIns = async (): Promise<void> => {
    if (!user?.id) return;

    try {
      setIsLoadingCheckIns(true);
      const response = await withTokenRefresh(() => api.getUserCheckIns(user.id));

      if (response.success && response.data) {
        console.log('Check-ins fetched successfully:', response.data.length);
        response.data.forEach((checkIn) => {
          console.log(`Check-in ${checkIn.id}: contacts =`, checkIn.contacts);
        });
        setUserCheckIns(response.data);
      } else {
        console.error('Failed to fetch check-ins:', response.error);
      }
    } catch (error) {
      console.error('Error fetching check-ins:', error);
    } finally {
      setIsLoadingCheckIns(false);
    }
  };

  const updateCheckInStatus = async (
    checkInId: string,
    status: CheckIn['status']
  ): Promise<ApiResponse<CheckIn>> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setIsLoadingCheckIns(true);

      // For now, we'll simulate the update since the API might not have a direct update endpoint
      // In practice, you'd call api.updateCheckIn or similar
      const checkIn = userCheckIns.find((c) => c.id === checkInId);
      if (!checkIn) {
        return { success: false, error: 'Check-in not found' };
      }

      const updatedCheckIn = {
        ...checkIn,
        status,
        updatedAt: new Date().toISOString(),
      };

      // Update local state
      setUserCheckIns((prev) => prev.map((c) => (c.id === checkInId ? updatedCheckIn : c)));

      return { success: true, data: updatedCheckIn };
    } catch (error) {
      console.error('Error updating check-in:', error);
      return { success: false, error: 'Failed to update check-in' };
    } finally {
      setIsLoadingCheckIns(false);
    }
  };

  const acknowledgeCheckIn = async (
    checkInId: string,
    checkInCode: string
  ): Promise<ApiResponse<CheckIn>> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setIsLoadingCheckIns(true);
      const response = await api.acknowledgeCheckIn(user.id, checkInId, checkInCode);

      if (response.success && response.data) {
        // Update local state
        setUserCheckIns((prev) => prev.map((c) => (c.id === checkInId ? response.data! : c)));
      }

      return response;
    } catch (error) {
      console.error('Error acknowledging check-in:', error);
      return { success: false, error: 'Failed to acknowledge check-in' };
    } finally {
      setIsLoadingCheckIns(false);
    }
  };

  const getCheckInById = async (checkInId: string): Promise<CheckIn | null> => {
    // First try to find in local state
    const localCheckIn = userCheckIns.find((c) => c.id === checkInId);
    if (localCheckIn) {
      return localCheckIn;
    }

    // If not found locally, fetch from API
    if (!user?.id) {
      return null;
    }

    try {
      const response = await withTokenRefresh(() => api.getCheckInById(user.id!, checkInId));
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error fetching check-in:', error);
      return null;
    }
  };

  const confirmCheckIn = async (checkInId: string): Promise<ApiResponse<CheckIn>> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setIsLoadingCheckIns(true);
      const response = await withTokenRefresh(() => api.confirmCheckIn(checkInId));

      if (response.success && response.data) {
        // Update local state
        setUserCheckIns((prev) => prev.map((c) => (c.id === checkInId ? response.data! : c)));
      }

      return response;
    } catch (error) {
      console.error('Error confirming check-in:', error);
      return { success: false, error: 'Failed to confirm check-in' };
    } finally {
      setIsLoadingCheckIns(false);
    }
  };

  const deleteCheckIn = async (checkInId: string): Promise<ApiResponse<void>> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setIsLoadingCheckIns(true);

      // Cancel any scheduled alarms for this check-in
      // Since we don't store notification IDs yet, we'll cancel all and reschedule others
      await NotificationService.cancelAllCheckInAlarms();

      const response = await withTokenRefresh(() => api.deleteCheckIn(checkInId));

      if (response.success) {
        // Update local state
        setUserCheckIns((prev) => prev.filter((c) => c.id !== checkInId));

        // Reschedule alarms for remaining check-ins
        const remainingCheckIns = userCheckIns.filter((c) => c.id !== checkInId);
        await NotificationService.rescheduleActiveCheckIns(remainingCheckIns);
      }

      return { success: response.success, error: response.error };
    } catch (error) {
      console.error('Error deleting check-in:', error);
      return { success: false, error: 'Failed to delete check-in' };
    } finally {
      setIsLoadingCheckIns(false);
    }
  };

  // Combined operations
  const refreshAll = async (): Promise<void> => {
    await Promise.all([fetchUserContacts(), fetchUserCheckIns()]);
  };

  // Escalation operations
  const processEscalations = async () => {
    try {
      const response = await withTokenRefresh(() => api.processEscalations());
      return response;
    } catch (error) {
      console.error('Error processing escalations:', error);
      return { success: false, error: 'Failed to process escalations' };
    }
  };

  const value: BackendContextType = {
    isLoadingContacts,
    isLoadingCheckIns,
    userContacts,
    userCheckIns,
    createUserIfNeeded,
    createContact,
    fetchUserContacts,
    deleteContact,
    createCheckIn,
    updateCheckIn,
    fetchUserCheckIns,
    updateCheckInStatus,
    acknowledgeCheckIn,
    getCheckInById,
    confirmCheckIn,
    deleteCheckIn,
    processEscalations,
    refreshAll,
  };

  return <BackendContext.Provider value={value}>{children}</BackendContext.Provider>;
};

export const useBackend = () => {
  const context = useContext(BackendContext);
  if (context === undefined) {
    throw new Error('useBackend must be used within a BackendProvider');
  }
  return context;
};
