// ============================================
// ROUTES/SKILLS.JS - Skills Routes
// ============================================

const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skillController');
const { isAuthenticated } = require('../middleware/auth');

// GET - Get all skills (Public)
router.get('/', skillsController.getSkills);

// GET - Get skills by category
router.get('/category/:category', skillsController.getSkillsByCategory);

// POST - Create new skill (Admin only)
router.post('/', isAuthenticated, skillsController.createSkill);

// PUT - Update skill (Admin only)
router.put('/:id', isAuthenticated, skillsController.updateSkill);

// DELETE - Delete skill (Admin only)
router.delete('/:id', isAuthenticated, skillsController.deleteSkill);

module.exports = router;