const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function seedData() {
    try {
        console.log('Seeding initial data...');

        // Clear existing data
        await db.query('DELETE FROM blogs');
        await db.query('DELETE FROM users');

        // Hash default password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // 1. Insert Admin User
        const [adminResult] = await db.query(
            `INSERT INTO users (firstname, lastname, email, password, isActive, role) 
       VALUES (?, ?, ?, ?, true, 'admin')`,
            ['Super', 'Admin', 'admin@example.com', hashedPassword]
        );
        const adminId = adminResult.insertId;

        // 2. Insert Normal User
        const [userResult] = await db.query(
            `INSERT INTO users (firstname, lastname, email, password, isActive, role) 
       VALUES (?, ?, ?, ?, true, 'user')`,
            ['John', 'Doe', 'john@example.com', hashedPassword]
        );
        const userId = userResult.insertId;

        // 3. Insert Sample Blogs
        await db.query(
            `INSERT INTO blogs (userId, blogTitle, blog, category) VALUES 
       (?, 'Introduction to API Testing', 'Fundamentals of REST API testing using Postman...', 'Testing'),
       (?, 'Automating with Playwright', 'Complete guide to modern end-to-end automation testing...', 'Automation'),
       (?, 'SDET Career Roadmap', 'Essential skills and best practices for SDET engineers in 2026...', 'Career')`,
            [userId, userId, adminId]
        );

        console.log('Seeding completed successfully!');
        console.log('Credentials:');
        console.log('Admin -> admin@example.com / password123');
        console.log('User  -> john@example.com  / password123');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error.message);
        process.exit(1);
    }
}

seedData();