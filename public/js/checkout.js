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

function getLocalCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

async function getCart() {
  if (isLoggedIn()) {
    return await fetchServerCart();
  } else {
    return getLocalCart();
  }
}

async function clearCart() {
  if (isLoggedIn()) {
    try {
      // Clear server cart by removing all items
      const cart = await fetchServerCart();
      for (const item of cart) {
        await fetch(`/api/cart/${item._id}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + getToken() }
        });
      }
    } catch (error) {
      console.error('Error clearing server cart:', error);
    }
  } else {
    localStorage.removeItem('cart');
  }
}

function createCheckoutItemHTML(item) {
  const subtotal = (item.price * item.quantity).toFixed(2);
  return `
    <div class="checkout-item">
      <div class="checkout-item__image">
        <img src="${item.imageUrl || 'https://picsum.photos/seed/default/400/300'}" alt="${item.title}" />
      </div>
      <div class="checkout-item__details">
        <h4 class="checkout-item__title">${item.title}</h4>
        <p class="checkout-item__price">$${item.price.toFixed(2)} x ${item.quantity}</p>
      </div>
      <div class="checkout-item__subtotal">
        $${subtotal}
      </div>
    </div>
  `;
}

async function renderCheckoutSummary() {
  const summary = document.getElementById('checkout-summary');
  const form = document.getElementById('checkout-form');
  const messageDiv = document.getElementById('order-message');
  
  // Show loading state
  summary.innerHTML = `
    <div class="checkout-loading">
      <div class="checkout-loading__spinner"></div>
      <p>Loading your order summary...</p>
    </div>
  `;
  
  try {
    const cart = await getCart();
    
    if (cart.length === 0) {
      summary.innerHTML = `
        <div class="checkout-empty">
          <div class="checkout-empty__icon">🛒</div>
          <h2 class="checkout-empty__title">Your cart is empty</h2>
          <p class="checkout-empty__description">
            Add some items to your cart before proceeding to checkout.
          </p>
          <a href="index.html" class="checkout-empty__btn">
            🛍️ Continue Shopping
          </a>
        </div>
      `;
      form.style.display = 'none';
      return;
    }
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 5.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    // Render checkout summary
    summary.innerHTML = `
      <div class="checkout-summary">
        <h2 class="checkout-summary__title">Order Summary</h2>
        <div class="checkout-items">
          ${cart.map(item => createCheckoutItemHTML(item)).join('')}
        </div>
        <div class="checkout-totals">
          <div class="checkout-total-item">
            <span>Subtotal</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          <div class="checkout-total-item">
            <span>Shipping</span>
            <span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span>
          </div>
          <div class="checkout-total-item">
            <span>Tax</span>
            <span>$${tax.toFixed(2)}</span>
          </div>
          <div class="checkout-total-item checkout-total-item--final">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
    
    form.style.display = 'block';
    messageDiv.textContent = '';
    
  } catch (error) {
    console.error('Error rendering checkout summary:', error);
    summary.innerHTML = `
      <div class="checkout-error">
        <div class="checkout-error__icon">⚠️</div>
        <h2 class="checkout-error__title">Error Loading Cart</h2>
        <p class="checkout-error__description">
          There was an error loading your cart. Please try refreshing the page.
        </p>
      </div>
    `;
    form.style.display = 'none';
  }
}

async function placeOrder(formData) {
  const messageDiv = document.getElementById('order-message');
  const submitBtn = document.querySelector('#checkout-form button[type="submit"]');
  
  // Show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing Order...';
  messageDiv.textContent = '';
  
  try {
    const cart = await getCart();
    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }
    
    const order = {
      name: formData.get('name'),
      email: formData.get('email'),
      address: formData.get('address'),
      items: cart
    };
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (isLoggedIn()) {
      headers['Authorization'] = 'Bearer ' + getToken();
    }
    
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(order)
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Clear cart after successful order
      await clearCart();
      
      // Show success message
      messageDiv.innerHTML = `
        <div class="order-success">
          <div class="order-success__icon">✅</div>
          <h2 class="order-success__title">Order Placed Successfully!</h2>
          <p class="order-success__description">
            Thank you for your order. You will receive a confirmation email shortly.
          </p>
          <div class="order-success__actions">
            <a href="index.html" class="order-success__btn">
              🛍️ Continue Shopping
            </a>
            <a href="myorders.html" class="order-success__btn order-success__btn--secondary">
              📋 View Orders
            </a>
          </div>
        </div>
      `;
      
      // Hide the form
      document.getElementById('checkout-form').style.display = 'none';
      
      // Re-render summary to show empty state
      await renderCheckoutSummary();
      
    } else {
      throw new Error(data.message || 'Order failed');
    }
    
  } catch (error) {
    console.error('Order error:', error);
    messageDiv.innerHTML = `
      <div class="order-error">
        <div class="order-error__icon">❌</div>
        <h2 class="order-error__title">Order Failed</h2>
        <p class="order-error__description">
          ${error.message || 'There was an error processing your order. Please try again.'}
        </p>
      </div>
    `;
  } finally {
    // Reset button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Place Order';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in for better UX
  if (!isLoggedIn()) {
    console.log('User not logged in, using local cart');
  }
  
  // Render checkout summary
  renderCheckoutSummary();
  
  // Handle form submission
  document.getElementById('checkout-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    await placeOrder(formData);
  });
}); 