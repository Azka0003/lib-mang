function showMsg(id, text, isOk) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'msg ' + (isOk ? 'ok' : 'err');
}

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN');
}

async function loadFine() {
  try {
    const res  = await fetch('/api/student/my-fine');
    const data = await res.json();
    document.getElementById('fine-amount').textContent = data.fine ?? 0;
  } catch {
    document.getElementById('fine-amount').textContent = 'Error';
  }
}

async function loadMyBooks() {
  const tbody = document.getElementById('my-books-tbody');
  try {
    const res  = await fetch('/api/student/my-books');
    const data = await res.json();
    if (!data.length) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No books issued to you.</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(b => `
      <tr>
        <td style="font-size:0.75rem; word-break:break-all">${b._id}</td>
        <td>${b.bookId?.title || '—'}</td>
        <td>${b.bookId?.author || '—'}</td>
        <td>${fmt(b.issueDate)}</td>
        <td>${fmt(b.returnDate)}</td>
        <td>₹${b.finePerDay ?? 0}</td>
      </tr>`).join('');
  } catch {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Failed to load issued books.</td></tr>';
  }
}

async function searchBooks() {
  const q       = document.getElementById('search-input').value.trim();
  const results = document.getElementById('search-results');
  if (!q) { results.innerHTML = ''; return; }
  try {
    const res  = await fetch(`/api/student/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (!data.length) {
      results.innerHTML = '<p style="color:#888;font-size:0.85rem;margin-top:8px">No books found.</p>';
      return;
    }
    results.innerHTML = data.map(b => `
      <div class="book-item">
        <strong>${b.title}</strong>
        <span>by ${b.author}</span>
        <span>| ISBN: ${b.isbn || 'N/A'}</span>
        <span>| Available: ${b.availableCopies}/${b.totalCopies}</span>
        <span style="font-size:0.7rem;color:#aaa;display:block;margin-top:2px">ID: ${b._id}</span>
      </div>`).join('');
  } catch {
    results.innerHTML = '<p style="color:#c62828;font-size:0.85rem">Search failed.</p>';
  }
}

// Search
document.getElementById('search-btn').addEventListener('click', searchBooks);
document.getElementById('search-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchBooks();
});

// Return Book
document.getElementById('return-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const issuedBookId = document.getElementById('return-issued-id').value.trim();
  try {
    const res  = await fetch('/api/student/return-book', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ issuedBookId })
    });
    const data = await res.json();
    let msg = data.message;
    if (res.ok && data.fineAdded > 0) msg += ` (Fine added: ₹${data.fineAdded})`;
    showMsg('return-msg', msg, res.ok);
    if (res.ok) { e.target.reset(); loadMyBooks(); loadFine(); }
  } catch {
    showMsg('return-msg', 'Error processing return.', false);
  }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/';
});

// Init — single DOMContentLoaded, no duplicate calls
document.addEventListener('DOMContentLoaded', () => {
  loadFine();
  loadMyBooks();
});
