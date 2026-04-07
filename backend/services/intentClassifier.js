const { INTENT_KEYWORDS } = require('../config/constants');
const AIService = require('./ai');

class IntentClassifier {
  /**
   * Classify user intent — keyword fast path first, then AI fallback
   */
  static async classify(message, apiKey) {
    const normalized = message.toLowerCase().trim();

    // Fast path: keyword matching
    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      for (const keyword of keywords) {
        if (normalized.includes(keyword)) {
          console.log(`🎯 Intent matched (keyword): ${intent} [keyword: "${keyword}"]`);
          return intent;
        }
      }
    }

    // Slow path: AI classification
    console.log('🤖 No keyword match, using AI classification...');
    const aiIntent = await AIService.classifyIntent(message, apiKey);
    console.log(`🎯 Intent matched (AI): ${aiIntent}`);
    return aiIntent;
  }

  /**
   * Extract booking info from a natural language message
   * e.g., "Table for 3 tonight at 8 PM" → { peopleCount: 3, date: today, time: "20:00" }
   */
  static extractBookingInfo(message) {
    const data = {};
    const normalized = message.toLowerCase();

    // Extract people count
    const peopleMatch = normalized.match(/(?:for|party of|group of|table for)\s*(\d+)/i)
      || normalized.match(/(\d+)\s*(?:people|person|pax|guests)/i);
    if (peopleMatch) {
      data.peopleCount = parseInt(peopleMatch[1], 10);
    }

    // Extract time
    const timeMatch = normalized.match(/(\d{1,2})\s*(?::(\d{2}))?\s*(am|pm)/i)
      || normalized.match(/at\s*(\d{1,2})\s*(?::(\d{2}))?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2] ? timeMatch[2] : '00';
      const period = timeMatch[3]?.toLowerCase();

      if (period === 'pm' && hours < 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;

      data.time = `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    // Extract date keywords
    if (normalized.includes('today') || normalized.includes('tonight')) {
      data.date = new Date().toISOString().split('T')[0];
    } else if (normalized.includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      data.date = tomorrow.toISOString().split('T')[0];
    }

    // Extract name (if present after patterns like "name is" or "I'm")
    const nameMatch = normalized.match(/(?:name is|i'm|i am|this is)\s+([a-zA-Z]+)/i);
    if (nameMatch) {
      data.customerName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
    }

    return data;
  }
}

module.exports = IntentClassifier;
