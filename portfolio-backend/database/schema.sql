CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
-- Password hash is for 'admin123' using bcrypt
INSERT INTO users (username, email, full_name, role) 
VALUES ('admin', 'mekdesw60@gmail.com', 'Mekdes Wale', 'admin')
ON CONFLICT (username) DO NOTHING;


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

-- Insert default profile
INSERT INTO profile (name, title, bio, email, phone, location, github, linkedin, profile_image)
VALUES (
    'Mekdes Wale',
    'Web Developer',
    'Welcome to my portfolio! I''m Mekdes Wale, a passionate web developer specializing in both backend and frontend development.',
    'mekdesw60@gmail.com',
    '+25180536095',
    'Addis Ababa, Ethiopia',
    'https://github.com/19mekdes',
    'https://www.linkedin.com/in/mekdes-wale-a25a54396',
    'image/mekdi.jpg'
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TABLE: about
-- ============================================
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

-- Insert default about
INSERT INTO about (title, description, experience, education, image)
VALUES (
    'About Me',
    'I''m Mekdes Wale, a passionate web developer who loves creating beautiful and functional websites. I enjoy learning new technologies and building projects that solve real problems.',
    '2+ Years',
    'Computer Science',
    'image/About.jpg'
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TABLE: skills
-- ============================================
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    level INT DEFAULT 50 CHECK (level >= 0 AND level <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);

-- Insert default skills
INSERT INTO skills (category, name, level) VALUES
('Frontend', 'HTML', 90),
('Frontend', 'CSS', 85),
('Frontend', 'JavaScript', 80),
('Frontend', 'React', 75),
('Backend', 'Node.js', 85),
('Backend', 'Express.js', 80),
('Backend', 'Nest.js', 75),
('Backend', 'MySQL', 85),
('Tools', 'Git', 85),
('Tools', 'Docker', 70),
('Tools', 'AWS', 65),
('Tools', 'Linux', 80)
ON CONFLICT (id) DO NOTHING;


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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_title ON projects(title);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);

-- Insert default projects
INSERT INTO projects (title, description, tags, image, link, featured) VALUES
(
    'Dental Clinic Management System',
    'A comprehensive dental clinic management system for appointment scheduling, patient records, and treatment tracking.',
    ARRAY['React', 'CSS', 'JavaScript'],
    'image/project1.jpg',
    '#',
    TRUE
),
(
    'CineMatch',
    'A movie recommendation system that suggests films based on user preferences and viewing history.',
    ARRAY['Next.js', 'Tailwind CSS', 'TypeScript', 'Nest.js', 'PostgreSQL'],
    'image/project2.jpg',
    '#',
    TRUE
),
(
    'Cake House',
    'An e-commerce platform for ordering custom cakes, pastries, and baked goods with online payment integration.',
    ARRAY['React', 'Tailwind CSS', 'TypeScript'],
    'image/project3.jpg',
    '#',
    FALSE
),
(
    'AlphaLine Engineering Website',
    'A professional corporate website for an engineering company showcasing services, projects, and client portfolios.',
    ARRAY['React', 'Tailwind CSS', 'TypeScript'],
    'image/project4.jpg',
    '#',
    FALSE
),
(
    'Product Catalog',
    'An interactive product catalog with search, filter, and sorting features for easy product discovery.',
    ARRAY['React', 'Tailwind CSS', 'TypeScript'],
    'image/project5.jpg',
    '#',
    FALSE
),
(
    'Book Review',
    'A book review platform where users can rate, review, and discover new books across different genres.',
    ARRAY['React', 'Tailwind CSS', 'TypeScript', 'Node.js', 'PostgreSQL'],
    'image/project6.jpg',
    '#',
    FALSE
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TABLE: messages
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_email ON messages(email);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ============================================
-- TABLE: sessions (for authentication)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- ============================================
-- TABLE: activity_logs (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================
-- VIEWS
-- ============================================

-- View: Recent messages
CREATE OR REPLACE VIEW recent_messages AS
SELECT id, name, email, message, is_read, created_at
FROM messages
ORDER BY created_at DESC
LIMIT 10;

-- View: Project count by status
CREATE OR REPLACE VIEW project_status_count AS
SELECT status, COUNT(*) as count
FROM projects
GROUP BY status;

-- View: Skill categories
CREATE OR REPLACE VIEW skill_categories AS
SELECT DISTINCT category
FROM skills
ORDER BY category;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_projects', (SELECT COUNT(*) FROM projects),
        'total_skills', (SELECT COUNT(*) FROM skills),
        'unread_messages', (SELECT COUNT(*) FROM messages WHERE is_read = FALSE),
        'total_messages', (SELECT COUNT(*) FROM messages),
        'total_users', (SELECT COUNT(*) FROM users)
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function: Mark message as read
CREATE OR REPLACE FUNCTION mark_message_read(msg_id INT)
RETURNS VOID AS $$
BEGIN
    UPDATE messages SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = msg_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Get skills by category
CREATE OR REPLACE FUNCTION get_skills_by_category(cat VARCHAR)
RETURNS TABLE(
    id INT,
    name VARCHAR,
    level INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.name, s.level
    FROM skills s
    WHERE s.category = cat
    ORDER BY s.name;
END;
$$ LANGUAGE plpgsql;

-- Function: Search projects
CREATE OR REPLACE FUNCTION search_projects(search_term VARCHAR)
RETURNS TABLE(
    id INT,
    title VARCHAR,
    description TEXT,
    tags TEXT[],
    image VARCHAR,
    link VARCHAR,
    featured BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.title, p.description, p.tags, p.image, p.link, p.featured
    FROM projects p
    WHERE p.title ILIKE '%' || search_term || '%'
       OR p.description ILIKE '%' || search_term || '%'
       OR EXISTS (SELECT 1 FROM unnest(p.tags) tag WHERE tag ILIKE '%' || search_term || '%')
    ORDER BY p.featured DESC, p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Function: Update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for each table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profile_updated_at
    BEFORE UPDATE ON profile
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_about_updated_at
    BEFORE UPDATE ON about
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_skills_updated_at
    BEFORE UPDATE ON skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trigger: Log activity when message is created
CREATE OR REPLACE FUNCTION log_message_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (NULL, 'CREATE', 'message', NEW.id, jsonb_build_object('name', NEW.name, 'email', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_message_insert
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION log_message_creation();

-- Trigger: Log activity when project is updated
CREATE OR REPLACE FUNCTION log_project_update()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (NULL, 'UPDATE', 'project', NEW.id, jsonb_build_object('old_title', OLD.title, 'new_title', NEW.title));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_project_update
    AFTER UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION log_project_update();

-- ============================================
-- SAMPLE QUERIES
-- ============================================

-- Get all skills grouped by category
SELECT category, 
       COUNT(*) as count,
       array_agg(name ORDER BY name) as skills,
       ROUND(AVG(level)) as avg_level
FROM skills
GROUP BY category
ORDER BY category;

-- Get featured projects with their tags
SELECT id, title, description, tags, image, link
FROM projects
WHERE featured = TRUE
ORDER BY created_at DESC;

-- Get unread messages count
SELECT COUNT(*) as unread_count
FROM messages
WHERE is_read = FALSE;

-- Get recent activity
SELECT * FROM activity_logs
ORDER BY created_at DESC
LIMIT 20;

-- Search projects using function
SELECT * FROM search_projects('dental');

-- Get dashboard stats using function
SELECT get_dashboard_stats();

-- ============================================
-- MAINTENANCE
-- ============================================

-- Delete old sessions (older than 7 days)
DELETE FROM sessions 
WHERE expires_at < (NOW() - INTERVAL '7 days');

-- Archive old messages (older than 1 year)
-- CREATE TABLE messages_archive (LIKE messages);
-- INSERT INTO messages_archive SELECT * FROM messages WHERE created_at < (NOW() - INTERVAL '1 year');
-- DELETE FROM messages WHERE created_at < (NOW() - INTERVAL '1 year');

-- ============================================
-- DATABASE USER (Create application user)
-- ============================================

-- Create application user (uncomment to use)
-- CREATE USER portfolio_user WITH PASSWORD 'portfolio_password';
-- GRANT CONNECT ON DATABASE portfolio_db TO portfolio_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO portfolio_user;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO portfolio_user;

-- ============================================
-- END OF SCHEMA
-- ============================================