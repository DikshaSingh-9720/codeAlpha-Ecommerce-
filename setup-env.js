const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment for ecommerce app...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
} else {
  console.log('✅ .env file already exists');
}

// Check if MongoDB is running
const { exec } = require('child_process');
console.log('\n🔍 Checking MongoDB connection...');

exec('mongod --version', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ MongoDB is not installed or not in PATH');
    console.log('💡 To install MongoDB:');
    console.log('   - Windows: Download from https://www.mongodb.com/try/download/community');
    console.log('   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas');
  } else {
    console.log('✅ MongoDB is installed');
    console.log('📋 Version:', stdout.trim());
  }
  
  console.log('\n🚀 Next steps:');
  console.log('1. Start MongoDB (if not running): mongod');
  console.log('2. Start the server: node server.js');
  console.log('3. Open browser: http://localhost:5000');
  console.log('4. Test login: http://localhost:5000/test-login.html');
  
  console.log('\n📁 Project structure:');
  console.log('├── public/          # Frontend files');
  console.log('├── routes/           # API routes');
  console.log('├── models/           # Database models');
  console.log('├── middleware/       # Auth middleware');
  console.log('├── server.js         # Main server file');
  console.log('└── .env             # Environment variables');
}); 