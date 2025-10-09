const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const { checkInId } = event.pathParameters;
    const { code } = JSON.parse(event.body || '{}');

    console.log(`🔐 Web verification attempt for check-in: ${checkInId}`);

    if (!code || code.length !== 4) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Please provide a 4-digit verification code',
        }),
      };
    }

    // Get check-in data - we need to find it by scanning since we don't have userId in the URL
    const checkIn = await findCheckInById(checkInId);
    if (!checkIn) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ success: false, error: 'Check-in not found' }),
      };
    }

    // Check if already acknowledged
    if (checkIn.status === 'acknowledged') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Check-in already verified!',
          alreadyVerified: true,
        }),
      };
    }

    // Check if escalated (too late)
    if (checkIn.status === 'escalated') {
      return {
        statusCode: 410,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Check-in deadline has passed and emergency contacts have been notified',
        }),
      };
    }

    // Verify the code
    if (checkIn.checkInCode === code) {
      // Mark as acknowledged
      await acknowledgeCheckIn(checkIn.PK, checkIn.SK);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Check-in verified successfully! Your emergency contacts will not be notified.',
        }),
      };
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid verification code. Please try again.',
        }),
      };
    }
  } catch (error) {
    console.error('❌ Verification error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
    };
  }
};

async function findCheckInById(checkInId) {
  try {
    // Since we don't have userId in the URL, we need to scan for the check-in
    // In production, you might want to add a GSI to make this more efficient
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: 'id = :checkInId AND begins_with(SK, :checkInPrefix)',
      ExpressionAttributeValues: {
        ':checkInId': checkInId,
        ':checkInPrefix': 'CHECKIN#',
      },
    };

    const result = await dynamodb.scan(params).promise();
    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
  } catch (error) {
    console.error(`Failed to find check-in ${checkInId}:`, error);
    return null;
  }
}

async function acknowledgeCheckIn(PK, SK) {
  const updateParams = {
    TableName: TABLE_NAME,
    Key: { PK, SK },
    UpdateExpression:
      'SET #status = :status, GSI1PK = :gsiPK, acknowledgedAt = :now, updatedAt = :now',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': 'acknowledged',
      ':gsiPK': 'acknowledged', // Remove from escalation queries
      ':now': new Date().toISOString(),
    },
  };

  await dynamodb.update(updateParams).promise();
  console.log(`✅ Check-in acknowledged via web verification`);
}
