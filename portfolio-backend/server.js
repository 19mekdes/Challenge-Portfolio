require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const contactRoutes = require('./routes/contact');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON data
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Serve static files (your frontend)
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// ROUTES
// ============================================

// API Routes
app.use('/api/contact', contactRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running!',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// SERVE FRONTEND - FIXED (no wildcard * issue)
// ============================================

// Serve index.html for all non-API routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Optional: Serve index.html for other routes (except API)
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});


app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});



app.listen(PORT, () => {
    console.log('✅ Server running on http://localhost:' + PORT);
    console.log('📧 Email: ' + process.env.EMAIL_USER);
    console.log('🔗 API Endpoints:');
    console.log('   - POST /api/contact/send - Send message');
    console.log('   - GET  /api/contact/test - Test email');
    console.log('   - GET  /api/health - Server status');
});