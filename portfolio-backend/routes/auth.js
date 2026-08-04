// ============================================
// ROUTES/AUTH.JS - Authentication Routes
// ============================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

// POST - Admin login
router.post('/login', authController.login);

// POST - Admin logout
router.post('/logout', isAuthenticated, authController.logout);

// GET - Check if user is authenticated
router.get('/check', isAuthenticated, authController.checkAuth);

// PUT - Change password (Admin only)
router.put('/change-password', isAuthenticated, authController.changePassword);

module.exports = router;