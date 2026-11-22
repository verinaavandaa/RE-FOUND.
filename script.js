const sampleReports = [
  {
    id: 1, type: "lost", name: "Botol Minum Biru",
    category: "Perlengkapan", color: "Biru",
    city: "Blitar", institution: "SMA Negeri 2 Blitar",
    location: "Perpustakaan", date: "20 November 2026",
    description: "Botol minum tertinggal setelah jam istirahat.",
    emoji: "🧴", status: "Dicari"
  },
  {
    id: 2, type: "found", name: "Tempat Pensil",
    category: "Alat tulis", color: "Ungu",
    city: "Malang", institution: "Universitas Negeri Malang",
    location: "Gedung A", date: "21 November 2026",
    description: "Ditemukan di dekat ruang kelas.",
    emoji: "✏️", status: "Ditemukan"
  },
  {
    id: 3, type: "lost", name: "Kartu Pelajar",
    category: "Dokumen", color: "Putih biru",
    city: "Surabaya", institution: "SMA Negeri 5 Surabaya",
    location: "Lapangan sekolah", date: "19 November 2026",
    description: "Kemungkinan terjatuh saat olahraga.",
    emoji: "🪪", status: "Dicari"
  },
  {
    id: 4, type: "found", name: "Payung Lipat",
    category: "Aksesori", color: "Kuning",
    city: "Blitar", institution: "Universitas Islam Balitar",
    location: "Kantin kampus", date: "22 November 2026",
    description: "Ditemukan setelah hujan.",
    emoji: "☂️", status: "Ditemukan"
  },
  {
    id: 5, type: "lost", name: "Earphone Putih",
    category: "Elektronik", color: "Putih",
    city: "Yogyakarta", institution: "Universitas Gadjah Mada",
    location: "Perpustakaan", date: "18 November 2026",
    description: "Kotak earphone kecil berwarna putih.",
    emoji: "🎧", status: "Dicari"
  },
  {
    id: 6, type: "found", name: "Buku Catatan",
    category: "Alat tulis", color: "Cokelat",
    city: "Malang", institution: "SMA Negeri 3 Malang",
    location: "Aula sekolah", date: "20 November 2026",
    description: "Ditemukan setelah kegiatan sekolah.",
    emoji: "📒", status: "Ditemukan"
  }
];

const STORAGE = "refound_reports";
let reports = loadReports();

function loadReports() {
  try {
    const saved = localStorage.getItem(STORAGE);
    return saved ? JSON.parse(saved) : sampleReports;
  } catch {
    return sampleReports;
  }
}

function saveReports() {
  localStorage.setItem(STORAGE, JSON.stringify(reports));
}

function updateStats() {
  document.getElementById("total").textContent = reports.length;
  document.getElementById("lost").textContent =
    reports.filter(r => r.type === "lost").length;
  document.getElementById("found").textContent =
    reports.filter(r => r.type === "found").length;
  document.getElementById("returned").textContent =
    reports.filter(r => r.status === "Dikembalikan").length;
}

function renderReports() {
  const search = document.getElementById("search").value.toLowerCase();
  const type = document.getElementById("typeFilter").value;
  const category = document.getElementById("categoryFilter").value;

  const filtered = reports.filter(r => {
    const text = [
      r.name, r.city, r.institution, r.location, r.color
    ].join(" ").toLowerCase();

    return text.includes(search) &&
      (type === "all" || r.type === type) &&
      (category === "all" || r.category === category);
  });

  const container = document.getElementById("reports");

  container.innerHTML = filtered.map(r => `
    <article class="report-card">
      <div class="report-top ${r.type === "lost" ? "lost-bg" : "found-bg"}">
        <span>${r.emoji || "📦"}</span>
        <span class="pill">${r.type === "lost" ? "DICARI" : "DITEMUKAN"}</span>
      </div>
      <div class="report-content">
        <small>${escapeHTML(r.category)} · ${escapeHTML(r.date)}</small>
        <h3>${escapeHTML(r.name)}</h3>
        <p>📍 ${escapeHTML(r.location)}, ${escapeHTML(r.city)}</p>
        <p>${escapeHTML(r.institution)}</p>
        <button onclick="showDetail(${r.id})">Lihat Detail ↗</button>
      </div>
    </article>
  `).join("");

  document.getElementById("empty").hidden = filtered.length > 0;
  updateStats();
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  }[char]));
}

function openForm() {
  document.getElementById("reportDialog").showModal();
}

function closeForm() {
  document.getElementById("reportDialog").close();
}

document.getElementById("reportForm").addEventListener("submit", event => {
  event.preventDefault();

  const data = new FormData(event.target);
  const type = data.get("type");
  const category = data.get("category");

  const emojiMap = {
    "Elektronik": "🎧",
    "Alat tulis": "✏️",
    "Aksesori": "🧢",
    "Dokumen": "🪪",
    "Perlengkapan": "🎒",
    "Lainnya": "📦"
  };

  const newReport = {
    id: Date.now(),
    type,
    name: data.get("name").trim(),
    category,
    color: data.get("color").trim(),
    institution: data.get("institution").trim(),
    city: data.get("city").trim(),
    location: data.get("location").trim(),
    date: new Date(data.get("date") + "T00:00:00")
      .toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric"
      }),
    description: data.get("description").trim(),
    emoji: emojiMap[category] || "📦",
    status: type === "lost" ? "Dicari" : "Ditemukan"
  };

  reports.unshift(newReport);

  try {
    saveReports();
  } catch {
    reports.shift();
    alert("Penyimpanan browser penuh.");
    return;
  }

  event.target.reset();
  closeForm();
  renderReports();
  alert("Laporan berhasil ditambahkan!");
});

function showDetail(id) {
  const r = reports.find(item => item.id === id);
  if (!r) return;

  const dialog = document.getElementById("resultDialog");
  const content = document.getElementById("resultContent");

  content.innerHTML = `
    <div style="font-size:55px;text-align:center;margin-bottom:15px">${r.emoji}</div>
    <span class="tag">${r.type === "lost" ? "BARANG HILANG" : "BARANG DITEMUKAN"}</span>
    <h2 style="margin:8px 0">${escapeHTML(r.name)}</h2>
    <p style="margin:10px 0;color:#85818a;line-height:1.7">
      ${escapeHTML(r.description || "Tidak ada deskripsi.")}
    </p>
    <p><b>Kategori:</b> ${escapeHTML(r.category)}</p>
    <p><b>Warna:</b> ${escapeHTML(r.color || "-")}</p>
    <p><b>Institusi:</b> ${escapeHTML(r.institution)}</p>
    <p><b>Kota:</b> ${escapeHTML(r.city)}</p>
    <p><b>Lokasi:</b> ${escapeHTML(r.location)}</p>
    <p><b>Status:</b> ${escapeHTML(r.status)}</p>
    <p style="font-size:12px;color:#85818a;margin-top:15px">
      Lakukan verifikasi ciri khusus barang dan atur pengambilan di titik aman.
    </p>
    ${r.status !== "Dikembalikan" ? `
      <button class="primary" style="margin-top:15px"
        onclick="markReturned(${r.id})">
        Tandai Dikembalikan ✓
      </button>` : ""}
  `;

  dialog.showModal();
}

function markReturned(id) {
  const item = reports.find(r => r.id === id);
  if (!item) return;

  item.status = "Dikembalikan";
  saveReports();
  document.getElementById("resultDialog").close();
  renderReports();
  alert("Status barang berhasil diperbarui!");
}

function findMatches() {
  const lost = reports.filter(r => r.type === "lost");
  const found = reports.filter(r => r.type === "found");
  const pairs = [];

  lost.forEach(l => {
    found.forEach(f => {
      let score = 0;

      if (l.category === f.category) score += 3;
      if (l.city.toLowerCase() === f.city.toLowerCase()) score += 2;
      if (l.institution.toLowerCase() === f.institution.toLowerCase()) score += 3;

      if (l.color && f.color &&
          l.color.toLowerCase() === f.color.toLowerCase()) score += 2;

      const words = l.name.toLowerCase().split(" ");
      if (words.some(word => word.length > 3 &&
          f.name.toLowerCase().includes(word))) score += 2;

      if (score >= 4) pairs.push({l, f, score});
    });
  });

  pairs.sort((a, b) => b.score - a.score);

  const content = document.getElementById("resultContent");

  if (pairs.length === 0) {
    content.innerHTML = `
      <h2>Belum ada kecocokan 🧩</h2>
      <p style="margin:15px 0;color:#85818a">
        Coba tambahkan lebih banyak laporan kehilangan dan penemuan.
      </p>`;
  } else {
    content.innerHTML = `
      <span class="tag">SMART MATCH</span>
      <h2 style="margin:8px 0">Kemungkinan cocok! ✨</h2>
      ${pairs.slice(0, 8).map(p => `
        <div class="match-item">
          <b>🔍 ${escapeHTML(p.l.name)}</b>
          <p>Barang hilang · ${escapeHTML(p.l.institution)}</p>
          <div style="text-align:center;margin:8px">↕ MUNGKIN COCOK ↕</div>
          <b>✨ ${escapeHTML(p.f.name)}</b>
          <p>Barang ditemukan · ${escapeHTML(p.f.institution)}</p>
        </div>
      `).join("")}
      <p style="font-size:11px;color:#85818a">
        Hasil ini hanya rekomendasi kemiripan data. Tetap verifikasi kepemilikan barang.
      </p>`;
  }

  document.getElementById("resultDialog").showModal();
}

["search", "typeFilter", "categoryFilter"].forEach(id => {
  document.getElementById(id).addEventListener(
    id === "search" ? "input" : "change",
    renderReports
  );
});
renderReports();
