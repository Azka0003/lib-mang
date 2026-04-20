document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const msgEl = document.getElementById('login-msg');

  if (!email || !password) {
    msgEl.textContent = 'Please enter email and password.';
    msgEl.className = 'msg err';
    return;
  }

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (res.redirected) {
      window.location.href = res.url;
      return;
    }

    const data = await res.json().catch(() => ({}));
    msgEl.textContent = data.message || 'Invalid credentials.';
    msgEl.className = 'msg err';
  } catch (err) {
    msgEl.textContent = 'Server error. Please try again.';
    msgEl.className = 'msg err';
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('login-btn').click();
});