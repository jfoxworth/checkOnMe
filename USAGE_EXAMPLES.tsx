// Example: How to use the UserDataContext in your components

import React from 'react';
import { View, Text, Button } from 'react-native';
import { 
  useUserData, 
  useUser, 
  useUserUsage, 
  useCheckIns, 
  useContacts, 
  usePurchaseOptions 
} from '@/app/contexts/UserDataContext';
import { api, billingService } from '@/lib/api';

// Example 1: Simple component using individual hooks
export const UserProfile = () => {
  const user = useUser();
  const userUsage = useUserUsage();
  
  if (!user) return <Text>Loading user...</Text>;
  
  return (
    <View>
      <Text>Welcome, {user.firstName} {user.lastName}!</Text>
      <Text>Credits: {userUsage?.checkInsRemaining} remaining</Text>
      <Text>Email: {user.email}</Text>
    </View>
  );
};

// Example 2: Component that updates context after API calls
export const CreateCheckInButton = () => {
  const { addNewCheckIn, getCurrentUserId } = useUserData();
  const user = useUser();
  
  const handleCreateCheckIn = async () => {
    const userId = getCurrentUserId();
    if (!userId || !user) return;
    
    // Call your API
    const response = await api.createCheckIn(userId, {
      scheduledTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      intervalMinutes: 60,
      contacts: ['contact1', 'contact2'],
    });
    
    // Update context immediately after successful API call
    if (response.success && response.data) {
      addNewCheckIn(response.data); // This updates the context instantly!
    }
  };
  
  return (
    <Button
      title={`Create Check-in (${user?.availableCredits} credits left)`}
      onPress={handleCreateCheckIn}
      disabled={!user || user.availableCredits <= 0}
    />
  );
};

// Example 3: Component displaying context data
export const CheckInsList = () => {
  const checkIns = useCheckIns();
  const { refreshCheckIns } = useUserData();
  
  return (
    <View>
      <Button title="Refresh Check-ins" onPress={refreshCheckIns} />
      {checkIns.map(checkIn => (
        <View key={checkIn.id}>
          <Text>Status: {checkIn.status}</Text>
          <Text>Scheduled: {new Date(checkIn.scheduledTime).toLocaleString()}</Text>
          <Text>Code: {checkIn.confirmationCode}</Text>
        </View>
      ))}
    </View>
  );
};

// Example 4: Purchase component that updates user credits
export const PurchaseCredits = () => {
  const { updateUserAfterPurchase } = useUserData();
  const purchaseOptions = usePurchaseOptions();
  const user = useUser();
  
  const handlePurchase = async (option: any) => {
    // Call billing API
    const response = await billingService.purchaseCheckInCredits('user-id', {
      purchaseId: option.id,
      paymentMethodId: 'pm_123'
    });
    
    // Update context after successful purchase
    if (response.success) {
      updateUserAfterPurchase(option.checkIns); // Adds credits to context!
    }
  };
  
  return (
    <View>
      <Text>Current Credits: {user?.availableCredits}</Text>
      {purchaseOptions.map(option => (
        <Button
          key={option.id}
          title={`Buy ${option.checkIns} credits for $${option.price}`}
          onPress={() => handlePurchase(option)}
        />
      ))}
    </View>
  );
};
