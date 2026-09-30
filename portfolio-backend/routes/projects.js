const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { isAuthenticated } = require('../middleware/auth');
const { uploadSingle, handleUploadError, getFileInfo } = require('../middleware/upload');

router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.get('/tag/:tag', projectController.getProjectsByTag);
router.get('/category/:category', projectController.getProjectsByCategory);
router.get('/search', projectController.searchProjects);

router.post(
    '/',
    isAuthenticated,
    uploadSingle('image'),
    handleUploadError,
    (req, res, next) => {
        
        if (req.file) {
            req.body.image = getFileInfo(req.file).url;
        }
        next();
    },
    projectController.createProject
);


router.put(
    '/:id',
    isAuthenticated,
    uploadSingle('image'),
    handleUploadError,
    (req, res, next) => {
        if (req.file) {
            req.body.image = getFileInfo(req.file).url;
        }
        next();
    },
    projectController.updateProject
);

router.patch('/:id', isAuthenticated, projectController.patchProject);
router.delete('/:id', isAuthenticated, projectController.deleteProject);
router.post('/reset', isAuthenticated, projectController.resetProjects);

module.exports = router;