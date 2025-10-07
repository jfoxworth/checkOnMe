import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { User, UserUsage, CheckIn, Contact, CheckInPlan } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';

// Types for our context state
interface UserDataState {
  // Core user data
  user: User | null;
  userUsage: UserUsage | null;
  checkIns: CheckIn[];
  contacts: Contact[];
  purchaseOptions: CheckInPlan[];

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;

  // Error states
  error: string | null;

  // Current user ID
  currentUserId: string | null;
}

// Actions for updating state
type UserDataAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER_ID'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_USER_USAGE'; payload: UserUsage | null }
  | { type: 'SET_CHECKINS'; payload: CheckIn[] }
  | { type: 'SET_CONTACTS'; payload: Contact[] }
  | { type: 'SET_PURCHASE_OPTIONS'; payload: CheckInPlan[] }
  | { type: 'ADD_CHECKIN'; payload: CheckIn }
  | { type: 'UPDATE_CHECKIN'; payload: CheckIn }
  | { type: 'ADD_CONTACT'; payload: Contact }
  | { type: 'UPDATE_USER_CREDITS'; payload: { usedCredits: number; availableCredits: number } }
  | { type: 'CLEAR_ALL_DATA' };

// Context interface
interface UserDataContextType {
  state: UserDataState;

  // Main operations
  initializeUserData: (userId: string) => Promise<void>;
  refreshAllData: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  refreshCheckIns: () => Promise<void>;
  refreshContacts: () => Promise<void>;
  refreshPurchaseOptions: () => Promise<void>;

  // Update operations (called after successful API calls)
  updateUserAfterPurchase: (newCredits: number) => void;
  addNewCheckIn: (checkIn: CheckIn) => void;
  updateCheckInStatus: (
    checkInId: string,
    status: CheckIn['status'],
    additionalData?: Partial<CheckIn>
  ) => void;
  addNewContact: (contact: Contact) => void;

  // Utilities
  clearUserData: () => void;
  getCurrentUserId: () => string | null;
}

// Initial state
const initialState: UserDataState = {
  user: null,
  userUsage: null,
  checkIns: [],
  contacts: [],
  purchaseOptions: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  currentUserId: null,
};

// Reducer for managing state updates
const userDataReducer = (state: UserDataState, action: UserDataAction): UserDataState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_REFRESHING':
      return { ...state, isRefreshing: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, isRefreshing: false };

    case 'SET_USER_ID':
      return { ...state, currentUserId: action.payload };

    case 'SET_USER':
      return { ...state, user: action.payload, error: null };

    case 'SET_USER_USAGE':
      return { ...state, userUsage: action.payload };

    case 'SET_CHECKINS':
      return { ...state, checkIns: action.payload };

    case 'SET_CONTACTS':
      return { ...state, contacts: action.payload };

    case 'SET_PURCHASE_OPTIONS':
      return { ...state, purchaseOptions: action.payload };

    case 'ADD_CHECKIN':
      return {
        ...state,
        checkIns: [action.payload, ...state.checkIns].sort(
          (a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
        ),
      };

    case 'UPDATE_CHECKIN':
      return {
        ...state,
        checkIns: state.checkIns.map((checkIn) =>
          checkIn.id === action.payload.id ? action.payload : checkIn
        ),
      };

    case 'ADD_CONTACT':
      return { ...state, contacts: [...state.contacts, action.payload] };

    case 'UPDATE_USER_CREDITS':
      if (!state.user) return state;
      const updatedUser = {
        ...state.user,
        usedCredits: action.payload.usedCredits,
        availableCredits: action.payload.availableCredits,
        updatedAt: new Date().toISOString(),
      };
      const updatedUsage = state.userUsage
        ? {
            ...state.userUsage,
            checkInsUsed: action.payload.usedCredits,
            checkInsRemaining: action.payload.availableCredits,
          }
        : null;

      return {
        ...state,
        user: updatedUser,
        userUsage: updatedUsage,
      };

    case 'CLEAR_ALL_DATA':
      return initialState;

    default:
      return state;
  }
};

// Create context
const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

// Provider component
export const UserDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(userDataReducer, initialState);
  const { user: authUser, isAuthenticated } = useAuth();

  // Auto-initialize user data when authenticated user changes
  useEffect(() => {
    if (isAuthenticated && authUser?.userId) {
      initializeUserData(authUser.userId);
    } else if (!isAuthenticated) {
      // Clear data when user logs out
      dispatch({ type: 'CLEAR_ALL_DATA' });
    }
  }, [isAuthenticated, authUser?.userId]);

  // Initialize user data (call this after login)
  const initializeUserData = async (userId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_USER_ID', payload: userId });

      // Fetch all user data in parallel
      const [userResponse, checkInsResponse, contactsResponse, purchaseOptionsResponse] =
        await Promise.all([
          api.getUserById(userId),
          api.getUserCheckIns(userId),
          api.getUserContacts(userId),
          api.getCheckInPurchaseOptions(),
        ]);

      // Handle user data
      if (userResponse.success && userResponse.data) {
        dispatch({ type: 'SET_USER', payload: userResponse.data });

        // Get user usage
        const usageResponse = await api.getUserUsage(userId);
        if (usageResponse.success && usageResponse.data) {
          dispatch({ type: 'SET_USER_USAGE', payload: usageResponse.data });
        }
      }

      // Handle check-ins
      if (checkInsResponse.success && checkInsResponse.data) {
        dispatch({ type: 'SET_CHECKINS', payload: checkInsResponse.data });
      }

      // Handle contacts
      if (contactsResponse.success && contactsResponse.data) {
        dispatch({ type: 'SET_CONTACTS', payload: contactsResponse.data });
      }

      // Handle purchase options
      if (purchaseOptionsResponse.success && purchaseOptionsResponse.data) {
        dispatch({ type: 'SET_PURCHASE_OPTIONS', payload: purchaseOptionsResponse.data });
      }
    } catch (error) {
      console.error('Error initializing user data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load user data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Refresh all data
  const refreshAllData = async () => {
    if (!state.currentUserId) return;

    try {
      dispatch({ type: 'SET_REFRESHING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await Promise.all([
        refreshUserData(),
        refreshCheckIns(),
        refreshContacts(),
        refreshPurchaseOptions(),
      ]);
    } catch (error) {
      console.error('Error refreshing all data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh data' });
    } finally {
      dispatch({ type: 'SET_REFRESHING', payload: false });
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (!state.currentUserId) return;

    const [userResponse, usageResponse] = await Promise.all([
      api.getUserById(state.currentUserId),
      api.getUserUsage(state.currentUserId),
    ]);

    if (userResponse.success && userResponse.data) {
      dispatch({ type: 'SET_USER', payload: userResponse.data });
    }

    if (usageResponse.success && usageResponse.data) {
      dispatch({ type: 'SET_USER_USAGE', payload: usageResponse.data });
    }
  };

  // Refresh check-ins
  const refreshCheckIns = async () => {
    if (!state.currentUserId) return;

    const response = await api.getUserCheckIns(state.currentUserId);
    if (response.success && response.data) {
      dispatch({ type: 'SET_CHECKINS', payload: response.data });
    }
  };

  // Refresh contacts
  const refreshContacts = async () => {
    if (!state.currentUserId) return;

    const response = await api.getUserContacts(state.currentUserId);
    if (response.success && response.data) {
      dispatch({ type: 'SET_CONTACTS', payload: response.data });
    }
  };

  // Refresh purchase options
  const refreshPurchaseOptions = async () => {
    const response = await api.getCheckInPurchaseOptions();
    if (response.success && response.data) {
      dispatch({ type: 'SET_PURCHASE_OPTIONS', payload: response.data });
    }
  };

  // Update user credits after purchase
  const updateUserAfterPurchase = (newCredits: number) => {
    if (!state.user) return;

    dispatch({
      type: 'UPDATE_USER_CREDITS',
      payload: {
        usedCredits: state.user.usedCredits,
        availableCredits: state.user.availableCredits + newCredits,
      },
    });
  };

  // Add new check-in (called after successful creation)
  const addNewCheckIn = (checkIn: CheckIn) => {
    dispatch({ type: 'ADD_CHECKIN', payload: checkIn });

    // Update user credits
    if (state.user) {
      dispatch({
        type: 'UPDATE_USER_CREDITS',
        payload: {
          usedCredits: state.user.usedCredits + 1,
          availableCredits: state.user.availableCredits - 1,
        },
      });
    }
  };

  // Update check-in status (called after acknowledgment/escalation)
  const updateCheckInStatus = (
    checkInId: string,
    status: CheckIn['status'],
    additionalData?: Partial<CheckIn>
  ) => {
    const existingCheckIn = state.checkIns.find((c) => c.id === checkInId);
    if (!existingCheckIn) return;

    const updatedCheckIn = {
      ...existingCheckIn,
      status,
      ...additionalData,
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'UPDATE_CHECKIN', payload: updatedCheckIn });
  };

  // Add new contact (called after successful creation)
  const addNewContact = (contact: Contact) => {
    dispatch({ type: 'ADD_CONTACT', payload: contact });
  };

  // Clear all user data (called on logout)
  const clearUserData = () => {
    dispatch({ type: 'CLEAR_ALL_DATA' });
  };

  // Get current user ID
  const getCurrentUserId = () => state.currentUserId;

  const contextValue: UserDataContextType = {
    state,
    initializeUserData,
    refreshAllData,
    refreshUserData,
    refreshCheckIns,
    refreshContacts,
    refreshPurchaseOptions,
    updateUserAfterPurchase,
    addNewCheckIn,
    updateCheckInStatus,
    addNewContact,
    clearUserData,
    getCurrentUserId,
  };

  return <UserDataContext.Provider value={contextValue}>{children}</UserDataContext.Provider>;
};

// Hook to use the context
export const useUserData = (): UserDataContextType => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};

// Export individual hooks for specific data
export const useUser = () => {
  const { state } = useUserData();
  return state.user;
};

export const useUserUsage = () => {
  const { state } = useUserData();
  return state.userUsage;
};

export const useCheckIns = () => {
  const { state } = useUserData();
  return state.checkIns;
};

export const useContacts = () => {
  const { state } = useUserData();
  return state.contacts;
};

export const usePurchaseOptions = () => {
  const { state } = useUserData();
  return state.purchaseOptions;
};
