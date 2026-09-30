const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');


router.post('/login', authController.login);


router.post('/logout', isAuthenticated, authController.logout);

router.get('/check', isAuthenticated, authController.checkAuth);

router.put('/change-password', isAuthenticated, authController.changePassword);

module.exports = router;