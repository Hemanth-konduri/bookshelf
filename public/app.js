const API = '/api/books';

const grid       = document.getElementById('books-grid');
const form       = document.getElementById('book-form');
const overlay    = document.getElementById('modal-overlay');
const emptyState = document.getElementById('empty-state');
const toast      = document.getElementById('toast');

let allBooks      = [];
let activeStatus  = 'All';
let activeGenre   = 'All';

// ── Modal ──
document.getElementById('open-modal').onclick   = () => overlay.classList.remove('hidden');
document.getElementById('close-modal').onclick  = closeModal;
document.getElementById('cancel-modal').onclick = closeModal;
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

function closeModal() {
  overlay.classList.add('hidden');
  form.reset();
}

// ── Filters ──
document.getElementById('status-filter').addEventListener('change', e => {
  activeStatus = e.target.value;
  renderBooks();
});
document.getElementById('genre-filter').addEventListener('change', e => {
  activeGenre = e.target.value;
  renderBooks();
});

// ── Load ──
async function loadBooks() {
  allBooks = await fetch(API).then(r => r.json());
  updateStats();
  renderBooks();
}

function updateStats() {
  document.getElementById('total-count').textContent    = allBooks.length;
  document.getElementById('reading-count').textContent  = allBooks.filter(b => b.status === 'Reading').length;
  document.getElementById('finished-count').textContent = allBooks.filter(b => b.status === 'Finished').length;
  document.getElementById('want-count').textContent     = allBooks.filter(b => b.status === 'Want to Read').length;
}

function renderBooks() {
  let filtered = allBooks;
  if (activeStatus !== 'All') filtered = filtered.filter(b => b.status === activeStatus);
  if (activeGenre  !== 'All') filtered = filtered.filter(b => b.genre  === activeGenre);

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    document.getElementById('books-count').textContent = '0 Books';
    return;
  }

  emptyState.classList.add('hidden');
  document.getElementById('books-count').textContent = `${filtered.length} Book${filtered.length !== 1 ? 's' : ''}`;

  const genreColors = {
    'Self-Help':  '#fff2e8,#e07b39',
    'Fiction':    '#fce8f3,#d946a8',
    'Technology': '#e8f4ff,#3b82f6',
    'Business':   '#fefce8,#ca8a04',
    'Psychology': '#f3e8ff,#a855f7',
    'Philosophy': '#e8fff2,#22c55e',
    'Biography':  '#fff1f1,#ef4444',
    'Other':      '#f1f5f9,#64748b'
  };

  grid.innerHTML = filtered.map(b => {
    const [gbg, gcol] = (genreColors[b.genre] || genreColors['Other']).split(',');
    return `
    <div class="book-card">
      ${b.imageUrl
        ? `<img class="book-cover" src="${b.imageUrl}" alt="${b.title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : ''}
      <div class="book-cover-placeholder" ${b.imageUrl ? 'style="display:none"' : ''}>
        <i class="fa-solid fa-book"></i>
        <span>No Cover</span>
      </div>
      <div class="book-body">
        <div class="genre-tag" style="background:${gbg};color:${gcol}">${b.genre || 'Other'}</div>
        <div class="book-title">${b.title}</div>
        <div class="book-author">by ${b.author}</div>
        ${b.notes ? `<div class="book-notes">${b.notes}</div>` : ''}
      </div>
      <div class="book-footer">
        <select class="status-select" onchange="updateStatus('${b._id}', this.value)">
          ${['Want to Read','Reading','Finished'].map(s =>
            `<option ${b.status === s ? 'selected' : ''}>${s}</option>`
          ).join('')}
        </select>
        <button class="delete-btn" onclick="deleteBook('${b._id}')" title="Delete">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>`;
  }).join('');
}

// ── Add Book ──
form.addEventListener('submit', async e => {
  e.preventDefault();
  const title    = document.getElementById('title').value.trim();
  const author   = document.getElementById('author').value.trim();
  const status   = document.getElementById('status').value;
  const genre    = document.getElementById('genre').value;
  const imageUrl = document.getElementById('imageUrl').value.trim();
  const notes    = document.getElementById('notes').value.trim();
  if (!title || !author) return;

  await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author, status, genre, imageUrl, notes })
  });

  closeModal();
  showToast(`"${title}" added to your shelf!`);
  loadBooks();
});

// ── Update Status ──
async function updateStatus(id, status) {
  await fetch(`${API}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  showToast('Status updated');
  loadBooks();
}

// ── Delete ──
async function deleteBook(id) {
  const book = allBooks.find(b => b._id === id);
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  showToast(`"${book?.title}" removed`);
  loadBooks();
}

// ── Toast ──
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 2800);
}

loadBooks();
