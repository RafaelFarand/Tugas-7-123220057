// Konfigurasi awal dan variabel global
const API_URL = "https://be-1061342868557.us-central1.run.app";
let accessToken = "";
let currentUsername = "";
let noteToDeleteId = null;

axios.defaults.withCredentials = true;

// --- MANAJEMEN TAMPILAN (UI) ---

// Navigasi Single-Page Application (SPA)
function showPage(page) {
  document.getElementById('login-page').classList.add('hidden');
  document.getElementById('register-page').classList.add('hidden');
  document.getElementById('notes-page').classList.add('hidden');
  
  const targetPage = document.getElementById(`${page}-page`);
  if (targetPage) {
    targetPage.classList.remove('hidden');
  }

  // Jika pindah ke halaman catatan, isi nama pengguna dan muat catatan
  if (page === 'notes') {
    document.getElementById('note-username').value = currentUsername;
    loadNotes();
  }
}

// Menampilkan notifikasi sementara
function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    notificationMessage.textContent = message;
    notification.className = `fixed bottom-5 right-5 text-white py-3 px-6 rounded-lg shadow-lg ${isError ? 'bg-red-500' : 'bg-green-500'}`;
    notification.classList.remove('hidden');
    
    // Sembunyikan notifikasi setelah 3 detik
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// --- FUNGSI AUTENTIKASI ---

// Registrasi pengguna baru
async function register() {
  const username = document.getElementById("register-username").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;
  const confirm = document.getElementById("register-confirm").value;
  const errorDiv = document.getElementById("register-error");
  errorDiv.textContent = "";

  if (!username || !email || !password || !confirm) {
    errorDiv.textContent = "Semua field harus diisi!";
    return;
  }
  if (password !== confirm) {
    errorDiv.textContent = "Password dan konfirmasi tidak sama!";
    return;
  }

  try {
    await axios.post(`${API_URL}/register`, { email, username, password });
    showNotification("Registrasi berhasil! Silakan login.");
    showPage('login');
  } catch (err) {
    errorDiv.textContent = err.response?.data?.message || "Registrasi gagal";
  }
}

// Login pengguna
async function login() {
  const username = document.getElementById("login-username").value.trim();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const errorDiv = document.getElementById("login-error");
  errorDiv.textContent = "";

  if (!username || !email || !password) {
    errorDiv.textContent = "Semua field harus diisi!";
    return;
  }

  try {
    const res = await axios.post(`${API_URL}/login`, { email, password });
    accessToken = res.data.accessToken;
    currentUsername = username; // Simpan username setelah login berhasil
    showPage('notes');
  } catch (err) {
    errorDiv.textContent = err.response?.data?.message || "Login gagal";
  }
}

// Logout pengguna
async function logout() {
  try {
    await axios.get(`${API_URL}/logout`);
    accessToken = "";
    currentUsername = "";
    showPage("login");
  } catch (err) {
    console.error("Logout gagal:", err.message);
    showNotification("Logout gagal", true);
  }
}

// --- MANAJEMEN CATATAN (CRUD) ---

// Memuat semua catatan dari server
async function loadNotes() {
    const tableBody = document.getElementById("note-list-body");
    const noNotesMessage = document.getElementById('no-notes-message');
    tableBody.innerHTML = "";
    try {
        const res = await apiCall("get", "/notes");
        const notes = res.data;

        if (notes.length === 0) {
            noNotesMessage.classList.remove('hidden');
            tableBody.classList.add('hidden');
        } else {
            noNotesMessage.classList.add('hidden');
            tableBody.classList.remove('hidden');
            notes.forEach((note, index) => {
                const row = document.createElement("tr");
                row.className = "hover:bg-gray-700 transition-colors";
                // Escaping karakter khusus untuk onclick
                const escapedTitle = note.title.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                const escapedContent = note.content.replace(/'/g, "\\'").replace(/"/g, "&quot;");

                row.innerHTML = `
                    <td class="p-4 text-center">${index + 1}</td>
                    <td class="p-4">${currentUsername}</td>
                    <td class="p-4 font-medium">${note.title}</td>
                    <td class="p-4 text-gray-400">
                        <div class="note-content" title="${note.content}">${note.content}</div>
                    </td>
                    <td class="p-4 text-center">
                        <div class="flex gap-2 justify-center">
                            <button class="py-1 px-4 bg-yellow-500 text-black rounded font-semibold hover:bg-yellow-600" onclick="editNote(${note.id}, '${escapedTitle}', '${escapedContent}')">Edit</button>
                            <button class="py-1 px-4 bg-red-600 text-white rounded font-semibold hover:bg-red-700" onclick="openDeleteModal(${note.id})">Hapus</button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    } catch (err) {
        showNotification("Gagal memuat catatan", true);
    }
}

// Menyimpan catatan (baik baru maupun yang diedit)
async function saveNote() {
  const title = document.getElementById("note-title").value.trim();
  const content = document.getElementById("note-content").value.trim();
  const id = document.getElementById("note-id").value;

  if (!title || !content) {
    showNotification("Judul dan isi harus diisi!", true);
    return;
  }

  try {
    if (id) {
      await apiCall("put", `/update-notes/${id}`, { title, content });
      showNotification("Catatan berhasil diupdate!");
    } else {
      await apiCall("post", "/add-notes", { title, content });
      showNotification("Catatan berhasil ditambahkan!");
    }
    resetNoteForm();
    loadNotes();
  } catch {
    showNotification("Gagal menyimpan catatan", true);
  }
}

// Menyiapkan form untuk mengedit catatan
function editNote(id, title, content) {
  document.getElementById("note-id").value = id;
  document.getElementById("note-title").value = title;
  document.getElementById("note-content").value = content;
  document.getElementById("note-save-btn").textContent = "Update Catatan";
  document.getElementById("note-cancel-btn").classList.remove("hidden");
  // Scroll ke atas halaman agar form terlihat
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Membatalkan mode edit
function cancelEdit() {
  resetNoteForm();
}

// Mereset form catatan ke kondisi awal
function resetNoteForm() {
  document.getElementById("note-form").reset();
  document.getElementById("note-id").value = "";
  document.getElementById("note-save-btn").textContent = "Simpan";
  document.getElementById("note-cancel-btn").classList.add("hidden");
}

// Menghapus catatan melalui konfirmasi modal
async function confirmDelete() {
    if (!noteToDeleteId) return;
    try {
        await apiCall("delete", `/delete-notes/${noteToDeleteId}`);
        showNotification("Catatan berhasil dihapus!");
        loadNotes();
    } catch {
        showNotification("Gagal menghapus catatan", true);
    } finally {
        closeDeleteModal();
    }
}

// --- MODAL KONFIRMASI ---

function openDeleteModal(id) {
    noteToDeleteId = id;
    document.getElementById('delete-modal').classList.remove('hidden');
}

function closeDeleteModal() {
    noteToDeleteId = null;
    document.getElementById('delete-modal').classList.add('hidden');
}

// --- HELPER & INISIALISASI ---

// Refresh token jika token akses kedaluwarsa
async function refreshToken() {
  try {
    const res = await axios.get(`${API_URL}/token`);
    accessToken = res.data.accessToken;
  } catch {
    accessToken = "";
    showPage('login'); // Jika refresh gagal, kembali ke login
  }
}

// Wrapper untuk panggilan API yang menangani refresh token secara otomatis
async function apiCall(method, url, data = null) {
  try {
    return await axios({
      method,
      url: `${API_URL}${url}`,
      data,
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  } catch (err) {
    // Jika error karena token tidak valid (403 Forbidden), coba refresh token
    if (err.response && err.response.status === 403) {
      await refreshToken();
      // Coba lagi panggilan API dengan token baru
      return await axios({
        method,
        url: `${API_URL}${url}`,
        data,
        headers: { Authorization: `Bearer ${accessToken}` }
      });
    } else {
      throw err; // Lemparkan error lain
    }
  }
}

// Event listener yang dijalankan saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    showPage('login'); // Halaman awal adalah login
    document.getElementById('cancel-delete-btn').addEventListener('click', closeDeleteModal);
    document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete);
});
