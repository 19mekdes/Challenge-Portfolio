// Admin credentials (stored in .env for security)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// In-memory token storage (for demo)
let activeTokens = [];

function login(req, res) {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide username and password'
        });
    }
    
    // Check credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Generate simple token (in production, use JWT)
        const token = generateToken(username);
        activeTokens.push(token);
        
        res.json({
            success: true,
            token: token,
            user: {
                username: username,
                name: 'Mekdes Wale'
            },
            message: 'Login successful!'
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid credentials!'
        });
    }
}

function logout(req, res) {
    const token = req.headers.authorization;
    
    // Remove token from active tokens
    activeTokens = activeTokens.filter(t => t !== token);
    
    res.json({
        success: true,
        message: 'Logged out successfully!'
    });
}

// ============================================
// CHECK AUTH - Check if user is authenticated
// ============================================
function checkAuth(req, res) {
    res.json({
        success: true,
        authenticated: true,
        user: {
            username: ADMIN_USERNAME,
            name: 'Mekdes Wale'
        }
    });
}

// ============================================
// CHANGE PASSWORD - Change admin password
// ============================================
function changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Please provide current and new password'
        });
    }
    
    // Check current password
    if (currentPassword !== ADMIN_PASSWORD) {
        return res.status(401).json({
            success: false,
            message: 'Current password is incorrect'
        });
    }
    
    // In a real app, you would update the password in the database
    // For this demo, we'll just log it
    console.log('Password changed from:', currentPassword, 'to:', newPassword);
    
    res.json({
        success: true,
        message: 'Password changed successfully!'
    });
}

// ============================================
// HELPER - Generate simple token
// ============================================
function generateToken(username) {
    // Simple token generation (for demo only)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return Buffer.from(`${username}:${timestamp}:${random}`).toString('base64');
}

module.exports = {
    login,
    logout,
    checkAuth,
    changePassword
};