const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.message);
    } else {
        console.log('✅ Connected to the SQLite database.');
    }
});

// Enable WAL mode for better performance
db.run('PRAGMA journal_mode=WAL');

db.serialize(() => {

    // ===================== USERS TABLE =====================
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => { if (err) console.error('users table:', err.message); });

    // ===================== MENU ITEMS TABLE =====================
    db.run(`CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        price_large REAL DEFAULT 0,
        category TEXT,
        image_url TEXT,
        available INTEGER DEFAULT 1,
        rating REAL DEFAULT 4.5,
        total_orders INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => { 
        if (err) console.error('menu_items table:', err.message); 
        else {
            // Attempt to add columns to existing table (will fail silently if already exists)
            db.run("ALTER TABLE menu_items ADD COLUMN price_large REAL DEFAULT 0", (e) => {});
            db.run("ALTER TABLE menu_items ADD COLUMN extra_prices TEXT", (e) => {});
        }
    });

    // ===================== ORDERS TABLE =====================
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        customer_name TEXT,
        customer_email TEXT,
        customer_phone TEXT,
        delivery_address TEXT,
        city TEXT,
        postal_code TEXT,
        payment_method TEXT DEFAULT 'cash',
        status TEXT DEFAULT 'pending',
        subtotal REAL DEFAULT 0,
        shipping REAL DEFAULT 400,
        total_amount REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => { 
        if (err) console.error('orders table:', err.message);
        else {
            db.run("ALTER TABLE orders ADD COLUMN discount REAL DEFAULT 0", (e) => {});
        }
    });

    // ===================== ORDER ITEMS TABLE =====================
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        menu_item_id INTEGER NOT NULL,
        item_name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL
    )`, (err) => { if (err) console.error('order_items table:', err.message); });

    // ===================== PAYMENTS TABLE =====================
    db.run(`CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        card_last4 TEXT,
        status TEXT DEFAULT 'completed',
        transaction_id TEXT,
        paid_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => { if (err) console.error('payments table:', err.message); });

    // ===================== REVIEWS TABLE =====================
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        menu_item_id INTEGER,
        rating INTEGER NOT NULL,
        comment TEXT,
        reviewer_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => { if (err) console.error('reviews table:', err.message); });

    // ===================== CONTACT MESSAGES TABLE =====================
    db.run(`CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'unread',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => { if (err) console.error('contact_messages table:', err.message); });

    // ===================== PLACES TABLE =====================
    db.run(`CREATE TABLE IF NOT EXISTS places (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        distance TEXT,
        image_url TEXT,
        phone TEXT,
        hours TEXT
    )`, (err) => { if (err) console.error('places table:', err.message); });

    // ===================== RESERVATIONS TABLE =====================
    db.run(`CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        guests INTEGER NOT NULL,
        special_requests TEXT,
        status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => { if (err) console.error('reservations table:', err.message); });

    // ===================== SEED DATA =====================

    // Seed places
    db.get("SELECT COUNT(*) AS count FROM places", (err, row) => {
        if (!err && row && row.count === 0) {
            const stmt = db.prepare("INSERT INTO places (name, address, distance, image_url, phone, hours) VALUES (?, ?, ?, ?, ?, ?)");
            stmt.run("Colombo Branch", "No. 236, Main Street, Colombo", "0km", "images/front.jpg", "+94 11 234 5678", "Mon-Sun 7am-11pm");
            stmt.run("Kandy Branch", "No. 45, Hill Top Road, Kandy", "115km", "images/pretty-woman-waiting-in-restaurant-photo.jpg", "+94 81 234 5678", "Mon-Sun 8am-10pm");
            stmt.run("Galle Branch", "No. 12, Ocean View, Galle", "120km", "images/back.jpg", "+94 91 234 5678", "Mon-Sun 8am-10pm");
            stmt.finalize();
        }
    });

    // Seed menu items, then reviews after finalize
    db.get("SELECT COUNT(*) AS count FROM menu_items", (err, row) => {
        if (!err && row && row.count === 0) {
            const stmt = db.prepare("INSERT INTO menu_items (name, description, price, category, image_url, rating, total_orders) VALUES (?, ?, ?, ?, ?, ?, ?)");
            stmt.run("Pepper Chicken", "Juicy chicken with black pepper sauce", 200, "main course", "images/pepper chicken_resized.jpg", 4.8, 145);
            stmt.run("Sea Food", "Fresh banana seafood mix", 250, "main course", "images/sea food banana_resized.webp", 4.7, 98);
            stmt.run("Chicken with Mushroom", "Tender chicken with button mushrooms", 180, "main course", "images/chicken with mushroom_resized.jpg", 4.6, 112);
            stmt.run("Hot Butter Mushroom", "Crispy mushrooms in butter sauce", 300, "side dishes", "images/hot butter mushroom.png", 4.9, 87);
            stmt.run("Rice & Curry", "Traditional Sri Lankan rice and curry", 220, "main course", "images/rice and curry 1.jpg", 4.5, 203);
            stmt.run("Nasi & Carry", "Fragrant rice with spicy curry", 150, "main course", "images/rice and curry 2.webp", 4.4, 167);
            stmt.run("Polos", "Traditional jackfruit curry", 150, "side dishes", "images/rice and curry 3.webp", 4.3, 56);
            stmt.run("Noodles", "Stir-fried noodles with vegetable medley", 150, "breakfast items", "images/shaved radish side dish 2.webp", 4.5, 78);
            stmt.run("Cocoa", "Rich and creamy hot chocolate", 150, "beverages", "images/cocoa.jpg", 4.7, 189);
            stmt.run("Baby Poteto", "Roasted baby potatoes with herbs", 150, "side dishes", "images/baby poteto.jpg", 4.2, 43);
            stmt.run("Onion Side Dish", "Caramelized onions with traditional spices", 150, "side dishes", "images/shaved radish side dish 2.webp", 4.1, 34);
            stmt.run("Nasigurang", "Indonesian style fried rice", 150, "main course", "images/nasi.webp", 4.6, 91);
            stmt.run("Coconut Balls", "Sweet coconut treats", 150, "desserts & sweets", "images/coconut balls.webp", 4.8, 134);
            stmt.run("Poteto Brownies", "Unique potato-based chocolate brownies", 150, "desserts & sweets", "images/poteto brownies.webp", 4.7, 102);
            stmt.run("Fruit Juice", "Freshly squeezed seasonal fruits", 150, "beverages", "images/juice.jpg", 4.6, 156);
            stmt.run("Coffee", "Freshly brewed premium coffee", 150, "beverages", "images/coffee.jpg", 4.8, 210);
            stmt.finalize(() => {
                // Seed reviews AFTER menu items are committed
                const rStmt = db.prepare("INSERT INTO reviews (menu_item_id, rating, comment, reviewer_name) VALUES (?, ?, ?, ?)");
                rStmt.run(1, 5, "Absolutely amazing! Best pepper chicken I've ever had.", "Amara Silva");
                rStmt.run(5, 4, "The rice and curry tasted just like home. Perfect flavors.", "Kamal Perera");
                rStmt.run(9, 5, "The cocoa was rich and creamy. Highly recommended!", "Nisha Fernando");
                rStmt.run(13, 5, "Coconut balls are a must try. Melts in your mouth!", "Roshan Jayawardena");
                rStmt.finalize();
                console.log('✅ Menu items and reviews seeded.');
            });
        }
    });
    // ===================== HOMEPAGE DISHES TABLE =====================
    db.run(`CREATE TABLE IF NOT EXISTS homepage_dishes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price TEXT NOT NULL,
        price_large TEXT,
        image_url TEXT,
        link_url TEXT DEFAULT 'fooddetail.html',
        sort_order INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => { 
        if (err) console.error('homepage_dishes table:', err.message); 
        else {
            db.run("ALTER TABLE homepage_dishes ADD COLUMN price_large TEXT", (e) => {});
        }
    });

    // ===================== HOMEPAGE COLLECTIONS TABLE =====================
    db.run(`CREATE TABLE IF NOT EXISTS homepage_collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price TEXT NOT NULL,
        image_url TEXT,
        link_url TEXT DEFAULT 'fooddetail.html',
        sort_order INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => { if (err) console.error('homepage_collections table:', err.message); });

    // Seed Signature Dishes
    db.get("SELECT COUNT(*) AS count FROM homepage_dishes", (err, row) => {
        if (!err && row && row.count === 0) {
            const stmt = db.prepare("INSERT INTO homepage_dishes (name, description, price, image_url, sort_order) VALUES (?, ?, ?, ?, ?)");
            stmt.run("Pepper Chicken", "Spiced to perfection with a blend of aromatic peppers and traditional seasonings.", "Rs.1350", "images/pepper chicken_resized.jpg", 1);
            stmt.run("Sea Food Banana Leaf", "Fresh seafood wrapped in traditional banana leaves with a medley of herbs and spices.", "Rs.950", "images/sea food banana_resized.webp", 2);
            stmt.run("Chicken with Mushroom Sauce", "Tender chicken in a rich and creamy mushroom sauce with a hint of garlic and herbs.", "Rs.1100", "images/chicken with mushroom_resized.jpg", 3);
            stmt.run("Hot Butter Mushroom", "Sautéed mushrooms in hot butter with a fiery blend of spices for a bold flavor.", "Rs.1400", "images/hot butter mushroom.png", 4);
            stmt.finalize(() => console.log('✅ Homepage dishes seeded.'));
        }
    });

    // Seed Featured Collections
    db.get("SELECT COUNT(*) AS count FROM homepage_collections", (err, row) => {
        if (!err && row && row.count === 0) {
            const stmt = db.prepare("INSERT INTO homepage_collections (name, description, price, image_url, sort_order) VALUES (?, ?, ?, ?, ?)");
            stmt.run("Sea food menu", "Fresh from the ocean to your plate, our seafood dishes are crafted with the finest catch, infused with rich flavors and signature spices.", "Rs.2750", "images/nasi.webp", 1);
            stmt.run("Rice menu", "From classic favorites to signature creations, each plate offers a satisfying and flavorful experience.", "Rs.1250", "images/ricemenu.jpg", 2);
            stmt.run("Chicken menu", "Juicy, tender, and full of flavor, our chicken dishes are prepared with a blend of signature spices and fresh ingredients.", "Rs.1350", "images/chicken menu.webp", 3);
            stmt.run("Vegetarian menu", "Each plate offers a perfect balance of taste and nutrition, celebrating the richness of plant-based cuisine.", "Rs.1250", "images/vegetarian.webp", 4);
            stmt.finalize(() => console.log('✅ Homepage collections seeded.'));
        }
    });

    // ===================== ADMIN USER SEED =====================
    db.get("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'", (err, row) => {
        if (!err && row && row.count === 0) {
            db.run(`INSERT INTO users (firstName, lastName, email, phone, password, role) 
                   VALUES ('System', 'Admin', 'admin@mssignature.com', '0000000000', 'admin123', 'admin')`, 
                   (err) => { if (!err) console.log('✅ Default admin user created.'); });
        }
    });
});

module.exports = db;
