const express = require('express');
require('dotenv').config();
const cors = require('cors');

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const blogRoutes = require('./routes/blogRoutes');

// ১. আগে app ইনিশিয়ালাইজ করো
const app = express();

// ২. এরপর CORS মিডলওয়্যার
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ৩. বডি পার্সার
app.use(express.json());

// API Base Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Blog REST API is running successfully.' });
});

app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found.' });
});

const PORT = process.env.PORT || 5000;

db.getConnection()
    .then((connection) => {
        console.log('Database connected successfully to blogdb_api.');
        connection.release();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection failed:', err.message);
    });