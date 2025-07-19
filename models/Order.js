const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  _id: String,
  title: String,
  price: Number,
  imageUrl: String,
  quantity: Number,
});

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  items: [orderItemSchema],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  status: { type: String, enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema); 