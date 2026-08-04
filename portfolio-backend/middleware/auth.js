// ============================================
// MIDDLEWARE/AUTH.JS - Authentication Middleware
// ============================================

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Simple admin authentication middleware
function isAuthenticated(req, res, next) {
    // Get token from header
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized. Please provide a valid token.'
        });
    }
    
    // Check if token is valid (matches admin password for simplicity)
    if (token === ADMIN_PASSWORD) {
        return next();
    }
    
    // For more secure token validation (optional)
    // You can also validate against stored tokens
    // if (activeTokens && activeTokens.includes(token)) {
    //     return next();
    // }
    
    res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.'
    });
}

// ============================================
// ADMIN LOGIN HANDLER (for /api/admin/login)
// ============================================
function login(req, res) {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide username and password'
        });
    }
    
    // The returned token is the password itself, which isAuthenticated()
    // verifies against ADMIN_PASSWORD, so keep the checks in sync.
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        res.json({
            success: true,
            token: password,
            message: 'Login successful!'
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid credentials!'
        });
    }
}

module.exports = {
    isAuthenticated,
    login
};