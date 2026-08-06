const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Allowed file types
const ALLOWED_TYPES = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg'
};

// Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;


// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        
        const uploadPath = path.join(__dirname, '..', 'public', 'uploads');
        
        // Create folder if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

// ============================================
// FILE FILTER
// ============================================

const fileFilter = (req, file, cb) => {
    // Check if file type is allowed
    if (ALLOWED_TYPES[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} is not allowed. Allowed: ${Object.keys(ALLOWED_TYPES).join(', ')}`), false);
    }
};

// ============================================
// CREATE MULTER INSTANCE
// ============================================

const upload = multer({
    storage: storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter: fileFilter
});

// ============================================
// UPLOAD MIDDLEWARE FUNCTIONS
// ============================================

// Single file upload
const uploadSingle = (fieldName) => {
    return upload.single(fieldName);
};

// Multiple files upload
const uploadMultiple = (fieldName, maxCount) => {
    return upload.array(fieldName, maxCount || 10);
};

// Multiple fields upload
const uploadFields = (fields) => {
    return upload.fields(fields);
};

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === 'FILE_TOO_LARGE') {
            return res.status(400).json({
                success: false,
                message: `File too large. Max size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files uploaded'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected file field'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    
    next();
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Delete file helper
const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};

// Get file info helper
const getFileInfo = (file) => {
    if (!file) return null;
    return {
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        url: `/uploads/${file.filename}`
    };
};

// ============================================
// EXPORT
// ============================================

module.exports = {
    upload,
    uploadSingle,
    uploadMultiple,
    uploadFields,
    handleUploadError,
    deleteFile,
    getFileInfo,
    ALLOWED_TYPES,
    MAX_FILE_SIZE
};