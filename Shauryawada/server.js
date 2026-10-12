const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname))); // Serves your static HTML, CSS, and JS files

// MySQL Database Connection
// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'appuser',        // Updated username
    password: 'password123',// Updated password
    database: 'shauryawada_db'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL Database successfully.');
});

// GET Endpoint: Fetch all reviews for the scrolling ticker
app.get('/api/reviews', (req, res) => {
    const query = 'SELECT * FROM reviews ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// POST Endpoint: Save a new customer review
app.post('/api/reviews', (req, res) => {
    const { name, rating, comment } = req.body;
    if (!name || !rating || !comment) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = 'INSERT INTO reviews (name, rating, comment) VALUES (?, ?, ?)';
    db.query(query, [name, rating, comment], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Review submitted successfully!', id: result.insertId });
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});