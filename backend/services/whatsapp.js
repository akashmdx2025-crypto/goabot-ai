const axios = require('axios');
const { WHATSAPP_API_BASE } = require('../config/constants');

class WhatsAppService {
  /**
   * Send a text message via WhatsApp Cloud API
   */
  static async sendTextMessage(to, text, phoneNumberId, accessToken) {
    const url = `${WHATSAPP_API_BASE}/${phoneNumberId}/messages`;
    try {
      const response = await axios.post(url, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { body: text },
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(`📤 Message sent to ${to}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to send WhatsApp message:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Send an image message
   */
  static async sendImageMessage(to, imageUrl, caption, phoneNumberId, accessToken) {
    const url = `${WHATSAPP_API_BASE}/${phoneNumberId}/messages`;
    try {
      const response = await axios.post(url, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'image',
        image: {
          link: imageUrl,
          caption: caption || '',
        },
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(`📤 Image sent to ${to}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to send WhatsApp image:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Send a document (PDF menu, etc.)
   */
  static async sendDocumentMessage(to, documentUrl, filename, caption, phoneNumberId, accessToken) {
    const url = `${WHATSAPP_API_BASE}/${phoneNumberId}/messages`;
    try {
      const response = await axios.post(url, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'document',
        document: {
          link: documentUrl,
          filename: filename || 'menu.pdf',
          caption: caption || '',
        },
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(`📤 Document sent to ${to}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to send WhatsApp document:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Mark a message as read
   */
  static async markAsRead(messageId, phoneNumberId, accessToken) {
    const url = `${WHATSAPP_API_BASE}/${phoneNumberId}/messages`;
    try {
      await axios.post(url, {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Non-critical, don't throw
      console.warn('⚠️ Failed to mark as read:', error.response?.data || error.message);
    }
  }

  /**
   * Send interactive buttons (for confirmations, etc.)
   */
  static async sendButtonMessage(to, bodyText, buttons, phoneNumberId, accessToken) {
    const url = `${WHATSAPP_API_BASE}/${phoneNumberId}/messages`;
    try {
      const response = await axios.post(url, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: bodyText },
          action: {
            buttons: buttons.map((btn, i) => ({
              type: 'reply',
              reply: {
                id: btn.id || `btn_${i}`,
                title: btn.title.substring(0, 20), // Max 20 chars
              },
            })),
          },
        },
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to send button message:', error.response?.data || error.message);
      // Fallback to text message
      return WhatsAppService.sendTextMessage(to, bodyText, phoneNumberId, accessToken);
    }
  }
}

module.exports = WhatsAppService;
