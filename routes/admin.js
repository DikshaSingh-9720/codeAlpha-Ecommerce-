const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const PRODUCTS_PATH = path.join(__dirname, '../../public/data/products.json');

// All admin routes require auth and admin
router.use(auth, admin);

// Helper to read/write products.json
async function readProducts() {
  const data = await fs.readFile(PRODUCTS_PATH, 'utf-8');
  return JSON.parse(data).products;
}
async function writeProducts(products) {
  await fs.writeFile(PRODUCTS_PATH, JSON.stringify({ products }, null, 2));
}

// POST /api/admin/products - Add product
router.post('/products', async (req, res) => {
  try {
    const products = await readProducts();
    const newProduct = req.body;
    newProduct.id = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push(newProduct);
    await writeProducts(products);
    res.json({ success: true, product: newProduct });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add product.' });
  }
});

// PUT /api/admin/products/:id - Edit product
router.put('/products/:id', async (req, res) => {
  try {
    const products = await readProducts();
    const id = parseInt(req.params.id);
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ message: 'Product not found.' });
    products[idx] = { ...products[idx], ...req.body, id };
    await writeProducts(products);
    res.json({ success: true, product: products[idx] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product.' });
  }
});

// DELETE /api/admin/products/:id - Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const products = await readProducts();
    const id = parseInt(req.params.id);
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return res.status(404).json({ message: 'Product not found.' });
    await writeProducts(filtered);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product.' });
  }
});

module.exports = router; 