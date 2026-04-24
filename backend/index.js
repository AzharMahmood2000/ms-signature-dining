const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// ===================== MIDDLEWARE =====================
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (frontend) from the parent directory
app.use(express.static(path.join(__dirname, '../frontend')));

// ===================== ROOT ROUTE =====================
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Ms Signature Dining API</title>
            <style>
                body { font-family: Inter, sans-serif; background: #0d0d0d; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
                .box { background: #1a1a1a; border: 1px solid #333; border-radius: 16px; padding: 40px; max-width: 500px; text-align: center; }
                h1 { color: #c9a84c; margin-bottom: 8px; }
                p { color: #aaa; margin-bottom: 24px; }
                a { display: inline-block; margin: 8px; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
                .primary { background: #c9a84c; color: #000; }
                .secondary { background: #222; color: #fff; border: 1px solid #444; }
            </style>
        </head>
        <body>
            <div class="box">
                <h1>🍽️ Ms Signature Dining</h1>
                <p>API Server is running on port 5000</p>
                <a class="primary" href="/api">📖 API Docs</a>
                <a class="secondary" href="../Home.html">🏠 Go to Website</a>
            </div>
        </body>
        </html>
    `);
});

app.get('/api', (req, res) => {
    res.json({
        message: 'Ms Signature Dining API is Running ✅',
        version: '2.0.0',
        endpoints: [
            'POST /api/signup',
            'POST /api/login',
            'GET  /api/menu',
            'GET  /api/menu/:id',
            'POST /api/menu',
            'PUT  /api/menu/:id',
            'DELETE /api/menu/:id',
            'POST /api/orders',
            'GET  /api/orders',
            'GET  /api/orders/:id',
            'PUT  /api/orders/:id/status',
            'POST /api/payments',
            'GET  /api/profile/:id',
            'PUT  /api/profile/update',
            'POST /api/contact',
            'GET  /api/contact',
            'GET  /api/places',
            'GET  /api/reviews/:menu_item_id',
            'POST /api/reviews',
            'GET  /api/admin/stats',
            'GET  /api/admin/customers',
        ]
    });
});

// ======================================================
// ==================== AUTH ROUTES =====================
// ======================================================

// POST /api/signup — Register a new user
app.post('/api/signup', (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields: firstName, lastName, email, password' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const query = `INSERT INTO users (firstName, lastName, email, phone, password) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [firstName, lastName, email, phone || null, password], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'An account with this email already exists' });
            }
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        res.status(201).json({
            message: 'Account created successfully',
            user: { id: this.lastID, firstName, lastName, email }
        });
    });
});

// POST /api/login — Authenticate user
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const query = `SELECT id, firstName, lastName, email, phone, role, avatar_url FROM users WHERE email = ? AND password = ?`;
    db.get(query, [username, password], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error: ' + err.message });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar_url: user.avatar_url
            }
        });
    });
});

// POST /api/profile/update — Update user profile
app.post('/api/profile/update', (req, res) => {
    const { id, firstName, lastName, phone } = req.body;
    if (!id) return res.status(400).json({ error: 'User ID is required' });

    db.run(
        `UPDATE users SET firstName = ?, lastName = ?, phone = ? WHERE id = ?`,
        [firstName, lastName || '', phone || '', id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
            res.status(200).json({ message: 'Profile updated successfully' });
        }
    );
});

// PUT /api/profile/password — Update user password
app.put('/api/profile/password', (req, res) => {
    const { id, currentPassword, newPassword } = req.body;
    if (!id || !currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // First check if current password is correct
    db.get(`SELECT password FROM users WHERE id = ?`, [id], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        if (user.password !== currentPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // If correct, update to new password
        db.run(`UPDATE users SET password = ? WHERE id = ?`, [newPassword, id], function(updateErr) {
            if (updateErr) return res.status(500).json({ error: updateErr.message });
            res.status(200).json({ message: 'Password updated successfully' });
        });
    });
});

// ======================================================
// ==================== MENU ROUTES =====================
// ======================================================

// GET /api/menu — Get all menu items (with optional category filter)
app.get('/api/menu', (req, res) => {
    const { category, available, search } = req.query;
    let query = `SELECT * FROM menu_items WHERE 1=1`;
    const params = [];

    if (category && category !== 'all') {
        query += ` AND LOWER(category) = LOWER(?)`;
        params.push(category);
    }
    if (available !== undefined) {
        query += ` AND available = ?`;
        params.push(available === 'true' ? 1 : 0);
    }
    if (search) {
        query += ` AND (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))`;
        params.push(`%${search}%`, `%${search}%`);
    }
    query += ` ORDER BY total_orders DESC`;

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// GET /api/menu/:id — Get single menu item
app.get('/api/menu/:id', (req, res) => {
    db.get(`SELECT * FROM menu_items WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Menu item not found' });
        res.status(200).json(row);
    });
});

// POST /api/menu — Add new menu item (Admin)
app.post('/api/menu', (req, res) => {
    const { name, description, price, price_large, category, image_url, available, extra_prices } = req.body;

    if (!name || price === undefined || !category) {
        return res.status(400).json({ error: 'name, price, and category are required' });
    }

    const query = `INSERT INTO menu_items (name, description, price, price_large, category, image_url, available, extra_prices) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [name, description || '', price, price_large || 0, category, image_url || '', available !== undefined ? available : 1, extra_prices || null], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({
            message: 'Menu item created successfully',
            id: this.lastID,
            item: { id: this.lastID, name, description, price, price_large, category, image_url, available: 1, extra_prices }
        });
    });
});

// PUT /api/menu/:id — Update menu item (Admin)
app.put('/api/menu/:id', (req, res) => {
    const { name, description, price, price_large, category, image_url, available, extra_prices } = req.body;
    const query = `UPDATE menu_items SET name = ?, description = ?, price = ?, price_large = ?, category = ?, image_url = ?, available = ?, extra_prices = ? WHERE id = ?`;
    db.run(query, [name, description, price, price_large || 0, category, image_url, available, extra_prices, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Menu item not found' });
        res.status(200).json({ message: 'Menu item updated successfully' });
    });
});

// DELETE /api/menu/:id — Delete menu item (Admin)
app.delete('/api/menu/:id', (req, res) => {
    db.run(`DELETE FROM menu_items WHERE id = ?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Menu item not found' });
        res.status(200).json({ message: 'Menu item deleted successfully' });
    });
});

// ======================================================
// =================== ORDER ROUTES =====================
// ======================================================

// POST /api/orders — Place a new order
app.post('/api/orders', (req, res) => {
    const {
        user_id, customer_name, customer_email, customer_phone,
        delivery_address, city, postal_code,
        payment_method, notes, items
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    if (!customer_name || !customer_email || !delivery_address) {
        return res.status(400).json({ error: 'Customer name, email, and delivery address are required' });
    }

    // Calculate totals
    let subtotal = 0;
    const shipping = 400;

    // Validate items and calculate subtotal
    const itemIds = items.map(i => i.menu_item_id || i.id);
    const placeholders = itemIds.map(() => '?').join(',');

    db.all(`SELECT * FROM menu_items WHERE id IN (${placeholders})`, itemIds, (err, menuItems) => {
        if (err) return res.status(500).json({ error: err.message });

        const menuMap = {};
        menuItems.forEach(m => menuMap[m.id] = m);

        const orderItems = [];
        for (const item of items) {
            const menuItem = menuMap[item.menu_item_id || item.id];
            if (!menuItem) {
                return res.status(400).json({ error: `Menu item with id ${item.menu_item_id || item.id} not found` });
            }
            const qty = parseInt(item.quantity) || 1;
            const unitPrice = menuItem.price;
            const totalPrice = unitPrice * qty;
            subtotal += totalPrice;
            orderItems.push({
                menu_item_id: menuItem.id,
                item_name: menuItem.name,
                quantity: qty,
                unit_price: unitPrice,
                total_price: totalPrice
            });
        }

        // Apply Promo Code (10% Discount)
        let discount = 0;
        if (req.body.promo_code === 'DINING10') {
            discount = Math.round(subtotal * 0.1);
        }

        const total_amount = subtotal + shipping - discount;

        // Insert order
        const orderQuery = `INSERT INTO orders 
            (user_id, customer_name, customer_email, customer_phone, delivery_address, city, postal_code, payment_method, subtotal, shipping, total_amount, discount, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.run(orderQuery, [
            user_id || null, customer_name, customer_email, customer_phone || null,
            delivery_address, city || null, postal_code || null,
            payment_method || 'cash', subtotal, shipping, total_amount, discount, notes || null
        ], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            const order_id = this.lastID;

            // Insert order items
            const itemStmt = db.prepare(`INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)`);
            orderItems.forEach(oi => {
                itemStmt.run(order_id, oi.menu_item_id, oi.item_name, oi.quantity, oi.unit_price, oi.total_price);
                // Update total_orders count for each menu item
                db.run(`UPDATE menu_items SET total_orders = total_orders + ? WHERE id = ?`, [oi.quantity, oi.menu_item_id]);
            });
            itemStmt.finalize();

            res.status(201).json({
                message: 'Order placed successfully',
                order_id,
                subtotal,
                shipping,
                total_amount,
                items: orderItems
            });
        });
    });
});

// GET /api/orders — Get all orders (Admin)
app.get('/api/orders', (req, res) => {
    const { status, user_id, limit } = req.query;
    let query = `SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count
        FROM orders o WHERE 1=1`;
    const params = [];

    if (status) { query += ` AND o.status = ?`; params.push(status); }
    if (user_id) { query += ` AND o.user_id = ?`; params.push(user_id); }
    query += ` ORDER BY o.created_at DESC`;
    if (limit) { query += ` LIMIT ?`; params.push(parseInt(limit)); }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// GET /api/orders/:id — Get single order with items
app.get('/api/orders/:id', (req, res) => {
    db.get(`SELECT * FROM orders WHERE id = ?`, [req.params.id], (err, order) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        db.all(`SELECT * FROM order_items WHERE order_id = ?`, [order.id], (err2, items) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.status(200).json({ ...order, items });
        });
    });
});

// PUT /api/orders/:id/status — Update order status (Admin)
app.put('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'confirmed', 'preparing', 'delivered', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Order not found' });
        res.status(200).json({ message: `Order status updated to "${status}"` });
    });
});

// GET /api/orders/user/:user_id — Get orders by user
app.get('/api/orders/user/:user_id', (req, res) => {
    db.all(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`, [req.params.user_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// ======================================================
// =================== PAYMENT ROUTES ===================
// ======================================================

// POST /api/payments — Process a payment
app.post('/api/payments', (req, res) => {
    const { order_id, amount, payment_method, card_last4 } = req.body;

    if (!order_id || !amount || !payment_method) {
        return res.status(400).json({ error: 'order_id, amount, and payment_method are required' });
    }

    // Verify order exists
    db.get(`SELECT * FROM orders WHERE id = ?`, [order_id], (err, order) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const transactionId = 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();

        const query = `INSERT INTO payments (order_id, amount, payment_method, card_last4, transaction_id, status) VALUES (?, ?, ?, ?, ?, ?)`;
        db.run(query, [order_id, amount, payment_method, card_last4 || null, transactionId, 'completed'], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // Update order status to confirmed after payment
            db.run(`UPDATE orders SET status = 'confirmed', payment_method = ? WHERE id = ?`, [payment_method, order_id]);

            res.status(201).json({
                message: 'Payment processed successfully',
                transaction_id: transactionId,
                payment_id: this.lastID,
                status: 'completed'
            });
        });
    });
});

// ======================================================
// =================== PROFILE ROUTES ===================
// ======================================================

// GET /api/profile/:id — Get user profile
app.get('/api/profile/:id', (req, res) => {
    db.get(`SELECT id, firstName, lastName, email, phone, role, avatar_url, created_at FROM users WHERE id = ?`, [req.params.id], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(user);
    });
});

// PUT /api/profile/update — Update user profile
app.put('/api/profile/update', (req, res) => {
    const { id, firstName, lastName, phone } = req.body;

    if (!id) return res.status(400).json({ error: 'User ID is required' });

    const query = `UPDATE users SET firstName = ?, lastName = ?, phone = ? WHERE id = ?`;
    db.run(query, [firstName, lastName, phone || null, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ message: 'Profile updated successfully' });
    });
});

// Backwards-compat: also allow POST for profile update
app.post('/api/profile/update', (req, res) => {
    const { id, firstName, lastName, phone } = req.body;

    if (!id) return res.status(400).json({ error: 'User ID is required' });

    const query = `UPDATE users SET firstName = ?, lastName = ?, phone = ? WHERE id = ?`;
    db.run(query, [firstName, lastName, phone || null, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ message: 'Profile updated successfully' });
    });
});

// PUT /api/profile/change-password — Change user password
app.put('/api/profile/change-password', (req, res) => {
    const { id, currentPassword, newPassword } = req.body;

    if (!id || !currentPassword || !newPassword) {
        return res.status(400).json({ error: 'id, currentPassword, and newPassword are required' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    db.get(`SELECT * FROM users WHERE id = ? AND password = ?`, [id, currentPassword], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Current password is incorrect' });

        db.run(`UPDATE users SET password = ? WHERE id = ?`, [newPassword, id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Password changed successfully' });
        });
    });
});

// ======================================================
// =================== CONTACT ROUTES ===================
// ======================================================

// POST /api/contact — Submit a contact message
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'name, email, and message are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    const query = `INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)`;
    db.run(query, [name, email, subject || 'General Inquiry', message], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({
            message: 'Your message has been received. We will get back to you shortly!',
            id: this.lastID
        });
    });
});

// GET /api/contact — Get all contact messages (Admin)
app.get('/api/contact', (req, res) => {
    db.all(`SELECT * FROM contact_messages ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// PUT /api/contact/:id/status — Mark message as read (Admin)
app.put('/api/contact/:id/status', (req, res) => {
    const { status } = req.body;
    db.run(`UPDATE contact_messages SET status = ? WHERE id = ?`, [status || 'read', req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Message status updated' });
    });
});

// ======================================================
// =================== PLACES ROUTES ====================
// ======================================================

// GET /api/places — Get all restaurant locations
app.get('/api/places', (req, res) => {
    db.all(`SELECT * FROM places`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// ======================================================
// =================== REVIEW ROUTES ====================
// ======================================================

// GET /api/reviews/:menu_item_id — Get reviews for a menu item
app.get('/api/reviews/:menu_item_id', (req, res) => {
    db.all(`SELECT * FROM reviews WHERE menu_item_id = ? ORDER BY created_at DESC`, [req.params.menu_item_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// GET /api/reviews — Get all reviews (Admin)
app.get('/api/reviews', (req, res) => {
    db.all(`SELECT r.*, m.name AS item_name FROM reviews r LEFT JOIN menu_items m ON r.menu_item_id = m.id ORDER BY r.created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// POST /api/reviews — Add a review
app.post('/api/reviews', (req, res) => {
    const { user_id, menu_item_id, rating, comment, reviewer_name } = req.body;

    if (!rating || !menu_item_id) {
        return res.status(400).json({ error: 'rating and menu_item_id are required' });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }

    const query = `INSERT INTO reviews (user_id, menu_item_id, rating, comment, reviewer_name) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [user_id || null, menu_item_id, rating, comment || '', reviewer_name || 'Anonymous'], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        // Update average rating on menu item
        db.get(`SELECT AVG(rating) AS avg_rating FROM reviews WHERE menu_item_id = ?`, [menu_item_id], (err2, row) => {
            if (!err2 && row) {
                db.run(`UPDATE menu_items SET rating = ? WHERE id = ?`, [Math.round(row.avg_rating * 10) / 10, menu_item_id]);
            }
        });

        res.status(201).json({ message: 'Review submitted successfully', id: this.lastID });
    });
});

// ======================================================
// ================== ADMIN ROUTES ======================
// ======================================================

// GET /api/admin/stats — Dashboard statistics
app.get('/api/admin/stats', (req, res) => {
    const stats = {};

    db.get(`SELECT COUNT(*) AS total_users FROM users`, (err, row) => {
        stats.total_users = row ? row.total_users : 0;

        db.get(`SELECT COUNT(*) AS total_orders, COALESCE(SUM(total_amount), 0) AS total_revenue FROM orders`, (err2, row2) => {
            stats.total_orders = row2 ? row2.total_orders : 0;
            stats.total_revenue = row2 ? parseFloat(row2.total_revenue.toFixed(2)) : 0;

            db.get(`SELECT COUNT(*) AS total_menu_items FROM menu_items WHERE available = 1`, (err3, row3) => {
                stats.total_menu_items = row3 ? row3.total_menu_items : 0;

                db.get(`SELECT COUNT(*) AS pending_orders FROM orders WHERE status = 'pending'`, (err4, row4) => {
                    stats.pending_orders = row4 ? row4.pending_orders : 0;

                    db.get(`SELECT COUNT(*) AS unread_messages FROM contact_messages WHERE status = 'unread'`, (err5, row5) => {
                        stats.unread_messages = row5 ? row5.unread_messages : 0;

                        db.get(`SELECT COALESCE(AVG(rating), 0) AS avg_rating FROM reviews`, (err6, row6) => {
                            stats.avg_rating = row6 ? Math.round(row6.avg_rating * 10) / 10 : 0;

                            res.status(200).json(stats);
                        });
                    });
                });
            });
        });
    });
});

// GET /api/admin/customers — Get all customers (Admin)
app.get('/api/admin/customers', (req, res) => {
    const query = `SELECT u.id, u.firstName, u.lastName, u.email, u.phone, u.created_at,
        COUNT(o.id) AS total_orders, COALESCE(SUM(o.total_amount), 0) AS total_spent
        FROM users u
        LEFT JOIN orders o ON o.user_id = u.id
        GROUP BY u.id
        ORDER BY u.created_at DESC`;

    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// GET /api/admin/recent-orders — Get recent orders for dashboard
app.get('/api/admin/recent-orders', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    db.all(`SELECT * FROM orders ORDER BY created_at DESC LIMIT ?`, [limit], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// GET /api/admin/popular-items — Get most ordered items
app.get('/api/admin/popular-items', (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    db.all(`SELECT * FROM menu_items ORDER BY total_orders DESC LIMIT ?`, [limit], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// ======================================================
// ============= HOMEPAGE CONTENT ROUTES ================
// ======================================================

// ----- SIGNATURE DISHES -----

// GET /api/homepage/dishes — Get all active signature dishes (public)
app.get('/api/homepage/dishes', (req, res) => {
    const onlyActive = req.query.active !== 'false';
    const q = onlyActive
        ? `SELECT * FROM homepage_dishes WHERE active = 1 ORDER BY sort_order ASC`
        : `SELECT * FROM homepage_dishes ORDER BY sort_order ASC`;
    db.all(q, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// POST /api/homepage/dishes — Add a new signature dish (Admin)
app.post('/api/homepage/dishes', (req, res) => {
    const { name, description, price, price_large, image_url, link_url, sort_order, active } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'name and price are required' });
    db.run(
        `INSERT INTO homepage_dishes (name, description, price, price_large, image_url, link_url, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, description || '', price, price_large || '', image_url || '', link_url || 'fooddetail.html', sort_order || 0, active !== undefined ? active : 1],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Dish added successfully', id: this.lastID });
        }
    );
});

// PUT /api/homepage/dishes/:id — Edit a signature dish (Admin)
app.put('/api/homepage/dishes/:id', (req, res) => {
    const { name, description, price, price_large, image_url, link_url, sort_order, active } = req.body;
    db.run(
        `UPDATE homepage_dishes SET name=?, description=?, price=?, price_large=?, image_url=?, link_url=?, sort_order=?, active=? WHERE id=?`,
        [name, description, price, price_large || '', image_url, link_url || 'fooddetail.html', sort_order || 0, active !== undefined ? active : 1, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Dish not found' });
            res.status(200).json({ message: 'Dish updated successfully' });
        }
    );
});

// DELETE /api/homepage/dishes/:id — Delete a signature dish (Admin)
app.delete('/api/homepage/dishes/:id', (req, res) => {
    db.run(`DELETE FROM homepage_dishes WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Dish not found' });
        res.status(200).json({ message: 'Dish deleted successfully' });
    });
});

// ----- FEATURED COLLECTIONS -----

// GET /api/homepage/collections — Get all active featured collections (public)
app.get('/api/homepage/collections', (req, res) => {
    const onlyActive = req.query.active !== 'false';
    const q = onlyActive
        ? `SELECT * FROM homepage_collections WHERE active = 1 ORDER BY sort_order ASC`
        : `SELECT * FROM homepage_collections ORDER BY sort_order ASC`;
    db.all(q, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// POST /api/homepage/collections — Add a featured collection (Admin)
app.post('/api/homepage/collections', (req, res) => {
    const { name, description, price, image_url, link_url, sort_order, active } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'name and price are required' });
    db.run(
        `INSERT INTO homepage_collections (name, description, price, image_url, link_url, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, description || '', price, image_url || '', link_url || 'fooddetail.html', sort_order || 0, active !== undefined ? active : 1],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Collection added successfully', id: this.lastID });
        }
    );
});

// PUT /api/homepage/collections/:id — Edit a featured collection (Admin)
app.put('/api/homepage/collections/:id', (req, res) => {
    const { name, description, price, image_url, link_url, sort_order, active } = req.body;
    db.run(
        `UPDATE homepage_collections SET name=?, description=?, price=?, image_url=?, link_url=?, sort_order=?, active=? WHERE id=?`,
        [name, description, price, image_url, link_url || 'fooddetail.html', sort_order || 0, active !== undefined ? active : 1, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Collection not found' });
            res.status(200).json({ message: 'Collection updated successfully' });
        }
    );
});

// DELETE /api/homepage/collections/:id — Delete a featured collection (Admin)
app.delete('/api/homepage/collections/:id', (req, res) => {
    db.run(`DELETE FROM homepage_collections WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Collection not found' });
        res.status(200).json({ message: 'Collection deleted successfully' });
    });
});

// ======================================================
// ================== RESERVATIONS API ==================
// ======================================================

// POST /api/reservations — Create a new table reservation
app.post('/api/reservations', (req, res) => {
    const { user_id, name, email, phone, date, time, guests, special_requests } = req.body;
    
    if (!name || !email || !phone || !date || !time || !guests) {
        return res.status(400).json({ error: 'Name, email, phone, date, time, and number of guests are required' });
    }

    const query = `INSERT INTO reservations (user_id, name, email, phone, date, time, guests, special_requests) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [user_id || null, name, email, phone, date, time, guests, special_requests || ''], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Reservation request submitted successfully', reservation_id: this.lastID });
    });
});

// GET /api/reservations — Get all reservations (Admin)
app.get('/api/reservations', (req, res) => {
    db.all(`SELECT * FROM reservations ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /api/reservations/user/:userId — Get reservations for a specific user
app.get('/api/reservations/user/:userId', (req, res) => {
    db.all(`SELECT * FROM reservations WHERE user_id = ? ORDER BY date DESC, time DESC`, [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// PUT /api/reservations/:id/status — Update reservation status (Admin)
app.put('/api/reservations/:id/status', (req, res) => {
    const { status } = req.body; // e.g. "Approved", "Rejected", "Completed"
    if (!status) return res.status(400).json({ error: 'Status is required' });

    db.run(`UPDATE reservations SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Reservation not found' });
        res.json({ message: `Reservation marked as ${status}` });
    });
});

// DELETE /api/reservations/:id — Delete a reservation (Admin)
app.delete('/api/reservations/:id', (req, res) => {
    db.run(`DELETE FROM reservations WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Reservation not found' });
        res.json({ message: 'Reservation deleted successfully' });
    });
});

// ======================================================
// =================== ERROR HANDLER ====================
// ======================================================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// ======================================================
// ==================== START SERVER ====================
// ======================================================
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ================================');
    console.log(`✅  Ms Signature Dining API v2.0`);
    console.log(`🌐  http://localhost:${PORT}`);
    console.log(`📖  API Docs: http://localhost:${PORT}/api`);
    console.log('🚀 ================================');
    console.log('');
});
