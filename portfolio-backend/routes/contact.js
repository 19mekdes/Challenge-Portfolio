const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// POST: Send contact message
router.post('/send', contactController.sendMessage);

// GET: Test email (optional)
router.get('/test', contactController.testEmail);

// GET: Check API status
router.get('/status', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Contact API is working!',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;