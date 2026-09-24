const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
    let connection;
    try {
        // 1. Connect without selecting database first
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log('Connected to MySQL server.');

        // 2. Create database
        const dbName = process.env.DB_NAME || 'blogdb_api';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        console.log(`Database '${dbName}' created or already exists.`);

        await connection.query(`USE \`${dbName}\`;`);

        // 3. Create users table
        const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstname VARCHAR(100) NOT NULL,
        lastname VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        role VARCHAR(20) DEFAULT 'user',
        createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
        await connection.query(createUsersTable);
        console.log("Table 'users' ready.");

        // 4. Create blogs table
        const createBlogsTable = `
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        blogTitle VARCHAR(255) NOT NULL,
        blog TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
        await connection.query(createBlogsTable);
        console.log("Table 'blogs' ready.");

        console.log('Database initialization completed successfully!');
    } catch (error) {
        console.error('Initialization failed:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

initializeDatabase();