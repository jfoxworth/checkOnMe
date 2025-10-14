const AWS = require('aws-sdk');

// Initialize SNS client
const sns = new AWS.SNS({
  region: process.env.AWS_REGION || 'us-east-2',
});

/**
 * SMS messaging utilities
 */
const smsHelpers = {
  async sendSMS(phoneNumber, message, subject = null) {
    try {
      // Format phone number
      const formattedPhone = formatPhoneNumber(phoneNumber);

      const params = {
        PhoneNumber: formattedPhone,
        Message: message,
      };

      // Add subject for long messages
      if (subject) {
        params.Subject = subject;
      }

      const result = await sns.publish(params).promise();

      console.log(`📱 SMS sent successfully to ${formattedPhone}:`, {
        messageId: result.MessageId,
        subject: subject || 'N/A',
      });

      return {
        success: true,
        messageId: result.MessageId,
        phone: formattedPhone,
      };
    } catch (error) {
      console.error(`❌ Failed to send SMS to ${phoneNumber}:`, error);

      return {
        success: false,
        error: error.message,
        phone: phoneNumber,
      };
    }
  },

  async sendEmail(email, subject, message, topicArn = null) {
    try {
      const params = {
        Message: message,
        Subject: subject,
      };

      // If we have a topic ARN for email, use it
      if (topicArn) {
        params.TopicArn = topicArn;
        params.MessageAttributes = {
          email: {
            DataType: 'String',
            StringValue: email,
          },
        };
      } else {
        // Direct email (requires SES setup)
        params.TargetArn = `arn:aws:ses:${process.env.AWS_REGION || 'us-east-2'}:${process.env.AWS_ACCOUNT_ID}:identity/${email}`;
      }

      const result = await sns.publish(params).promise();

      console.log(`📧 Email sent successfully to ${email}:`, {
        messageId: result.MessageId,
        subject: subject,
      });

      return {
        success: true,
        messageId: result.MessageId,
        email: email,
      };
    } catch (error) {
      console.error(`❌ Failed to send email to ${email}:`, error);

      return {
        success: false,
        error: error.message,
        email: email,
      };
    }
  },

  async sendBulkSMS(phoneNumbers, message) {
    const results = [];

    for (const phone of phoneNumbers) {
      const result = await this.sendSMS(phone, message);
      results.push(result);
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`📊 Bulk SMS results: ${successful} successful, ${failed} failed`);

    return {
      successful,
      failed,
      results,
    };
  },
};

/**
 * Message templates for different scenarios
 */
const messageTemplates = {
  checkInReminder(checkInTitle, verificationLink, code, deadline) {
    return `🚨 CheckOnMe Safety Alert: Time to check in for "${checkInTitle}".

Click to verify: ${verificationLink}

Or open the CheckOnMe app and enter code: ${code}

Deadline: ${new Date(deadline).toLocaleString()}`;
  },

  escalationAlert(userName, checkInTitle, scheduledTime) {
    return `🚨 SAFETY ALERT: ${userName} failed to check in for "${checkInTitle}" scheduled at ${new Date(scheduledTime).toLocaleString()}. They may need assistance. This is an automated message from CheckOnMe safety app.`;
  },

  checkInConfirmed(checkInTitle) {
    return `✅ Safety confirmed: Check-in for "${checkInTitle}" has been successfully verified. Emergency contacts will not be notified.`;
  },

  welcomeMessage(userName) {
    return `👋 Welcome to CheckOnMe, ${userName}! Your safety app is now set up. You can create check-ins to automatically notify emergency contacts if you don't check in on time.`;
  },
};

/**
 * Utility functions for phone number formatting
 */
function formatPhoneNumber(phone) {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');

  // Add +1 if it's a 10-digit US number
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  // Add + if it doesn't have one and it's longer than 10 digits
  if (cleaned.length > 10 && !phone.startsWith('+')) {
    return `+${cleaned}`;
  }

  // Return as-is if it already has + or is in an unexpected format
  return phone.startsWith('+') ? phone : `+${cleaned}`;
}

module.exports = {
  sns,
  smsHelpers,
  messageTemplates,
  formatPhoneNumber,
};
