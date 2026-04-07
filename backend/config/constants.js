// Intent keywords for fast-path classification
const INTENT_KEYWORDS = {
  menu: ['menu', 'food', 'dishes', 'eat', 'order', 'what do you serve', 'items', 'cuisine', 'veg', 'non-veg', 'starter', 'dessert', 'drink', 'beverage', 'snack'],
  booking: ['book', 'reserve', 'reservation', 'table', 'seat', 'booking'],
  location: ['where', 'location', 'address', 'directions', 'map', 'find you', 'how to reach', 'route'],
  timing: ['time', 'open', 'close', 'hours', 'timing', 'schedule', 'when', 'working hours', 'available'],
  contact: ['contact', 'call', 'phone', 'number', 'email', 'reach', 'whatsapp number'],
  greeting: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'good afternoon', 'hola', 'namaste'],
};

// Booking flow steps
const BOOKING_STEPS = {
  ASK_NAME: 'ask_name',
  ASK_DATE: 'ask_date',
  ASK_TIME: 'ask_time',
  ASK_PEOPLE: 'ask_people',
  CONFIRM: 'confirm',
};

// Default system prompt for AI
const DEFAULT_SYSTEM_PROMPT = `You are a polite and professional restaurant assistant. Your job is to help customers with menu queries, bookings, timings, and general questions. Always respond in a friendly and helpful tone. Keep answers short and clear. Do not make up information - only use the provided business context.`;

// WhatsApp API base URL
const WHATSAPP_API_BASE = 'https://graph.facebook.com/v21.0';

// Supported business types
const BUSINESS_TYPES = ['restaurant', 'homestay', 'cafe', 'shack', 'bar', 'resort'];

// Subscription plans
const SUBSCRIPTION_PLANS = ['basic', 'pro', 'premium'];

// Booking statuses
const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'];

module.exports = {
  INTENT_KEYWORDS,
  BOOKING_STEPS,
  DEFAULT_SYSTEM_PROMPT,
  WHATSAPP_API_BASE,
  BUSINESS_TYPES,
  SUBSCRIPTION_PLANS,
  BOOKING_STATUSES,
};
