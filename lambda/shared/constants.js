// Environment constants
const ENVIRONMENTS = {
  DEV: 'dev',
  STAGING: 'staging',
  PROD: 'prod',
};

const CURRENT_ENV = process.env.STAGE || process.env.NODE_ENV || 'dev';

// Table and resource naming
const TABLE_NAMES = {
  MAIN: process.env.DYNAMODB_TABLE_NAME || 'checkonme-main',
};

const GSI_NAMES = {
  ESCALATION: 'GSI1', // For finding check-ins needing escalation
  SMS_SCHEDULE: 'GSI2', // For finding SMS notifications to send
};

// Status constants
const CHECK_IN_STATUSES = {
  SCHEDULED: 'scheduled',
  ACKNOWLEDGED: 'acknowledged',
  ESCALATED: 'escalated',
  CANCELLED: 'cancelled',
};

const SMS_STATUSES = {
  SCHEDULED: 'scheduled',
  SENT: 'sent',
  FAILED: 'failed',
};

// Notification types
const NOTIFICATION_METHODS = {
  ALARM: 'alarm',
  SMS: 'sms',
};

// Timing constants
const TIMING = {
  ESCALATION_CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutes in milliseconds
  SMS_CHECK_INTERVAL: 1 * 60 * 1000, // 1 minute in milliseconds
  DEFAULT_ESCALATION_DELAY: 60 * 60 * 1000, // 1 hour in milliseconds
  MAX_SMS_LENGTH: 160, // Standard SMS length
  RETRY_ATTEMPTS: 3,
};

// Error messages
const ERROR_MESSAGES = {
  INVALID_PHONE: 'Invalid phone number format',
  INVALID_EMAIL: 'Invalid email address format',
  CHECK_IN_NOT_FOUND: 'Check-in not found',
  INVALID_CODE: 'Invalid verification code',
  ALREADY_ACKNOWLEDGED: 'Check-in already acknowledged',
  TOO_LATE: 'Check-in deadline has passed',
  MISSING_CONTACTS: 'No emergency contacts specified',
  RATE_LIMITED: 'Too many requests, please try again later',
};

// Success messages
const SUCCESS_MESSAGES = {
  CHECK_IN_CREATED: 'Check-in created successfully',
  CHECK_IN_ACKNOWLEDGED: 'Check-in verified successfully',
  SMS_SENT: 'SMS notification sent',
  ESCALATION_PROCESSED: 'Escalation processed',
  CONTACTS_NOTIFIED: 'Emergency contacts have been notified',
};

// URLs and endpoints
const URLS = {
  WEB_VERIFICATION: process.env.WEB_VERIFICATION_URL || 'https://checkonme.app/verify',
  API_BASE: process.env.API_BASE_URL || 'https://api.checkonme.app',
  APP_STORE: 'https://apps.apple.com/app/checkonme',
  PLAY_STORE: 'https://play.google.com/store/apps/details?id=com.checkonme',
};

// Feature flags
const FEATURES = {
  SMS_NOTIFICATIONS: process.env.ENABLE_SMS === 'true',
  EMAIL_NOTIFICATIONS: process.env.ENABLE_EMAIL === 'true',
  WEB_VERIFICATION: process.env.ENABLE_WEB_VERIFICATION === 'true',
  ESCALATION_PROCESSING: process.env.ENABLE_ESCALATION === 'true',
  DEBUG_LOGGING: CURRENT_ENV !== 'prod',
};

// AWS service configurations
const AWS_CONFIG = {
  REGION: process.env.AWS_REGION || 'us-east-2',
  SNS_TOPIC_ARN: process.env.SNS_TOPIC_ARN,
  EMAIL_TOPIC_ARN: process.env.EMAIL_TOPIC_ARN,
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-in-production',
};

// Validation patterns
const VALIDATION = {
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  CODE_REGEX: /^\d{4}$/,
  ID_REGEX: /^[a-zA-Z0-9_-]+$/,
};

module.exports = {
  ENVIRONMENTS,
  CURRENT_ENV,
  TABLE_NAMES,
  GSI_NAMES,
  CHECK_IN_STATUSES,
  SMS_STATUSES,
  NOTIFICATION_METHODS,
  TIMING,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  URLS,
  FEATURES,
  AWS_CONFIG,
  VALIDATION,
};
