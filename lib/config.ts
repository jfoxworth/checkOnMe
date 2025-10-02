import Constants from 'expo-constants';

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string = ''): string => {
  return process.env[key] || Constants.expoConfig?.extra?.[key] || fallback;
};

export const CONFIG = {
  // AWS Configuration
  AWS: {
    REGION: getEnvVar('EXPO_PUBLIC_AWS_REGION', 'us-east-1'),
    ACCESS_KEY_ID: getEnvVar('EXPO_PUBLIC_AWS_ACCESS_KEY_ID'),
    SECRET_ACCESS_KEY: getEnvVar('EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY'),
  },

  // DynamoDB Table Names
  DYNAMODB: {
    USERS_TABLE: getEnvVar('EXPO_PUBLIC_DYNAMODB_USERS_TABLE', 'checkonme-users'),
    CHECKINS_TABLE: getEnvVar('EXPO_PUBLIC_DYNAMODB_CHECKINS_TABLE', 'checkonme-checkins'),
    CONTACTS_TABLE: getEnvVar('EXPO_PUBLIC_DYNAMODB_CONTACTS_TABLE', 'checkonme-contacts'),
    PLANS_TABLE: getEnvVar('EXPO_PUBLIC_DYNAMODB_PLANS_TABLE', 'checkonme-plans'),
    TRANSACTIONS_TABLE: getEnvVar(
      'EXPO_PUBLIC_DYNAMODB_TRANSACTIONS_TABLE',
      'checkonme-transactions'
    ),
  },

  // API Configuration
  API: {
    BASE_URL: getEnvVar('EXPO_PUBLIC_API_BASE_URL', 'https://api.checkonme.com'),
    TIMEOUT: 30000, // 30 seconds
  },

  // App Configuration
  APP: {
    VERSION: getEnvVar('EXPO_PUBLIC_APP_VERSION', '1.0.0'),
    ENVIRONMENT: getEnvVar('EXPO_PUBLIC_ENVIRONMENT', 'development'),
    ENABLE_ANALYTICS: getEnvVar('EXPO_PUBLIC_ENABLE_ANALYTICS', 'false') === 'true',
  },

  // Payment Configuration
  PAYMENT: {
    STRIPE_PUBLISHABLE_KEY: getEnvVar('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  },

  // Development helpers
  isDevelopment: () => CONFIG.APP.ENVIRONMENT === 'development',
  isProduction: () => CONFIG.APP.ENVIRONMENT === 'production',
};

// Validation function to check required environment variables
export const validateConfig = () => {
  const required = ['EXPO_PUBLIC_AWS_ACCESS_KEY_ID', 'EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY'];

  const missing = required.filter((key) => !getEnvVar(key));

  if (missing.length > 0 && CONFIG.isProduction()) {
    console.warn('Missing required environment variables:', missing);
  }

  return missing.length === 0;
};

// Log configuration (only in development)
if (CONFIG.isDevelopment()) {
  console.log('App Configuration:', {
    environment: CONFIG.APP.ENVIRONMENT,
    region: CONFIG.AWS.REGION,
    tablesConfigured: Object.keys(CONFIG.DYNAMODB).length,
    apiBaseUrl: CONFIG.API.BASE_URL,
  });
}
