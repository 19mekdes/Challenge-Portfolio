const { getOne, query } = require('../config/database');

// Map DB row (snake_case) to API shape (camelCase)
function mapProfile(row) {
    if (!row) return null;
    return {
        id: row.id,
        name: row.name,
        title: row.title,
        bio: row.bio,
        email: row.email,
        phone: row.phone,
        location: row.location,
        github: row.github,
        linkedin: row.linkedin,
        profileImage: row.profile_image,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

   // GET PROFILE INFORMATION (Public)

async function getProfile(req, res) {
    try {
        const row = await getOne('SELECT * FROM profile ORDER BY id LIMIT 1');
        res.json({ success: true, data: mapProfile(row) });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch profile information' });
    }
}

     // GET PROFILE BY ID (Public)

async function getProfileById(req, res) {
    try {
        const { id } = req.params;
        const row = await getOne('SELECT * FROM profile WHERE id = $1', [id]);
        if (!row) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        res.json({ success: true, data: mapProfile(row) });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch profile information' });
    }
}

     // UPDATE PROFILE INFORMATION (Admin only)

async function updateProfile(req, res) {
    try {
        const { name, title, bio, email, phone, location, github, linkedin, profileImage } = req.body;

        const current = await getOne('SELECT * FROM profile ORDER BY id LIMIT 1');
        if (!current) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        const updated = await getOne(
            `UPDATE profile SET
                name = $1, title = $2, bio = $3, email = $4, phone = $5,
                location = $6, github = $7, linkedin = $8, profile_image = $9
             WHERE id = $10 RETURNING *`,
            [
                name || current.name,
                title || current.title,
                bio || current.bio,
                email || current.email,
                phone || current.phone,
                location || current.location,
                github || current.github,
                linkedin || current.linkedin,
                profileImage || current.profile_image,
                current.id
            ]
        );

        res.json({ success: true, message: 'Profile updated successfully!', data: mapProfile(updated) });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile information' });
    }
}

// ============================================
// PARTIAL UPDATE PROFILE - PATCH (Admin only)
// ============================================
const PATCHABLE_PROFILE = ['name', 'title', 'bio', 'email', 'phone', 'location', 'github', 'linkedin', 'profileImage'];

async function patchProfile(req, res) {
    try {
        const updates = req.body;
        const sets = [];
        const values = [];
        let i = 1;

        for (const key of PATCHABLE_PROFILE) {
            if (updates[key] !== undefined) {
                const column = key === 'profileImage' ? 'profile_image' : key;
                sets.push(`${column} = $${i++}`);
                values.push(updates[key]);
            }
        }

        if (sets.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields to update' });
        }

        values.push(1);
        const updated = await getOne(
            `UPDATE profile SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`,
            values
        );

        res.json({ success: true, message: 'Profile partially updated!', data: mapProfile(updated) });
    } catch (error) {
        console.error('Error patching profile:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile information' });
    }
}

// ============================================
// RESET PROFILE TO DEFAULT (Admin only)
// ============================================
async function resetProfile(req, res) {
    try {
        await query(
            `UPDATE profile SET
                name = 'Mekdes Wale',
                title = 'Web Developer',
                bio = 'Welcome to my portfolio! I''m Mekdes Wale, a passionate web developer specializing in both backend and frontend development.',
                email = 'mekdesw60@gmail.com',
                phone = '+25180536095',
                location = 'Addis Ababa, Ethiopia',
                github = 'https://github.com/19mekdes',
                linkedin = 'https://www.linkedin.com/in/mekdes-wale-a25a54396',
                profile_image = 'image/mekdi.jpg'
             WHERE id = 1`
        );
        const row = await getOne('SELECT * FROM profile ORDER BY id LIMIT 1');
        res.json({ success: true, message: 'Profile reset to default!', data: mapProfile(row) });
    } catch (error) {
        console.error('Error resetting profile:', error);
        res.status(500).json({ success: false, message: 'Failed to reset profile information' });
    }
}

// ============================================
// UPLOAD PROFILE IMAGE (Admin only)
// ============================================
async function uploadProfileImage(req, res) {
    try {
        const { imagePath } = req.body;
        if (!imagePath) {
            return res.status(400).json({ success: false, message: 'Please provide image path' });
        }

        const updated = await getOne(
            'UPDATE profile SET profile_image = $1 WHERE id = 1 RETURNING *',
            [imagePath]
        );

        res.json({ success: true, message: 'Profile image updated!', data: { profileImage: updated.profile_image } });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ success: false, message: 'Failed to upload profile image' });
    }
}

module.exports = {
    getProfile,
    updateProfile,
    getProfileById,
    patchProfile,
    resetProfile,
    uploadProfileImage
};
