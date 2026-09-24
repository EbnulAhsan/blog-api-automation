const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public / Guest Routes
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);

// Protected Routes (User & Admin)
router.post('/create', authenticateToken, blogController.createBlog);
router.put('/update/:id', authenticateToken, blogController.updateBlog);


router.delete('/:id', authenticateToken, blogController.deleteBlog);
router.delete('/delete/:id', authenticateToken, blogController.deleteBlog);

module.exports = router;