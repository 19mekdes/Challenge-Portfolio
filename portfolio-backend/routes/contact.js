// ============================================
// ROUTES/CONTACT.JS - Fixed Contact Routes
// ============================================

const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { isAuthenticated } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES
// ============================================

// POST - Send contact message (Public)
router.post('/send', contactController.sendMessage);

// ============================================
// ADMIN ROUTES (Protected)
// ============================================

// GET - Get all messages (Admin only)
router.get('/messages', isAuthenticated, contactController.getMessages);

// GET - Get single message by ID (Admin only)
router.get('/messages/:id', isAuthenticated, contactController.getMessageById);

// DELETE - Delete message (Admin only)
router.delete('/messages/:id', isAuthenticated, contactController.deleteMessage);

// GET - Test email (Admin only)
router.get('/test', isAuthenticated, contactController.testEmail);

module.exports = router;