const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');


router.get('/profile', authenticateToken, userController.getOwnProfile);
router.put('/profile/update', authenticateToken, userController.updateOwnProfile);
router.patch('/password', authenticateToken, userController.updatePassword);


router.get('/', authenticateToken, authorizeAdmin, userController.getAllUsers);
router.get('/:id', authenticateToken, authorizeAdmin, userController.getUserById);
router.patch('/:id/status', authenticateToken, authorizeAdmin, userController.updateUserStatus);

module.exports = router;