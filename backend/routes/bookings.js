const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/bookings — List bookings (filterable)
 */
router.get('/', async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;

    const filter = { tenantId: req.tenantId };

    if (status) filter.status = status;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ date: -1, time: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
});

/**
 * GET /api/bookings/:id — Get single booking
 */
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch booking.' });
  }
});

/**
 * POST /api/bookings — Create booking from dashboard
 */
router.post('/', async (req, res) => {
  try {
    const { customerName, customerPhone, date, time, peopleCount, notes } = req.body;

    if (!customerName || !date || !time || !peopleCount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customerName, date, time, and peopleCount.',
      });
    }

    const booking = await Booking.create({
      tenantId: req.tenantId,
      customerName,
      customerPhone: customerPhone || '',
      date: new Date(date),
      time,
      peopleCount: parseInt(peopleCount),
      notes: notes || '',
      source: 'dashboard',
      status: 'confirmed',
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create booking.' });
  }
});

/**
 * PATCH /api/bookings/:id — Update booking status
 */
router.patch('/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $set: updates },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    res.json({
      success: true,
      message: 'Booking updated.',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update booking.' });
  }
});

/**
 * DELETE /api/bookings/:id — Delete/cancel booking
 */
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $set: { status: 'cancelled' } },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    res.json({
      success: true,
      message: 'Booking cancelled.',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel booking.' });
  }
});

module.exports = router;
