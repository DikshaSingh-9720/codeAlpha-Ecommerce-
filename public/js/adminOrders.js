function renderOrders(orders) {
  const container = document.getElementById('orders-container');
  if (!orders.length) {
    container.innerHTML = '<p>No orders found.</p>';
    return;
  }
  container.innerHTML = orders.map(order => `
    <div class="order-card">
      <div class="order-header">
        <strong>Order ID:</strong> ${order._id}<br>
        <strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}<br>
        <strong>Name:</strong> ${order.name}<br>
        <strong>Email:</strong> ${order.email}<br>
        <strong>Address:</strong> ${order.address}<br>
        <strong>Status:</strong> <select class="order-status" data-id="${order._id}">
          ${['Pending','Shipped','Delivered','Cancelled'].map(s => `<option value="${s}"${order.status===s?' selected':''}>${s}</option>`).join('')}
        </select>
        <button class="save-status" data-id="${order._id}">Save Status</button>
      </div>
      <div class="order-items">
        <strong>Items:</strong>
        <ul>
          ${order.items.map(item => `
            <li>${item.title} x ${item.quantity} ($${item.price.toFixed(2)} each)</li>
          `).join('')}
        </ul>
      </div>
    </div>
  `).join('');
}

function getToken() {
  return localStorage.getItem('token');
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/admin/orders')
    .then(res => res.json())
    .then(orders => {
      renderOrders(orders);
    });

  document.getElementById('orders-container').addEventListener('click', function(e) {
    if (e.target.classList.contains('save-status')) {
      const id = e.target.getAttribute('data-id');
      const status = this.querySelector(`.order-status[data-id="${id}"]`).value;
      fetch(`/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer ' + getToken(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            location.reload();
          } else {
            alert(data.message || 'Failed to update status.');
          }
        });
    }
  });
}); 