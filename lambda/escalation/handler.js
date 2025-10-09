const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;
const GSI_NAME = 'GSI1'; // Your existing GSI

exports.processEscalations = async (event, context) => {
  console.log('🚨 Starting escalation processing...');

  try {
    const now = new Date().toISOString();
    let processedCount = 0;
    const escalatedCheckIns = [];

    // Query GSI for check-ins that need escalation
    const params = {
      TableName: TABLE_NAME,
      IndexName: GSI_NAME,
      KeyConditionExpression: 'GSI1PK = :status AND GSI1SK <= :now',
      ExpressionAttributeValues: {
        ':status': 'scheduled',
        ':now': now,
      },
    };

    console.log('🔍 Querying for overdue check-ins:', params);
    const result = await dynamodb.query(params).promise();

    console.log(`📊 Found ${result.Items.length} check-ins needing escalation`);

    // Process each overdue check-in
    for (const checkIn of result.Items) {
      try {
        console.log(`⚠️ Escalating check-in: ${checkIn.id} - ${checkIn.title}`);

        // Update the check-in status to 'escalated'
        await updateCheckInStatus(checkIn.PK, checkIn.SK, 'escalated');

        // Send notifications to emergency contacts
        await notifyEmergencyContacts(checkIn);

        escalatedCheckIns.push({
          id: checkIn.id,
          title: checkIn.title,
          scheduledTime: checkIn.scheduledTime,
          escalationTime: checkIn.GSI1SK,
          userId: checkIn.userId,
        });

        processedCount++;
      } catch (error) {
        console.error(`❌ Failed to escalate check-in ${checkIn.id}:`, error);
      }
    }

    console.log(`✅ Escalation processing complete. Processed: ${processedCount}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        processed: processedCount,
        escalated: escalatedCheckIns,
        timestamp: now,
      }),
    };
  } catch (error) {
    console.error('❌ Escalation processing failed:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};

async function updateCheckInStatus(PK, SK, status) {
  const updateParams = {
    TableName: TABLE_NAME,
    Key: { PK, SK },
    UpdateExpression:
      'SET #status = :status, GSI1PK = :gsiPK, escalatedAt = :now, updatedAt = :now',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': status,
      ':gsiPK': 'escalated', // Remove from future escalation queries
      ':now': new Date().toISOString(),
    },
  };

  await dynamodb.update(updateParams).promise();
  console.log(`📝 Updated check-in status to: ${status}`);
}

async function notifyEmergencyContacts(checkIn) {
  const { title, scheduledTime, customContacts = [], contacts = [], userId } = checkIn;

  const message = `🚨 SAFETY ALERT: ${userId} failed to check in for "${title}" scheduled at ${new Date(scheduledTime).toLocaleString()}. They may need assistance. This is an automated message from CheckOnMe safety app.`;

  // Notify custom contacts
  for (const contact of customContacts) {
    if (contact.phone) {
      await sendSMS(contact.phone, message);
    }
    if (contact.email) {
      await sendEmail(contact.email, `Safety Alert: Check-in Missed`, message);
    }
  }

  // Notify selected contacts (you'd need to fetch these from the contacts table)
  for (const contactId of contacts) {
    try {
      const contactData = await getContactById(contactId, userId);
      if (contactData && contactData.phoneNumber) {
        await sendSMS(contactData.phoneNumber, message);
      }
      if (contactData && contactData.email) {
        await sendEmail(contactData.email, `Safety Alert: Check-in Missed`, message);
      }
    } catch (error) {
      console.error(`Failed to notify contact ${contactId}:`, error);
    }
  }
}

async function sendSMS(phoneNumber, message) {
  try {
    const params = {
      PhoneNumber: phoneNumber,
      Message: message,
    };

    await sns.publish(params).promise();
    console.log(`📱 SMS sent to: ${phoneNumber}`);
  } catch (error) {
    console.error(`Failed to send SMS to ${phoneNumber}:`, error);
  }
}

async function sendEmail(email, subject, message) {
  try {
    const params = {
      TopicArn: process.env.EMAIL_TOPIC_ARN, // You'd set up an SNS topic for emails
      Subject: subject,
      Message: message,
      MessageAttributes: {
        email: {
          DataType: 'String',
          StringValue: email,
        },
      },
    };

    await sns.publish(params).promise();
    console.log(`📧 Email sent to: ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
  }
}

async function getContactById(contactId, userId) {
  try {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `CONTACT#${contactId}`,
      },
    };

    const result = await dynamodb.get(params).promise();
    return result.Item;
  } catch (error) {
    console.error(`Failed to get contact ${contactId}:`, error);
    return null;
  }
}
