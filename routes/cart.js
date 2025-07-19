const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// All cart routes require auth
router.use(auth);

// GET /api/cart - Get user's cart
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) cart = { items: [] };
    
    // Manually populate product details since we're using string IDs
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        try {
          // Try to find product by string ID first
          let product = await Product.findById(item.productId);
          
          // If not found, try to find by string ID as string
          if (!product) {
            product = await Product.findOne({ _id: item.productId.toString() });
          }
          
          if (product) {
            return {
              _id: item.productId,
              title: product.title,
              price: product.price,
              imageUrl: product.imageUrl,
              description: product.description,
              quantity: item.quantity
            };
          } else {
            // Product not found in database, but we have it in cart
            // This means it was added from the frontend with complete data
            console.log('Product not found in database, checking if we have stored data:', item.productId);
            
            // Check if we have stored product data in the cart item
            if (item.title && item.price) {
              return {
                _id: item.productId,
                title: item.title,
                price: item.price,
                imageUrl: item.imageUrl || 'https://picsum.photos/seed/default/400/300',
                description: item.description || 'Product description not available',
                quantity: item.quantity
              };
            }
            
            // If no stored data, return basic info
            return {
              _id: item.productId,
              title: 'Product not found',
              price: 0,
              imageUrl: 'https://picsum.photos/seed/default/400/300',
              description: 'Product not available',
              quantity: item.quantity
            };
          }
        } catch (error) {
          console.error('Error populating product:', error);
          return {
            _id: item.productId,
            title: 'Product not found',
            price: 0,
            imageUrl: 'https://picsum.photos/seed/default/400/300',
            description: 'Product not available',
            quantity: item.quantity
          };
        }
      })
    );
    
    res.json(populatedItems);
  } catch (err) {
    console.error('Cart fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch cart.' });
  }
});

// POST /api/cart - Add/update item in cart
router.post('/', async (req, res) => {
  const { productId, quantity, title, price, imageUrl, description } = req.body;
  
  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ message: 'Invalid product or quantity.' });
  }

  try {
    // Check if product exists in database
    let product = await Product.findById(productId);
    
    // If not found, try to find by string ID
    if (!product) {
      product = await Product.findOne({ _id: productId.toString() });
    }
    
    // If product doesn't exist in database, create a new one with complete data
    if (!product && title && price) {
      try {
        // Create a new product with the provided ID as a string and complete data
        product = new Product({
          _id: productId.toString(), // Ensure it's a string
          title: title,
          price: price,
          imageUrl: imageUrl || 'https://picsum.photos/seed/default/400/300',
          description: description || 'Product description not available.'
        });
        await product.save();
        console.log('Product saved to database:', productId, 'Title:', title);
      } catch (saveError) {
        console.error('Error saving product:', saveError);
        // If we can't save the product, still try to add to cart
        product = { _id: productId, title, price, imageUrl, description };
      }
    } else if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) {
      cart = new Cart({ userId: req.user.userId, items: [] });
    }
    
    // Find existing item by productId (as string)
    const item = cart.items.find(i => i.productId.toString() === productId.toString());
    if (item) {
      item.quantity = quantity;
      // Update stored product data if provided
      if (title) item.title = title;
      if (price) item.price = price;
      if (imageUrl) item.imageUrl = imageUrl;
      if (description) item.description = description;
    } else {
      // Add new item with string productId and complete product data
      cart.items.push({ 
        productId: productId.toString(), 
        quantity: quantity,
        title: title || product?.title,
        price: price || product?.price,
        imageUrl: imageUrl || product?.imageUrl,
        description: description || product?.description
      });
    }
    
    cart.updatedAt = new Date();
    await cart.save();
    
    console.log('Cart updated successfully for user:', req.user.userId);
    res.json({ success: true, cart: cart.items });
  } catch (err) {
    console.error('Cart update error:', err);
    res.status(500).json({ message: 'Failed to update cart.' });
  }
});

// DELETE /api/cart/:productId - Remove item from cart
router.delete('/:productId', async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found.' });
    
    // Remove item by string productId
    cart.items = cart.items.filter(i => i.productId.toString() !== req.params.productId.toString());
    cart.updatedAt = new Date();
    await cart.save();
    
    res.json({ success: true, cart: cart.items });
  } catch (err) {
    console.error('Cart delete error:', err);
    res.status(500).json({ message: 'Failed to remove item.' });
  }
});

module.exports = router; 