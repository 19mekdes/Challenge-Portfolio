// ============================================
// ROUTES/ADMIN.JS - Admin Routes
// ============================================

const express = require('express');
const router = express.Router();
const { login } = require('../middleware/auth');

// POST - Admin login
router.post('/login', login);

module.exports = router;