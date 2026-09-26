const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const userController = require('../controllers/userController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const userId = req.user?.id || req.user?.userId || 'user';
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `avatar-${userId}-${uniqueSuffix}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        const ext = path.extname(file.originalname).toLowerCase();
        const mime = file.mimetype;
        if (allowed.test(ext) && allowed.test(mime)) {
            return cb(null, true);
        }
        cb(new Error('Only JPEG, JPG, PNG, and WebP images are allowed.'));
    },
});

// Profile endpoints
router.get('/profile', authenticateToken, userController.getOwnProfile);
router.put('/profile/update', authenticateToken, userController.updateOwnProfile);

// PATCH /api/users/profile/image
router.patch(
    '/profile/image',
    authenticateToken,
    upload.single('image'),
    (req, res, next) => {
        // If controller already has an upload handler, call it
        if (userController.updateProfileImage) {
            return userController.updateProfileImage(req, res, next);
        }
        if (userController.uploadAvatar) {
            return userController.uploadAvatar(req, res, next);
        }

        // Default standalone handler
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded.' });
        }

        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        return res.status(200).json({
            message: 'Profile image updated successfully.',
            imageUrl: imageUrl,
            image: imageUrl,
        });
    }
);

router.patch('/password', authenticateToken, userController.updatePassword);

// Admin-only endpoints
router.get('/', authenticateToken, authorizeAdmin, userController.getAllUsers);
router.get('/:id', authenticateToken, authorizeAdmin, userController.getUserById);
router.patch('/:id/status', authenticateToken, authorizeAdmin, userController.updateUserStatus);

module.exports = router;