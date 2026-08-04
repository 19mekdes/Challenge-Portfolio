// ============================================
// CONTROLLERS/ADMINCONTROLLER.JS - PostgreSQL
// ============================================

const { getAll, getOne, transaction } = require('../config/database');

// Admin credentials (from .env)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// ============================================
// ADMIN LOGIN
// ============================================
function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username and password'
            });
        }

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');

            res.json({
                success: true,
                token: token,
                user: {
                    username: username,
                    name: 'Mekdes Wale',
                    email: process.env.EMAIL_USER || 'mekdesw60@gmail.com'
                },
                message: 'Login successful!'
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid username or password!'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
    }
}

// ============================================
// ADMIN LOGOUT
// ============================================
function logout(req, res) {
    try {
        res.json({ success: true, message: 'Logged out successfully!' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, message: 'Logout failed. Please try again.' });
    }
}

// ============================================
// CHECK AUTHENTICATION STATUS
// ============================================
function checkAuth(req, res) {
    try {
        res.json({
            success: true,
            authenticated: true,
            user: {
                username: ADMIN_USERNAME,
                name: 'Mekdes Wale',
                email: process.env.EMAIL_USER || 'mekdesw60@gmail.com'
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(500).json({ success: false, message: 'Failed to check authentication status' });
    }
}

// ============================================
// GET ADMIN DASHBOARD STATS
// ============================================
async function getDashboardStats(req, res) {
    try {
        const [projects, skills, messages, categories] = await Promise.all([
            getOne('SELECT COUNT(*)::int AS c FROM projects'),
            getOne('SELECT COUNT(*)::int AS c FROM skills'),
            getOne('SELECT COUNT(*)::int AS c FROM messages'),
            getAll('SELECT DISTINCT category FROM skills')
        ]);

        res.json({
            success: true,
            data: {
                totalProjects: projects.c,
                totalSkills: skills.c,
                totalMessages: messages.c,
                totalCategories: categories.length,
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get dashboard statistics' });
    }
}

// ============================================
// CHANGE ADMIN PASSWORD
// ============================================
function changePassword(req, res) {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        if (currentPassword !== ADMIN_PASSWORD) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        console.log('Password changed from:', currentPassword, 'to:', newPassword);

        res.json({
            success: true,
            message: 'Password changed successfully! Please update your .env file'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Failed to change password' });
    }
}

// ============================================
// GET ALL DATA (Full Backup)
// ============================================
async function getAllData(req, res) {
    try {
        const data = await fetchAllData();
        res.json({ success: true, data: data });
    } catch (error) {
        console.error('Get all data error:', error);
        res.status(500).json({ success: false, message: 'Failed to get all data' });
    }
}

// ============================================
// EXPORT DATA (Download Backup)
// ============================================
async function exportData(req, res) {
    try {
        const data = await fetchAllData();
        res.json({
            success: true,
            data: { ...data, exportedAt: new Date().toISOString(), version: '1.0.0' },
            message: 'Data exported successfully!'
        });
    } catch (error) {
        console.error('Export data error:', error);
        res.status(500).json({ success: false, message: 'Failed to export data' });
    }
}

// ============================================
// IMPORT DATA (Restore Backup)
// ============================================
async function importData(req, res) {
    try {
        const { data: imported } = req.body;

        if (!imported) {
            return res.status(400).json({ success: false, message: 'No data provided to import' });
        }

        if (!imported.profile || !imported.about || !imported.skills || !imported.projects) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data structure. Missing required fields.'
            });
        }

        await transaction(async (client) => {
            // Profile (single row)
            if (imported.profile) {
                await client.query(
                    `UPDATE profile SET name=$1, title=$2, bio=$3, email=$4, phone=$5,
                     location=$6, github=$7, linkedin=$8, profile_image=$9 WHERE id=1`,
                    [
                        imported.profile.name, imported.profile.title, imported.profile.bio,
                        imported.profile.email, imported.profile.phone, imported.profile.location,
                        imported.profile.github, imported.profile.linkedin,
                        imported.profile.profileImage || imported.profile.profile_image
                    ]
                );
            }

            // About (single row)
            if (imported.about) {
                await client.query(
                    `UPDATE about SET title=$1, description=$2, experience=$3, education=$4, image=$5 WHERE id=1`,
                    [
                        imported.about.title, imported.about.description, imported.about.experience,
                        imported.about.education, imported.about.image
                    ]
                );
            }

            // Skills (replace all)
            if (Array.isArray(imported.skills)) {
                await client.query('DELETE FROM skills');
                for (const skill of imported.skills) {
                    await client.query(
                        'INSERT INTO skills (category, name, level) VALUES ($1, $2, $3)',
                        [skill.category, skill.name, skill.level]
                    );
                }
            }

            // Projects (replace all)
            if (Array.isArray(imported.projects)) {
                await client.query('DELETE FROM projects');
                for (const project of imported.projects) {
                    await client.query(
                        'INSERT INTO projects (title, description, tags, image, link) VALUES ($1, $2, $3, $4, $5)',
                        [
                            project.title, project.description,
                            Array.isArray(project.tags) ? project.tags : [],
                            project.image, project.link || '#'
                        ]
                    );
                }
            }

            // Messages (replace all)
            if (Array.isArray(imported.messages)) {
                await client.query('DELETE FROM messages');
                for (const message of imported.messages) {
                    await client.query(
                        'INSERT INTO messages (name, email, message) VALUES ($1, $2, $3)',
                        [message.name, message.email, message.message]
                    );
                }
            }
        });

        res.json({
            success: true,
            message: 'Data imported successfully!',
            imported: {
                profile: !!imported.profile,
                about: !!imported.about,
                skills: !!imported.skills,
                projects: !!imported.projects,
                messages: !!imported.messages
            }
        });
    } catch (error) {
        console.error('Import data error:', error);
        res.status(500).json({ success: false, message: 'Failed to import data' });
    }
}

// ============================================
// HELPERS
// ============================================
async function fetchAllData() {
    const [profile, about, skills, projects, messages] = await Promise.all([
        getOne('SELECT * FROM profile ORDER BY id LIMIT 1'),
        getOne('SELECT * FROM about ORDER BY id LIMIT 1'),
        getAll('SELECT * FROM skills ORDER BY id'),
        getAll('SELECT * FROM projects ORDER BY id'),
        getAll('SELECT * FROM messages ORDER BY id DESC')
    ]);

    return {
        profile,
        about,
        skills,
        projects,
        messages,
        timestamp: new Date().toISOString()
    };
}

module.exports = {
    login,
    logout,
    checkAuth,
    getDashboardStats,
    changePassword,
    getAllData,
    exportData,
    importData
};
