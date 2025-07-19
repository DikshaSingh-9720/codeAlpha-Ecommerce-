document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const isAdmin = (() => {
    if (!token) return false;
    try {
      return JSON.parse(atob(token.split('.')[1])).isAdmin;
    } catch { return false; }
  })();
  if (!token || !isAdmin) {
    window.location.href = 'login.html';
    return;
  }

  const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

  function fetchProducts() {
    fetch('/api/products')
      .then(res => res.json())
      .then(products => renderProducts(products));
  }

  function renderProducts(products) {
    const list = document.getElementById('products-list');
    if (!products.length) {
      list.innerHTML = '<p>No products found.</p>';
      return;
    }
    list.innerHTML = products.map(product => `
      <div class="admin-product-card" data-id="${product._id}">
        <img src="${product.imageUrl}" alt="${product.title}" />
        <input type="text" value="${product.title}" class="edit-title" />
        <input type="text" value="${product.description}" class="edit-description" />
        <input type="number" value="${product.price}" class="edit-price" step="0.01" />
        <input type="url" value="${product.imageUrl}" class="edit-imageUrl" />
        <button class="save-edit">Save</button>
        <button class="delete-product">Delete</button>
      </div>
    `).join('');
  }

  document.getElementById('add-product-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const product = {
      title: formData.get('title'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      imageUrl: formData.get('imageUrl')
    };
    fetch('/api/admin/products', {
      method: 'POST',
      headers,
      body: JSON.stringify(product)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          document.getElementById('add-product-message').textContent = 'Product added!';
          this.reset();
          fetchProducts();
        } else {
          document.getElementById('add-product-message').textContent = data.message || 'Failed to add product.';
        }
      });
  });

  document.getElementById('products-list').addEventListener('click', function(e) {
    const card = e.target.closest('.admin-product-card');
    if (!card) return;
    const id = card.getAttribute('data-id');
    if (e.target.classList.contains('save-edit')) {
      const product = {
        title: card.querySelector('.edit-title').value,
        description: card.querySelector('.edit-description').value,
        price: parseFloat(card.querySelector('.edit-price').value),
        imageUrl: card.querySelector('.edit-imageUrl').value
      };
      fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(product)
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            fetchProducts();
          } else {
            alert(data.message || 'Failed to update product.');
          }
        });
    } else if (e.target.classList.contains('delete-product')) {
      if (!confirm('Delete this product?')) return;
      fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            fetchProducts();
          } else {
            alert(data.message || 'Failed to delete product.');
          }
        });
    }
  });

  fetchProducts();
}); 