# E-commerce Website

A full-stack e-commerce website built with:
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT-based
- **Images/Data:** Product images and data are served via backend API (image URLs from public image APIs)

## Features
- Product listings and details (with images)
- Shopping cart (add, remove, update quantity)
- User authentication (register, login, logout)
- Order processing (checkout, place order, store order details)
- Admin panel for product management (add/edit/delete)

## Folder Structure
```
ecommerce/
  backend/
    controllers/
    models/
    routes/
    middleware/
    config/
    public/
    server.js
  frontend/
    css/
    js/
    images/
    index.html
    product.html
    cart.html
    login.html
    register.html
    admin.html
  README.md
```

## Getting Started

### Prerequisites
- Node.js
- MongoDB

### Backend Setup
1. `cd backend`
2. Run `npm install`
3. Create a `.env` file with your MongoDB URI and JWT secret:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Run the server:
   ```
   npm start
   ```

### Frontend Setup
- Open `frontend/index.html` in your browser (served via backend or directly for static files).

## API Endpoints
- `/api/products` - Get all products
- `/api/products/:id` - Get product details
- `/api/cart` - Manage cart
- `/api/auth` - Register/Login/Logout
- `/api/orders` - Place and view orders
- `/api/admin/products` - Admin product management

## Notes
- Product images use public image APIs (e.g., Unsplash, Lorem Picsum).
- All product and user data is managed via REST API.

---
Feel free to customize and extend the project as needed! 