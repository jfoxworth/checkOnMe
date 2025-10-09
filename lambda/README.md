# CheckOnMe Lambda Functions

This directory contains AWS Lambda functions for the CheckOnMe safety application that handle:

1. **Escalation Processing** - Automatically escalates overdue check-ins
2. **SMS Notifications** - Sends text message reminders for check-ins  
3. **Web Verification** - Handles check-in verification via SMS links

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │  Lambda         │    │  DynamoDB       │
│   App           │────│  Functions      │────│  Single Table   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │  Amazon SNS     │
                       │  (SMS/Email)    │
                       └─────────────────┘
```

## 📁 Directory Structure

```
lambda/
├── escalation/              # Escalation processing Lambda
│   ├── handler.js          # Main escalation logic
│   └── package.json        # Dependencies
├── sms-notifications/       # SMS notification Lambda
│   ├── handler.js          # SMS sending logic  
│   ├── verify.js           # Web verification endpoint
│   └── package.json        # Dependencies
├── shared/                  # Shared utilities
│   ├── dynamodb.js         # DynamoDB helpers
│   ├── sns.js              # SNS/SMS helpers
│   └── constants.js        # Constants and config
├── serverless.yml          # Serverless Framework config
├── package.json            # Root dependencies
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

1. **AWS CLI** configured with appropriate permissions
2. **Node.js** 18+ installed
3. **Serverless Framework** installed globally

```bash
npm install -g serverless
```

### Environment Setup

Create a `.env` file in the lambda directory:

```bash
# Required
DYNAMODB_TABLE_NAME=checkonme-dev
AWS_REGION=us-east-1

# Optional
EMAIL_TOPIC_ARN=arn:aws:sns:us-east-1:123456789:email-notifications
JWT_SECRET=your-secure-jwt-secret-here
WEB_VERIFICATION_URL=https://checkonme.app/verify
ENABLE_SMS=true
ENABLE_EMAIL=true
```

### Installation & Deployment

```bash
# Install dependencies
cd lambda
npm install

# Deploy to development
npm run deploy:dev

# Deploy to production
npm run deploy:prod
```

## 🔧 Functions

### 1. Escalation Processing (`processEscalations`)

**Purpose**: Automatically escalates check-ins that are past their deadline

**Trigger**: CloudWatch cron (every 5 minutes)

**Process**:
1. Query GSI1 for check-ins with status='scheduled' and deadline <= now
2. Update status to 'escalated' 
3. Send SMS/email alerts to emergency contacts
4. Update GSI to remove from future queries

**Manual Testing**:
```bash
npm run invoke:escalation
npm run logs:escalation
```

### 2. SMS Notifications (`sendSMSNotifications`)

**Purpose**: Sends scheduled SMS reminders for check-ins

**Trigger**: CloudWatch cron (every 1 minute)

**Process**:
1. Query GSI2 for SMS schedules with status='scheduled' and time <= now
2. Generate secure verification links
3. Send SMS with link and backup code
4. Mark SMS as sent

**Manual Testing**:
```bash
npm run invoke:sms
npm run logs:sms  
```

### 3. Web Verification (`verifySMSCheckIn`)

**Purpose**: Handles check-in verification from SMS links

**Trigger**: HTTP POST to `/verify/{checkInId}`

**Process**:
1. Validate 4-digit code from request
2. Find check-in by ID
3. Mark as acknowledged if code matches
4. Return success/failure response

**Endpoint**: `POST https://api-id.execute-api.region.amazonaws.com/stage/verify/{checkInId}`

**Request**:
```json
{
  "code": "1234"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Check-in verified successfully!"
}
```

## 🔐 Required AWS Permissions

The Lambda functions need these IAM permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:Query",
        "dynamodb:GetItem", 
        "dynamodb:UpdateItem",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:region:account:table/checkonme-*",
        "arn:aws:dynamodb:region:account:table/checkonme-*/index/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "sns:Publish",
      "Resource": "*"
    }
  ]
}
```

## 📊 DynamoDB GSI Requirements

### GSI1 (Escalation Index)
- **Partition Key**: `GSI1PK` (String) - Status ('scheduled', 'acknowledged', 'escalated')  
- **Sort Key**: `GSI1SK` (String) - Escalation deadline (ISO timestamp)
- **Purpose**: Find check-ins needing escalation

### GSI2 (SMS Schedule Index) - Optional for SMS feature
- **Partition Key**: `GSI2PK` (String) - Type ('SMS_SCHEDULE')
- **Sort Key**: `GSI2SK` (String) - Send time (ISO timestamp)  
- **Purpose**: Find SMS notifications to send

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DYNAMODB_TABLE_NAME` | ✅ | - | Main DynamoDB table name |
| `AWS_REGION` | ✅ | us-east-1 | AWS region |
| `EMAIL_TOPIC_ARN` | ❌ | - | SNS topic for email notifications |
| `JWT_SECRET` | ❌ | - | Secret for SMS link tokens |
| `ENABLE_SMS` | ❌ | true | Enable SMS notifications |
| `ENABLE_EMAIL` | ❌ | true | Enable email notifications |

### Deployment Stages

- **dev**: Development environment with debug logging
- **staging**: Pre-production testing environment  
- **prod**: Production environment with optimized settings

## 📝 Monitoring & Logs

### CloudWatch Logs

Each function logs to separate log groups:
- `/aws/lambda/checkonme-lambda-dev-processEscalations`
- `/aws/lambda/checkonme-lambda-dev-sendSMSNotifications`
- `/aws/lambda/checkonme-lambda-dev-verifySMSCheckIn`

### View Logs

```bash
# Real-time logs
npm run logs:escalation
npm run logs:sms
npm run logs:verify

# CloudWatch dashboard
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/checkonme"
```

### Metrics to Monitor

- **Escalation Function**: Number of check-ins processed, notification failures
- **SMS Function**: SMS delivery success rate, invalid phone numbers
- **Verification Function**: Verification success rate, invalid codes

## 🧪 Testing

### Local Testing

```bash
# Test escalation function locally
npm run test:escalation

# Test SMS function locally  
npm run test:sms

# Run offline API Gateway
npm run offline
```

### Integration Testing

1. Create a test check-in in your app
2. Set escalation time to 1 minute in the future
3. Wait for escalation to trigger
4. Check CloudWatch logs for processing

## 🚨 Troubleshooting

### Common Issues

1. **"Table not found"**
   - Verify `DYNAMODB_TABLE_NAME` environment variable
   - Ensure table exists in correct region

2. **"GSI not found"** 
   - Create GSI1 and GSI2 on your DynamoDB table
   - Wait for GSI to become ACTIVE

3. **SMS delivery failures**
   - Verify phone numbers are in E.164 format (+1234567890)
   - Check SNS sending quotas and limits
   - Ensure origination number is configured

4. **Permission denied**
   - Review IAM role permissions
   - Check resource ARNs match your account/region

### Debug Mode

Enable debug logging in development:

```bash
export ENABLE_DEBUG=true
npm run deploy:dev
```

## 🔄 Updates & Maintenance

### Updating Functions

```bash
# Update code and redeploy
npm run deploy:dev

# Update specific function
serverless deploy function -f processEscalations --stage dev
```

### Scaling Considerations

- **Escalation Function**: Runs every 5 minutes, scales based on number of overdue check-ins
- **SMS Function**: Runs every minute, scales based on SMS volume
- **Verification Function**: On-demand, scales based on web traffic

### Cost Optimization

- Monitor Lambda execution duration and memory usage
- Adjust memory allocation based on actual usage
- Consider increasing cron intervals if volume is low

## 📞 Support

For issues or questions:

1. Check CloudWatch logs for error details
2. Review this documentation  
3. Open an issue on the GitHub repository
4. Contact the development team

---

*Last updated: October 8, 2025*