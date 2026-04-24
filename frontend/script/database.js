const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the users database.');
});

db.serialize(() => {
    // ✅ USERS TABLE - For authentication
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('✅ Users table created successfully.');
        }
    });

    // ✅ MENU/FOOD ITEMS TABLE
    db.run(`CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT,
        image_url TEXT,
        available BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('✅ Menu items table created successfully.');
        }
    });

    // ✅ ORDERS TABLE
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        delivery_address TEXT,
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        delivery_date DATETIME,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('✅ Orders table created successfully.');
        }
    });

    // ✅ ORDER ITEMS TABLE
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        menu_item_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY(order_id) REFERENCES orders(id),
        FOREIGN KEY(menu_item_id) REFERENCES menu_items(id)
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('✅ Order items table created successfully.');
        }
    });

    // ✅ PAYMENTS TABLE
    db.run(`CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT,
        status TEXT DEFAULT 'completed',
        transaction_id TEXT,
        payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(order_id) REFERENCES orders(id)
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('✅ Payments table created successfully.');
        }
    });
});

module.exports = db;