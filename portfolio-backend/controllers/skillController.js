const { getAll, getOne, query } = require('../config/database');
const data = require('../models/data');

async function getSkills(req, res) {
    try {
        const rows = await getAll('SELECT * FROM skills ORDER BY id');
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch skills' });
    }
}

async function getSkillById(req, res) {
    try {
        const { id } = req.params;
        const row = await getOne('SELECT * FROM skills WHERE id = $1', [id]);
        if (!row) {
            return res.status(404).json({ success: false, message: 'Skill not found' });
        }
        res.json({ success: true, data: row });
    } catch (error) {
        console.error('Error fetching skill:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch skill' });
    }
}


async function getSkillsByCategory(req, res) {
    try {
        const { category } = req.params;
        const rows = await getAll(
            'SELECT * FROM skills WHERE LOWER(category) = LOWER($1)',
            [category]
        );
        res.json({ success: true, count: rows.length, category, data: rows });
    } catch (error) {
        console.error('Error fetching skills by category:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch skills by category' });
    }
}


async function getCategories(req, res) {
    try {
        const rows = await getAll('SELECT DISTINCT category FROM skills ORDER BY category');
        res.json({ success: true, count: rows.length, data: rows.map(r => r.category) });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
}

async function createSkill(req, res) {
    try {
        const { category, name, level } = req.body;

        if (!category || !name || level === undefined) {
            return res.status(400).json({ success: false, message: 'Please provide category, name, and level' });
        }
        if (level < 0 || level > 100) {
            return res.status(400).json({ success: false, message: 'Level must be between 0 and 100' });
        }

        const row = await getOne(
            'INSERT INTO skills (category, name, level) VALUES ($1, $2, $3) RETURNING *',
            [category.trim(), name.trim(), parseInt(level)]
        );

        res.status(201).json({ success: true, message: 'Skill added successfully!', data: row });
    } catch (error) {
        console.error('Error creating skill:', error);
        res.status(500).json({ success: false, message: 'Failed to create skill' });
    }
}

async function updateSkill(req, res) {
    try {
        const { id } = req.params;
        const { category, name, level } = req.body;

        if (level !== undefined && (level < 0 || level > 100)) {
            return res.status(400).json({ success: false, message: 'Level must be between 0 and 100' });
        }

        const updated = await getOne(
            `UPDATE skills SET
                category = COALESCE($1, category),
                name = COALESCE($2, name),
                level = COALESCE($3, level)
             WHERE id = $4 RETURNING *`,
            [category, name, level, id]
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Skill not found' });
        }

        res.json({ success: true, message: 'Skill updated successfully!', data: updated });
    } catch (error) {
        console.error('Error updating skill:', error);
        res.status(500).json({ success: false, message: 'Failed to update skill' });
    }
}

async function deleteSkill(req, res) {
    try {
        const { id } = req.params;
        const deleted = await getOne('DELETE FROM skills WHERE id = $1 RETURNING *', [id]);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Skill not found' });
        }
        res.json({ success: true, message: 'Skill deleted successfully!', data: deleted });
    } catch (error) {
        console.error('Error deleting skill:', error);
        res.status(500).json({ success: false, message: 'Failed to delete skill' });
    }
}


const PATCHABLE_SKILL = ['category', 'name', 'level'];

async function patchSkill(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;
        const sets = [];
        const values = [];
        let i = 1;

        for (const key of PATCHABLE_SKILL) {
            if (updates[key] !== undefined) {
                sets.push(`${key} = $${i++}`);
                values.push(updates[key]);
            }
        }

        if (sets.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields to update' });
        }

        values.push(id);
        const updated = await getOne(
            `UPDATE skills SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`,
            values
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Skill not found' });
        }

        res.json({ success: true, message: 'Skill updated successfully!', data: updated });
    } catch (error) {
        console.error('Error patching skill:', error);
        res.status(500).json({ success: false, message: 'Failed to update skill' });
    }
}

async function resetSkills(req, res) {
    try {
        await query('DELETE FROM skills');
        for (const skill of data.skills) {
            await query(
                'INSERT INTO skills (category, name, level) VALUES ($1, $2, $3)',
                [skill.category, skill.name, skill.level]
            );
        }
        const rows = await getAll('SELECT * FROM skills ORDER BY id');
        res.json({ success: true, message: 'Skills reset to default!', data: rows });
    } catch (error) {
        console.error('Error resetting skills:', error);
        res.status(500).json({ success: false, message: 'Failed to reset skills' });
    }
}

async function bulkCreateSkills(req, res) {
    try {
        const { skills } = req.body;
        if (!skills || !Array.isArray(skills) || skills.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide an array of skills' });
        }

        const newSkills = [];
        for (const skill of skills) {
            const row = await getOne(
                'INSERT INTO skills (category, name, level) VALUES ($1, $2, $3) RETURNING *',
                [skill.category.trim(), skill.name.trim(), parseInt(skill.level) || 50]
            );
            newSkills.push(row);
        }

        res.json({ success: true, message: `${newSkills.length} skills added successfully!`, data: newSkills });
    } catch (error) {
        console.error('Error bulk creating skills:', error);
        res.status(500).json({ success: false, message: 'Failed to create skills' });
    }
}

module.exports = {
    getSkills,
    getSkillById,
    getSkillsByCategory,
    getCategories,
    createSkill,
    updateSkill,
    deleteSkill,
    patchSkill,
    resetSkills,
    bulkCreateSkills
};
