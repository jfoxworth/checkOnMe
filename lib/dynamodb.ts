import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';

// Environment configuration
const AWS_CONFIG = {
  region: process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },
};

// Table names - Single table design
export const TABLE_NAMES = {
  MAIN: process.env.EXPO_PUBLIC_DYNAMODB_MAIN_TABLE || 'checkonme-main',
  // GSI for escalation queries
  ESCALATION_GSI: 'EscalationIndex', // PK=status, SK=responseDeadline
};

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient(AWS_CONFIG);
export const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Generic DynamoDB operations
export class DynamoDBService {
  // Get single item by primary key
  async getItem<T>(tableName: string, key: Record<string, any>): Promise<T | null> {
    try {
      const command = new GetCommand({
        TableName: tableName,
        Key: key,
      });

      const response = await docClient.send(command);
      return (response.Item as T) || null;
    } catch (error) {
      console.error('DynamoDB getItem error:', error);
      throw error;
    }
  }

  // Put/Create item
  async putItem<T extends Record<string, any>>(tableName: string, item: T): Promise<T> {
    try {
      const command = new PutCommand({
        TableName: tableName,
        Item: item,
      });

      await docClient.send(command);
      return item;
    } catch (error) {
      console.error('DynamoDB putItem error:', error);
      throw error;
    }
  }

  // Update item
  async updateItem<T>(
    tableName: string,
    key: Record<string, any>,
    updateExpression: string,
    expressionAttributeValues: Record<string, any>,
    expressionAttributeNames?: Record<string, string>
  ): Promise<T> {
    try {
      const command = new UpdateCommand({
        TableName: tableName,
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'ALL_NEW',
      });

      const response = await docClient.send(command);
      return response.Attributes as T;
    } catch (error) {
      console.error('DynamoDB updateItem error:', error);
      throw error;
    }
  }

  // Delete item
  async deleteItem(tableName: string, key: Record<string, any>): Promise<void> {
    try {
      const command = new DeleteCommand({
        TableName: tableName,
        Key: key,
      });

      await docClient.send(command);
    } catch (error) {
      console.error('DynamoDB deleteItem error:', error);
      throw error;
    }
  }

  // Query items
  async queryItems<T>(
    tableName: string,
    keyConditionExpression: string,
    expressionAttributeValues: Record<string, any>,
    expressionAttributeNames?: Record<string, string>,
    indexName?: string,
    limit?: number,
    scanIndexForward?: boolean
  ): Promise<T[]> {
    try {
      const command = new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        IndexName: indexName,
        Limit: limit,
        ScanIndexForward: scanIndexForward,
      });

      const response = await docClient.send(command);
      return (response.Items as T[]) || [];
    } catch (error) {
      console.error('DynamoDB queryItems error:', error);
      throw error;
    }
  }

  // Query GSI - Convenience method for Global Secondary Index queries
  async queryGSI<T>(
    tableName: string,
    indexName: string,
    keyConditionExpression: string,
    expressionAttributeValues: Record<string, any>,
    expressionAttributeNames?: Record<string, string>,
    limit?: number,
    scanIndexForward?: boolean
  ): Promise<T[]> {
    return this.queryItems<T>(
      tableName,
      keyConditionExpression,
      expressionAttributeValues,
      expressionAttributeNames,
      indexName,
      limit,
      scanIndexForward
    );
  }

  // Scan items (use sparingly for small tables)
  async scanItems<T>(
    tableName: string,
    filterExpression?: string,
    expressionAttributeValues?: Record<string, any>,
    expressionAttributeNames?: Record<string, string>,
    limit?: number
  ): Promise<T[]> {
    try {
      const command = new ScanCommand({
        TableName: tableName,
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        Limit: limit,
      });

      const response = await docClient.send(command);
      return (response.Items as T[]) || [];
    } catch (error) {
      console.error('DynamoDB scanItems error:', error);
      throw error;
    }
  }

  // Batch operations can be added here as needed
  // For example: batchGetItems, batchWriteItems, etc.
}

// Export singleton instance
export const dynamoService = new DynamoDBService();

// Single-table design key utilities
export const createKeys = {
  user: (userId: string) => ({ PK: `USER#${userId}`, SK: 'PROFILE' }),
  checkIn: (userId: string, checkInId: string) => ({
    PK: `USER#${userId}`,
    SK: `CHECKIN#${checkInId}`,
  }),
  contact: (userId: string, contactId: string) => ({
    PK: `USER#${userId}`,
    SK: `CONTACT#${contactId}`,
  }),
  plan: (planId: string) => ({ PK: `PLAN#${planId}`, SK: 'DETAILS' }),
  transaction: (userId: string, transactionId: string) => ({
    PK: `USER#${userId}`,
    SK: `TRANSACTION#${transactionId}`,
  }),
};

// Query patterns for single table
export const queryPatterns = {
  userProfile: (userId: string) => ({
    TableName: TABLE_NAMES.MAIN,
    KeyConditionExpression: 'PK = :pk AND SK = :sk',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'PROFILE',
    },
  }),

  userCheckIns: (userId: string) => ({
    TableName: TABLE_NAMES.MAIN,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'CHECKIN#',
    },
  }),

  userContacts: (userId: string) => ({
    TableName: TABLE_NAMES.MAIN,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'CONTACT#',
    },
  }),

  userTransactions: (userId: string) => ({
    TableName: TABLE_NAMES.MAIN,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'TRANSACTION#',
    },
  }),

  allPlans: () => ({
    TableName: TABLE_NAMES.MAIN,
    IndexName: undefined, // Use main table scan with filter
    FilterExpression: 'begins_with(PK, :pk) AND SK = :sk',
    ExpressionAttributeValues: {
      ':pk': 'PLAN#',
      ':sk': 'DETAILS',
    },
  }),

  // Critical query for escalation - uses GSI
  unacknowledgedCheckIns: (beforeTimestamp: string) => ({
    TableName: TABLE_NAMES.MAIN,
    IndexName: TABLE_NAMES.ESCALATION_GSI,
    KeyConditionExpression: '#status = :status AND responseDeadline < :deadline',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': 'scheduled',
      ':deadline': beforeTimestamp,
    },
  }),
};
