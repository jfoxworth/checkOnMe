import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import Constants from 'expo-constants';

// AWS Cognito configuration
export const cognitoConfig = {
  UserPoolId: Constants.expoConfig?.extra?.awsCognito?.userPoolId || 'us-east-2_BoQzehOZu',
  ClientId: Constants.expoConfig?.extra?.awsCognito?.clientId || '52stasgak8e6otpr73p9i9018e',
  region: Constants.expoConfig?.extra?.awsCognito?.region || 'us-east-2',
};

// Create Cognito client
export const cognitoClient = new CognitoIdentityProviderClient({
  region: cognitoConfig.region,
});

export const configureCognito = () => {
  console.log('Configuring AWS Cognito with SDK v3...');

  // Debug configuration
  console.log('User Pool ID:', cognitoConfig.UserPoolId);
  console.log('Client ID:', cognitoConfig.ClientId);
  console.log('Region:', cognitoConfig.region);

  // Validate configuration
  if (!cognitoConfig.UserPoolId || !cognitoConfig.ClientId) {
    console.error('Missing AWS Cognito configuration!');
    throw new Error('AWS Cognito configuration is incomplete');
  }

  console.log('AWS Cognito configuration completed successfully');
  return cognitoConfig;
};
