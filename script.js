(function () {
  const form = document.getElementById('login-form');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const emailErr = document.getElementById('email-error');
  const passErr = document.getElementById('password-error');
  const msg = document.getElementById('form-message');
  const remember = document.getElementById('remember');
  const toggle = document.getElementById('toggle-password');

  // Restore remembered email (demo-only; never store real passwords)
  const remembered = localStorage.getItem('sm-login-email');
  if (remembered) {
    email.value = remembered;
    remember.checked = true;
  }

  toggle.addEventListener('click', () => {
    const isPassword = password.type === 'password';
    password.type = isPassword ? 'text' : 'password';
    toggle.setAttribute('aria-pressed', String(isPassword));
    toggle.textContent = isPassword ? 'Hide' : 'Show';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    emailErr.textContent = '';
    passErr.textContent = '';
    msg.textContent = '';

    const emailVal = email.value.trim();
    const passVal = password.value;

    let valid = true;
    if (!emailVal) {
      emailErr.textContent = 'Email is required';
      valid = false;
    }
    if (!passVal) {
      passErr.textContent = 'Password is required';
      valid = false;
    }

    if (!valid) return;

    // Demo: pretend to authenticate, then show success
    if (remember.checked) {
      localStorage.setItem('sm-login-email', emailVal);
    } else {
      localStorage.removeItem('sm-login-email');
    }

    msg.textContent = 'Logging in…';
    setTimeout(() => {
      msg.textContent = 'Success! Redirecting to dashboard…';
      // In a real app, redirect after successful auth
      // location.href = '/dashboard.html';
    }, 600);
  });
})();
