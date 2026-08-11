const { getAll, getOne, query } = require('../config/database');
const data = require('../models/data');

// Convert "a, b, c" strings into arrays when provided
function normalizeTags(tags) {
    if (tags === undefined || tags === null) return undefined;
    if (Array.isArray(tags)) return tags.map(t => String(t).trim()).filter(Boolean);
    return String(tags).split(',').map(t => t.trim()).filter(Boolean);
}

async function getProjects(req, res) {
    try {
        const rows = await getAll('SELECT * FROM projects ORDER BY id');
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch projects' });
    }
}

async function getProjectById(req, res) {
    try {
        const { id } = req.params;
        const row = await getOne('SELECT * FROM projects WHERE id = $1', [id]);
        if (!row) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        res.json({ success: true, data: row });
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch project' });
    }
}

async function getProjectsByTag(req, res) {
    try {
        const { tag } = req.params;
        const rows = await getAll('SELECT * FROM projects WHERE $1 = ANY(tags)', [tag]);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error fetching projects by tag:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch projects by tag' });
    }
}

async function getProjectsByCategory(req, res) {
    try {
        const { category } = req.params;
        const rows = await getAll('SELECT * FROM projects WHERE $1 = ANY(tags)', [category]);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error fetching projects by category:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch projects by category' });
    }
}

async function searchProjects(req, res) {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ success: false, message: 'Please provide a search query' });
        }

        const like = `%${q}%`;
        const rows = await getAll(
            `SELECT * FROM projects
             WHERE title ILIKE $1
                OR description ILIKE $1
                OR EXISTS (SELECT 1 FROM unnest(tags) t WHERE t ILIKE $1)
             ORDER BY id`,
            [like]
        );

        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error searching projects:', error);
        res.status(500).json({ success: false, message: 'Failed to search projects' });
    }
}

async function createProject(req, res) {
    try {
        const { title, description, tags, image, link } = req.body;

        if (!title || !description) {
            return res.status(400).json({ success: false, message: 'Please provide title and description' });
        }

        const row = await getOne(
            `INSERT INTO projects (title, description, tags, image, link)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [
                title.trim(),
                description.trim(),
                normalizeTags(tags) || [],
                image || 'image/default.jpg',
                link || '#'
            ]
        );

        res.status(201).json({ success: true, message: 'Project created successfully!', data: row });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ success: false, message: 'Failed to create project' });
    }
}

async function updateProject(req, res) {
    try {
        const { id } = req.params;
        const { title, description, tags, image, link } = req.body;

        const current = await getOne('SELECT * FROM projects WHERE id = $1', [id]);
        if (!current) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const updated = await getOne(
            `UPDATE projects SET
                title = $1, description = $2, tags = $3, image = $4, link = $5
             WHERE id = $6 RETURNING *`,
            [
                title || current.title,
                description || current.description,
                tags ? normalizeTags(tags) : current.tags,
                image || current.image,
                link || current.link,
                id
            ]
        );

        res.json({ success: true, message: 'Project updated successfully!', data: updated });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ success: false, message: 'Failed to update project' });
    }
}

async function deleteProject(req, res) {
    try {
        const { id } = req.params;
        const deleted = await getOne('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        res.json({ success: true, message: 'Project deleted successfully!', data: deleted });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ success: false, message: 'Failed to delete project' });
    }
}

const PATCHABLE_PROJECT = ['title', 'description', 'tags', 'image', 'link'];

async function patchProject(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;
        const sets = [];
        const values = [];
        let i = 1;

        for (const key of PATCHABLE_PROJECT) {
            if (updates[key] !== undefined) {
                let value = updates[key];
                if (key === 'tags') value = normalizeTags(value);
                sets.push(`${key} = $${i++}`);
                values.push(value);
            }
        }

        if (sets.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields to update' });
        }

        values.push(id);
        const updated = await getOne(
            `UPDATE projects SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`,
            values
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        res.json({ success: true, message: 'Project updated successfully!', data: updated });
    } catch (error) {
        console.error('Error patching project:', error);
        res.status(500).json({ success: false, message: 'Failed to update project' });
    }
}


async function resetProjects(req, res) {
    try {
        await query('DELETE FROM projects');
        for (const project of data.projects) {
            await query(
                `INSERT INTO projects (title, description, tags, image, link)
                 VALUES ($1, $2, $3, $4, $5)`,
                [project.title, project.description, project.tags, project.image, project.link || '#']
            );
        }
        const rows = await getAll('SELECT * FROM projects ORDER BY id');
        res.json({ success: true, message: 'Projects reset to default!', data: rows });
    } catch (error) {
        console.error('Error resetting projects:', error);
        res.status(500).json({ success: false, message: 'Failed to reset projects' });
    }
}

module.exports = {
    getProjects,
    getProjectById,
    getProjectsByTag,
    searchProjects,
    createProject,
    updateProject,
    deleteProject,
    patchProject,
    getProjectsByCategory,
    resetProjects
};
