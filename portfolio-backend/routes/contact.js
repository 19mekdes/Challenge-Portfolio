const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { isAuthenticated } = require('../middleware/auth');


router.post('/send', contactController.sendMessage);


router.get('/messages', isAuthenticated, contactController.getMessages);


router.get('/messages/:id', isAuthenticated, contactController.getMessageById);


router.delete('/messages/:id', isAuthenticated, contactController.deleteMessage);


router.get('/test', isAuthenticated, contactController.testEmail);

module.exports = router;