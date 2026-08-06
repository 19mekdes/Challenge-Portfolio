

const { query, testConnection } = require('../config/database');
const data = require('../models/data');

// ============================================
// CREATE TABLES (idempotent)
// ============================================

async function createTables() {
    await query(`
        CREATE TABLE IF NOT EXISTS profile (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            title VARCHAR(100),
            bio TEXT,
            email VARCHAR(100),
            phone VARCHAR(20),
            location VARCHAR(100),
            github VARCHAR(255),
            linkedin VARCHAR(255),
            profile_image VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS about (
            id SERIAL PRIMARY KEY,
            title VARCHAR(100) NOT NULL,
            description TEXT,
            experience VARCHAR(50),
            education VARCHAR(100),
            image VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS skills (
            id SERIAL PRIMARY KEY,
            category VARCHAR(50) NOT NULL,
            name VARCHAR(50) NOT NULL,
            level INT DEFAULT 50 CHECK (level >= 0 AND level <= 100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS projects (
            id SERIAL PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            tags TEXT[],
            image VARCHAR(255),
            link VARCHAR(255),
            status VARCHAR(20) DEFAULT 'active',
            featured BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

// ============================================
// SEED DEFAULT DATA (only if a table is empty)
// ============================================

async function seedIfEmpty() {
    // Profile
    const profileCount = (await query('SELECT COUNT(*)::int AS c FROM profile')).rows[0].c;
    if (profileCount === 0) {
        await query(
            `INSERT INTO profile (name, title, bio, email, phone, location, github, linkedin, profile_image)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                data.profile.name,
                data.profile.title,
                data.profile.bio,
                data.profile.email,
                data.profile.phone,
                data.profile.location,
                data.profile.github,
                data.profile.linkedin,
                data.profile.profileImage
            ]
        );
    }

    // About
    const aboutCount = (await query('SELECT COUNT(*)::int AS c FROM about')).rows[0].c;
    if (aboutCount === 0) {
        await query(
            `INSERT INTO about (title, description, experience, education, image)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                data.about.title,
                data.about.description,
                data.about.experience,
                data.about.education,
                data.about.image
            ]
        );
    }

    // Skills
    const skillsCount = (await query('SELECT COUNT(*)::int AS c FROM skills')).rows[0].c;
    if (skillsCount === 0) {
        for (const skill of data.skills) {
            await query(
                'INSERT INTO skills (category, name, level) VALUES ($1, $2, $3)',
                [skill.category, skill.name, skill.level]
            );
        }
    }

    // Projects
    const projectsCount = (await query('SELECT COUNT(*)::int AS c FROM projects')).rows[0].c;
    if (projectsCount === 0) {
        for (const project of data.projects) {
            await query(
                `INSERT INTO projects (title, description, tags, image, link)
                 VALUES ($1, $2, $3, $4, $5)`,
                [project.title, project.description, project.tags, project.image, project.link || '#']
            );
        }
    }
}

// ============================================
// INIT (called on server startup)
// ============================================

async function initDatabase() {
    const ok = await testConnection();
    if (!ok) {
        console.log('⚠️  Database initialization skipped — check DB_* settings in .env');
        return false;
    }
    await createTables();
    await seedIfEmpty();
    console.log('✅ Database initialized (tables ready, defaults seeded).');
    return true;
}

module.exports = {
    initDatabase,
    createTables,
    seedIfEmpty
};
