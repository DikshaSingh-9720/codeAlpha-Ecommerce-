// Global variable to store all products
let allProducts = []; // Store all products for filtering

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('products-container');
  const searchForm = document.querySelector('.navbar__search');
  const searchInput = document.querySelector('.navbar__search-input');
  const categorySelect = document.getElementById('sidebar-category');
  const priceRange = document.getElementById('sidebar-price');
  const priceValue = document.getElementById('price-value');
  
  // Initialize cart count
  updateCartCount();
  
  // Show loading state
  container.innerHTML = `
    <div class="products-loading">
      <div class="products-loading__spinner"></div>
      <p>Loading amazing products...</p>
    </div>
  `;

  // Load products initially
  loadProducts();

  // Search functionality
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    filterProducts();
  });

  // Real-time search as user types
  searchInput.addEventListener('input', function() {
    filterProducts();
  });

  // Category filter
  categorySelect.addEventListener('change', function() {
    filterProducts();
  });

  // Price filter
  priceRange.addEventListener('input', function() {
    const value = this.value;
    priceValue.textContent = `$${value}`;
    filterProducts();
  });

  function loadProducts() {
  fetch('data/products.json')
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
        allProducts = data.products || [];
        if (allProducts.length === 0) {
          container.innerHTML = `
            <div class="products-empty">
              <div class="products-empty__icon">📦</div>
              <h3>No products available</h3>
              <p>We're working on adding more amazing products for you!</p>
            </div>
          `;
          return;
        }
        renderProducts(allProducts);
      })
      .catch(err => {
        console.error('Failed to load products:', err);
        container.innerHTML = `
          <div class="products-empty">
            <div class="products-empty__icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>We're having trouble loading products. Please try again later.</p>
          </div>
        `;
      });
  }

  function filterProducts() {
    const searchQuery = searchInput.value.trim().toLowerCase();
    const selectedCategory = categorySelect.value;
    const maxPrice = parseFloat(priceRange.value);

    let filteredProducts = allProducts.filter(product => {
      // Search filter
      const matchesSearch = !searchQuery || 
        product.title.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery) ||
        (product.category && product.category.toLowerCase().includes(searchQuery));

      // Category filter
      const matchesCategory = selectedCategory === 'all' || 
        (product.category && product.category.toLowerCase() === selectedCategory);

      // Price filter
      const matchesPrice = product.price <= maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    });

    renderProducts(filteredProducts);
  }

  function renderProducts(products) {
    if (products.length === 0) {
      container.innerHTML = `
        <div class="products-empty">
          <div class="products-empty__icon">🔍</div>
          <h3>No products found</h3>
          <p>Try adjusting your search criteria or filters.</p>
        </div>
      `;
        return;
      }

    container.innerHTML = products.map(product => {
      const rating = product.rating || 4.5;
      const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
      const discount = product.discountPercentage ? Math.round(product.discountPercentage) : 0;
      
      return `
        <div class="product-card">
          ${product.category ? `<div class="product-card__category">${product.category}</div>` : ''}
          ${discount > 0 ? `<div class="product-card__category" style="right: 1rem; left: auto; background: #dc3545; color: white;">-${discount}%</div>` : ''}
          
          <div class="product-card__image">
            <img src="${product.thumbnail}" alt="${product.title || 'Product Image'}" loading="lazy" />
          </div>
          
          <div class="product-card__content">
            <h3 class="product-card__title">${product.title}</h3>
            <p class="product-card__description">${product.description}</p>
            
            <div class="product-card__rating">
              <span class="product-card__stars">${stars}</span>
              <span class="product-card__rating-text">(${rating})</span>
            </div>
            
            <div class="product-card__price">
              ${discount > 0 ? `<span style="text-decoration: line-through; color: #999; font-size: 1rem; margin-right: 0.5rem;">$${(product.price * (1 + discount/100)).toFixed(2)}</span>` : ''}
              $${product.price.toFixed(2)}
            </div>
            
            <div class="product-card__actions">
              <a href="product.html?id=${product.id}" class="product-card__btn product-card__btn--primary">
                View Details
              </a>
              <button class="product-card__btn product-card__btn--secondary" onclick="addToCart(${product.id})">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
});

// Add to cart function
async function addToCart(productId) {
  try {
    // Find the product from allProducts array
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
      showCartError('Product not found!');
      return;
    }

    const cartProduct = {
      _id: product.id.toString(),
      title: product.title,
      price: product.price,
      imageUrl: product.images && product.images.length ? product.images[0] : product.thumbnail,
      description: product.description,
      quantity: 1
    };

    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    if (token) {
      // User is logged in - try to add to server cart
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            productId: cartProduct._id, 
            quantity: 1,
            title: product.title,
            price: product.price,
            imageUrl: product.images && product.images.length ? product.images[0] : product.thumbnail,
            description: product.description
          })
        });
        
        if (response.ok) {
          showCartSuccess('Product added to cart!');
        } else if (response.status === 401) {
          // Token expired, use local storage
          localStorage.removeItem('token');
          addToLocalCart(cartProduct);
          showCartSuccess('Product added to cart! (Local storage)');
        } else if (response.status === 500) {
          // Server error, fallback to local storage
          console.log('Server error, using local storage');
          addToLocalCart(cartProduct);
          showCartSuccess('Product added to cart! (Local storage)');
        } else {
          const errorData = await response.json();
          showCartError(errorData.message || 'Failed to add to cart');
        }
      } catch (error) {
        console.error('Error adding to server cart:', error);
        // Any network error, fallback to local storage
        addToLocalCart(cartProduct);
        showCartSuccess('Product added to cart! (Local storage)');
      }
    } else {
      // User is not logged in - add to local storage
      addToLocalCart(cartProduct);
      showCartSuccess('Product added to cart!');
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    showCartError('Error adding to cart');
  }
}

function addToLocalCart(cartProduct) {
  try {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item._id === cartProduct._id);
    if (existing) {
      existing.quantity += cartProduct.quantity;
    } else {
      cart.push(cartProduct);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    return true;
  } catch (error) {
    console.error('Error adding to local cart:', error);
    return false;
  }
}

function showCartSuccess(message) {
  // Create success notification
  const notification = document.createElement('div');
  notification.className = 'cart-notification cart-notification--success';
  notification.innerHTML = `
    <span>✅ ${message}</span>
    <button onclick="this.parentElement.remove()">×</button>
  `;
  document.body.appendChild(notification);
  
  // Update cart count in navbar
  // updateCartCount();
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 3000);
}

function showCartError(message) {
  // Create error notification
  const notification = document.createElement('div');
  notification.className = 'cart-notification cart-notification--error';
  notification.innerHTML = `
    <span>❌ ${message}</span>
    <button onclick="this.parentElement.remove()">×</button>
  `;
  document.body.appendChild(notification);
  
  // Remove notification after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

function updateCartCount() {
  try {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
      const token = localStorage.getItem('token');
      let cart = [];
      
      if (token) {
        // For logged-in users, we'll update this when we implement server cart fetching
        // For now, use local storage
        cart = JSON.parse(localStorage.getItem('cart') || '[]');
      } else {
        cart = JSON.parse(localStorage.getItem('cart') || '[]');
      }
      
      const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      
      if (totalItems > 0) {
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = 'inline';
      } else {
        cartCountElement.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error updating cart count:', error);
  }
}
