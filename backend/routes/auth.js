const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');
const authMiddleware = require('../middleware/auth');
const { generateTenantId } = require('../utils/helpers');
const { DEFAULT_SYSTEM_PROMPT } = require('../config/constants');

/**
 * POST /api/auth/register — Register new business + admin user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, businessName, businessType } = req.body;

    // Validate required fields
    if (!email || !password || !name || !businessName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, name, and businessName.',
      });
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Generate tenant ID
    const tenantId = generateTenantId();

    // Create business profile
    const business = await Business.create({
      tenantId,
      name: businessName,
      type: businessType || 'restaurant',
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      chatbotEnabled: true,
      menu: { type: 'text', items: [] },
    });

    // Create admin user
    const user = await User.create({
      tenantId,
      email: email.toLowerCase(),
      passwordHash: password, // Will be hashed by pre-save hook
      name,
      role: 'owner',
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, tenantId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: {
        token,
        user: user.toJSON(),
        business,
      },
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
    });
  }
});

/**
 * POST /api/auth/login — Login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, tenantId: user.tenantId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Get business info
    const business = await Business.findOne({ tenantId: user.tenantId });

    res.json({
      success: true,
      data: {
        token,
        user: user.toJSON(),
        business,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
    });
  }
});

/**
 * GET /api/auth/me — Get current user profile
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const business = await Business.findOne({ tenantId: req.tenantId });
    res.json({
      success: true,
      data: {
        user: req.user.toJSON(),
        business,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get profile.',
    });
  }
});

module.exports = router;
