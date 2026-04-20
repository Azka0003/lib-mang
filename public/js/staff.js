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

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN');
}

async function loadIssuedBooks() {
  const tbody = document.getElementById('issued-tbody');
  try {
    const res  = await fetch('/api/staff/issued-books');
    const data = await res.json();
    if (!data.length) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No books currently issued.</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(b => `
      <tr>
        <td style="font-size:0.75rem; word-break:break-all">${b._id}</td>
        <td>${b.bookId?.title || '—'}</td>
        <td>${b.studentId?.name || '—'} (${b.studentId?.email || '—'})</td>
        <td>${fmt(b.issueDate)}</td>
        <td>${fmt(b.returnDate)}</td>
        <td>₹${b.finePerDay ?? 0}</td>
      </tr>`).join('');
  } catch {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Failed to load.</td></tr>';
  }
}

// Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/';
});

// Add Book
document.getElementById('add-book-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    title:       document.getElementById('book-title').value.trim(),
    author:      document.getElementById('book-author').value.trim(),
    isbn:        document.getElementById('book-isbn').value.trim(),
    totalCopies: Number(document.getElementById('book-copies').value)
  };
  const { ok, data } = await postJSON('/api/staff/add-book', body);
  showMsg('add-book-msg', data.message, ok);
  if (ok) e.target.reset();
});

// Delete Book
document.getElementById('delete-book-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = { bookId: document.getElementById('delete-book-id').value.trim() };
  const { ok, data } = await postJSON('/api/staff/delete-book', body);
  showMsg('delete-book-msg', data.message, ok);
  if (ok) e.target.reset();
});

// Issue Book
document.getElementById('issue-book-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    bookId:    document.getElementById('issue-book-id').value.trim(),
    studentId: document.getElementById('issue-student-id').value.trim()
  };
  const { ok, data } = await postJSON('/api/staff/issue-book', body);
  showMsg('issue-book-msg', data.message, ok);
  if (ok) { e.target.reset(); loadIssuedBooks(); }
});

// Init
document.addEventListener('DOMContentLoaded', loadIssuedBooks);
