const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/business — Get business profile
 */
router.get('/', async (req, res) => {
  try {
    const business = await Business.findOne({ tenantId: req.tenantId });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found.',
      });
    }
    res.json({ success: true, data: business });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch business.' });
  }
});

/**
 * PUT /api/business — Update business profile
 */
router.put('/', async (req, res) => {
  try {
    const allowedFields = [
      'name', 'type', 'description', 'phone',
      'location', 'timings', 'contact',
      'whatsappPhoneNumberId', 'whatsappAccessToken',
      'geminiApiKey', 'systemPrompt',
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const business = await Business.findOneAndUpdate(
      { tenantId: req.tenantId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found.',
      });
    }

    res.json({
      success: true,
      message: 'Business updated successfully.',
      data: business,
    });
  } catch (error) {
    console.error('❌ Business update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update business.' });
  }
});

/**
 * PATCH /api/business/chatbot-toggle — Toggle chatbot ON/OFF
 */
router.patch('/chatbot-toggle', async (req, res) => {
  try {
    const business = await Business.findOne({ tenantId: req.tenantId });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    business.chatbotEnabled = !business.chatbotEnabled;
    await business.save();

    res.json({
      success: true,
      message: `Chatbot ${business.chatbotEnabled ? 'enabled' : 'disabled'}.`,
      data: { chatbotEnabled: business.chatbotEnabled },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle chatbot.' });
  }
});

/**
 * GET /api/business/stats — Get dashboard stats
 */
router.get('/stats', async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const Customer = require('../models/Customer');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalBookings, todayBookings, totalCustomers, activeBookings] = await Promise.all([
      Booking.countDocuments({ tenantId: req.tenantId }),
      Booking.countDocuments({
        tenantId: req.tenantId,
        date: { $gte: today, $lt: tomorrow },
      }),
      Customer.countDocuments({ tenantId: req.tenantId }),
      Booking.countDocuments({
        tenantId: req.tenantId,
        status: { $in: ['pending', 'confirmed'] },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalBookings,
        todayBookings,
        totalCustomers,
        activeBookings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get stats.' });
  }
});

module.exports = router;
