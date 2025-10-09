const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

exports.sendScheduledSMS = async (event, context) => {
  console.log('📱 Starting SMS notification processing...');
  
  try {
    const now = new Date().toISOString();
    let sentCount = 0;
    const sentNotifications = [];

    // Query for SMS notifications that need to be sent
    // Note: You'll need to create SMS schedule items when users create check-ins with SMS method
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI2', // You might need a second GSI for SMS scheduling
      KeyConditionExpression: 'GSI2PK = :type AND GSI2SK <= :now',
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':type': 'SMS_SCHEDULE',
        ':now': now,
        ':status': 'scheduled'
      }
    };

    console.log('🔍 Querying for scheduled SMS notifications:', params);
    
    try {
      const result = await dynamodb.query(params).promise();
      console.log(`📊 Found ${result.Items.length} SMS notifications to send`);

      // Process each scheduled SMS
      for (const smsSchedule of result.Items) {
        try {
          console.log(`📤 Sending SMS for check-in: ${smsSchedule.checkInId}`);
          
          // Get the full check-in data
          const checkIn = await getCheckInById(smsSchedule.checkInId, smsSchedule.userId);
          if (!checkIn) {
            console.warn(`Check-in ${smsSchedule.checkInId} not found, skipping`);
            continue;
          }

          // Generate verification link
          const verificationLink = `https://checkonme.app/verify/${checkIn.id}?token=${generateSecureToken(checkIn)}`;
          
          // Create SMS message
          const message = `🚨 CheckOnMe Safety Alert: Time to check in for "${checkIn.title}". 

Click to verify: ${verificationLink}

Or open the CheckOnMe app and enter your 4-digit code: ${checkIn.checkInCode}

Deadline: ${new Date(checkIn.escalationTime || checkIn.GSI1SK).toLocaleString()}`;

          // Send SMS to user
          await sendSMS(smsSchedule.userPhone, message);
          
          // Mark SMS as sent
          await markSMSAsSent(smsSchedule.PK, smsSchedule.SK);
          
          sentNotifications.push({
            checkInId: smsSchedule.checkInId,
            title: checkIn.title,
            sentAt: now,
            phone: smsSchedule.userPhone
          });
          
          sentCount++;
          
        } catch (error) {
          console.error(`❌ Failed to send SMS for ${smsSchedule.checkInId}:`, error);
        }
      }
    } catch (queryError) {
      console.warn('⚠️ GSI2 query failed (might not exist yet):', queryError.message);
      console.log('💡 To enable SMS notifications, you need to:');
      console.log('1. Create a GSI2 on your DynamoDB table');
      console.log('2. Update your app to create SMS_SCHEDULE items when users choose SMS notifications');
    }

    console.log(`✅ SMS processing complete. Sent: ${sentCount}`);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        sent: sentCount,
        notifications: sentNotifications,
        timestamp: now
      })
    };

  } catch (error) {
    console.error('❌ SMS processing failed:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

async function getCheckInById(checkInId, userId) {
  try {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `CHECKIN#${checkInId}`
      }
    };
    
    const result = await dynamodb.get(params).promise();
    return result.Item;
  } catch (error) {
    console.error(`Failed to get check-in ${checkInId}:`, error);
    return null;
  }
}

async function sendSMS(phoneNumber, message) {
  try {
    const params = {
      PhoneNumber: phoneNumber,
      Message: message
    };
    
    const result = await sns.publish(params).promise();
    console.log(`📱 SMS sent to: ${phoneNumber}, MessageId: ${result.MessageId}`);
    return result;
  } catch (error) {
    console.error(`Failed to send SMS to ${phoneNumber}:`, error);
    throw error;
  }
}

async function markSMSAsSent(PK, SK) {
  const updateParams = {
    TableName: TABLE_NAME,
    Key: { PK, SK },
    UpdateExpression: 'SET #status = :status, sentAt = :now',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': 'sent',
      ':now': new Date().toISOString()
    }
  };

  await dynamodb.update(updateParams).promise();
  console.log(`📝 Marked SMS as sent`);
}

function generateSecureToken(checkIn) {
  // Generate a secure token for the verification link
  const crypto = require('crypto');
  const payload = `${checkIn.id}:${checkIn.checkInCode}:${checkIn.scheduledTime}`;
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
    .substring(0, 16); // Use first 16 characters
}