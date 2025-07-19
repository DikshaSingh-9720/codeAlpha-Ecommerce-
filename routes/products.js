const express = require('express');
const router = express.Router();

// GET /api/products - Get all products
router.get('/', (req, res) => {
  // Placeholder: return sample products with image URLs from a public API
  res.json([
    {
      _id: '1',
      title: 'Sample Product 1',
      price: 29.99,
      description: 'A great product.',
      imageUrl: 'https://picsum.photos/seed/p1/400/300',
    },
    {
      _id: '2',
      title: 'Sample Product 2',
      price: 49.99,
      description: 'Another awesome product.',
      imageUrl: 'https://picsum.photos/seed/p2/400/300',
    },
  ]);
});

// GET /api/products/:id - Get product by ID
router.get('/:id', (req, res) => {
  // Placeholder: return a single product
  res.json({
    _id: req.params.id,
    title: `Sample Product ${req.params.id}`,
    price: 39.99,
    description: 'Detailed description of the product.',
    imageUrl: `https://picsum.photos/seed/p${req.params.id}/600/400`,
  });
});

module.exports = router; 