const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    index: true,
  },
  phone: {
    type: String,
    required: true,
  },
  name: { type: String, default: '' },

  // Conversation state for multi-step flows
  conversationState: {
    currentFlow: {
      type: String,
      enum: [null, 'booking', 'menu', 'review'],
      default: null,
    },
    step: { type: String, default: null },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedAt: { type: Date, default: Date.now },
  },

  lastMessageAt: { type: Date, default: Date.now },
  messageCount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Compound unique index — each phone is unique per tenant
customerSchema.index({ tenantId: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);
