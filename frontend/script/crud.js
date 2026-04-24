// crud.js - CRUD operations for users

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./users.db');

// ✅ CREATE - Add a new user
const createUser = (name, email, password, callback) => {
    const sql = 'INSERT INTO users(name, email, password) VALUES(?, ?, ?)';
    db.run(sql, [name, email, password], function(err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, { id: this.lastID, name, email });
        }
    });
};

// ✅ READ - Get all users
const getAllUsers = (callback) => {
    const sql = 'SELECT * FROM users';
    db.all(sql, [], (err, rows) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
};

// ✅ READ - Get user by ID
const getUserById = (id, callback) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.get(sql, [id], (err, row) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, row);
        }
    });
};

// ✅ UPDATE - Update user info
const updateUser = (id, name, email, callback) => {
    const sql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    db.run(sql, [name, email, id], function(err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, { id, name, email, changes: this.changes });
        }
    });
};

// ✅ DELETE - Delete user by ID
const deleteUser = (id, callback) => {
    const sql = 'DELETE FROM users WHERE id = ?';
    db.run(sql, [id], function(err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, { deleted: this.changes > 0 });
        }
    });
};

// Export functions
module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    db
};
