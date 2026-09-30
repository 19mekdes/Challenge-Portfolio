const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/aboutController');
const { isAuthenticated } = require('../middleware/auth');


router.get('/', aboutController.getAbout);


router.put('/', isAuthenticated, aboutController.updateAbout);

module.exports = router;