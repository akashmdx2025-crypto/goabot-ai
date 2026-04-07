const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Business = require('../models/Business');
const AIService = require('../services/ai');
const authMiddleware = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `menu-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|webp/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed.'));
  },
});

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/menu — Get menu items
 */
router.get('/', async (req, res) => {
  try {
    const business = await Business.findOne({ tenantId: req.tenantId });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    res.json({
      success: true,
      data: {
        type: business.menu?.type || 'text',
        items: business.menu?.items || [],
        pdfUrl: business.menu?.pdfUrl || '',
        imageUrls: business.menu?.imageUrls || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch menu.' });
  }
});

/**
 * POST /api/menu/items — Add a menu item
 */
router.post('/items', async (req, res) => {
  try {
    const { category, name, description, price, isVeg, isAvailable } = req.body;

    if (!category || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, name, and price.',
      });
    }

    const business = await Business.findOne({ tenantId: req.tenantId });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    business.menu.items.push({
      category,
      name,
      description: description || '',
      price: parseFloat(price),
      isVeg: isVeg || false,
      isAvailable: isAvailable !== false,
    });

    await business.save();

    res.status(201).json({
      success: true,
      message: 'Menu item added.',
      data: business.menu.items[business.menu.items.length - 1],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add menu item.' });
  }
});

/**
 * PUT /api/menu/items/:id — Update a menu item
 */
router.put('/items/:id', async (req, res) => {
  try {
    const business = await Business.findOne({ tenantId: req.tenantId });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    const item = business.menu.items.id(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    const { category, name, description, price, isVeg, isAvailable } = req.body;
    if (category !== undefined) item.category = category;
    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = parseFloat(price);
    if (isVeg !== undefined) item.isVeg = isVeg;
    if (isAvailable !== undefined) item.isAvailable = isAvailable;

    await business.save();

    res.json({
      success: true,
      message: 'Menu item updated.',
      data: item,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update menu item.' });
  }
});

/**
 * DELETE /api/menu/items/:id — Delete a menu item
 */
router.delete('/items/:id', async (req, res) => {
  try {
    const business = await Business.findOne({ tenantId: req.tenantId });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    const item = business.menu.items.id(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    item.deleteOne();
    await business.save();

    res.json({
      success: true,
      message: 'Menu item deleted.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete menu item.' });
  }
});

/**
 * POST /api/menu/upload — Upload menu PDF or image
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const business = await Business.findOne({ tenantId: req.tenantId });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    const filePath = `uploads/${req.file.filename}`;
    const ext = path.extname(req.file.originalname).toLowerCase();

    if (ext === '.pdf') {
      business.menu.pdfUrl = filePath;
      business.menu.type = 'pdf';
    } else {
      business.menu.imageUrls.push(filePath);
      business.menu.type = 'image';
    }

    await business.save();

    res.json({
      success: true,
      message: 'File uploaded successfully.',
      data: {
        url: filePath,
        type: ext === '.pdf' ? 'pdf' : 'image',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload file.' });
  }
});

/**
 * POST /api/menu/review-reply — Generate AI review reply (MVP+ feature)
 */
router.post('/review-reply', async (req, res) => {
  try {
    const { reviewText } = req.body;
    if (!reviewText) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reviewText.',
      });
    }

    const business = await Business.findOne({ tenantId: req.tenantId });
    const reply = await AIService.generateReviewReply(
      reviewText,
      business?.name || 'Our Business',
      business?.geminiApiKey
    );

    res.json({
      success: true,
      data: { reply },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate reply. Make sure your Gemini API key is configured.',
    });
  }
});

module.exports = router;
