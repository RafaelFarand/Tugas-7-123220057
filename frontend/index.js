const API_URL = "https://notes-1031435520100.us-central1.run.app";
let accessToken = "";

axios.defaults.withCredentials = true;

// SPA Navigation
function showPage(page) {
  document.getElementById('login-page').classList.add('hidden');
  document.getElementById('register-page').classList.add('hidden');
  document.getElementById('notes-page').classList.add('hidden');
  if (page === 'login') {
    document.getElementById('login-error').textContent = '';
    document.getElementById('login-page').classList.remove('hidden');
  } else if (page === 'register') {
    document.getElementById('register-error').textContent = '';
    document.getElementById('register-page').classList.remove('hidden');
  } else if (page === 'notes') {
    document.getElementById('notes-success').textContent = '';
    document.getElementById('notes-page').classList.remove('hidden');
    loadNotes();
  }
}

// Register
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
    alert("Registrasi berhasil! Silakan login.");
    showPage('login');
  } catch (err) {
    errorDiv.textContent = err.response?.data?.message || "Registrasi gagal";
  }
}

// Login
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
    showPage('notes');
  } catch (err) {
    errorDiv.textContent = err.response?.data?.message || "Login gagal";
  }
}

// Logout
async function logout() {
  try {
    await axios.get(`${API_URL}/logout`);
    accessToken = "";
    showPage("login");
  } catch (err) {
    console.error("Logout gagal:", err.message);
    alert("Logout gagal");
  }
}


// Token Refresh
async function refreshToken() {
  try {
    const res = await axios.get(`${API_URL}/token`);
    accessToken = res.data.accessToken;
  } catch {
    accessToken = "";
    showPage('login');
  }
}

// API Call Helper
async function apiCall(method, url, data = null) {
  try {
    return await axios({
      method,
      url: `${API_URL}${url}`,
      data,
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  } catch (err) {
    if (err.response && err.response.status === 403) {
      await refreshToken();
      return await axios({
        method,
        url: `${API_URL}${url}`,
        data,
        headers: { Authorization: `Bearer ${accessToken}` }
      });
    } else {
      throw err;
    }
  }
}

// Load Notes
async function loadNotes() {
  try {
    const res = await apiCall("get", "/notes");
    const notes = res.data;
    const list = document.getElementById("note-list");
    list.innerHTML = "";
    if (notes.length === 0) {
      list.innerHTML = "<div>Tidak ada catatan.</div>";
      return;
    }
    notes.forEach(note => {
      const div = document.createElement("div");
      div.className = "note";
      div.innerHTML = `
        <span class="note-title">${note.title}</span><br>
        <span>${note.content}</span>
        <div class="note-actions">
          <button class="edit" onclick="editNote(${note.id}, '${note.title.replace(/'/g, "\\'")}', '${note.content.replace(/'/g, "\\'")}')">Edit</button>
          <button onclick="deleteNote(${note.id})">Hapus</button>
        </div>
      `;
      list.appendChild(div);
    });
  } catch (err) {
    document.getElementById("notes-success").textContent = "Gagal memuat catatan";
  }
}

// Add/Edit Note
async function saveNote() {
  const title = document.getElementById("note-title").value.trim();
  const content = document.getElementById("note-content").value.trim();
  const id = document.getElementById("note-id").value;
  const successDiv = document.getElementById("notes-success");

  if (!title || !content) {
    successDiv.textContent = "Judul dan isi harus diisi!";
    return;
  }

  try {
    if (id) {
      await apiCall("put", `/update-notes/${id}`, { title, content });
      successDiv.textContent = "Catatan berhasil diupdate!";
    } else {
      await apiCall("post", "/add-notes", { title, content });
      successDiv.textContent = "Catatan berhasil ditambahkan!";
    }
    resetNoteForm();
    loadNotes();
  } catch {
    successDiv.textContent = "Gagal menyimpan catatan";
  }
}

// Edit Note
function editNote(id, title, content) {
  document.getElementById("note-id").value = id;
  document.getElementById("note-title").value = title;
  document.getElementById("note-content").value = content;
  document.getElementById("note-save-btn").textContent = "Update Catatan";
  document.getElementById("note-cancel-btn").classList.remove("hidden");
}

// Cancel Edit
function cancelEdit() {
  resetNoteForm();
}

// Reset Note Form
function resetNoteForm() {
  document.getElementById("note-id").value = "";
  document.getElementById("note-title").value = "";
  document.getElementById("note-content").value = "";
  document.getElementById("note-save-btn").textContent = "Tambah Catatan";
  document.getElementById("note-cancel-btn").classList.add("hidden");
}

// Delete Note
async function deleteNote(id) {
  if (!confirm("Hapus catatan ini?")) return;
  try {
    await apiCall("delete", `/delete-notes/${id}`);
    document.getElementById("notes-success").textContent = "Catatan dihapus!";
    loadNotes();
  } catch {
    document.getElementById("notes-success").textContent = "Gagal menghapus catatan";
  }
}

// SPA Routing on load
window.onload = () => {
  showPage('login');
};

// Expose for inline onclick
window.editNote = editNote;
window.deleteNote = deleteNote;
window.cancelEdit = cancelEdit;