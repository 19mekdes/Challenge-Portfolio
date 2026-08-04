// ============================================
// CONTROLLERS/ABOUTCONTROLLER.JS - PostgreSQL
// ============================================

const { getOne, query } = require('../config/database');

// ============================================
// GET ABOUT INFORMATION (Public)
// ============================================
async function getAbout(req, res) {
    try {
        const row = await getOne('SELECT * FROM about ORDER BY id LIMIT 1');
        res.json({ success: true, data: row });
    } catch (error) {
        console.error('Error fetching about:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch about information' });
    }
}

// ============================================
// UPDATE ABOUT INFORMATION (Admin only)
// ============================================
async function updateAbout(req, res) {
    try {
        const { title, description, experience, education, image } = req.body;

        const current = await getOne('SELECT * FROM about ORDER BY id LIMIT 1');
        if (!current) {
            return res.status(404).json({ success: false, message: 'About section not found' });
        }

        const updated = await getOne(
            `UPDATE about SET
                title = $1, description = $2, experience = $3, education = $4, image = $5
             WHERE id = $6 RETURNING *`,
            [
                title || current.title,
                description || current.description,
                experience || current.experience,
                education || current.education,
                image || current.image,
                current.id
            ]
        );

        res.json({ success: true, message: 'About section updated successfully!', data: updated });
    } catch (error) {
        console.error('Error updating about:', error);
        res.status(500).json({ success: false, message: 'Failed to update about information' });
    }
}

// ============================================
// GET ABOUT BY ID (Public)
// ============================================
async function getAboutById(req, res) {
    try {
        const { id } = req.params;
        const row = await getOne('SELECT * FROM about WHERE id = $1', [id]);
        if (!row) {
            return res.status(404).json({ success: false, message: 'About section not found' });
        }
        res.json({ success: true, data: row });
    } catch (error) {
        console.error('Error fetching about by id:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch about information' });
    }
}

// ============================================
// RESET ABOUT TO DEFAULT (Admin only)
// ============================================
async function resetAbout(req, res) {
    try {
        await query(
            `UPDATE about SET
                title = 'About Me',
                description = 'I''m Mekdes Wale, a passionate web developer who loves creating beautiful and functional websites. I enjoy learning new technologies and building projects that solve real problems.',
                experience = '2+ Years',
                education = 'Computer Science',
                image = 'image/About.jpg'
             WHERE id = 1`
        );
        const row = await getOne('SELECT * FROM about ORDER BY id LIMIT 1');
        res.json({ success: true, message: 'About section reset to default!', data: row });
    } catch (error) {
        console.error('Error resetting about:', error);
        res.status(500).json({ success: false, message: 'Failed to reset about information' });
    }
}

// ============================================
// PARTIAL UPDATE ABOUT - PATCH (Admin only)
// ============================================
const PATCHABLE_ABOUT = ['title', 'description', 'experience', 'education', 'image'];

async function patchAbout(req, res) {
    try {
        const updates = req.body;
        const sets = [];
        const values = [];
        let i = 1;

        for (const key of PATCHABLE_ABOUT) {
            if (updates[key] !== undefined) {
                sets.push(`${key} = $${i++}`);
                values.push(updates[key]);
            }
        }

        if (sets.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields to update' });
        }

        values.push(1);
        const updated = await getOne(
            `UPDATE about SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`,
            values
        );

        res.json({ success: true, message: 'About section partially updated!', data: updated });
    } catch (error) {
        console.error('Error patching about:', error);
        res.status(500).json({ success: false, message: 'Failed to update about information' });
    }
}

module.exports = {
    getAbout,
    updateAbout,
    getAboutById,
    resetAbout,
    patchAbout
};
