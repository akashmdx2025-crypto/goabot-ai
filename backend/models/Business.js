const mongoose = require('mongoose');
const { BUSINESS_TYPES, SUBSCRIPTION_PLANS } = require('../config/constants');

const menuItemSchema = new mongoose.Schema({
  category: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  isVeg: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
}, { _id: true });

const timingSchema = new mongoose.Schema({
  open: { type: String, default: '09:00' },
  close: { type: String, default: '23:00' },
  closed: { type: Boolean, default: false },
}, { _id: false });

const businessSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: BUSINESS_TYPES,
    default: 'restaurant',
  },
  description: { type: String, default: '' },
  phone: { type: String, default: '' },

  // WhatsApp Cloud API credentials (per business)
  whatsappPhoneNumberId: { type: String, default: '' },
  whatsappAccessToken: { type: String, default: '' },

  // Gemini AI key (optional per-business override)
  geminiApiKey: { type: String, default: '' },

  // Location
  location: {
    address: { type: String, default: '' },
    googleMapsUrl: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
  },

  // Operating hours
  timings: {
    monday: { type: timingSchema, default: () => ({}) },
    tuesday: { type: timingSchema, default: () => ({}) },
    wednesday: { type: timingSchema, default: () => ({}) },
    thursday: { type: timingSchema, default: () => ({}) },
    friday: { type: timingSchema, default: () => ({}) },
    saturday: { type: timingSchema, default: () => ({}) },
    sunday: { type: timingSchema, default: () => ({}) },
  },

  // Contact info
  contact: {
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    instagram: { type: String, default: '' },
    website: { type: String, default: '' },
  },

  // Menu
  menu: {
    type: { type: String, enum: ['text', 'image', 'pdf'], default: 'text' },
    items: [menuItemSchema],
    pdfUrl: { type: String, default: '' },
    imageUrls: [{ type: String }],
  },

  // Chatbot settings
  chatbotEnabled: { type: Boolean, default: true },
  systemPrompt: { type: String, default: '' },

  // Subscription
  subscription: {
    plan: { type: String, enum: SUBSCRIPTION_PLANS, default: 'basic' },
    validUntil: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  },
}, {
  timestamps: true,
});

// Index for fast lookups
businessSchema.index({ whatsappPhoneNumberId: 1 });

module.exports = mongoose.model('Business', businessSchema);
