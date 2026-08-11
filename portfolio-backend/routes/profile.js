const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/auth');
const { uploadSingle, handleUploadError, getFileInfo } = require('../middleware/upload');

// GET - Get profile
router.get('/', profileController.getProfile);

// GET - Get profile by ID
router.get('/:id', profileController.getProfileById);

// PUT - Update profile
router.put('/', isAuthenticated, profileController.updateProfile);

// PATCH - Partial update
router.patch('/', isAuthenticated, profileController.patchProfile);

// POST - Upload profile image
router.post(
    '/upload-image',
    isAuthenticated,
    uploadSingle('image'),
    handleUploadError,
    (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }
            
            const fileInfo = getFileInfo(req.file);
            
            // Update profile image path
            const imagePath = fileInfo.url;
            
            res.json({
                success: true,
                message: 'Profile image uploaded successfully!',
                data: {
                    image: imagePath,
                    file: fileInfo
                }
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload image'
            });
        }
    }
);

// POST - Reset profile
router.post('/reset', isAuthenticated, profileController.resetProfile);

module.exports = router;