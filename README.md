# MS Signature Dining 🍽️

A full-stack restaurant ordering and reservation platform built with Node.js backend and Vanilla JavaScript frontend.

**Live Repository:** https://github.com/AzharMahmood2000/ms-signature-dining

---

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Main Features](#main-features)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [API Endpoints](#api-endpoints)
- [Database](#database)
- [Key JavaScript Files](#key-javascript-files)
- [API Integration](#api-integration)
- [Testing](#testing)
- [Common Issues](#common-issues)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 📝 Project Overview

MS Signature Dining is a complete restaurant management system that allows:
- Users to browse menu items
- Add items to cart and place orders
- Book table reservations
- Manage user profiles
- Admin dashboard for restaurant management

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** SQLite with Prisma ORM
- **Authentication:** JWT Tokens
- **Process Manager:** Nodemon

### Frontend
- **HTML5** - Page structure
- **CSS3** - Styling and responsive design
- **Vanilla JavaScript** - Client-side logic
- **Fetch API** - Server communication

### Tools & DevOps
- **Version Control:** Git & GitHub
- **Package Manager:** npm
- **Code Quality:** Biome (Linter/Formatter)

---

## ✨ Main Features

### User Features
- ✅ User Authentication (Sign up, Login, Logout)
- ✅ Browse Restaurant Menu
- ✅ Search & Filter Menu Items
- ✅ Add Items to Cart
- ✅ Place Orders with Delivery Address
- ✅ View Order History & Status
- ✅ Book Table Reservations
- ✅ User Profile Management
- ✅ Payment Integration Ready

### Admin Features
- ✅ Admin Dashboard
- ✅ Manage Menu Items
- ✅ View All Orders
- ✅ Update Order Status
- ✅ Manage Reservations
- ✅ User Management

---

## 📂 Project Structure

```
ms-signature-dining/
├── backend/                    # Node.js/Express API (TypeScript)
│   ├── src/
│   │   ├── server.ts          # Main server file
│   │   ├── @types/            # TypeScript type definitions
│   │   ├── config/            # Configuration
│   │   ├── controllers/       # Route handlers
│   │   ├── helpers/           # Utility functions
│   │   ├── middlewares/       # Express middlewares
│   │   ├── models/            # Data models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   └── validators/        # Input validation
│   ├── prisma/               # Database schema
│   ├── database.js           # Database setup
│   ├── index.js              # Entry point
│   ├── package.json
│   └── biome.json
│
├── frontend/                  # HTML/CSS/JavaScript UI
│   ├── script/               # JavaScript files
│   │   ├── menu.js           # Menu functionality
│   │   ├── cart.js           # Shopping cart
│   │   ├── checkout.js       # Order checkout
│   │   ├── home.js           # Home page
│   │   ├── login.js          # Authentication
│   │   ├── profile.js        # User profile
│   │   ├── reservation.js    # Table booking
│   │   ├── fooddetail.js     # Item details
│   │   ├── contact.js        # Contact form
│   │   ├── aboutus.js        # About page
│   │   ├── services.js       # Services page
│   │   ├── signup.js         # Sign up
│   │   ├── payments.js       # Payment processing
│   │   └── index.js          # Common functions
│   ├── Styles/               # CSS files
│   │   ├── Home.css
│   │   ├── menu.css
│   │   ├── cartpage.css
│   │   ├── checkout.css
│   │   ├── login.css
│   │   ├── signup.css
│   │   ├── profile.css
│   │   ├── reservation.css
│   │   ├── fooddetail.css
│   │   ├── payments.css
│   │   ├── aboutus.css
│   │   ├── services.css
│   │   ├── contact.css
│   │   └── cartpage.css
│   ├── images/               # Restaurant images
│   ├── admin/                # Admin panel
│   ├── *.html                # HTML pages
│   └── index.html            # Main entry page
│
├── package.json              # Root dependencies
├── scratch_reservations.sql  # Database schema
└── README.md                 # This file
```

---

## 🚀 Quick Start

### Clone Repository
```bash
git clone https://github.com/AzharMahmood2000/ms-signature-dining.git
cd ms-signature-dining
```

### Start Backend (Terminal 1)
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
# Backend runs on http://localhost:3000
```

### Start Frontend (Terminal 2)
```bash
cd frontend
# Option 1: Open index.html directly in browser
# Option 2: Use VS Code Live Server extension
# Option 3: Use Python's simple server: python -m http.server 8000
```

---

## 🔧 Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create Environment File (.env)
```env
DATABASE_URL="file:./database.sqlite"
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret_key_here_min_32_chars
FRONTEND_URL=http://localhost:8000
```

### 3. Initialize Database
```bash
npx prisma migrate dev --name init
npx prisma db seed  # Optional: seed with sample data
```

### 4. Verify Database
```bash
npx prisma studio  # Opens database browser
```

### 5. Start Backend Server
```bash
npm run dev
# Server runs on http://localhost:3000
```

---

## 📱 Frontend Setup

### Option 1: Direct File Opening
```bash
cd frontend
# Right-click index.html → Open with Browser
```

### Option 2: VS Code Live Server
```bash
1. Install "Live Server" extension in VS Code
2. Right-click index.html
3. Select "Open with Live Server"
```

### Option 3: Python Simple Server
```bash
cd frontend
python -m http.server 8000
# Access at http://localhost:8000
```

### Important
Make sure the backend is running on port 3000, as all frontend files fetch data from it.

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/signup        - Register new user
POST   /api/auth/login         - User login
POST   /api/auth/logout        - User logout
```

### Menu
```
GET    /api/menu               - Get all menu items
GET    /api/menu/:id           - Get item by ID
POST   /api/menu               - Create item (Admin)
PUT    /api/menu/:id           - Update item (Admin)
DELETE /api/menu/:id           - Delete item (Admin)
```

### Orders
```
GET    /api/orders             - Get user's orders
POST   /api/orders             - Create new order
GET    /api/orders/:id         - Get order details
PUT    /api/orders/:id         - Update order status (Admin)
DELETE /api/orders/:id         - Cancel order
```

### Reservations
```
GET    /api/reservations       - Get user's reservations
POST   /api/reservations       - Create reservation
PUT    /api/reservations/:id   - Modify reservation
DELETE /api/reservations/:id   - Cancel reservation
```

### Users
```
GET    /api/users/profile      - Get current user profile
PUT    /api/users/profile      - Update user profile
```

---

## 🗄️ Database

### SQLite with Prisma ORM

**Main Tables:**
- `users` - User accounts and profiles
- `menu_items` - Restaurant menu
- `orders` - Customer orders
- `order_items` - Items in each order
- `reservations` - Table bookings
- `payments` - Payment records

**Schema Location:** `scratch_reservations.sql`

---

## 📄 Key JavaScript Files

| File | Purpose |
|------|---------|
| `script/menu.js` | Load and display menu items from API |
| `script/cart.js` | Add/remove items, manage cart state |
| `script/checkout.js` | Order placement and payment |
| `script/home.js` | Home page features |
| `script/login.js` | User authentication (login/signup) |
| `script/profile.js` | User profile management |
| `script/reservation.js` | Table booking functionality |
| `script/fooddetail.js` | Individual item details |
| `script/contact.js` | Contact form handling |
| `script/payments.js` | Payment processing |

---

## 🔗 API Integration

All frontend JavaScript files communicate with the backend using Fetch API.

### Example: Getting Menu Data (from menu.js)
```javascript
// Location: frontend/script/menu.js (Line 50)

function loadMenu() {
    fetch('http://localhost:3000/api/menu')
        .then(res => res.json())
        .then(data => {
            renderMenuItems(data);
        })
        .catch(err => console.error('Error fetching menu:', err));
}

function renderMenuItems(items) {
    menuGrid.innerHTML = ''; // Clear existing
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        // Display item in HTML
        menuGrid.appendChild(card);
    });
}
```

### Example: Creating an Order
```javascript
// In checkout.js
const order = {
    userId: currentUserId,
    items: cartItems,
    totalPrice: calculateTotal(),
    deliveryAddress: address
};

fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(order)
})
.then(res => res.json())
.then(data => {
    console.log('Order created:', data);
    // Redirect to success page
});
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Security Audit
```bash
npm audit
```

### Manual API Testing
Use Postman or curl:
```bash
# Test login endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'
```

---

## 🆘 Common Issues

### Issue: Backend not responding
**Solution:**
```bash
# Make sure backend is running
cd backend
npm run dev
# Check if port 3000 is available
```

### Issue: API returns 404 errors
**Solution:**
- Verify API endpoint URLs in JavaScript files
- Check backend console for error messages
- Ensure backend port is 3000

### Issue: CORS errors
**Solution:**
- Verify backend CORS configuration
- Check `FRONTEND_URL` in backend .env file
- Ensure frontend and backend URLs match

### Issue: Database connection error
**Solution:**
```bash
# Recreate database
cd backend
rm database.sqlite
npx prisma migrate dev --name init
npm run dev
```

### Issue: Images not loading
**Solution:**
- Check image file paths in HTML
- Ensure images are in `frontend/images/` folder
- Verify image file names match

---

## 📦 Deployment

### Backend Deployment (Heroku)
```bash
cd backend
heroku create ms-signature-dining-api
git push heroku main
heroku config:set DATABASE_URL="your_database_url"
heroku config:set JWT_SECRET="your_secret_key"
```

### Backend Deployment (AWS EC2)
```bash
1. Create EC2 instance
2. Install Node.js
3. Clone repository
4. Setup .env file
5. Run: npm install && npm start
```

### Frontend Deployment
```bash
# GitHub Pages
1. Push frontend folder to gh-pages branch
2. Enable GitHub Pages in repository settings

# Or host with backend on same server
```

---

## 🤝 Contributing

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ms-signature-dining.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**

---

## 📞 Support & Contact

- **GitHub Issues:** https://github.com/AzharMahmood2000/ms-signature-dining/issues
- **Repository:** https://github.com/AzharMahmood2000/ms-signature-dining

---

## 🚀 Future Enhancements

- [ ] Real-time payment gateway integration (Stripe/PayPal)
- [ ] Real-time order status tracking with WebSockets
- [ ] Mobile app (React Native or Flutter)
- [ ] SMS/Email notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Rating & review system
- [ ] Loyalty program
- [ ] QR code ordering
- [ ] Social media integration

---

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

**Last Updated:** April 24, 2026  
**Version:** 1.0.0  
**Status:** Active Development
