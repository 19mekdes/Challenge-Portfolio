// ============================================
// ROUTES/ABOUT.JS - About Routes
// ============================================

const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/aboutController');
const { isAuthenticated } = require('../middleware/auth');

// GET - Get about information
router.get('/', aboutController.getAbout);

// PUT - Update about information (Admin only)
router.put('/', isAuthenticated, aboutController.updateAbout);

module.exports = router;