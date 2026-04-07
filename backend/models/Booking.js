const mongoose = require('mongoose');
const { BOOKING_STATUSES } = require('../config/constants');

const bookingSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    index: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  peopleCount: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: BOOKING_STATUSES,
    default: 'confirmed',
  },
  notes: { type: String, default: '' },
  source: {
    type: String,
    enum: ['whatsapp', 'dashboard', 'phone'],
    default: 'whatsapp',
  },
}, {
  timestamps: true,
});

// Compound index for querying bookings by tenant + date
bookingSchema.index({ tenantId: 1, date: 1 });
bookingSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
