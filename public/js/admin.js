function showMsg(id, text, isOk) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'msg ' + (isOk ? 'ok' : 'err');
}

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return { ok: res.ok, data: await res.json() };
}

// Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/';
});

// Add Staff
document.getElementById('add-staff-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    name:     document.getElementById('staff-name').value.trim(),
    email:    document.getElementById('staff-email').value.trim(),
    password: document.getElementById('staff-password').value
  };
  const { ok, data } = await postJSON('/api/admin/add-staff', body);
  showMsg('staff-msg', data.message, ok);
  if (ok) e.target.reset();
});

// Set Fine Per Day
document.getElementById('set-fine-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    issuedBookId: document.getElementById('fine-issued-id').value.trim(),
    finePerDay:   Number(document.getElementById('fine-per-day').value)
  };
  const { ok, data } = await postJSON('/api/admin/set-fine', body);
  showMsg('fine-msg', data.message, ok);
  if (ok) e.target.reset();
});

// Set Return Date
document.getElementById('set-return-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    issuedBookId: document.getElementById('return-issued-id').value.trim(),
    returnDate:   document.getElementById('return-date').value
  };
  const { ok, data } = await postJSON('/api/admin/set-return-date', body);
  showMsg('return-msg', data.message, ok);
  if (ok) e.target.reset();
});
