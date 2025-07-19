function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function getToken() {
  return localStorage.getItem('token');
}

async function fetchServerCart() {
  try {
  const res = await fetch('/api/cart', {
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
    if (!res.ok) {
      if (res.status === 401) {
        // Token expired or invalid, clear it and return empty cart
        localStorage.removeItem('token');
        console.log('Token expired, using local storage for cart');
        return [];
      }
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to fetch cart');
    }
  return await res.json();
  } catch (error) {
    console.error('Error fetching cart:', error);
    return [];
  }
}

async function updateServerCart(productId, quantity) {
  try {
  const res = await fetch('/api/cart', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + getToken(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productId, quantity })
  });
    if (!res.ok) {
      if (res.status === 401) {
        // Token expired, clear it and update local cart
        localStorage.removeItem('token');
        console.log('Token expired, updating local cart');
        return updateLocalCart(productId, quantity);
      }
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to update cart');
    }
  return await res.json();
  } catch (error) {
    console.error('Error updating cart:', error);
    return updateLocalCart(productId, quantity);
  }
}

async function removeServerCartItem(productId) {
  try {
  const res = await fetch(`/api/cart/${productId}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
    if (!res.ok) {
      if (res.status === 401) {
        // Token expired, clear it and remove from local cart
        localStorage.removeItem('token');
        console.log('Token expired, removing from local cart');
        return removeLocalCartItem(productId);
      }
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to remove item');
    }
  return await res.json();
  } catch (error) {
    console.error('Error removing item:', error);
    return removeLocalCartItem(productId);
  }
}

function updateLocalCart(productId, quantity) {
  try {
    let cart = getLocalCart();
    const item = cart.find(i => i._id === productId);
    if (item) {
      item.quantity = quantity;
      saveLocalCart(cart);
    }
    return { success: true };
  } catch (error) {
    console.error('Error updating local cart:', error);
    return { success: false };
  }
}

function removeLocalCartItem(productId) {
  try {
    let cart = getLocalCart();
    cart = cart.filter(i => i._id !== productId);
    saveLocalCart(cart);
    return { success: true };
  } catch (error) {
    console.error('Error removing from local cart:', error);
    return { success: false };
  }
}

function getLocalCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveLocalCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function createCartItemHTML(item) {
  // Add safety checks for undefined or null items
  if (!item || !item._id) {
    console.error('Invalid cart item:', item);
    return '';
  }
  
  console.log('Creating cart item HTML for:', item);
  
  const subtotal = ((item.price || 0) * (item.quantity || 1)).toFixed(2);
  
  return `
    <div class="cart-item" data-id="${item._id}">
      <img src="${item.imageUrl || 'https://picsum.photos/seed/default/400/300'}" alt="${item.title || 'Product'}" class="cart-item__image" />
      <div class="cart-item__content">
        <h3 class="cart-item__title">${item.title || 'Product not found'}</h3>
        <p class="cart-item__price">$${(item.price || 0).toFixed(2)}</p>
        <div class="cart-item__quantity">
          <span class="cart-item__quantity-label">Quantity:</span>
          <div class="cart-item__quantity-controls">
            <button class="cart-item__quantity-btn" onclick="changeQuantity('${item._id}', -1)">-</button>
            <input type="number" class="cart-item__quantity-input" value="${item.quantity || 1}" 
                   min="1" max="99" onchange="updateQuantity('${item._id}', this.value)" />
            <button class="cart-item__quantity-btn" onclick="changeQuantity('${item._id}', 1)">+</button>
          </div>
        </div>
        <p class="cart-item__subtotal">Subtotal: $${subtotal}</p>
      </div>
      <div class="cart-item__actions">
        <button class="cart-item__remove" onclick="removeItem('${item._id}')">
          🗑️ Remove
        </button>
      </div>
    </div>
  `;
}

function createCartSummaryHTML(cart, total) {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = total;
  const shipping = total > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax
  const finalTotal = subtotal + shipping + tax;
  
  return `
    <h3 class="cart-summary__title">Order Summary</h3>
    <div class="cart-summary__items">
      <div class="cart-summary__item">
        <span class="cart-summary__label">Items (${itemCount})</span>
        <span class="cart-summary__value">$${subtotal.toFixed(2)}</span>
      </div>
      <div class="cart-summary__item">
        <span class="cart-summary__label">Shipping</span>
        <span class="cart-summary__value">${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span>
      </div>
      <div class="cart-summary__item">
        <span class="cart-summary__label">Tax</span>
        <span class="cart-summary__value">$${tax.toFixed(2)}</span>
      </div>
    </div>
    <div class="cart-summary__total">
      <span class="cart-summary__total-label">Total</span>
      <span class="cart-summary__total-value">$${finalTotal.toFixed(2)}</span>
    </div>
    <div class="cart-summary__actions">
      <button class="cart-summary__btn cart-summary__btn--primary" onclick="proceedToCheckout()">
        🛒 Proceed to Checkout
      </button>
      <a href="index.html" class="cart-summary__btn cart-summary__btn--secondary">
        🛍️ Continue Shopping
      </a>
    </div>
  `;
}

function createEmptyCartHTML() {
  return `
    <div class="cart-empty">
      <div class="cart-empty__icon">🛒</div>
      <h2 class="cart-empty__title">Your cart is empty</h2>
      <p class="cart-empty__description">
        Looks like you haven't added any items to your cart yet. 
        Start shopping to discover amazing products!
      </p>
      <a href="index.html" class="cart-empty__btn">
        🛍️ Start Shopping
      </a>
    </div>
  `;
}

async function renderCart() {
  const container = document.getElementById('cart-container');
  const summary = document.getElementById('cart-summary');
  const countBadge = document.getElementById('cart-count-badge');
  
  console.log('Rendering cart...');
  
  // Show loading state
  container.innerHTML = `
    <div class="cart-loading">
      <div class="cart-loading__spinner"></div>
      <p>Loading your cart...</p>
    </div>
  `;
  
  let cart = [];
  try {
    if (isLoggedIn()) {
      console.log('User is logged in, fetching from server...');
      const serverCart = await fetchServerCart();
      console.log('Server cart data:', serverCart);
      // Handle the new response format - server returns populated items directly
      cart = serverCart.map(item => ({
        _id: item._id || item.productId,
        title: item.title || 'Product not found',
        price: item.price || 0,
        imageUrl: item.imageUrl || '',
        quantity: item.quantity || 1
      }));
    } else {
      console.log('User is not logged in, using local storage...');
      cart = getLocalCart();
      console.log('Local cart data:', cart);
    }
  } catch (error) {
    console.error('Error loading cart:', error);
    cart = [];
  }
  
  console.log('Final cart data:', cart);
  
  // Update cart count badge
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  if (countBadge) {
    countBadge.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
  }
  
  // Also update the navbar cart count
  const navbarCartCount = document.getElementById('cart-count');
  if (navbarCartCount) {
    if (totalItems > 0) {
      navbarCartCount.textContent = totalItems;
      navbarCartCount.style.display = 'inline';
    } else {
      navbarCartCount.style.display = 'none';
    }
  }
  
  if (cart.length === 0) {
    console.log('Cart is empty, showing empty state');
    container.innerHTML = createEmptyCartHTML();
    summary.innerHTML = '';
    return;
  }
  
  console.log('Rendering cart items...');
  // Render cart items
  container.innerHTML = cart.map(item => createCartItemHTML(item)).join('');
  
  // Calculate total and render summary
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  summary.innerHTML = createCartSummaryHTML(cart, total);
  
  console.log('Cart rendering complete');
}

// Global functions for cart interactions
function changeQuantity(productId, delta) {
  const input = document.querySelector(`[data-id="${productId}"] .cart-item__quantity-input`);
  const newValue = Math.max(1, Math.min(99, parseInt(input.value) + delta));
  input.value = newValue;
  updateQuantity(productId, newValue);
}

async function updateQuantity(productId, quantity) {
  const qty = Math.max(1, parseInt(quantity));
  
  try {
      if (isLoggedIn()) {
      await updateServerCart(productId, qty);
      } else {
        let cart = getLocalCart();
      const item = cart.find(i => i._id === productId);
        if (item) {
          item.quantity = qty;
          saveLocalCart(cart);
        }
      }
    await renderCart();
  } catch (error) {
    console.error('Error updating quantity:', error);
  }
}

async function removeItem(productId) {
  if (!confirm('Are you sure you want to remove this item from your cart?')) {
    return;
  }
  
  try {
      if (isLoggedIn()) {
      await removeServerCartItem(productId);
      } else {
        let cart = getLocalCart();
      cart = cart.filter(i => i._id !== productId);
        saveLocalCart(cart);
      }
    await renderCart();
  } catch (error) {
    console.error('Error removing item:', error);
  }
}

function proceedToCheckout() {
  window.location.href = 'checkout.html';
}

document.addEventListener('DOMContentLoaded', () => {
      renderCart();
}); 