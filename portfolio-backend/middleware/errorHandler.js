// ============================================
// MIDDLEWARE/ERRORHANDLER.JS
// ============================================

function errorHandler(err, req, res, next) {
    console.error('❌ Error:', err.stack);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            error: err.toString()
        })
    });
}

// Not found handler
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
}

// Validation error handler
function validationError(err, req, res, next) {
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: err.errors
        });
    }
    next(err);
}

module.exports = {
    errorHandler,
    notFoundHandler,
    validationError
};