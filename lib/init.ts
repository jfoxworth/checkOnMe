import { CONFIG, validateConfig } from './config';
import { runSeedOperations } from './seed';

// Initialize the app with required data and configuration
export const initializeApp = async (): Promise<void> => {
  console.log('Initializing CheckOnMe app...');

  try {
    // Validate configuration
    const configValid = validateConfig();
    if (!configValid && CONFIG.isProduction()) {
      console.error('App configuration is invalid for production');
      return;
    }

    // In development, seed the database with initial data
    if (CONFIG.isDevelopment()) {
      console.log('Development mode detected, running seed operations...');
      await runSeedOperations();
    }

    console.log('App initialization completed successfully!');
  } catch (error) {
    console.error('Error during app initialization:', error);
  }
};

// Test DynamoDB connection
export const testDynamoDBConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing DynamoDB connection...');

    const { planService } = await import('./api');
    const response = await planService.getAllPlans();

    if (response.success) {
      console.log('✅ DynamoDB connection successful');
      return true;
    } else {
      console.log('❌ DynamoDB connection failed:', response.error);
      return false;
    }
  } catch (error) {
    console.log('❌ DynamoDB connection error:', error);
    return false;
  }
};
