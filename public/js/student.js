/**
 * Utility to display status messages to the user
 */
function showMsg(id, text, isOk) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'msg ' + (isOk ? 'ok' : 'err');
}

/**
 * Formats date strings to Indian locale (DD/MM/YYYY)
 */
function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN');
}

/**
 * Fetches the current student's outstanding fine
 */
async function loadFine() {
  try {
    const res = await fetch('/api/student/my-fine');
    const data = await res.json();
    document.getElementById('fine-amount').textContent = data.fine ?? 0;
  } catch (err) {
    console.error('Fine load error:', err);
    document.getElementById('fine-amount').textContent = 'Error';
  }
}

/**
 * Fetches and displays books currently issued to the student
 */
async function loadMyBooks() {
  const tbody = document.getElementById('my-books-tbody');
  try {
    const res = await fetch('/api/student/my-books');
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
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Failed to load issued books.</td></tr>';
  }
}

/**
 * Search functionality for the library catalog
 */
async function searchBooks() {
  const q = document.getElementById('search-input').value.trim();
  const results = document.getElementById('search-results');

  if (!q) {
    results.innerHTML = '';
    return;
  }

  try {
    const res = await fetch(`/api/student/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();

    if (!data.length) {
      results.innerHTML = '<p style="color:#888; font-size:0.85rem; margin-top:8px">No books found matching that query.</p>';
      return;
    }

    results.innerHTML = data.map(b => `
      <div class="book-item">
        <strong>${b.title}</strong> 
        <span>by ${b.author}</span>
        <span>| ISBN: ${b.isbn || 'N/A'}</span>
        <span>| Available: ${b.availableCopies}/${b.totalCopies}</span>
        <span style="font-size:0.7rem; color:#aaa; display:block; margin-top:2px">ID: ${b._id}</span>
      </div>
    `).join('');
  } catch (err) {
    results.innerHTML = '<p style="color:#c62828; font-size:0.85rem">Search failed. Please try again.</p>';
  }
}

// --- Event Listeners ---

// Search Trigger (Button & Enter Key)
document.getElementById('search-btn').addEventListener('click', searchBooks);
document.getElementById('search-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchBooks();
});

// Return Book Form Handler
document.getElementById('return-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const issuedBookId = document.getElementById('return-issued-id').value.trim();

  try {
    const res = await fetch('/api/student/return-book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issuedBookId })
    });

    const data = await res.json();
    const ok = res.ok;
    
    let msg = data.message;
    if (ok && data.fineAdded > 0) {
      msg += ` (Fine added: ₹${data.fineAdded})`;
    }

    showMsg('return-msg', msg, ok);

    if (ok) {
      e.target.reset();
      loadMyBooks();
      loadFine();
    }
  } catch (err) {
    showMsg('return-msg', 'Error processing return.', false);
  }
});

// Logout Handler
document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/';
  } catch (err) {
    console.error('Logout failed');
  }
});

// Initialize Page Data
document.addEventListener('DOMContentLoaded', () => {
  loadFine();
  loadMyBooks();
});