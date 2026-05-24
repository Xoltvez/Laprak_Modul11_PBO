/* ============================================================
   script.js — Wikipedia Homepage JavaScript
   Berisi semua fungsi interaktif tampilan Wikipedia
   ============================================================ */

/* ============================================================
   1. FUNGSI: PENCARIAN (Search)
      Menangani input pada kotak pencarian.
      - Saat user mengetik → placeholder hilang secara smooth
      - Saat user tekan Enter → redirect ke Wikipedia sesuai bahasa
      - Saat tombol search diklik → sama seperti Enter
      - Saat input kosong → tombol search sedikit redup
   ============================================================ */

const searchInput = document.getElementById("searchInput");
const searchBtn = document.querySelector(".search-btn");

/* Redirect ke Wikipedia dengan query pencarian */
function doSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    /* Kalau kosong: animasi shake pada search box */
    const box = document.querySelector(".search-box");
    box.classList.add("shake");
    setTimeout(() => box.classList.remove("shake"), 500);
    searchInput.focus();
    return;
  }
  /* Buka hasil pencarian Wikipedia di tab baru */
  const lang = currentLang;
  const url = `https://${lang}.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`;
  window.open(url, "_blank");
}

/* Tekan Enter di input → jalankan pencarian */
searchInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") doSearch();
});

/* Klik tombol search → jalankan pencarian */
searchBtn.addEventListener("click", doSearch);

/* Saat mengetik → tampilkan/sembunyikan placeholder hint */
searchInput.addEventListener("input", function () {
  const hasText = this.value.length > 0;
  searchBtn.style.opacity = hasText ? "1" : "0.7";
});

/* ============================================================
   2. FUNGSI: DROPDOWN PILIHAN BAHASA PENCARIAN
      Saat user klik area "ID ▾" → muncul dropdown
      daftar bahasa yang bisa dipilih untuk pencarian.
      Memilih bahasa → mengubah variabel currentLang
      sehingga pencarian diarahkan ke Wikipedia bahasa tsb.
   ============================================================ */

const langSelect = document.querySelector(".lang-select");
const langOptions = [
  { code: "id", label: "ID – Bahasa Indonesia" },
  { code: "en", label: "EN – English" },
  { code: "ja", label: "JA – 日本語" },
  { code: "de", label: "DE – Deutsch" },
  { code: "fr", label: "FR – Français" },
  { code: "ru", label: "RU – Русский" },
  { code: "zh", label: "ZH – 中文" },
  { code: "es", label: "ES – Español" },
  { code: "it", label: "IT – Italiano" },
  { code: "pl", label: "PL – Polski" },
];

let currentLang = "id"; /* Default bahasa Indonesia */
let dropdown = null;

function buildDropdown() {
  /* Buat elemen dropdown */
  dropdown = document.createElement("ul");
  dropdown.id = "lang-dropdown";
  dropdown.style.cssText = `
    position:absolute; z-index:999; list-style:none;
    background:#1e2021; border:1px solid #3d3f41;
    border-radius:4px; padding:4px 0; margin:0;
    min-width:200px; box-shadow:0 8px 24px rgba(0,0,0,0.5);
    top:calc(100% + 6px); left:0;
  `;

  langOptions.forEach((opt) => {
    const li = document.createElement("li");
    li.textContent = opt.label;
    li.dataset.code = opt.code;
    li.style.cssText = `
      padding:8px 16px; cursor:pointer; font-size:0.85rem;
      color:${opt.code === currentLang ? "#60a5fa" : "#d8d8d8"};
      transition:background 0.15s;
    `;
    li.addEventListener("mouseenter", () => (li.style.background = "#2d3748"));
    li.addEventListener(
      "mouseleave",
      () => (li.style.background = "transparent"),
    );
    li.addEventListener("click", () => {
      currentLang = opt.code;
      /* Update label di tombol */
      langSelect.querySelector("span").textContent = opt.code.toUpperCase();
      closeDropdown();
    });
    dropdown.appendChild(li);
  });

  /* Posisikan relatif terhadap lang-select */
  langSelect.style.position = "relative";
  langSelect.appendChild(dropdown);
}

function closeDropdown() {
  if (dropdown) {
    dropdown.remove();
    dropdown = null;
  }
}

langSelect.addEventListener("click", function (e) {
  e.stopPropagation();
  if (dropdown) {
    closeDropdown();
    return;
  }
  buildDropdown();
});

/* Klik di luar dropdown → tutup */
document.addEventListener("click", closeDropdown);

/* ============================================================
   3. FUNGSI: KLIK KARTU BAHASA
      Saat user klik salah satu bahasa (misal "English") →
      redirect ke Wikipedia versi bahasa tersebut.
      Plus efek ripple visual saat diklik.
   ============================================================ */

const langCards = document.querySelectorAll(".lang-card");

/* Map nama bahasa → kode Wikipedia */
const langCodeMap = {
  "Bahasa Indonesia": "id",
  English: "en",
  日本語: "ja",
  Deutsch: "de",
  Français: "fr",
  Русский: "ru",
  中文: "zh",
  Español: "es",
  Italiano: "it",
  Polski: "pl",
};

langCards.forEach((card) => {
  card.addEventListener("click", function (e) {
    e.preventDefault();
    const langName = this.querySelector(".lang-name").textContent.trim();
    const code = langCodeMap[langName] || "id";

    /* Efek ripple */
    createRipple(this, e);

    /* Tunda sedikit agar ripple terlihat, lalu buka Wikipedia */
    setTimeout(() => {
      window.open(`https://${code}.wikipedia.org`, "_blank");
    }, 220);
  });
});

/* Buat efek ripple pada elemen */
function createRipple(el, e) {
  const ripple = document.createElement("span");
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.cssText = `
    position:absolute; border-radius:50%;
    width:${size}px; height:${size}px;
    background:rgba(59,130,246,0.25);
    transform:scale(0); pointer-events:none;
    left:${e.clientX - rect.left - size / 2}px;
    top:${e.clientY - rect.top - size / 2}px;
    animation:ripple-anim 0.5s ease-out forwards;
  `;
  el.style.position = "relative";
  el.style.overflow = "hidden";
  el.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

/* ============================================================
   4. FUNGSI: TOMBOL "BACA WIKIPEDIA DALAM BAHASA ANDA"
      Saat diklik → deteksi bahasa browser user secara otomatis
      → tampilkan popup kecil dengan pilihan bahasa yang sesuai
      → user konfirmasi → redirect ke Wikipedia bahasa tsb.
   ============================================================ */

const readLangBtn = document.querySelector(".read-lang-btn");

readLangBtn.addEventListener("click", function () {
  /* Deteksi bahasa browser */
  const browserLang = (navigator.language || "id").slice(0, 2).toLowerCase();
  const found = langOptions.find((o) => o.code === browserLang);
  const target = found || langOptions[0];

  /* Tampilkan toast konfirmasi */
  showToast(
    `Bahasa browser Anda terdeteksi: <strong>${target.label}</strong>`,
    () => window.open(`https://${target.code}.wikipedia.org`, "_blank"),
    `Buka Wikipedia ${target.code.toUpperCase()}`,
  );
});

/* ============================================================
   5. FUNGSI: TOAST NOTIFICATION
      Menampilkan notifikasi kecil di pojok bawah layar.
      Dipakai oleh beberapa fitur di atas.
      Parameter:
        - message  : teks HTML yang ditampilkan
        - onAction : fungsi yang dijalankan saat tombol diklik
        - actionLabel : label tombol aksi
   ============================================================ */

function showToast(message, onAction, actionLabel) {
  /* Hapus toast lama jika ada */
  const old = document.getElementById("wiki-toast");
  if (old) old.remove();

  const toast = document.createElement("div");
  toast.id = "wiki-toast";
  toast.style.cssText = `
    position:fixed; bottom:28px; left:50%; transform:translateX(-50%) translateY(60px);
    background:#1e2124; border:1px solid #3d4146;
    color:#d8d8d8; padding:14px 20px;
    border-radius:8px; font-size:0.87rem; font-family:sans-serif;
    box-shadow:0 8px 32px rgba(0,0,0,0.55);
    display:flex; align-items:center; gap:14px;
    z-index:9999; transition:transform 0.3s cubic-bezier(.34,1.56,.64,1);
    max-width:90vw; white-space:nowrap;
  `;

  const msg = document.createElement("span");
  msg.innerHTML = message;

  const btn = document.createElement("button");
  btn.textContent = actionLabel || "Buka";
  btn.style.cssText = `
    background:#3366cc; color:#fff; border:none; border-radius:4px;
    padding:6px 14px; cursor:pointer; font-size:0.82rem; white-space:nowrap;
  `;
  btn.addEventListener("click", () => {
    onAction && onAction();
    toast.remove();
  });

  const close = document.createElement("button");
  close.textContent = "✕";
  close.style.cssText = `background:transparent;border:none;color:#888;cursor:pointer;font-size:0.9rem;padding:0 4px;`;
  close.addEventListener("click", () => toast.remove());

  toast.append(msg, btn, close);
  document.body.appendChild(toast);

  /* Animasi masuk */
  requestAnimationFrame(() => {
    toast.style.transform = "translateX(-50%) translateY(0)";
  });

  /* Auto hilang setelah 5 detik */
  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 5000);
}

/* ============================================================
   6. FUNGSI: ANIMASI COUNTER JUMLAH ARTIKEL
      Saat halaman dimuat → angka artikel di setiap
      kartu bahasa "berhitung" dari 0 ke angka aslinya,
      memberi efek dinamis seolah data sedang diload.
   ============================================================ */

function animateCounter(el, targetText, duration = 1200) {
  /* Ambil angka dari teks seperti "771.000+ artikel" */
  const match = targetText.match(/([\d.,\s]+)/);
  if (!match) return;

  /* Bersihkan angka */
  const raw = match[1].replace(/[.,\s]/g, "");
  const end = parseInt(raw, 10);
  if (isNaN(end)) return;

  /* Simpan format asli untuk ditampilkan kembali */
  const prefix = targetText.slice(0, targetText.indexOf(match[1]));
  const suffix = targetText.slice(
    targetText.indexOf(match[1]) + match[1].length,
  );

  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    /* Easing: ease-out cubic */
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(ease * end);

    /* Format ulang angka dengan pemisah ribuan */
    const formatted = current.toLocaleString("id-ID").replace(/\./g, ".");
    el.textContent = prefix + formatted + suffix;

    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = targetText; /* pastikan akhirnya tepat */
  }

  requestAnimationFrame(tick);
}

/* Jalankan counter saat elemen masuk viewport (IntersectionObserver) */
const countEls = document.querySelectorAll(".lang-count");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const txt = el.dataset.original || el.textContent;
        el.dataset.original = txt; /* simpan teks asli */
        animateCounter(el, txt);
        observer.unobserve(el);
      }
    });
  },
  { threshold: 0.3 },
);

countEls.forEach((el) => observer.observe(el));

/* ============================================================
   7. FUNGSI: KEYBOARD SHORTCUT
      Menekan "/" di mana saja pada halaman →
      fokus otomatis ke kotak pencarian (seperti Wikipedia asli).
      Menekan Escape → kosongkan & unfokus input.
   ============================================================ */

document.addEventListener("keydown", function (e) {
  /* Jangan tangkap kalau user sedang mengetik di input lain */
  if (document.activeElement.tagName === "INPUT") {
    if (e.key === "Escape") {
      searchInput.value = "";
      searchInput.blur();
      searchBtn.style.opacity = "0.7";
    }
    return;
  }

  if (e.key === "/") {
    e.preventDefault(); /* cegah "/" ikut terketik di input */
    searchInput.focus();
    searchInput.select();
    /* Flash highlight pada search box */
    const box = document.querySelector(".search-box");
    box.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.45)";
    setTimeout(() => (box.style.boxShadow = ""), 800);
  }
});

/* ============================================================
   8. FUNGSI: TOOLTIP PADA KARTU BAHASA
      Saat hover pada kartu bahasa → muncul tooltip kecil
      berisi nama bahasa dalam bahasa itu sendiri
      (misal hover "English" → tampil "English Wikipedia").
   ============================================================ */

const tooltipData = {
  "Bahasa Indonesia": "Wikipedia bahasa Indonesia",
  English: "English Wikipedia",
  日本語: "ウィキペディア日本語版",
  Deutsch: "Deutschsprachige Wikipedia",
  Français: "Wikipédia en français",
  Русский: "Русская Википедия",
  中文: "中文維基百科",
  Español: "Wikipedia en español",
  Italiano: "Wikipedia in italiano",
  Polski: "Polska Wikipedia",
};

let activeTooltip = null;

langCards.forEach((card) => {
  const langName = card.querySelector(".lang-name").textContent.trim();
  const tipText = tooltipData[langName] || langName;

  card.addEventListener("mouseenter", function (e) {
    if (activeTooltip) activeTooltip.remove();

    const tip = document.createElement("div");
    tip.textContent = tipText;
    tip.style.cssText = `
      position:fixed; background:#111314; color:#d8d8d8;
      border:1px solid #3d3f41; border-radius:4px;
      padding:5px 11px; font-size:0.78rem; font-family:sans-serif;
      pointer-events:none; z-index:9000; white-space:nowrap;
      opacity:0; transition:opacity 0.15s;
    `;
    document.body.appendChild(tip);
    activeTooltip = tip;

    const rect = card.getBoundingClientRect();
    tip.style.left = rect.left + rect.width / 2 - tip.offsetWidth / 2 + "px";
    tip.style.top = rect.top - tip.offsetHeight - 8 + "px";
    requestAnimationFrame(() => (tip.style.opacity = "1"));
  });

  card.addEventListener("mouseleave", function () {
    if (activeTooltip) {
      activeTooltip.remove();
      activeTooltip = null;
    }
  });
});

/* ============================================================
   9. FUNGSI: ANIMASI CSS TAMBAHAN (inject via JS)
      Beberapa animasi membutuhkan @keyframes yang
      didefinisikan secara dinamis lewat JavaScript.
   ============================================================ */

const extraStyles = document.createElement("style");
extraStyles.textContent = `
  /* Ripple effect untuk klik kartu bahasa */
  @keyframes ripple-anim {
    to { transform: scale(2.5); opacity: 0; }
  }

  /* Shake effect untuk search box kosong */
  @keyframes shake-anim {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-6px); }
    40%     { transform: translateX(6px); }
    60%     { transform: translateX(-4px); }
    80%     { transform: translateX(4px); }
  }

  .search-box.shake {
    animation: shake-anim 0.45s ease;
    border-color: #ef4444 !important;
  }
`;
document.head.appendChild(extraStyles);

/* ============================================================
   10. FUNGSI: PLACEHOLDER ANIMASI TYPING
       Kotak pencarian menampilkan contoh teks pencarian
       yang "diketik" otomatis saat input tidak aktif,
       berganti topik setiap beberapa detik.
   ============================================================ */

const placeholderTopics = [
  "Cari artikel...",
  "Sejarah Indonesia...",
  "Albert Einstein...",
  "Revolusi Industri...",
  "Sistem tata surya...",
  "Bahasa Jawa Kuno...",
];

let phIndex = 0;
let phChar = 0;
let phTimer = null;
let phDeleting = false;

function typePlaceholder() {
  /* Jangan jalankan kalau input sedang aktif / ada isinya */
  if (document.activeElement === searchInput || searchInput.value) {
    phTimer = setTimeout(typePlaceholder, 500);
    return;
  }

  const topic = placeholderTopics[phIndex];

  if (!phDeleting) {
    /* Mengetik maju */
    phChar++;
    searchInput.placeholder = topic.slice(0, phChar);
    if (phChar >= topic.length) {
      phDeleting = true;
      phTimer = setTimeout(typePlaceholder, 1800); /* jeda sebelum hapus */
      return;
    }
  } else {
    /* Menghapus mundur */
    phChar--;
    searchInput.placeholder = topic.slice(0, phChar);
    if (phChar === 0) {
      phDeleting = false;
      phIndex = (phIndex + 1) % placeholderTopics.length;
    }
  }

  phTimer = setTimeout(typePlaceholder, phDeleting ? 45 : 80);
}

/* Mulai animasi placeholder setelah 1 detik */
setTimeout(typePlaceholder, 1000);

/* Pause animasi saat input fokus, lanjut saat blur */
searchInput.addEventListener("focus", () => {
  clearTimeout(phTimer);
  searchInput.placeholder = "";
});
searchInput.addEventListener("blur", () => {
  if (!searchInput.value) setTimeout(typePlaceholder, 600);
});
