const AWS = require('aws-sdk');

// Initialize DynamoDB client
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

/**
 * Create keys for different entity types in the single table
 */
const createKeys = {
  user: (userId) => ({
    PK: `USER#${userId}`,
    SK: `USER#${userId}`
  }),
  
  checkIn: (userId, checkInId) => ({
    PK: `USER#${userId}`,
    SK: `CHECKIN#${checkInId}`
  }),
  
  contact: (userId, contactId) => ({
    PK: `USER#${userId}`,
    SK: `CONTACT#${contactId}`
  }),
  
  smsSchedule: (scheduledTime, checkInId) => ({
    PK: `SMS_SCHEDULE`,
    SK: `${scheduledTime}#${checkInId}`
  })
};

/**
 * Common DynamoDB operations
 */
const dynamoHelpers = {
  async getItem(keys) {
    const params = {
      TableName: TABLE_NAME,
      Key: keys
    };
    
    const result = await dynamodb.get(params).promise();
    return result.Item;
  },

  async putItem(item) {
    const params = {
      TableName: TABLE_NAME,
      Item: item
    };
    
    await dynamodb.put(params).promise();
    return item;
  },

  async updateItem(keys, updateExpression, expressionAttributeValues, expressionAttributeNames = {}) {
    const params = {
      TableName: TABLE_NAME,
      Key: keys,
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues
    };

    if (Object.keys(expressionAttributeNames).length > 0) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }

    await dynamodb.update(params).promise();
  },

  async queryGSI(indexName, keyCondition, expressionAttributeValues, filterExpression = null, expressionAttributeNames = {}) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: indexName,
      KeyConditionExpression: keyCondition,
      ExpressionAttributeValues: expressionAttributeValues
    };

    if (filterExpression) {
      params.FilterExpression = filterExpression;
    }

    if (Object.keys(expressionAttributeNames).length > 0) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }

    const result = await dynamodb.query(params).promise();
    return result.Items;
  },

  async scanTable(filterExpression, expressionAttributeValues, expressionAttributeNames = {}) {
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: filterExpression,
      ExpressionAttributeValues: expressionAttributeValues
    };

    if (Object.keys(expressionAttributeNames).length > 0) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }

    const result = await dynamodb.scan(params).promise();
    return result.Items;
  }
};

/**
 * Utility functions
 */
const utils = {
  getCurrentTimestamp() {
    return new Date().toISOString();
  },

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  },

  generate4DigitCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  },

  formatPhoneNumber(phone) {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Add +1 if it's a 10-digit US number
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    
    // Add + if it doesn't have one
    if (!phone.startsWith('+')) {
      return `+${cleaned}`;
    }
    
    return phone;
  },

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
  }
};

module.exports = {
  dynamodb,
  createKeys,
  dynamoHelpers,
  utils,
  TABLE_NAME
};