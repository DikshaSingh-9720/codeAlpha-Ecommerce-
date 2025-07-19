const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// POST /api/orders - Place an order (auth optional for guest checkout)
router.post('/', async (req, res) => {
  const { name, email, address, items } = req.body;
  
  // Validate required fields
  if (!name || !email || !address || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide name, email, address, and at least one item.' 
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide a valid email address.' 
    });
  }
  
  try {
    // Check if user is authenticated
    let userId = null;
    let userEmail = email;
    
    // Try to get user info from auth token if present
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
        userEmail = decoded.email || email; // Use token email if available
      } catch (tokenError) {
        console.log('Invalid token, proceeding as guest checkout');
      }
    }
    
    // Validate items have required fields
    for (const item of items) {
      if (!item._id || !item.title || !item.price || !item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid item data. Each item must have id, title, price, and quantity.' 
        });
      }
    }
    
    const order = new Order({
      name,
      email: userEmail,
      address,
      items: items.map(item => ({
        _id: item._id,
        title: item.title,
        price: item.price,
        imageUrl: item.imageUrl,
        quantity: item.quantity
      })),
      userId: userId,
      status: 'Pending'
    });
    
    await order.save();
    
    console.log('Order placed successfully:', {
      orderId: order._id,
      customerName: name,
      customerEmail: userEmail,
      itemCount: items.length,
      total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    });
    
    res.json({ 
      success: true, 
      orderId: order._id,
      message: 'Order placed successfully!' 
    });
    
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to place order. Please try again.' 
    });
  }
});

// GET /api/orders - Get order history for user (or all for admin)
router.get('/', auth, async (req, res) => {
  try {
    let orders;
    if (req.user.isAdmin) {
      orders = await Order.find().sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    }
    res.json(orders);
  } catch (err) {
    console.error('Order fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
});

// GET /api/orders/:orderId - Get specific order details
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    
    // Check if user can access this order (owner or admin)
    if (!req.user.isAdmin && order.userId?.toString() !== req.user.userId?.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    
    res.json(order);
  } catch (err) {
    console.error('Order detail fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch order details.' });
  }
});

module.exports = router; 