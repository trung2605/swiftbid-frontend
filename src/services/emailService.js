// Service for handling email functionality
// Uses EmailJS for client-side email sending

import emailjs from '@emailjs/browser';
import { personalInfo } from '../data';
import emailConfig from '../config/emailConfig';

class EmailService {
  constructor() {
    this.serviceId = emailConfig.serviceId;
    this.templateId = emailConfig.templateId;
    this.publicKey = emailConfig.publicKey;
    
    console.log('EmailJS Service Initialized with Config:', {
      serviceId: this.serviceId,
      templateId: this.templateId,
      publicKey: this.publicKey ? `${this.publicKey.substring(0, 5)}...` : 'undefined'
    });

    if (this.publicKey) {
      emailjs.init(this.publicKey);
      console.log('EmailJS initialized successfully');
    } else {
      console.error('EmailJS initialization failed: publicKey is missing');
    }
  }

  async sendContactEmail(formData) {
    try {
      if (!this.serviceId || !this.templateId || !this.publicKey) {
        throw new Error('EmailJS configuration is missing. Please check environment variables.');
      }

      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject || 'Liên hệ từ website portfolio',
        message: formData.message,
        to_name: personalInfo.name,
        to_email: personalInfo.contact.email,
        reply_to: formData.email,
      };

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );

      if (response.status === 200) {
        return {
          success: true,
          message: 'Email sent successfully!',
          data: response
        };
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send email. Please try again.',
        error: error
      };
    }
  }

  /**
   * Send newsletter subscription confirmation
   * @param {string} email - Subscriber email
   * @returns {Promise} EmailJS response
   */
  async sendSubscriptionConfirmation(email) {
    try {
      if (!this.serviceId || !this.publicKey) {
        throw new Error('EmailJS configuration is missing.');
      }

      const templateParams = {
        to_email: email,
        subscriber_email: email,
        confirmation_message: 'Thank you for subscribing to our newsletter!',
      };

      // Use a different template for subscription confirmation
      const subscriptionTemplateId = process.env.REACT_APP_EMAILJS_SUBSCRIPTION_TEMPLATE_ID || this.templateId;

      const response = await emailjs.send(
        this.serviceId,
        subscriptionTemplateId,
        templateParams
      );

      if (response.status === 200) {
        return {
          success: true,
          message: 'Subscription confirmation sent!',
          data: response
        };
      } else {
        throw new Error('Failed to send confirmation email');
      }
    } catch (error) {
      console.error('Subscription confirmation error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send confirmation email.',
        error: error
      };
    }
  }

  /**
   * Validate email configuration
   * @returns {boolean} Whether EmailJS is properly configured
   */
  isConfigured() {
    return !!(this.serviceId && this.templateId && this.publicKey);
  }

  /**
   * Get configuration status
   * @returns {Object} Configuration status details
   */
  getConfigStatus() {
    return {
      serviceId: !!this.serviceId,
      templateId: !!this.templateId,
      publicKey: !!this.publicKey,
      isConfigured: this.isConfigured(),
    };
  }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;

// Named exports for convenience
export const sendContactEmail = (formData) => emailService.sendContactEmail(formData);
export const sendSubscriptionConfirmation = (email) => emailService.sendSubscriptionConfirmation(email);
export const isEmailConfigured = () => emailService.isConfigured();
export const getEmailConfigStatus = () => emailService.getConfigStatus();