/* ============================================================
   app.js — kerangka aplikasi satu halaman (SPA).
   Alur linier sesuai panduan: Laman Muka > Panduan > Menu >
   Modul (berlangkah) > Evaluasi. Tidak ada perpindahan berkas
   HTML; seluruh perpindahan tampilan diatur di sini.
   ============================================================ */
(function (RPN) {
  'use strict';

  var modul = [];
  var layarAktif = 'muka';
  var modulAktif = null;      // { def, mesin, langkah }
  var dom = {};

  var IKON = {
    kiri:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H6M11 18l-6-6 6-6"/></svg>',
    kanan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
    menu:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    suara: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19.5 5.5a9 9 0 0 1 0 13"/></svg>',
    bisu:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="m17 9 4 6M21 9l-4 6"/></svg>',
    main:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>',
    ulang: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>'
  };

  function el(tag, kelas, isi) {
    var n = document.createElement(tag);
    if (kelas) n.className = kelas;
    if (isi != null) n.innerHTML = isi;
    return n;
  }

  /* ---------------- Pendaftaran modul ---------------- */
  function daftarkan(def) { modul.push(def); }

  /* ---------------- Bilah atas ---------------- */
  function gambarBilahAtas() {
    var b = dom.bilahAtas;
    b.innerHTML = '';

    var merek = el('div', 'merek');
    merek.appendChild(el('div', 'lambang', 'RP'));
    var t = el('div', 'kolom');
    t.appendChild(el('div', 'nama', 'Rumah Permainan Nusantara'));
    t.appendChild(el('div', 'sub', 'Belajar IPA & Matematika lewat permainan tradisional'));
    merek.appendChild(t);
    b.appendChild(merek);

    var kanan = el('div', 'baris g3');
    kanan.appendChild(dom.progres = el('div', 'progres'));

    var suara = el('button', 'tbl tbl-bulat');
    suara.type = 'button';
    suara.title = 'Hidup/matikan suara';
    suara.setAttribute('aria-label', 'Hidup atau matikan suara');
    function segarkanSuara() { suara.innerHTML = RPN.audio.nyala ? IKON.suara : IKON.bisu; }
    segarkanSuara();
    suara.addEventListener('click', function () {
      RPN.audio.nyala = !RPN.audio.nyala;
      segarkanSuara();
      if (RPN.audio.nyala) RPN.audio.efek.klik();
    });
    kanan.appendChild(suara);

    var kMenu = el('button', 'tbl tbl-bulat', IKON.menu);
    kMenu.type = 'button';
    kMenu.title = 'Kembali ke menu';
    kMenu.setAttribute('aria-label', 'Kembali ke menu utama');
    kMenu.addEventListener('click', function () { RPN.audio.efek.klik(); buka('menu'); });
    kanan.appendChild(kMenu);

    b.appendChild(kanan);
    segarkanProgres();
  }

  function segarkanProgres() {
    if (!dom.progres) return;
    dom.progres.innerHTML = '';
    var r = RPN.simpanan.ringkas(modul);
    modul.forEach(function (m) {
      var k = RPN.simpanan.data.kuis[m.id];
      var kelas = 'titik';
      if (k && k.total && k.benar / k.total >= 0.6) kelas += ' selesai';
      else if (modulAktif && modulAktif.def.id === m.id) kelas += ' aktif';
      var d = el('span', kelas);
      d.title = m.judul;
      dom.progres.appendChild(d);
    });
    dom.progres.appendChild(el('span', 'label', r.tuntas + '/' + r.total + ' modul tuntas'));
  }

  /* ---------------- Perpindahan layar ---------------- */
  function buka(nama, arg) {
    if (modulAktif && nama !== 'modul') { lepasModul(); }
    layarAktif = nama;
    dom.isi.innerHTML = '';
    dom.isi.scrollTop = 0;
    ({ muka: layarMuka, panduan: layarPanduan, menu: layarMenu,
       modul: layarModul, evaluasi: layarEvaluasi })[nama](arg);
    segarkanProgres();
  }

  function kaki(kiri, kanan) {
    var f = el('div', 'bilah-bawah');
    f.appendChild(kiri || el('span'));
    f.appendChild(kanan || el('span'));
    return f;
  }

  function tombol(teks, kelas, aksi, ikonKiri, ikonKanan) {
    var b = el('button', 'tbl ' + (kelas || 'tbl-garis'),
      (ikonKiri || '') + '<span>' + teks + '</span>' + (ikonKanan || ''));
    b.type = 'button';
    b.addEventListener('click', function () { RPN.audio.efek.pindah(); aksi(); });
    return b;
  }

  /* ============================================================
     1. LAMAN MUKA
     ============================================================ */
  function layarMuka() {
    var s = el('div', 'layar tampil');
    var isi = el('div', 'isi-layar');
    isi.style.display = 'grid';
    isi.style.placeItems = 'center';

    var kotak = el('div', 'kolom g5 muncul');
    kotak.style.maxWidth = '780px';
    kotak.style.textAlign = 'center';
    kotak.style.alignItems = 'center';

    kotak.appendChild(el('div', '', '<div style="font-size:64px;line-height:1;letter-spacing:6px">🌀🪁🎯🐚</div>'));
    kotak.appendChild(el('span', 'lencana lencana-kuning', 'Media Pembelajaran Interaktif · Jenjang SMP'));
    kotak.appendChild(el('h1', 'judul-xl', 'Rumah Permainan Nusantara'));
    kotak.appendChild(el('p', 'teks lembut',
      'Empat permainan tradisional Indonesia dibuka rahasianya. Kamu bisa mengubah sendiri ' +
      'setiap pengaturan, melihat langsung apa yang terjadi, lalu menemukan hukum IPA dan ' +
      'pola Matematika yang selama ini bekerja diam-diam di balik permainan itu.'));

    var tujuan = el('div', 'kartu kartu-pad kolom g3');
    tujuan.style.textAlign = 'left';
    tujuan.style.width = '100%';
    tujuan.appendChild(el('div', 'judul-s', '🎯 Tujuan Pembelajaran'));
    var ul = el('ul', 'teks-s lembut');
    ul.style.margin = '0'; ul.style.paddingLeft = '20px'; ul.style.lineHeight = '1.85';
    [ 'Menjelaskan pengaruh gaya terhadap gerak benda melalui percobaan maya.',
      'Menganalisis perubahan bentuk energi pada peristiwa sehari-hari.',
      'Merancang percobaan sederhana dengan mengubah satu variabel (uji adil).',
      'Menemukan pola bilangan dan menggunakan sisa pembagian untuk memprediksi hasil.',
      'Menghargai permainan tradisional sebagai warisan budaya yang sarat ilmu.'
    ].forEach(function (x) { ul.appendChild(el('li', '', x)); });
    tujuan.appendChild(ul);
    kotak.appendChild(tujuan);

    isi.appendChild(kotak);
    s.appendChild(isi);

    s.appendChild(kaki(
      el('span', 'teks-xs samar', 'Festival Biru Putih 2026 · Direktorat SMP'),
      tombol('Mulai Belajar', 'tbl-utama', function () { buka('panduan'); }, IKON.main)
    ));
    dom.isi.appendChild(s);
  }

  /* ============================================================
     2. PANDUAN PENGGUNAAN
     ============================================================ */
  function layarPanduan() {
    var s = el('div', 'layar tampil');
    var isi = el('div', 'isi-layar kolom g5 muncul');

    var kep = el('div', 'kolom g2');
    kep.appendChild(el('span', 'lencana', 'Langkah 0 · Sebelum mulai'));
    kep.appendChild(el('h2', 'judul-l', 'Panduan Penggunaan'));
    kep.appendChild(el('p', 'teks lembut',
      'Baca sebentar, ya. Setelah ini kamu akan bisa memakai semua modul tanpa bantuan siapa pun.'));
    isi.appendChild(kep);

    var grid = el('div', '');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = '1fr 1fr';
    grid.style.gap = '14px';

    [ ['1', 'Pilih permainan di Menu',
       'Ada empat modul. Setiap modul berdiri sendiri, jadi kamu bebas memilih mau mulai dari mana.'],
      ['2', 'Ikuti empat langkah di tiap modul',
       'Amati → Ubah → Bandingkan → Kuis. Nomor langkah selalu terlihat di bagian bawah layar.'],
      ['3', 'Geser pengaturan, amati perubahannya',
       'Ubah <b>satu</b> pengaturan saja lalu perhatikan angka dan gambarnya. Itulah cara ilmuwan bekerja: uji adil.'],
      ['4', 'Jawab kuis di akhir modul',
       'Setiap jawaban diberi penjelasan, termasuk saat kamu salah. Boleh diulang sebanyak yang kamu mau.']
    ].forEach(function (x) {
      var k = el('div', 'kartu kartu-pad langkah');
      k.appendChild(el('div', 'nomor', x[0]));
      var c = el('div', 'kolom g1');
      c.appendChild(el('div', 'judul-s', x[1]));
      c.appendChild(el('p', 'teks-s lembut', x[2]));
      k.appendChild(c);
      grid.appendChild(k);
    });
    isi.appendChild(grid);

    var bantu = el('div', '');
    bantu.style.display = 'grid';
    bantu.style.gridTemplateColumns = '1fr 1fr 1fr';
    bantu.style.gap = '12px';
    [ ['catatan', '🎛️ Penggeser', 'Tarik bulatan biru ke kiri atau ke kanan untuk mengubah nilai. Angkanya langsung berubah.'],
      ['catatan catatan-kuning', '📊 Panel ukur', 'Kotak berisi angka di sekitar gambar adalah hasil pengukuran. Perhatikan saat kamu mengubah pengaturan.'],
      ['catatan catatan-ungu', '🔊 Tombol suara', 'Ada di kanan atas. Matikan bila kamu sedang belajar di kelas atau di tempat umum.']
    ].forEach(function (x) {
      bantu.appendChild(el('div', x[0] + ' teks-s', '<span class="tajuk">' + x[1] + '</span>' + x[2]));
    });
    isi.appendChild(bantu);

    if (!RPN.simpanan.tersimpanPermanen) {
      isi.appendChild(el('div', 'catatan catatan-kuning teks-s',
        '<span class="tajuk">Catatan</span>Peramban kamu membatasi penyimpanan, jadi kemajuan belajar ' +
        'hanya tersimpan selama halaman ini terbuka. Selesaikan modul tanpa menutup tab, ya.'));
    }

    s.appendChild(isi);
    s.appendChild(kaki(
      tombol('Kembali', 'tbl-sunyi', function () { buka('muka'); }, IKON.kiri),
      tombol('Lanjut ke Menu', 'tbl-utama', function () { buka('menu'); }, null, IKON.kanan)
    ));
    dom.isi.appendChild(s);
  }

  /* ============================================================
     3. MENU / DAFTAR ISI
     ============================================================ */
  function layarMenu() {
    var s = el('div', 'layar tampil');
    var isi = el('div', 'isi-layar kolom g5 muncul');

    var kep = el('div', 'baris antara g4 bungkus');
    var kiri = el('div', 'kolom g1');
    kiri.appendChild(el('h2', 'judul-l', 'Menu Permainan'));
    kiri.appendChild(el('p', 'teks-s lembut', 'Pilih satu permainan untuk mulai bereksperimen.'));
    kep.appendChild(kiri);
    var r = RPN.simpanan.ringkas(modul);
    kep.appendChild(el('span', 'lencana lencana-hijau', r.tuntas + ' dari ' + r.total + ' modul tuntas'));
    isi.appendChild(kep);

    var grid = el('div', '');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    grid.style.gap = '13px';

    modul.forEach(function (m) {
      var k = el('button', 'kartu-modul');
      k.type = 'button';
      var g = el('div', 'gambar', m.ikon);
      g.style.background = m.latar || 'var(--c-surface-2)';
      k.appendChild(g);
      k.appendChild(el('span', 'lencana lencana-' + (m.warna || 'biru'), m.mapel));
      k.appendChild(el('div', 'tajuk', m.judul));
      k.appendChild(el('div', 'ket', m.ringkas));
      var kk = el('div', 'kaki');
      var nilai = RPN.simpanan.data.kuis[m.id];
      kk.appendChild(el('span', 'teks-xs samar', m.fase));
      kk.appendChild(el('span', 'teks-xs ' + (nilai ? '' : 'samar'),
        nilai ? '✅ ' + nilai.benar + '/' + nilai.total : 'Belum dikerjakan'));
      k.appendChild(kk);
      k.addEventListener('click', function () { RPN.audio.efek.pindah(); buka('modul', m.id); });
      grid.appendChild(k);
    });
    isi.appendChild(grid);

    var evalKartu = el('div', 'kartu kartu-pad baris antara g4 bungkus');
    var ek = el('div', 'kolom g1');
    ek.appendChild(el('div', 'judul-s', '🏁 Evaluasi Akhir'));
    ek.appendChild(el('p', 'teks-s lembut',
      'Sepuluh soal campuran dari keempat permainan. Kerjakan setelah kamu mencoba semua modul.'));
    evalKartu.appendChild(ek);
    evalKartu.appendChild(tombol('Kerjakan Evaluasi', 'tbl-utama', function () { buka('evaluasi'); }, null, IKON.kanan));
    isi.appendChild(evalKartu);

    s.appendChild(isi);
    s.appendChild(kaki(
      tombol('Panduan', 'tbl-sunyi', function () { buka('panduan'); }, IKON.kiri),
      el('span', 'teks-xs samar', 'Ketuk salah satu kartu permainan untuk memulai')
    ));
    dom.isi.appendChild(s);
  }

  /* ============================================================
     4. LAYAR MODUL (berlangkah)
     ============================================================ */
  function lepasModul() {
    if (modulAktif && modulAktif.mesin && modulAktif.mesin.lepas) {
      try { modulAktif.mesin.lepas(); } catch (e) {}
    }
    RPN.audio.bersihkanSemua();
    modulAktif = null;
  }

  function layarModul(id) {
    var def = modul.filter(function (m) { return m.id === id; })[0];
    if (!def) return buka('menu');

    if (!modulAktif || modulAktif.def.id !== id) {
      lepasModul();
      modulAktif = { def: def, mesin: null, langkah: 0 };
    }
    RPN.simpanan.kunjungi(id);

    var namaLangkah = def.langkah.concat(['Kuis']);
    var s = el('div', 'layar tampil');

    /* ---- Area utama ---- */
    var isi = el('div', 'isi-layar');
    isi.style.padding = '16px 22px';
    isi.style.overflow = 'hidden';
    isi.style.display = 'flex';
    isi.style.flexDirection = 'column';
    isi.style.gap = '12px';

    /* Kepala modul */
    var kep = el('div', 'baris antara g4');
    var kiri = el('div', 'baris g3');
    kiri.appendChild(el('div', '', '<span style="font-size:26px">' + def.ikon + '</span>'));
    var kt = el('div', 'kolom');
    kt.appendChild(el('div', 'judul-m', def.judul));
    kt.appendChild(el('div', 'teks-xs samar', def.mapel + ' · ' + def.fase));
    kiri.appendChild(kt);
    kep.appendChild(kiri);

    /* Cip langkah: bisa diklik langsung, tanpa mengulang dari awal */
    var cip = el('div', 'baris g2');
    namaLangkah.forEach(function (n, i) {
      var c = el('button', 'tbl tbl-kecil ' + (i === modulAktif.langkah ? 'tbl-utama' : 'tbl-sunyi'),
        (i + 1) + '. ' + n);
      c.type = 'button';
      c.addEventListener('click', function () { RPN.audio.efek.klik(); keLangkah(i); });
      cip.appendChild(c);
    });
    kep.appendChild(cip);
    isi.appendChild(kep);

    /* Badan: kiri simulasi, kanan panel */
    var badan = el('div', 'isi-penuh');
    badan.style.display = 'grid';
    badan.style.gridTemplateColumns = '1fr 372px';
    badan.style.gap = '14px';
    badan.style.minHeight = '0';

    var kolKiri = el('div', 'kolom g3');
    kolKiri.style.minHeight = '0';
    var simWadah = el('div', 'panggung-sim isi-penuh');
    simWadah.style.minHeight = '0';
    var ukurWadah = el('div', 'ukur-grid');
    ukurWadah.style.gridTemplateColumns = 'repeat(4, 1fr)';
    ukurWadah.style.flex = 'none';
    kolKiri.appendChild(simWadah);
    kolKiri.appendChild(ukurWadah);

    var panelWadah = el('div', 'kartu kartu-pad kolom g4');
    panelWadah.style.overflowY = 'auto';
    panelWadah.style.minHeight = '0';

    badan.appendChild(kolKiri);
    badan.appendChild(panelWadah);
    isi.appendChild(badan);
    s.appendChild(isi);

    /* ---- Kaki: navigasi langkah ---- */
    var bSebelum = el('button', 'tbl tbl-sunyi', IKON.kiri + '<span>Sebelumnya</span>');
    bSebelum.type = 'button';
    var infoLangkah = el('span', 'teks-s lembut');
    var bBerikut = el('button', 'tbl tbl-utama', '<span>Berikutnya</span>' + IKON.kanan);
    bBerikut.type = 'button';

    bSebelum.addEventListener('click', function () {
      RPN.audio.efek.pindah();
      if (modulAktif.langkah === 0) buka('menu');
      else keLangkah(modulAktif.langkah - 1);
    });
    bBerikut.addEventListener('click', function () {
      RPN.audio.efek.pindah();
      if (modulAktif.langkah === namaLangkah.length - 1) {
        var i = modul.indexOf(def);
        if (i < modul.length - 1) buka('modul', modul[i + 1].id);
        else buka('evaluasi');
      } else {
        keLangkah(modulAktif.langkah + 1);
      }
    });

    var kiriKaki = el('div', 'baris g3'); kiriKaki.appendChild(bSebelum);
    var kananKaki = el('div', 'baris g3');
    kananKaki.appendChild(infoLangkah);
    kananKaki.appendChild(bBerikut);
    s.appendChild(kaki(kiriKaki, kananKaki));
    dom.isi.appendChild(s);

    /* ---- Jalankan simulasi ---- */
    if (!modulAktif.mesin) {
      modulAktif.mesin = def.buat({ sim: simWadah, ukur: ukurWadah });
      if (modulAktif.mesin._mulai) modulAktif.mesin._mulai();
    } else {
      modulAktif.mesin.pindahWadah({ sim: simWadah, ukur: ukurWadah });
    }

    function keLangkah(i) {
      i = Math.max(0, Math.min(namaLangkah.length - 1, i));
      modulAktif.langkah = i;

      var anak = cip.children;
      for (var j = 0; j < anak.length; j++) {
        anak[j].className = 'tbl tbl-kecil ' + (j === i ? 'tbl-utama' : 'tbl-sunyi');
      }
      infoLangkah.textContent = 'Langkah ' + (i + 1) + ' dari ' + namaLangkah.length;
      bSebelum.querySelector('span').textContent = i === 0 ? 'Kembali ke Menu' : 'Sebelumnya';

      panelWadah.innerHTML = '';
      panelWadah.scrollTop = 0;

      if (i === namaLangkah.length - 1) {
        /* Langkah terakhir: kuis memakai seluruh lebar */
        badan.style.gridTemplateColumns = '1fr';
        kolKiri.style.display = 'none';
        panelWadah.style.maxWidth = '760px';
        panelWadah.style.margin = '0 auto';
        panelWadah.style.width = '100%';
        RPN.kuis.buat(panelWadah, def.kuis, {
          saatSelesai: function (b, t) {
            RPN.simpanan.catatKuis(def.id, b, t);
            segarkanProgres();
          }
        });
        bBerikut.querySelector('span').textContent = 'Modul berikutnya';
      } else {
        badan.style.gridTemplateColumns = '1fr 372px';
        kolKiri.style.display = 'flex';
        panelWadah.style.maxWidth = '';
        panelWadah.style.margin = '';
        modulAktif.mesin.gambarPanel(i, panelWadah);
        bBerikut.querySelector('span').textContent = 'Berikutnya';
      }
      modulAktif.mesin.keLangkah(i);
      requestAnimationFrame(function () { modulAktif.mesin.ukurUlang(); });
    }

    keLangkah(modulAktif.langkah);
  }

  /* ============================================================
     5. EVALUASI AKHIR
     ============================================================ */
  function layarEvaluasi() {
    var s = el('div', 'layar tampil');
    var isi = el('div', 'isi-layar kolom g4 muncul');

    var kep = el('div', 'kolom g1');
    kep.appendChild(el('span', 'lencana lencana-ungu', 'Asesmen Sumatif'));
    kep.appendChild(el('h2', 'judul-l', 'Evaluasi Akhir'));
    kep.appendChild(el('p', 'teks-s lembut',
      'Sepuluh soal campuran dari keempat permainan, dari yang mudah sampai yang menantang.'));
    isi.appendChild(kep);

    var wadah = el('div', 'kartu kartu-pad');
    wadah.style.maxWidth = '780px';
    wadah.style.width = '100%';
    wadah.style.margin = '0 auto';
    isi.appendChild(wadah);

    RPN.kuis.buat(wadah, RPN.soalEvaluasi, {
      saatSelesai: function (b, t) { RPN.simpanan.catatEvaluasi(b, t); segarkanProgres(); }
    });

    s.appendChild(isi);
    s.appendChild(kaki(
      tombol('Kembali ke Menu', 'tbl-sunyi', function () { buka('menu'); }, IKON.kiri),
      el('span', 'teks-xs samar', 'Semua jawaban disertai penjelasan')
    ));
    dom.isi.appendChild(s);
  }

  /* ============================================================
     Penyalaan
     ============================================================ */
  function mulai() {
    dom.bilahAtas = document.getElementById('bilah-atas');
    dom.isi = document.getElementById('isi-panggung');
    RPN.panggung.pasang();
    gambarBilahAtas();
    buka('muka');

    /* Bunyi baru boleh dihidupkan setelah pengguna berinteraksi
       (aturan peramban modern). */
    var sekali = function () {
      RPN.audio.hidupkan();
      window.removeEventListener('pointerdown', sekali);
      window.removeEventListener('keydown', sekali);
    };
    window.addEventListener('pointerdown', sekali);
    window.addEventListener('keydown', sekali);

    RPN.bus.dengar('kemajuan:ubah', segarkanProgres);
  }

  RPN.app = { daftarkan: daftarkan, buka: buka, mulai: mulai, IKON: IKON, el: el, tombol: tombol };
})(window.RPN = window.RPN || {});
