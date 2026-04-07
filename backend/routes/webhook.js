const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Business = require('../models/Business');
const Customer = require('../models/Customer');
const Conversation = require('../models/Conversation');
const WhatsAppService = require('../services/whatsapp');
const AIService = require('../services/ai');
const IntentClassifier = require('../services/intentClassifier');
const BookingFlow = require('../services/bookingFlow');
const MenuService = require('../services/menuService');
const { normalizePhone, formatBusinessHours, isBusinessOpen } = require('../utils/helpers');

/**
 * GET /api/webhook — Meta verification handshake
 */
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    return res.status(200).send(challenge);
  }

  console.warn('❌ Webhook verification failed');
  return res.sendStatus(403);
});

/**
 * POST /api/webhook — Receive incoming WhatsApp messages
 */
router.post('/', async (req, res) => {
  // Always respond 200 quickly to Meta
  res.status(200).send('EVENT_RECEIVED');

  try {
    const body = req.body;

    // Validate this is a WhatsApp message event
    if (body.object !== 'whatsapp_business_account') return;

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field !== 'messages') continue;

        const value = change.value;
        const phoneNumberId = value.metadata?.phone_number_id;
        const messages = value.messages || [];

        for (const message of messages) {
          await processMessage(message, phoneNumberId);
        }
      }
    }
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
  }
});

/**
 * Process an individual incoming message
 */
async function processMessage(message, phoneNumberId) {
  // Only handle text messages for now
  if (message.type !== 'text') return;

  const senderPhone = normalizePhone(message.from);
  const text = message.text?.body?.trim();
  if (!text) return;

  console.log(`📩 Message from ${senderPhone}: "${text}"`);

  // Find the business by WhatsApp phone number ID
  let business = await Business.findOne({ whatsappPhoneNumberId: phoneNumberId });

  // Fallback: use default credentials from env
  if (!business) {
    business = await Business.findOne({
      whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    });
  }

  if (!business) {
    console.error(`❌ No business found for phone number ID: ${phoneNumberId}`);
    return;
  }

  // Check if chatbot is enabled
  if (!business.chatbotEnabled) {
    console.log('⏸️ Chatbot disabled for business:', business.name);
    return;
  }

  const accessToken = business.whatsappAccessToken || process.env.WHATSAPP_ACCESS_TOKEN;
  const pnId = business.whatsappPhoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;

  // Mark message as read
  WhatsAppService.markAsRead(message.id, pnId, accessToken);

  // Find or create customer
  let customer = await Customer.findOne({
    tenantId: business.tenantId,
    phone: senderPhone,
  });

  if (!customer) {
    customer = await Customer.create({
      tenantId: business.tenantId,
      phone: senderPhone,
    });
  }

  // Update customer activity
  customer.lastMessageAt = new Date();
  customer.messageCount += 1;

  // Find or create conversation
  let conversation = await Conversation.findOne({
    tenantId: business.tenantId,
    customerPhone: senderPhone,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      tenantId: business.tenantId,
      customerId: customer._id,
      customerPhone: senderPhone,
      messages: [],
    });
  }

  // Add customer message to history
  conversation.messages.push({
    role: 'customer',
    content: text,
    timestamp: new Date(),
  });

  let response;

  // Check if customer is in a multi-step flow
  if (customer.conversationState?.currentFlow === 'booking') {
    response = await BookingFlow.handleStep(customer, text, business);
  } else {
    // Classify intent
    const intent = await IntentClassifier.classify(text, business.geminiApiKey);

    switch (intent) {
      case 'greeting':
        const openStatus = isBusinessOpen(business) ? 'We are currently open!' : 'We are currently closed.';
        response = `Hello! 👋 Welcome to *${business.name}*! ${openStatus}\n\nHow can I help you today? You can:\n📋 Ask for our *menu*\n📅 *Book a table*\n📍 Get our *location*\n⏰ Check our *timings*`;
        break;

      case 'menu':
        const menuDelivery = MenuService.getMenuDelivery(
          business,
          `${process.env.BASE_URL || 'http://localhost:5000'}/uploads`
        );

        if (menuDelivery.type === 'pdf') {
          await WhatsAppService.sendDocumentMessage(
            senderPhone, menuDelivery.url, 'menu.pdf', menuDelivery.caption, pnId, accessToken
          );
          // Save bot response in conversation
          conversation.messages.push({
            role: 'bot',
            content: '[Menu PDF sent]',
            timestamp: new Date(),
          });
          await conversation.save();
          await customer.save();
          return;
        }

        if (menuDelivery.type === 'image') {
          for (const url of menuDelivery.urls) {
            await WhatsAppService.sendImageMessage(
              senderPhone, url, menuDelivery.caption, pnId, accessToken
            );
          }
          conversation.messages.push({
            role: 'bot',
            content: '[Menu images sent]',
            timestamp: new Date(),
          });
          await conversation.save();
          await customer.save();
          return;
        }

        // Text menu
        response = menuDelivery.content;
        break;

      case 'booking':
        // Start booking flow
        customer.conversationState = {
          currentFlow: 'booking',
          step: null,
          data: {},
          updatedAt: new Date(),
        };
        response = await BookingFlow.handleStep(customer, text, business);
        break;

      case 'location':
        response = `📍 *${business.name} — Location*\n\n`;
        response += `${business.location?.address || 'Address not available'}\n\n`;
        if (business.location?.googleMapsUrl) {
          response += `🗺️ Google Maps: ${business.location.googleMapsUrl}`;
        } else {
          response += `_Contact us for directions!_`;
        }
        break;

      case 'timing':
        response = formatBusinessHours(business);
        break;

      case 'contact':
        response = `📞 *${business.name} — Contact*\n\n`;
        response += `📱 Phone: ${business.contact?.phone || business.phone || 'N/A'}\n`;
        response += `📧 Email: ${business.contact?.email || 'N/A'}\n`;
        if (business.contact?.instagram) {
          response += `📸 Instagram: ${business.contact.instagram}\n`;
        }
        if (business.contact?.website) {
          response += `🌐 Website: ${business.contact.website}\n`;
        }
        break;

      default:
        // General — use AI
        response = await AIService.generateResponse(
          business,
          conversation.messages.slice(-10),
          text
        );
        break;
    }
  }

  // Send response
  await WhatsAppService.sendTextMessage(senderPhone, response, pnId, accessToken);

  // Save bot response
  conversation.messages.push({
    role: 'bot',
    content: response,
    timestamp: new Date(),
  });

  await conversation.save();
  await customer.save();
}

module.exports = router;
