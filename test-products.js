require('dotenv').config();
const mongoose = require('mongoose');

// Use the same connection method as server.js
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.log('Please check your MongoDB connection string in .env file');
    console.log('Current MONGO_URI:', MONGO_URI);
  });

const Product = require('./models/Product');

async function testProducts() {
  try {
    console.log('🔍 Checking products in database...\n');
    
    // Check existing products
    const existingProducts = await Product.find({});
    console.log(`Found ${existingProducts.length} products in database:`);
    existingProducts.forEach(product => {
      console.log(`- ID: ${product._id}, Title: ${product.title}, Price: $${product.price}`);
    });
    
    // Create test products if none exist
    if (existingProducts.length === 0) {
      console.log('\n📝 Creating test products...');
      
      const testProducts = [
        {
          _id: '1',
          title: 'iPhone 15 Pro',
          price: 999.99,
          imageUrl: 'https://picsum.photos/seed/iphone/400/300',
          description: 'Latest iPhone with advanced features'
        },
        {
          _id: '2',
          title: 'MacBook Air M2',
          price: 1199.99,
          imageUrl: 'https://picsum.photos/seed/macbook/400/300',
          description: 'Powerful laptop with M2 chip'
        },
        {
          _id: '3',
          title: 'AirPods Pro',
          price: 249.99,
          imageUrl: 'https://picsum.photos/seed/airpods/400/300',
          description: 'Wireless earbuds with noise cancellation'
        },
        {
          _id: '4',
          title: 'iPad Pro',
          price: 799.99,
          imageUrl: 'https://picsum.photos/seed/ipad/400/300',
          description: 'Professional tablet for creative work'
        }
      ];
      
      for (const productData of testProducts) {
        const product = new Product(productData);
        await product.save();
        console.log(`✅ Created product: ${product.title}`);
      }
    }
    
    console.log('\n🎉 Product test completed!');
    console.log('Now try adding products to cart from the homepage.');
    
  } catch (error) {
    console.error('❌ Error testing products:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testProducts(); 