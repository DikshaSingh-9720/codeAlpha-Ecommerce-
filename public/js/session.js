function getUserInfo() {
  let token = localStorage.getItem('token');
  let name = localStorage.getItem('userName');
  let email = localStorage.getItem('userEmail');
  let isAdmin = false;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      email = email || payload.email || '';
      isAdmin = payload.isAdmin || false;
    } catch {}
  }
  return { name, email, isAdmin };
}

function renderSession() {
  console.log('Rendering session...');
  const { name, email, isAdmin } = getUserInfo();
  const navbar = document.querySelector('.navbar');
  if (!navbar) {
    console.log('Navbar not found');
    return;
  }

  // Handle navbar login/logout buttons
  const loginBtn = document.getElementById('navbar-login-btn');
  const logoutBtn = document.getElementById('navbar-logout-btn');
  
  console.log('Token exists:', !!localStorage.getItem('token'));
  console.log('Login button found:', !!loginBtn);
  console.log('Logout button found:', !!logoutBtn);
  
  if (localStorage.getItem('token')) {
    // User is logged in
    console.log('User is logged in');
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) {
      logoutBtn.style.display = 'inline-block';
      logoutBtn.textContent = `Logout (${name || email})`;
      
      // Add logout functionality
      logoutBtn.onclick = function() {
        console.log('Logging out...');
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
        window.location.reload();
      };
    }
    
    // Add admin link if user is admin
    if (isAdmin) {
      console.log('User is admin, adding admin link');
      const adminLink = document.createElement('a');
      adminLink.href = 'admin.html';
      adminLink.className = 'navbar__btn';
      adminLink.textContent = 'Admin';
      adminLink.style.marginRight = '0.5rem';
      
      const actions = document.querySelector('.navbar__actions');
      if (actions && !document.querySelector('.navbar__btn[href="admin.html"]')) {
        actions.insertBefore(adminLink, logoutBtn);
      }
    }
  } else {
    // User is not logged in
    console.log('User is not logged in');
    if (loginBtn) {
      loginBtn.style.display = 'inline-block';
      loginBtn.textContent = 'Login';
      loginBtn.onclick = function() {
        console.log('Redirecting to login...');
        window.location.href = 'login.html';
      };
    }
    if (logoutBtn) logoutBtn.style.display = 'none';
    
    // Remove admin link if exists
    const adminLink = document.querySelector('.navbar__btn[href="admin.html"]');
    if (adminLink) adminLink.remove();
  }
}

// Initialize session on page load
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const loginBtn = document.getElementById('navbar-login-btn');
  const logoutBtn = document.getElementById('navbar-logout-btn');
  const myOrdersLink = document.getElementById('navbar-myorders-link');

  function showLoggedInUI() {
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    if (myOrdersLink) myOrdersLink.style.display = 'inline-block';
  }
  function showLoggedOutUI() {
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (myOrdersLink) myOrdersLink.style.display = 'none';
  }

  if (token) {
    showLoggedInUI();
  } else {
    showLoggedOutUI();
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      showLoggedOutUI();
      window.location.href = 'login.html';
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      // If user is on a page with a myorders intent, store redirect
      if (window.location.pathname.endsWith('myorders.html')) {
        localStorage.setItem('postLoginRedirect', 'myorders.html');
      }
      window.location.href = 'login.html';
    });
  }

  // Post-login redirect logic
  if (window.location.pathname.endsWith('login.html')) {
    const redirect = localStorage.getItem('postLoginRedirect');
    if (redirect) {
      localStorage.removeItem('postLoginRedirect');
      // After successful login, redirect to myorders.html
      document.getElementById('login-form')?.addEventListener('submit', function() {
        setTimeout(() => {
          window.location.href = redirect;
        }, 500);
      });
    }
  }
}); 

// Re-render session when localStorage changes (for cross-tab sync)
window.addEventListener('storage', function(e) {
  if (e.key === 'token' || e.key === 'userName' || e.key === 'userEmail') {
    renderSession();
  }
}); 