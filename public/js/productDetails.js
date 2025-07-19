function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function getToken() {
  return localStorage.getItem('token');
}

async function addToCart(product, quantity = 1) {
  const cartProduct = {
    _id: product.id.toString(),
    title: product.title,
    price: product.price,
    imageUrl: product.images && product.images.length ? product.images[0] : product.thumbnail,
    description: product.description,
    quantity: quantity
  };
  
  try {
    if (isLoggedIn()) {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + getToken(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          productId: cartProduct._id, 
          quantity: quantity,
          title: product.title,
          price: product.price,
          imageUrl: product.images && product.images.length ? product.images[0] : product.thumbnail,
          description: product.description
        })
      });
      
      if (response.ok) {
        return { success: true, message: 'Product added to cart!' };
      } else if (response.status === 401) {
        // Token expired or invalid, clear it and use local storage
        localStorage.removeItem('token');
        console.log('Token expired, using local storage for cart');
        return addToLocalCart(cartProduct);
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to add to cart.' };
      }
    } else {
      return addToLocalCart(cartProduct);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    // Fallback to local storage if server is unreachable
    return addToLocalCart(cartProduct);
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
    return { success: true, message: 'Product added to cart!' };
  } catch (error) {
    console.error('Error adding to local cart:', error);
    return { success: false, message: 'Error adding to cart.' };
  }
}

function createImageGallery(images, thumbnail) {
  const allImages = images && images.length > 0 ? images : [thumbnail];
  
  let galleryHTML = `
    <div class="product-details-gallery">
      <img src="${allImages[0]}" alt="Product" class="product-details-main-image" id="main-image" />
      <div class="product-details-thumbnails">
  `;
  
  allImages.forEach((image, index) => {
    galleryHTML += `
      <img src="${image}" alt="Product thumbnail ${index + 1}" 
           class="product-details-thumbnail ${index === 0 ? 'active' : ''}" 
           onclick="changeMainImage('${image}', this)" />
    `;
  });
  
  galleryHTML += `
      </div>
    </div>
  `;
  
  return galleryHTML;
}

function changeMainImage(imageSrc, thumbnailElement) {
  // Update main image
  document.getElementById('main-image').src = imageSrc;
  
  // Update active thumbnail
  document.querySelectorAll('.product-details-thumbnail').forEach(thumb => {
    thumb.classList.remove('active');
  });
  thumbnailElement.classList.add('active');
}

function createProductInfo(product) {
  const rating = product.rating || 4.5;
  const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  const discount = product.discountPercentage ? Math.round(product.discountPercentage) : 0;
  const originalPrice = discount > 0 ? product.price * (1 + discount/100) : null;
  
  return `
    <div class="product-details-info">
      ${product.category ? `<span class="product-details-category">${product.category}</span>` : ''}
      
      <h1 class="product-details-title">${product.title}</h1>
      
      <div class="product-details-rating">
        <span class="product-details-stars">${stars}</span>
        <span class="product-details-rating-text">${rating} (${product.stock || 100} reviews)</span>
      </div>
      
      <div class="product-details-price">
        ${originalPrice ? `<span class="product-details-original-price">$${originalPrice.toFixed(2)}</span>` : ''}
        $${product.price.toFixed(2)}
        ${discount > 0 ? `<span class="product-details-discount">-${discount}%</span>` : ''}
      </div>
      
      <p class="product-details-description">${product.description}</p>
      
      <div class="product-details-quantity">
        <span class="product-details-quantity-label">Quantity:</span>
        <div class="product-details-quantity-controls">
          <button class="product-details-quantity-btn" onclick="changeQuantity(-1)">-</button>
          <input type="number" class="product-details-quantity-input" id="quantity-input" value="1" min="1" max="99" />
          <button class="product-details-quantity-btn" onclick="changeQuantity(1)">+</button>
        </div>
      </div>
      
      <div class="product-details-actions">
        <button class="product-details-btn product-details-btn--primary" onclick="addToCartClicked()">
          🛒 Add to Cart
        </button>
        <button class="product-details-btn product-details-btn--secondary" onclick="buyNowClicked()">
          ⚡ Buy Now
        </button>
      </div>
      
      <div class="product-details-specs">
        <h3 class="product-details-specs-title">Product Specifications</h3>
        <div class="product-details-specs-list">
          <div class="product-details-spec-item">
            <span class="product-details-spec-label">Brand</span>
            <span class="product-details-spec-value">${product.brand || 'ShopLogo'}</span>
          </div>
          <div class="product-details-spec-item">
            <span class="product-details-spec-label">Category</span>
            <span class="product-details-spec-value">${product.category || 'General'}</span>
          </div>
          <div class="product-details-spec-item">
            <span class="product-details-spec-label">Stock</span>
            <span class="product-details-spec-value">${product.stock || 'In Stock'}</span>
          </div>
          <div class="product-details-spec-item">
            <span class="product-details-spec-label">SKU</span>
            <span class="product-details-spec-value">${product.id}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function changeQuantity(delta) {
  const input = document.getElementById('quantity-input');
  const newValue = Math.max(1, Math.min(99, parseInt(input.value) + delta));
  input.value = newValue;
}

async function addToCartClicked() {
  const product = window.currentProduct;
  const quantity = parseInt(document.getElementById('quantity-input').value);
  
  const result = await addToCart(product, quantity);
  
  const button = document.querySelector('.product-details-btn--primary');
  const originalText = button.innerHTML;
  
  if (result.success) {
    button.innerHTML = '✅ Added!';
    button.style.background = '#28a745';
  } else {
    button.innerHTML = '❌ Failed';
    button.style.background = '#dc3545';
  }
  
  setTimeout(() => {
    button.innerHTML = originalText;
    button.style.background = '';
  }, 2000);
}

function buyNowClicked() {
  // Redirect to checkout with this product
  const product = window.currentProduct;
  const quantity = parseInt(document.getElementById('quantity-input').value);
  
  // Store the product for checkout
  localStorage.setItem('buyNowProduct', JSON.stringify({
    product: product,
    quantity: quantity
  }));
  
  window.location.href = 'checkout.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const productId = getProductId();
  const container = document.getElementById('product-details');
  
  if (!productId) {
    container.innerHTML = `
      <div class="product-details-error">
        <div class="product-details-error__icon">⚠️</div>
        <h3>Product not found</h3>
        <p>The product you're looking for doesn't exist.</p>
      </div>
    `;
    return;
  }
  
  // Show loading state
  container.innerHTML = `
    <div class="product-details-loading">
      <div class="product-details-loading__spinner"></div>
      <p>Loading product details...</p>
    </div>
  `;
  
  fetch('data/products.json')
    .then(res => res.json())
    .then(data => {
      const product = data.products.find(p => p.id.toString() === productId);
      
      if (!product) {
        container.innerHTML = `
          <div class="product-details-error">
            <div class="product-details-error__icon">⚠️</div>
            <h3>Product not found</h3>
            <p>The product you're looking for doesn't exist.</p>
          </div>
        `;
        return;
      }
      
      // Store product globally for cart functions
      window.currentProduct = product;
      
      // Create the product details layout
      container.innerHTML = `
        <div class="product-details-grid">
          ${createImageGallery(product.images, product.thumbnail)}
          ${createProductInfo(product)}
        </div>
      `;
    })
    .catch(error => {
      console.error('Error loading product:', error);
      container.innerHTML = `
        <div class="product-details-error">
          <div class="product-details-error__icon">⚠️</div>
          <h3>Error loading product</h3>
          <p>Something went wrong while loading the product details.</p>
        </div>
      `;
    });
}); 