import { CheckInPlan, User } from './types';
import { api } from './api';
import { createKeys, dynamoService, TABLE_NAMES } from './dynamodb';

// Default plans that should be available in the app - Updated for single table
export const DEFAULT_PLANS: Omit<CheckInPlan, 'id' | 'PK' | 'SK'>[] = [
  {
    name: 'Starter Bundle',
    description: 'Perfect for new users to try out our safety check-in system',
    checkIns: 5,
    price: 0,
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
    name: 'Value Bundle',
    description: 'Great value for regular users who check in occasionally',
    checkIns: 10,
    price: 10,
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
    name: 'Power Bundle',
    description: 'Best value for frequent users and heavy check-in activity',
    checkIns: 25,
    price: 20,
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

// Utility to seed plans data
export const seedPlans = async (): Promise<void> => {
  console.log('Seeding default plans...');

  try {
    // Check if plans already exist
    const existingPlans = await api.getAllPlans();
    
    if (existingPlans.success && existingPlans.data && existingPlans.data.length > 0) {
      console.log('Plans already exist, skipping seed');
      return;
    }
    
    // Create default plans with single-table keys
    for (const planData of DEFAULT_PLANS) {
      const planId = `plan-${planData.name.toLowerCase().replace(/\s+/g, '-')}`;
      const plan: CheckInPlan = {
        ...planData,
        ...createKeys.plan(planId),
        id: planId,
      };
      
      // Use the DynamoDB service directly since we need to create with specific IDs
      await dynamoService.putItem(TABLE_NAMES.MAIN, plan);
      
      console.log(`Created plan: ${plan.name}`);
    }
    
    console.log('Plans seeded successfully!');
  } catch (error) {
    console.error('Error seeding plans:', error);
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
    await seedPlans();
    await createSampleUser();
    console.log('All seed operations completed!');
  } catch (error) {
    console.error('Error running seed operations:', error);
  }
};
