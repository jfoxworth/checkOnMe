import { CheckInPlan, User } from './types';
import { api } from './api';
import { createKeys, dynamoService, TABLE_NAMES } from './dynamodb';

// Default check-in purchase options - Individual purchases, not recurring subscriptions
export const DEFAULT_PURCHASE_OPTIONS: Omit<CheckInPlan, 'id' | 'PK' | 'SK'>[] = [
  {
    name: 'Starter Pack',
    description: 'Perfect for new users to try our safety check-in system',
    checkIns: 5,
    price: 0, // Free starter credits
    features: [
      '5 check-ins included',
      'Basic emergency contacts',
      'SMS notifications',
      'Timeline tracking',
    ],
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Value Pack',
    description: 'Great value for occasional check-in needs',
    checkIns: 10,
    price: 5, // $0.50 per check-in
    features: [
      '10 check-ins included',
      'All starter features',
      'Email notifications',
      'Advanced timeline',
      'Location sharing',
      'Priority support',
    ],
    isActive: true,
    sortOrder: 2,
    popular: true, // Mark as popular
  },
  {
    name: 'Power Pack',
    description: 'Best value for frequent check-in activity',
    checkIns: 25,
    price: 10, // $0.40 per check-in
    features: [
      '25 check-ins included',
      'All value features',
      'Real-time GPS tracking',
      'Custom intervals',
      'Emergency escalation',
      '24/7 support',
    ],
    isActive: true,
    sortOrder: 3,
  },
];

// Utility to seed check-in purchase options data
export const seedPurchaseOptions = async (): Promise<void> => {
  console.log('Seeding check-in purchase options...');

  try {
    // Check if purchase options already exist
    const existingOptions = await api.getCheckInPurchaseOptions();

    if (existingOptions.success && existingOptions.data && existingOptions.data.length > 0) {
      console.log('Purchase options already exist, skipping seed');
      return;
    }

    // Create default purchase options with single-table keys
    for (const optionData of DEFAULT_PURCHASE_OPTIONS) {
      const optionId = `option-${optionData.name.toLowerCase().replace(/\s+/g, '-')}`;
      const option: CheckInPlan = {
        ...optionData,
        ...createKeys.plan(optionId),
        id: optionId,
      };

      // Use the DynamoDB service directly since we need to create with specific IDs
      await dynamoService.putItem(TABLE_NAMES.MAIN, option);

      console.log(
        `Created purchase option: ${option.name} (${option.checkIns} check-ins for $${option.price})`
      );
    }

    console.log('Purchase options seeded successfully!');
  } catch (error) {
    console.error('Error seeding purchase options:', error);
  }
};

// Utility to create a sample user for development/testing
export const createSampleUser = async (): Promise<void> => {
  if (process.env.EXPO_PUBLIC_ENVIRONMENT !== 'development') {
    return; // Only run in development
  }

  console.log('Creating sample user for development...');

  try {
    const userId = 'sample-user-123';
    const sampleUser: User = {
      ...createKeys.user(userId),
      id: userId,
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      totalCredits: 5,
      usedCredits: 2,
      availableCredits: 3,
      subscriptionStatus: 'free',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Check if user already exists
    const existingUser = await api.getUserById(userId);
    if (existingUser.success) {
      console.log('Sample user already exists');
      return;
    }

    // Create the user directly in DynamoDB
    await dynamoService.putItem(TABLE_NAMES.MAIN, sampleUser);
    console.log('Sample user created:', sampleUser.email);
  } catch (error) {
    console.error('Error creating sample user:', error);
  }
};

// Utility to run all seed operations
export const runSeedOperations = async (): Promise<void> => {
  console.log('Running seed operations...');

  try {
    await seedPurchaseOptions();
    await createSampleUser();
    console.log('All seed operations completed!');
  } catch (error) {
    console.error('Error running seed operations:', error);
  }
};
