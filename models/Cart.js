const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true }, // Changed from ObjectId to String
  quantity: { type: Number, required: true, default: 1 },
  // Store complete product data for offline access
  title: { type: String },
  price: { type: Number },
  imageUrl: { type: String },
  description: { type: String },
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Cart', cartSchema); 