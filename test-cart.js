const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Test database connection
async function testConnection() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
    
    // Test creating a user and cart
    const User = require('./models/User');
    const Cart = require('./models/Cart');
    const Product = require('./models/Product');
    
    // Create a test user
    const testUser = new User({
      email: 'test@example.com',
      password: 'password123'
    });
    await testUser.save();
    console.log('✅ Test user created');
    
    // Create a test product
    const testProduct = new Product({
      _id: 'test-product-1',
      title: 'Test Product',
      price: 29.99,
      imageUrl: 'https://picsum.photos/seed/test/400/300',
      description: 'A test product'
    });
    await testProduct.save();
    console.log('✅ Test product created');
    
    // Create a test cart
    const testCart = new Cart({
      userId: testUser._id,
      items: [{ productId: testProduct._id, quantity: 1 }]
    });
    await testCart.save();
    console.log('✅ Test cart created');
    
    // Test JWT token
    const token = jwt.sign({ userId: testUser._id }, 'your-super-secret-jwt-key-change-this-in-production');
    console.log('✅ JWT token created:', token.substring(0, 20) + '...');
    
    console.log('\n🎉 All tests passed! The server should work now.');
    console.log('\nTo test the cart functionality:');
    console.log('1. Start the server: node server.js');
    console.log('2. Login with test@example.com / password123');
    console.log('3. Try adding products to cart');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check if port 27017 is available');
    console.log('3. Try: mongod --dbpath /path/to/data/db');
  } finally {
    await mongoose.disconnect();
  }
}

testConnection(); 