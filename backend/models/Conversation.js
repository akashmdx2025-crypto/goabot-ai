const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['customer', 'bot'],
    required: true,
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    index: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  customerPhone: { type: String, required: true },
  messages: [messageSchema],
}, {
  timestamps: true,
});

// Index for lookups
conversationSchema.index({ tenantId: 1, customerPhone: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
