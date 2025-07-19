document.getElementById('register-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = this;
  const registerMessage = document.getElementById('register-message');
  const submitButton = form.querySelector('button');
  const formData = new FormData(form);

  // Reset message
  registerMessage.textContent = '';
  registerMessage.style.display = 'none';
  registerMessage.className = 'form__error';
  submitButton.disabled = true;
  submitButton.textContent = 'Creating Account...';

  try {
    console.log('Attempting registration...');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password')
      })
    });

    console.log('Response status:', res.status);
    const data = await res.json();
    console.log('Response data:', data);

    if (res.ok && data.message && data.message.includes('successful')) {
      // Show success message
      registerMessage.textContent = 'Registration successful! Redirecting to login...';
      registerMessage.className = 'form__success';
      registerMessage.style.display = 'block';
      
      console.log('Registration successful, redirecting...');
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } else {
      registerMessage.textContent = data.message || 'Registration failed.';
      registerMessage.className = 'form__error';
      registerMessage.style.display = 'block';
      console.error('Registration failed:', data.message);
    }
  } catch (error) {
    console.error('Registration error:', error);
    registerMessage.textContent = 'Unable to register. Please check your connection and try again.';
    registerMessage.className = 'form__error';
    registerMessage.style.display = 'block';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Create Account';
  }
}); 