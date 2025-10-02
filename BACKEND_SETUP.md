# CheckOnMe App - Backend Integration Setup

This document explains how to set up the DynamoDB backend integration for the CheckOnMe safety check-in app.

## 🗂️ Backend Architecture

The app uses AWS DynamoDB for data storage with the following structure:

### Tables

1. **Users Table** (`checkonme-users`)

   - Primary Key: `id` (String)
   - Attributes: email, firstName, lastName, phoneNumber, credits, etc.

2. **CheckIns Table** (`checkonme-checkins`)

   - Primary Key: `id` (String)
   - GSI: `userId` (for querying user's check-ins)
   - Attributes: title, status, scheduledTime, location, etc.

3. **Contacts Table** (`checkonme-contacts`)

   - Primary Key: `id` (String)
   - GSI: `userId` (for querying user's contacts)
   - Attributes: firstName, lastName, phoneNumber, relationship, etc.

4. **Plans Table** (`checkonme-plans`)

   - Primary Key: `id` (String)
   - Attributes: name, price, checkIns, features, etc.

5. **Transactions Table** (`checkonme-transactions`)
   - Primary Key: `id` (String)
   - GSI: `userId` (for querying user's transactions)
   - Attributes: amount, status, paymentMethod, etc.

## 🔧 Setup Instructions

### 1. AWS Account Setup

1. Create an AWS account if you don't have one
2. Create an IAM user with DynamoDB permissions
3. Generate access keys for the IAM user

### 2. DynamoDB Tables Creation

You can create the tables using AWS CLI, Console, or the provided scripts:

```bash
# Install AWS CLI
npm install -g aws-cli

# Configure AWS credentials
aws configure

# Create tables (example for users table)
aws dynamodb create-table \
  --table-name checkonme-users-dev \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 3. Environment Configuration

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Update the environment variables:

   ```env
   # AWS Configuration
   EXPO_PUBLIC_AWS_REGION=us-east-1
   EXPO_PUBLIC_AWS_ACCESS_KEY_ID=your_access_key_here
   EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY=your_secret_key_here

   # DynamoDB Table Names
   EXPO_PUBLIC_DYNAMODB_USERS_TABLE=checkonme-users-dev
   EXPO_PUBLIC_DYNAMODB_CHECKINS_TABLE=checkonme-checkins-dev
   EXPO_PUBLIC_DYNAMODB_CONTACTS_TABLE=checkonme-contacts-dev
   EXPO_PUBLIC_DYNAMODB_PLANS_TABLE=checkonme-plans-dev
   EXPO_PUBLIC_DYNAMODB_TRANSACTIONS_TABLE=checkonme-transactions-dev
   ```

### 4. Initialize Data

The app includes seed data that will be automatically created in development mode:

```typescript
import { initializeApp } from '@/lib/init';

// Call this in your app's entry point
await initializeApp();
```

## 📱 API Usage

### Import Services

```typescript
import {
  userService,
  checkInService,
  contactService,
  planService,
  billingService,
} from '@/lib/api';
```

### Example Usage

```typescript
// Get user's check-ins
const checkIns = await checkInService.getUserCheckIns(userId);

// Create a new check-in
const newCheckIn = await checkInService.createCheckIn(userId, {
  title: 'Hiking Trip',
  type: 'hiking',
  scheduledTime: '2024-01-15T14:00:00Z',
  checkInTime: '2024-01-15T18:00:00Z',
  emergencyContacts: ['contact-1', 'contact-2'],
});

// Purchase a plan
const transaction = await billingService.purchasePlan(userId, {
  planId: 'value',
  paymentMethodId: 'pm_1234567890',
});
```

## 🔒 Security Considerations

1. **Never commit AWS credentials** to version control
2. Use **environment variables** for all sensitive data
3. Implement **proper IAM roles** with minimal permissions
4. Consider using **AWS Cognito** for user authentication in production
5. Enable **DynamoDB encryption at rest**
6. Use **VPC endpoints** for enhanced security

## 🚀 Production Deployment

### Environment Separation

Create separate environments:

- Development: `checkonme-*-dev`
- Staging: `checkonme-*-staging`
- Production: `checkonme-*-prod`

### Monitoring

Set up CloudWatch monitoring for:

- DynamoDB read/write capacity
- API error rates
- User activity metrics

### Backup Strategy

Enable:

- Point-in-time recovery for DynamoDB tables
- Cross-region backups for critical data

## 🧪 Testing

### Development Testing

```bash
# Test DynamoDB connection
import { testDynamoDBConnection } from '@/lib/init';
const isConnected = await testDynamoDBConnection();
```

### Mock Data

The app includes comprehensive mock data for development:

- Sample user with credits
- Default check-in plans
- Test payment methods

## 📊 Data Flow

```
User Action → React Native Component → API Service → DynamoDB Service → AWS DynamoDB
```

## 🔄 State Management

Currently using local state. Consider implementing:

- Redux Toolkit for complex state management
- React Query for API data caching
- AsyncStorage for offline data persistence

## 🛠️ Troubleshooting

### Common Issues

1. **AWS Credentials Error**

   - Verify credentials in `.env` file
   - Check IAM permissions

2. **Table Not Found**

   - Ensure tables are created
   - Verify table names in environment variables

3. **Network Timeout**
   - Check internet connection
   - Verify AWS region settings

### Debug Mode

Enable debug logging:

```typescript
// In development
console.log('DynamoDB operation:', result);
```

## 📝 Next Steps

1. **Authentication**: Implement AWS Cognito or custom auth
2. **Payment Processing**: Integrate Stripe or similar payment processor
3. **Push Notifications**: Set up AWS SNS or Firebase
4. **Real-time Updates**: Consider AWS AppSync for real-time features
5. **Analytics**: Add AWS Analytics or custom tracking

## 📚 Resources

- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [React Native Security Best Practices](https://reactnative.dev/docs/security)
