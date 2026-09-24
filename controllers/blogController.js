const db = require('../config/db');


exports.createBlog = async (req, res) => {
    try {
        const userId = req.user.id;
        const { blogTitle, blog, category } = req.body;

        if (!blogTitle || !blog || !category) {
            return res.status(400).json({ message: 'blogTitle, blog content, and category are required.' });
        }

        const [result] = await db.query(
            'INSERT INTO blogs (userId, blogTitle, blog, category) VALUES (?, ?, ?, ?)',
            [userId, blogTitle, blog, category]
        );

        return res.status(201).json({
            message: 'Blog created successfully.',
            blogId: result.insertId
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};


exports.getAllBlogs = async (req, res) => {
    try {
        const { title, category } = req.query;

        let sql = `
      SELECT 
        b.id, b.blogTitle, b.blog, b.category, b.createAt, b.updateAt,
        u.id AS authorId, u.firstname AS authorFirstname, u.lastname AS authorLastname
      FROM blogs b
      JOIN users u ON b.userId = u.id
      WHERE 1=1
    `;
        const params = [];

        if (title) {
            sql += ' AND b.blogTitle LIKE ?';
            params.push(`%${title}%`);
        }

        if (category) {
            sql += ' AND b.category = ?';
            params.push(category);
        }

        sql += ' ORDER BY b.createAt DESC';

        const [rows] = await db.query(sql, params);


        const formattedBlogs = rows.map(row => ({
            id: row.id,
            blogTitle: row.blogTitle,
            blog: row.blog,
            category: row.category,
            createAt: row.createAt,
            updateAt: row.updateAt,
            author: {
                id: row.authorId,
                firstname: row.authorFirstname,
                lastname: row.authorLastname
            }
        }));

        return res.status(200).json(formattedBlogs);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};


exports.getBlogById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(`
      SELECT 
        b.id, b.blogTitle, b.blog, b.category, b.createAt, b.updateAt,
        u.id AS authorId, u.firstname AS authorFirstname, u.lastname AS authorLastname
      FROM blogs b
      JOIN users u ON b.userId = u.id
      WHERE b.id = ?
    `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Blog not found.' });
        }

        const row = rows[0];
        const blogData = {
            id: row.id,
            blogTitle: row.blogTitle,
            blog: row.blog,
            category: row.category,
            createAt: row.createAt,
            updateAt: row.updateAt,
            author: {
                id: row.authorId,
                firstname: row.authorFirstname,
                lastname: row.authorLastname
            }
        };

        return res.status(200).json(blogData);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};


exports.updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { blogTitle, blog, category } = req.body;
        const currentUserId = req.user.id;
        const currentUserRole = req.user.role;

        if (!blogTitle || !blog || !category) {
            return res.status(400).json({ message: 'blogTitle, blog content, and category are required.' });
        }

        const [blogs] = await db.query('SELECT * FROM blogs WHERE id = ?', [id]);
        if (blogs.length === 0) {
            return res.status(404).json({ message: 'Blog not found.' });
        }

        const targetBlog = blogs[0];


        if (currentUserRole !== 'admin' && targetBlog.userId !== currentUserId) {
            return res.status(403).json({ message: 'You are not authorized to update this blog.' });
        }

        await db.query(
            'UPDATE blogs SET blogTitle = ?, blog = ?, category = ? WHERE id = ?',
            [blogTitle, blog, category, id]
        );

        return res.status(200).json({ message: 'Blog updated successfully.' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};

exports.deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.id;
        const currentUserRole = req.user.role;

        const [blogs] = await db.query('SELECT * FROM blogs WHERE id = ?', [id]);
        if (blogs.length === 0) {
            return res.status(404).json({ message: 'Blog not found.' });
        }

        const targetBlog = blogs[0];

        // Authorization check
        if (currentUserRole !== 'admin' && targetBlog.userId !== currentUserId) {
            return res.status(403).json({ message: 'You are not authorized to delete this blog.' });
        }

        await db.query('DELETE FROM blogs WHERE id = ?', [id]);

        return res.status(200).json({ message: 'Blog deleted successfully.' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};