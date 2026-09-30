const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skillController');
const { isAuthenticated } = require('../middleware/auth');


router.get('/', skillsController.getSkills);


router.get('/category/:category', skillsController.getSkillsByCategory);


router.post('/', isAuthenticated, skillsController.createSkill);

// PUT - Update skill (Admin only)
router.put('/:id', isAuthenticated, skillsController.updateSkill);

// DELETE - Delete skill (Admin only)
router.delete('/:id', isAuthenticated, skillsController.deleteSkill);

module.exports = router;