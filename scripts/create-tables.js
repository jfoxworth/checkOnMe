#!/usr/bin/env node

/**
 * Script to create DynamoDB tables for the CheckOnMe app
 *
 * Prerequisites:
 * 1. AWS CLI installed and configured
 * 2. Proper IAM permissions for DynamoDB
 *
 * Usage:
 * node scripts/create-tables.js [environment]
 *
 * Example:
 * node scripts/create-tables.js dev
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const environment = process.argv[2] || 'dev';
const region = process.env.AWS_REGION || 'us-east-1';

const tables = [
  {
    name: `checkonme-users-${environment}`,
    keySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    attributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
  },
  {
    name: `checkonme-checkins-${environment}`,
    keySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    attributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: 'UserIndex',
        KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  },
  {
    name: `checkonme-contacts-${environment}`,
    keySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    attributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: 'UserIndex',
        KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  },
  {
    name: `checkonme-plans-${environment}`,
    keySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    attributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
  },
  {
    name: `checkonme-transactions-${environment}`,
    keySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    attributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: 'UserIndex',
        KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  },
];

async function createTable(tableConfig) {
  const { name, keySchema, attributeDefinitions, globalSecondaryIndexes } = tableConfig;

  console.log(`Creating table: ${name}`);

  let command = `aws dynamodb create-table \\
    --table-name ${name} \\
    --key-schema '${JSON.stringify(keySchema)}' \\
    --attribute-definitions '${JSON.stringify(attributeDefinitions)}' \\
    --billing-mode PAY_PER_REQUEST \\
    --region ${region}`;

  if (globalSecondaryIndexes) {
    const gsiConfig = globalSecondaryIndexes.map((gsi) => ({
      ...gsi,
      BillingMode: 'PAY_PER_REQUEST',
    }));
    command += ` \\
    --global-secondary-indexes '${JSON.stringify(gsiConfig)}'`;
  }

  try {
    const { stdout, stderr } = await execAsync(command);
    console.log(`✅ Table ${name} created successfully`);
    if (stdout) console.log(stdout);
  } catch (error) {
    if (error.stderr?.includes('Table already exists')) {
      console.log(`ℹ️  Table ${name} already exists`);
    } else {
      console.error(`❌ Error creating table ${name}:`, error.stderr || error.message);
    }
  }
}

async function createAllTables() {
  console.log(`Creating DynamoDB tables for environment: ${environment}`);
  console.log(`Region: ${region}`);
  console.log('---');

  for (const table of tables) {
    await createTable(table);
    // Add a small delay to avoid throttling
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('---');
  console.log('Table creation process completed!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Update your .env file with the correct table names');
  console.log('2. Run the app to seed initial data');
  console.log('3. Test the DynamoDB connection in the app');
}

if (require.main === module) {
  createAllTables().catch(console.error);
}

module.exports = { createAllTables, createTable };
