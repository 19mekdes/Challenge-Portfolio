require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const contactRoutes = require('./routes/contact');
const profileRoutes = require('./routes/profile');
const aboutRoutes = require('./routes/about');
const skillsRoutes = require('./routes/skills');
const projectsRoutes = require('./routes/projects');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');  // ← Added auth routes

// Import database initializer (creates tables + seeds defaults on startup)
const { initDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 5000;


// Enable CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend directory (project root — contains index.html, style.css, image/, etc.)
const FRONTEND_DIR = path.join(__dirname, '..');

// Serve images referenced by the portfolio (e.g. /image/Home.jpg)
app.use('/image', express.static(path.join(FRONTEND_DIR, 'image')));

// Serve uploaded files (multer writes to public/uploads)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Request logging (optional)
app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.url}`);
    next();
});


app.use('/api/contact', contactRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);  


app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running!',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        endpoints: {
            profile: '/api/profile',
            about: '/api/about',
            skills: '/api/skills',
            projects: '/api/projects',
            contact: '/api/contact',
            admin: '/api/admin',
            auth: '/api/auth'
        }
    });
});


// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Admin panel (also serve /admin.html so relative "admin.html" links work)
app.get(['/admin', '/admin.html'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'admin.html'));
});

// Frontend asset files (style.css, script.js, admin.css, admin.js)
['style.css', 'script.js', 'admin.css', 'admin.js'].forEach((asset) => {
    app.get(`/${asset}`, (req, res) => {
        res.sendFile(path.join(FRONTEND_DIR, asset));
    });
});


app.use((req, res, next) => {
    // Check if requesting API
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            message: 'API endpoint not found'
        });
    }
    
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next();
    }
    // Serve index.html for all other routes
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});


// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    
    // Multer errors
    if (err.code === 'FILE_TOO_LARGE') {
        return res.status(400).json({
            success: false,
            message: 'File too large. Max size is 5MB'
        });
    }
    
    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    
    // Database errors
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            success: false,
            message: 'Duplicate entry found'
        });
    }
    
    // Default error
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Something went wrong!' 
            : err.message
    });
});


app.listen(PORT, async () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🔗 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`🔐 Auth Endpoint: http://localhost:${PORT}/api/auth/login`);
    console.log(`📧 Email: ${process.env.EMAIL_USER || 'Not configured'}`);
    
    // Initialize the PostgreSQL database (create tables + seed defaults)
    const dbReady = await initDatabase();
    if (!dbReady) {
        console.log('⚠️  API will fail until the DB_* credentials in .env are fixed.');
    }
    
    console.log(`\n📋 Available Routes:`);
    console.log(`  GET  /api/health - Server status`);
    console.log(`  GET  /api/profile - Profile data`);
    console.log(`  GET  /api/about - About data`);
    console.log(`  GET  /api/skills - Skills data`);
    console.log(`  GET  /api/projects - Projects data`);
    console.log(`  POST /api/contact/send - Send message`);
    console.log(`  POST /api/auth/login - Admin login`);
    console.log(`  GET  /api/admin/check - Check auth`);
    console.log(`\n🌐 Frontend: http://localhost:${PORT}`);
    console.log(`🔑 Default Login: admin / admin123`);
});