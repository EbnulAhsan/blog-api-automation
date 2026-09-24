const bcrypt = require('bcryptjs');
const db = require('../config/db');


exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, firstname, lastname, email, isActive, role, createAt, updateAt FROM users'
        );
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};


exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const [users] = await db.query(
            'SELECT id, firstname, lastname, email, isActive, role, createAt, updateAt FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json(users[0]);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};


exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: 'isActive field must be a boolean (true or false).' });
        }

        const [users] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        await db.query('UPDATE users SET isActive = ? WHERE id = ?', [isActive, id]);

        return res.status(200).json({
            message: `User status successfully updated to ${isActive ? 'active' : 'deactivated'}.`
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};


exports.getOwnProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const [users] = await db.query(
            'SELECT id, firstname, lastname, email, isActive, role, createAt, updateAt FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json(users[0]);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};


exports.updateOwnProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { firstname, lastname } = req.body;

        if (!firstname || !lastname) {
            return res.status(400).json({ message: 'Firstname and lastname are required.' });
        }


        await db.query(
            'UPDATE users SET firstname = ?, lastname = ? WHERE id = ?',
            [firstname, lastname, userId]
        );

        return res.status(200).json({ message: 'Profile updated successfully.' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};


exports.updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        return res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};