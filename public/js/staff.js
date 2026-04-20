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
  return res.json();
}

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN');
}

async function loadIssuedBooks() {
  const tbody = document.getElementById('issued-tbody');
  try {
    const res = await fetch('/api/staff/issued-books');
    const data = await res.json();
    if (!data.length) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No books issued.</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(b => `
      <tr>
        <td style="font-size:0.75rem;">${b._id}</td>
        <td>${b.bookId?.title || '—'}</td>
        <td>${b.studentId?.name || '—'}</td>
        <td>${fmt(b.issueDate)}</td>
        <td>${fmt(b.returnDate)}</td>
        <td>₹${b.finePerDay ?? 0}</td>
      </tr>`).join('');
  } catch {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Failed to load.</td></tr>';
  }
}

// Event Listeners
document.getElementById('logout-btn').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/';
});

document.getElementById('add-book-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    title: document.getElementById('book-title').value,
    author: document.getElementById('book-author').value,
    isbn: document.getElementById('book-isbn').value,
    totalCopies: Number(document.getElementById('book-copies').value)
  };
  const data = await postJSON('/api/staff/add-book', body);
  showMsg('add-book-msg', data.message, true);
  e.target.reset();
});

loadIssuedBooks();