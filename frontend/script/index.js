//index.js

const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.get('/about', (req, res) => {
    res.send('This is the about page.');
}   );

app.get('/contact', (req, res) => {
    res.send('Contact us here.');
});

// ..(keep express setup)
const sqlite3 =
    require('sqlite3').verbose();
    const db = new sqlite3.Database('./users.db');

    app.use(express.json());  // remember to add this POST requests later

// ... (keep root '/' and other simpe routes)

  app.get('/api/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// ... (keep app.listen)

app.get ('/api/users/:id', (req, res) => {
    const sql = 'SELECT * FROM users WHERE id = ?';

        db.get(sql, [req.params.id], (err, row) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            if (row) {
                res.json(row);
            } else {
                res.status(404).send('User not found');
            }
        });
});

app.post('/api/users', (req, res) => {
    const { name, email } = req.body;
    const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';

    db.run(sql, [name, email], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, name, email });
    });
});


// A simple logger middleware
const logger = (req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);    
    next();  // Pass control to the next middleware
};

//Use the logger for all routes (place it before your routes)
app.use(logger);


