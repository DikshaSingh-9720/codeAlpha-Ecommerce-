document.getElementById('login-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = this;
  const loginMessage = document.getElementById('login-message');
  const submitButton = form.querySelector('button');
  const formData = new FormData(form);

  // Reset message
  loginMessage.textContent = '';
  loginMessage.style.display = 'none';
  loginMessage.className = 'form__error';
  submitButton.disabled = true;
  submitButton.textContent = 'Signing In...';

  try {
    console.log('Attempting login...');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password')
      })
    });

    console.log('Response status:', res.status);
    const data = await res.json();
    console.log('Response data:', data);

    if (res.ok && data.token) {
      // Store credentials
      localStorage.setItem('token', data.token);
      if (data.name) localStorage.setItem('userName', data.name);
      if (data.email) localStorage.setItem('userEmail', data.email);

      // Show success message
      loginMessage.textContent = 'Login successful! Redirecting...';
      loginMessage.className = 'form__success';
      loginMessage.style.display = 'block';

      console.log('Login successful, redirecting...');
      // Redirect to homepage after a short delay
      setTimeout(() => {
      window.location.href = 'index.html';
      }, 1000);
    } else {
      loginMessage.textContent = data.message || 'Invalid credentials.';
      loginMessage.className = 'form__error';
      loginMessage.style.display = 'block';
      console.error('Login failed:', data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    loginMessage.textContent = 'Unable to login. Please check your connection and try again.';
    loginMessage.className = 'form__error';
    loginMessage.style.display = 'block';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Sign In';
  }
});
