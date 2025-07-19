function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function getToken() {
  return localStorage.getItem('token');
}

function showLoading() {
  document.getElementById('orders-loading').style.display = 'block';
  document.getElementById('orders-list').style.display = 'none';
  document.getElementById('orders-empty').style.display = 'none';
  document.getElementById('orders-error').style.display = 'none';
}

function showOrders(orders) {
  document.getElementById('orders-loading').style.display = 'none';
  document.getElementById('orders-list').style.display = 'block';
  document.getElementById('orders-empty').style.display = 'none';
  document.getElementById('orders-error').style.display = 'none';
  
  const ordersList = document.getElementById('orders-list');
  ordersList.innerHTML = orders.map(order => createOrderHTML(order)).join('');
}

function showEmpty() {
  document.getElementById('orders-loading').style.display = 'none';
  document.getElementById('orders-list').style.display = 'none';
  document.getElementById('orders-empty').style.display = 'block';
  document.getElementById('orders-error').style.display = 'none';
}

function showError(message) {
  document.getElementById('orders-loading').style.display = 'none';
  document.getElementById('orders-list').style.display = 'none';
  document.getElementById('orders-empty').style.display = 'none';
  document.getElementById('orders-error').style.display = 'block';
  
  const errorDescription = document.querySelector('.orders-error__description');
  if (errorDescription) {
    errorDescription.textContent = message;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatPrice(price) {
  return `$${parseFloat(price).toFixed(2)}`;
}

function calculateOrderTotal(items) {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getStatusColor(status) {
  const statusColors = {
    'Pending': '#f39c12',
    'Shipped': '#3498db',
    'Delivered': '#27ae60',
    'Cancelled': '#e74c3c'
  };
  return statusColors[status] || '#95a5a6';
}

function createOrderItemHTML(item) {
  const subtotal = (item.price * item.quantity).toFixed(2);
  return `
    <div class="order-item">
      <div class="order-item__image">
        <img src="${item.imageUrl || 'https://picsum.photos/seed/default/400/300'}" alt="${item.title}" />
      </div>
      <div class="order-item__details">
        <h4 class="order-item__title">${item.title}</h4>
        <p class="order-item__price">${formatPrice(item.price)} x ${item.quantity}</p>
      </div>
      <div class="order-item__subtotal">
        ${formatPrice(subtotal)}
      </div>
    </div>
  `;
}

function createOrderHTML(order) {
  const total = calculateOrderTotal(order.items);
  const statusColor = getStatusColor(order.status);
  
  return `
    <div class="order-card">
      <div class="order-card__header">
        <div class="order-card__info">
          <h3 class="order-card__title">Order #${order._id.slice(-8)}</h3>
          <p class="order-card__date">${formatDate(order.createdAt)}</p>
        </div>
        <div class="order-card__status" style="background-color: ${statusColor}">
          ${order.status}
        </div>
      </div>
      
      <div class="order-card__customer">
        <div class="order-card__customer-info">
          <p><strong>Name:</strong> ${order.name}</p>
          <p><strong>Email:</strong> ${order.email}</p>
          <p><strong>Address:</strong> ${order.address}</p>
        </div>
      </div>
      
      <div class="order-card__items">
        <h4 class="order-card__items-title">Items (${order.items.length})</h4>
        <div class="order-card__items-list">
          ${order.items.map(item => createOrderItemHTML(item)).join('')}
        </div>
      </div>
      
      <div class="order-card__footer">
        <div class="order-card__total">
          <span class="order-card__total-label">Total:</span>
          <span class="order-card__total-value">${formatPrice(total)}</span>
        </div>
        <div class="order-card__actions">
          <button class="order-card__btn" onclick="viewOrderDetails('${order._id}')">
            📋 View Details
          </button>
          ${order.status === 'Delivered' ? `
            <button class="order-card__btn order-card__btn--secondary" onclick="reorderItems(${JSON.stringify(order.items).replace(/"/g, '&quot;')})">
              🔄 Reorder
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

async function loadOrders() {
  showLoading();
  
  try {
    if (!isLoggedIn()) {
      window.location.href = 'login.html';
      return;
    }
    
    const response = await fetch('/api/orders', {
      headers: { 'Authorization': 'Bearer ' + getToken() }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        return;
      }
      throw new Error('Failed to load orders');
    }
    
    const orders = await response.json();
    
    if (orders.length === 0) {
      showEmpty();
    } else {
      showOrders(orders);
    }
    
  } catch (error) {
    console.error('Error loading orders:', error);
    showError('There was an error loading your orders. Please try again.');
  }
}

function viewOrderDetails(orderId) {
  // For now, just show an alert. In a real app, this would open a modal or navigate to a details page
  alert(`Order details for ${orderId} would be displayed here.`);
}

function reorderItems(items) {
  // Add items back to cart
  items.forEach(item => {
    // This would integrate with the cart functionality
    console.log('Adding to cart:', item);
  });
  
  // Redirect to cart
  window.location.href = 'cart.html';
}

// Update cart count in navbar
async function updateCartCount() {
  try {
    if (isLoggedIn()) {
      const response = await fetch('/api/cart', {
        headers: { 'Authorization': 'Bearer ' + getToken() }
      });
      
      if (response.ok) {
        const cart = await response.json();
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
          if (totalItems > 0) {
            cartCount.textContent = totalItems;
            cartCount.style.display = 'inline';
          } else {
            cartCount.style.display = 'none';
          }
        }
      }
    }
  } catch (error) {
    console.error('Error updating cart count:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  
  // Load orders
  loadOrders();
  
  // Update cart count
  updateCartCount();
}); 