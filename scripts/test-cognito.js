#!/usr/bin/env node

/**
 * AWS Cognito Authentication Test Script
 *
 * This script tests the basic AWS Cognito connection and configuration
 * to help diagnose login issues.
 */

const { Amplify } = require('@aws-amplify/core');
const { signIn, getCurrentUser } = require('@aws-amplify/auth');

// Load environment variables
require('dotenv').config();

// Configure Amplify
const awsConfig = {
  aws_project_region: process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1',
  aws_cognito_region: process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1',
  aws_user_pools_id: process.env.EXPO_PUBLIC_AWS_USER_POOL_ID,
  aws_user_pools_web_client_id: process.env.EXPO_PUBLIC_AWS_USER_POOL_CLIENT_ID,
};

Amplify.configure(awsConfig);

async function testAWSConnection() {
  console.log('🔍 Testing AWS Cognito Configuration...\n');

  // Check environment variables
  console.log('Environment Variables:');
  console.log('- Region:', process.env.EXPO_PUBLIC_AWS_REGION || 'NOT SET');
  console.log('- User Pool ID:', process.env.EXPO_PUBLIC_AWS_USER_POOL_ID ? 'SET' : 'NOT SET');
  console.log('- Client ID:', process.env.EXPO_PUBLIC_AWS_USER_POOL_CLIENT_ID ? 'SET' : 'NOT SET');
  console.log('');

  if (
    !process.env.EXPO_PUBLIC_AWS_USER_POOL_ID ||
    !process.env.EXPO_PUBLIC_AWS_USER_POOL_CLIENT_ID
  ) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  // Test basic connection
  try {
    console.log('🔄 Testing getCurrentUser (should fail if no user logged in)...');
    await getCurrentUser();
    console.log('✅ User is already logged in');
  } catch (error) {
    if (error.name === 'UserUnAuthenticatedException') {
      console.log('✅ No user logged in (expected)');
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }

  // Test with invalid credentials (to verify connection works)
  console.log('\n🔄 Testing signIn with invalid credentials (to verify connection)...');
  try {
    await signIn({
      username: 'test@example.com',
      password: 'wrongpassword',
    });
  } catch (error) {
    if (error.name === 'NotAuthorizedException') {
      console.log('✅ Connection works (got expected auth error)');
    } else if (error.name === 'UserNotFoundException') {
      console.log('✅ Connection works (user not found - expected)');
    } else {
      console.error('❌ Unexpected connection error:', error.name, error.message);
    }
  }

  console.log('\n✅ Basic AWS Cognito configuration test completed!');
  console.log('\nTo test with your actual credentials, run:');
  console.log('node scripts/test-login.js <email> <password>');
}

async function testLogin(email, password) {
  console.log(`🔍 Testing login for: ${email}\n`);

  try {
    const result = await signIn({
      username: email,
      password: password,
    });

    console.log('✅ Login successful!');
    console.log('Result:', JSON.stringify(result, null, 2));

    // Test getCurrentUser
    const user = await getCurrentUser();
    console.log('Current user:', JSON.stringify(user, null, 2));
  } catch (error) {
    console.error('❌ Login failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);

    if (error.name === 'UserNotConfirmedException') {
      console.log(
        '\n💡 User exists but email not confirmed. Check your email for confirmation code.'
      );
    } else if (error.name === 'NotAuthorizedException') {
      console.log('\n💡 Wrong password or user not found.');
    } else if (error.name === 'UserNotFoundException') {
      console.log('\n💡 User does not exist in this User Pool.');
    }
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.length >= 2) {
  const [email, password] = args;
  testLogin(email, password);
} else {
  testAWSConnection();
}
