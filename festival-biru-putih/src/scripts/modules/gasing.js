/* ============================================================
   MODUL 1 — GASING
   Fokus SMP (Fase D): gerak berputar, gaya gesek, perubahan
   bentuk energi, dan rancangan percobaan uji adil.
   Materi SMA (momentum sudut vektor, torsi silang, rumus
   presesi, momen inersia I = k m r^2) sengaja tidak ditampilkan.
   Model fisikanya tetap dipakai di balik layar agar perilaku
   simulasi benar secara keilmuan.
   ============================================================ */
(function (RPN) {
  'use strict';
  var U = RPN.ui, el = U.el;

  var BENTUK = {
    kerucut: { k: 0.30, nama: 'Kerucut', ket: 'Gasing kayu Melayu', warna: ['#c98a3c', '#f3c17a', '#8a5a2b'] },
    cakram:  { k: 0.50, nama: 'Cakram',  ket: 'Pipih dan rata',      warna: ['#3f7fc4', '#8fc2ef', '#245a94'] },
    tepi:    { k: 0.80, nama: 'Berat di tepi', ket: 'Bandul di pinggir', warna: ['#7b4fa8', '#c3a2e4', '#55307a'] }
  };

  RPN.app.daftarkan({
    id: 'gasing',
    judul: 'Gasing',
    ikon: '🌀',
    warna: 'ungu',
    latar: 'linear-gradient(140deg,#f0e9f8,#e6eff9)',
    mapel: 'IPA · Gerak & Energi',
    fase: 'Fase D · Kelas VII–VIII',
    ringkas: 'Kenapa gasing tidak roboh saat berputar kencang, lalu tumbang ketika melambat?',
    langkah: ['Amati', 'Ubah', 'Bandingkan'],

    buat: function (dom) {
      /* ---------------- keadaan ---------------- */
      var bentuk = 'kerucut', massa = 0.25, jari = 0.08;
      var tarikan = 1800;            // putaran per menit saat diluncurkan
      var gesekan = 0.02;            // kekasaran lantai
      var berputar = false, jeda = false, lajuWaktu = 1;
      var omega = 0, miring = 0.12, sudutPresesi = 0, sudutPutar = 0;
      var waktuPutar = 0, omegaAwal = 1, goyangWaktu = 0;
      var jejak = [];
      var rafId = null, waktuLalu = 0;
      var kanvas, ctx, ukurRpm, ukurWaktu, ukurTenaga, ukurMiring;
      var tabel = null, langkahKini = 0;
      var G = 9.81;

      /* ---------------- susun DOM ---------------- */
      function pasangDom(d) {
        d.sim.innerHTML = '';
        kanvas = document.createElement('canvas');
        kanvas.setAttribute('aria-label', 'Simulasi gasing berputar');
        d.sim.appendChild(kanvas);

        d.ukur.innerHTML = '';
        ukurRpm    = U.ukur({ nama: 'Kecepatan Putar', satuan: 'putaran/menit', maks: 3000 });
        ukurWaktu  = U.ukur({ nama: 'Lama Berputar', satuan: 'detik', warna: 'hijau', maks: 60 });
        ukurTenaga = U.ukur({ nama: 'Sisa Tenaga Putar', satuan: '%', warna: 'kuning', maks: 100 });
        ukurMiring = U.ukur({ nama: 'Kemiringan', satuan: 'derajat', warna: 'merah', maks: 80 });
        [ukurRpm, ukurWaktu, ukurTenaga, ukurMiring].forEach(function (u) { d.ukur.appendChild(u); });
      }
      pasangDom(dom);

      /* ---------------- fisika ---------------- */
      function inersia() { return BENTUK[bentuk].k * massa * jari * jari; }

      function luncurkan() {
        omega = tarikan * 2 * Math.PI / 60;
        omegaAwal = omega;
        miring = 0.10;
        sudutPresesi = 0; goyangWaktu = 0; waktuPutar = 0;
        jejak = [];
        berputar = true; jeda = false;
        RPN.audio.mulaiMenerus('gasing');
        RPN.simpanan.catatPercobaan('gasing');
      }

      function hentikan() {
        berputar = false; omega = 0;
        RPN.audio.hentikanMenerus('gasing');
      }

      function ulang() {
        hentikan();
        miring = 0.10; sudutPresesi = 0; waktuPutar = 0; jejak = [];
      }

      function majuFisika(dt) {
        if (!berputar || jeda) return;
        dt *= lajuWaktu;
        var I = inersia();

        /* Gesekan ujung gasing dengan lantai + hambatan udara
           menguras tenaga putar. Kedua tetapan di bawah ditera
           agar lama putar simulasi masuk akal (puluhan detik),
           sebagaimana gasing kayu sungguhan. */
        var torsiGesek = gesekan * massa * G * 0.040
                       + 2.8e-6 * Math.pow(omega, 1.5) * Math.pow(jari / 0.08, 2);
        omega = Math.max(0, omega - (torsiGesek / I) * dt);
        sudutPutar += omega * dt;
        waktuPutar += dt;

        var rPusat = jari * 1.2;
        var lajuPresesi = omega > 0.5 ? (massa * G * rPusat) / (I * omega) : 14;
        sudutPresesi += lajuPresesi * dt;

        /* Makin lambat berputar, makin besar goyangannya. */
        var omegaKritis = Math.sqrt(4 * massa * G * rPusat / I) * 0.45;
        if (omega < omegaKritis) {
          goyangWaktu += dt;
          var kuat = Math.min(1, Math.pow((omegaKritis - omega) / omegaKritis, 2) + 0.05);
          miring += (0.55 * kuat) * dt;
        }

        if (miring >= Math.PI / 2.3 || omega <= 2) {
          berputar = false; omega = 0;
          RPN.audio.hentikanMenerus('gasing');
          RPN.audio.efek.tumbuk(0.5);
          catatHasil();
        }

        var rpm = omega * 60 / (2 * Math.PI);
        RPN.audio.aturMenerus('gasing', 55 + rpm / 3000 * 300,
          Math.min(0.05, rpm / 3000 * 0.05), 200 + rpm / 3000 * 1100);
      }

      function catatHasil() {
        if (!tabel || langkahKini !== 2) return;
        tabel.tambah([
          BENTUK[bentuk].nama,
          (massa * 1000).toFixed(0) + ' g',
          (jari * 100).toFixed(0) + ' cm',
          '<b>' + waktuPutar.toFixed(1) + ' s</b>'
        ]);
      }

      /* ---------------- gambar ---------------- */
      function gambar() {
        ctx = RPN.panggung.siapkanKanvas(kanvas);
        var w = kanvas.clientWidth, h = kanvas.clientHeight;
        if (!w || !h) return;
        ctx.clearRect(0, 0, w, h);

        /* Latar: ruangan terang dengan lantai kayu */
        var langit = ctx.createLinearGradient(0, 0, 0, h);
        langit.addColorStop(0, '#fdfaf4');
        langit.addColorStop(1, '#f0e6d6');
        ctx.fillStyle = langit;
        ctx.fillRect(0, 0, w, h);

        var cx = w * 0.5, cy = h * 0.70;

        /* Lantai */
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, cy, w * 0.44, w * 0.14, 0, 0, Math.PI * 2);
        var lantai = ctx.createRadialGradient(cx, cy, 10, cx, cy, w * 0.44);
        lantai.addColorStop(0, '#e8d6bb');
        lantai.addColorStop(1, '#d9c3a2');
        ctx.fillStyle = lantai;
        ctx.fill();
        ctx.strokeStyle = '#c3a97f';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        /* Lingkaran bantu jarak */
        ctx.strokeStyle = 'rgba(140,115,80,.22)';
        ctx.lineWidth = 1;
        for (var r = 38; r < w * 0.28; r += 38) {
          ctx.beginPath();
          ctx.ellipse(cx, cy, r, r * 0.30, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();

        /* Posisi ujung gasing (mengitari pusat = presesi) */
        var skala = 880;                       /* piksel per meter jari-jari */
        var panjangMiring = jari * skala * Math.sin(miring) * 1.5;
        var ux = cx + panjangMiring * Math.cos(sudutPresesi);
        var uy = cy + panjangMiring * Math.sin(sudutPresesi) * 0.30;

        if (berputar && !jeda) {
          jejak.push({ x: ux, y: uy });
          if (jejak.length > 90) jejak.shift();
        }

        /* Jejak orbit ujung gasing */
        if (jejak.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(107,63,150,.55)';
          ctx.lineWidth = 2.4;
          ctx.lineCap = 'round';
          for (var i = 0; i < jejak.length; i++) {
            ctx.globalAlpha = i / jejak.length;
            if (i === 0) ctx.moveTo(jejak[i].x, jejak[i].y);
            else ctx.lineTo(jejak[i].x, jejak[i].y);
          }
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        /* Bayangan */
        ctx.fillStyle = 'rgba(90,70,45,.22)';
        ctx.beginPath();
        ctx.ellipse(ux + 9, uy + 6, jari * skala * 0.9, jari * skala * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        /* Sumbu gasing: dari ujung (ux,uy) menuju puncak */
        var tinggi = 175;
        var ax = ux + tinggi * Math.sin(miring) * Math.cos(sudutPresesi);
        var ay = uy - tinggi * Math.cos(miring) + tinggi * Math.sin(miring) * Math.sin(sudutPresesi) * 0.30;

        var B = BENTUK[bentuk];
        var R = Math.max(18, jari * skala);        /* jari-jari badan di layar */

        /* Semua bagian gasing digambar dalam satu sistem koordinat
           yang sudah dimiringkan, supaya paku, badan, dan pegangan
           menyatu sebagai satu benda. Sumbu lokal -y = ke arah puncak. */
        ctx.save();
        ctx.translate(ux, uy);
        ctx.rotate(Math.atan2(ay - uy, ax - ux) + Math.PI / 2);

        var yPangkal = -R * 0.42;                  /* tempat paku bertemu badan */
        var yPuncak  = yPangkal - R * 0.95;        /* sisi atas badan */

        /* 1. Paku besi di ujung bawah */
        var gPaku = ctx.createLinearGradient(-3, 0, 3, 0);
        gPaku.addColorStop(0, '#6b7382');
        gPaku.addColorStop(0.5, '#c8cfd9');
        gPaku.addColorStop(1, '#6b7382');
        ctx.fillStyle = gPaku;
        ctx.beginPath();
        ctx.moveTo(0, 2);
        ctx.lineTo(3.2, yPangkal);
        ctx.lineTo(-3.2, yPangkal);
        ctx.closePath();
        ctx.fill();

        /* 2. Badan gasing */
        var gBadan = ctx.createLinearGradient(-R, 0, R, 0);
        gBadan.addColorStop(0, B.warna[2]);
        gBadan.addColorStop(0.42, B.warna[1]);
        gBadan.addColorStop(1, B.warna[0]);
        ctx.fillStyle = gBadan;
        ctx.strokeStyle = 'rgba(60,35,10,.45)';
        ctx.lineWidth = 1.6;

        if (bentuk === 'kerucut') {
          /* Kerucut khas gasing kayu: meruncing ke bawah, melebar ke atas */
          ctx.beginPath();
          ctx.moveTo(0, yPangkal + R * 0.1);
          ctx.quadraticCurveTo(R * 0.62, yPangkal - R * 0.18, R, yPuncak);
          ctx.lineTo(-R, yPuncak);
          ctx.quadraticCurveTo(-R * 0.62, yPangkal - R * 0.18, 0, yPangkal + R * 0.1);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
        } else if (bentuk === 'cakram') {
          /* Cakram pipih */
          var tebal = R * 0.34;
          ctx.beginPath();
          ctx.moveTo(-R * 1.12, yPuncak + tebal);
          ctx.lineTo(-R * 1.12, yPuncak);
          ctx.lineTo(R * 1.12, yPuncak);
          ctx.lineTo(R * 1.12, yPuncak + tebal);
          ctx.quadraticCurveTo(0, yPuncak + tebal * 2.1, -R * 1.12, yPuncak + tebal);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
          R = R * 1.12;
        } else {
          /* Berat di tepi: cakram dengan bandul logam di pinggir */
          var tb = R * 0.3;
          ctx.beginPath();
          ctx.moveTo(-R * 1.25, yPuncak + tb);
          ctx.lineTo(-R * 1.25, yPuncak);
          ctx.lineTo(R * 1.25, yPuncak);
          ctx.lineTo(R * 1.25, yPuncak + tb);
          ctx.quadraticCurveTo(0, yPuncak + tb * 1.9, -R * 1.25, yPuncak + tb);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
          R = R * 1.25;
        }

        /* 3. Tutup atas berbentuk elips + corak yang ikut berputar */
        var gTutup = ctx.createLinearGradient(-R, 0, R, 0);
        gTutup.addColorStop(0, B.warna[1]);
        gTutup.addColorStop(0.5, B.warna[0]);
        gTutup.addColorStop(1, B.warna[2]);
        ctx.fillStyle = gTutup;
        ctx.beginPath();
        ctx.ellipse(0, yPuncak, R, R * 0.3, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        if (bentuk === 'tepi') {
          ctx.fillStyle = '#3d2359';
          for (var a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            var pa = a + sudutPutar;
            ctx.beginPath();
            ctx.arc(Math.cos(pa) * R * 0.9, yPuncak + Math.sin(pa) * R * 0.27, 4.6, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          ctx.fillStyle = 'rgba(255,255,255,.95)';
          for (var a2 = 0; a2 < Math.PI * 2; a2 += Math.PI / 3) {
            var pa2 = a2 + sudutPutar;
            ctx.beginPath();
            ctx.arc(Math.cos(pa2) * R * 0.62, yPuncak + Math.sin(pa2) * R * 0.19, 3.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        /* 4. Pegangan kayu di puncak */
        ctx.fillStyle = '#7a8494';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(-4.5, yPuncak - 26, 9, 26, 4);
        else ctx.rect(-4.5, yPuncak - 26, 9, 26);
        ctx.fill();

        ctx.restore();

        /* Label keadaan */
        var pesan = !berputar && waktuPutar > 0 ? 'Gasing tumbang setelah ' + waktuPutar.toFixed(1) + ' detik'
                  : !berputar ? 'Tekan "Putar Gasing" untuk mulai'
                  : jeda ? 'Dijeda — amati posisinya' : '';
        if (pesan) {
          ctx.font = '700 15px ' + getComputedStyle(document.body).fontFamily;
          ctx.textAlign = 'center';
          var lebarTeks = ctx.measureText(pesan).width;
          ctx.fillStyle = 'rgba(255,255,255,.92)';
          if (ctx.roundRect) {
            ctx.beginPath(); ctx.roundRect(cx - lebarTeks / 2 - 14, 16, lebarTeks + 28, 32, 16); ctx.fill();
          }
          ctx.fillStyle = '#16233a';
          ctx.fillText(pesan, cx, 37);
          ctx.textAlign = 'left';
        }
      }

      /* ---------------- gelung animasi ---------------- */
      function gelung(t) {
        var dt = Math.min(0.033, (t - waktuLalu) / 1000) || 0;
        waktuLalu = t;
        majuFisika(dt);
        gambar();
        segarkanUkur();
        rafId = requestAnimationFrame(gelung);
      }

      function segarkanUkur() {
        var rpm = omega * 60 / (2 * Math.PI);
        ukurRpm.set(rpm, Math.round(rpm).toLocaleString('id-ID'));
        ukurWaktu.set(waktuPutar, waktuPutar.toFixed(1));
        var sisa = omegaAwal > 0 ? Math.pow(omega / omegaAwal, 2) * 100 : 0;
        ukurTenaga.set(sisa, Math.round(sisa));
        var drj = miring * 180 / Math.PI;
        ukurMiring.set(drj, Math.round(drj));
      }

      /* Gasing sungguhan bisa berputar sangat lama. Tombol ini
         mempercepat jalannya percobaan tanpa mengubah angka
         "Lama Berputar" — yang ditampilkan tetap detik sebenarnya. */
      function tombolLajuWaktu() {
        var w = el('div', 'kolom g2');
        w.appendChild(el('div', 'teks-xs samar', 'Kecepatan percobaan (angka detik tetap sebenarnya)'));
        w.appendChild(U.pilihan({
          kolom: 3, terpilih: 'x' + lajuWaktu,
          daftar: [
            { id: 'x1', tajuk: '1\u00D7', ket: 'Waktu nyata' },
            { id: 'x4', tajuk: '4\u00D7', ket: 'Dipercepat' },
            { id: 'x12', tajuk: '12\u00D7', ket: 'Sangat cepat' }
          ],
          saatPilih: function (id) { lajuWaktu = parseInt(id.slice(1), 10); }
        }));
        return w;
      }

      /* ---------------- panel tiap langkah ---------------- */
      function panelAmati(p) {
        p.appendChild(U.tajukPanel('Langkah 1 · Amati', 'Mulai di sini', 'ungu'));
        p.appendChild(el('p', 'teks-s lembut',
          'Luncurkan gasing, lalu perhatikan baik-baik sampai ia tumbang. ' +
          'Jangan ubah pengaturan apa pun dulu.'));

        p.appendChild(U.aksi([
          { teks: 'Putar Gasing', kelas: 'tbl-utama', ikon: RPN.app.IKON.main, aksi: function () { luncurkan(); } },
          { teks: 'Jeda', aksi: function () { jeda = !jeda; RPN.audio.efek.klik(); } },
          { teks: 'Ulang', ikon: RPN.app.IKON.ulang, aksi: function () { ulang(); RPN.audio.efek.klik(); } }
        ]));
        p.appendChild(tombolLajuWaktu());

        p.appendChild(U.catatan('ungu', '👀 Yang perlu kamu amati',
          '<b>1.</b> Saat putarannya masih kencang, gasing berdiri hampir tegak.<br>' +
          '<b>2.</b> Angka <i>Kecepatan Putar</i> terus turun sendiri walaupun tidak kamu sentuh.<br>' +
          '<b>3.</b> Menjelang berhenti, gasing mulai bergoyang lebar lalu tumbang.'));

        p.appendChild(U.catatan('kuning', '🤔 Pertanyaan pemantik',
          'Tidak ada yang mendorong gasing. Lalu <b>ke mana perginya tenaga putar</b> sampai ' +
          'gasing bisa melambat dan berhenti sendiri?'));

        p.appendChild(U.catatan('', '💡 Jawabannya',
          'Ujung gasing bergesekan dengan lantai, dan badannya menabrak udara. ' +
          'Gesekan itu mengubah <b>energi gerak</b> menjadi <b>energi panas</b> dan <b>bunyi</b> sedikit demi sedikit. ' +
          'Energinya tidak hilang, hanya berubah bentuk.'));
      }

      function panelUbah(p) {
        p.appendChild(U.tajukPanel('Langkah 2 · Ubah', 'Uji adil', 'kuning'));
        p.appendChild(el('p', 'teks-s lembut',
          'Ubah <b>satu</b> pengaturan saja, lalu putar lagi. Bandingkan dengan hasil sebelumnya.'));

        var pilBentuk = U.pilihan({
          kolom: 3, terpilih: bentuk,
          daftar: Object.keys(BENTUK).map(function (k) {
            return { id: k, ikon: k === 'kerucut' ? '🔻' : k === 'cakram' ? '💿' : '🛞',
                     tajuk: BENTUK[k].nama, ket: BENTUK[k].ket };
          }),
          saatPilih: function (id) { bentuk = id; }
        });
        p.appendChild(el('div', 'teks-s', '<b>Bentuk gasing</b>'));
        p.appendChild(pilBentuk);

        p.appendChild(U.penggeser({
          nama: 'Kekuatan tarikan tali', min: 300, max: 3000, step: 100, nilai: tarikan,
          format: function (v) { return v.toLocaleString('id-ID') + ' putaran/menit'; },
          skala: ['Pelan', 'Sedang', 'Kencang'],
          saatUbah: function (v) { tarikan = v; }
        }));

        p.appendChild(U.penggeser({
          nama: 'Massa gasing', min: 0.05, max: 0.6, step: 0.05, nilai: massa,
          format: function (v) { return (v * 1000).toFixed(0) + ' gram'; },
          skala: ['50 g', '300 g', '600 g'],
          saatUbah: function (v) { massa = v; }
        }));

        p.appendChild(U.penggeser({
          nama: 'Lebar gasing (jari-jari)', min: 0.04, max: 0.12, step: 0.01, nilai: jari,
          format: function (v) { return (v * 100).toFixed(0) + ' cm'; },
          skala: ['Kecil', 'Sedang', 'Lebar'],
          saatUbah: function (v) { jari = v; }
        }));

        p.appendChild(U.penggeser({
          nama: 'Kekasaran lantai', min: 0.005, max: 0.08, step: 0.005, nilai: gesekan,
          format: function (v) { return v <= 0.015 ? 'Licin (ubin)' : v >= 0.05 ? 'Kasar (tanah)' : 'Sedang (kayu)'; },
          skala: ['Licin', 'Sedang', 'Kasar'],
          saatUbah: function (v) { gesekan = v; }
        }));

        p.appendChild(U.aksi([
          { teks: 'Putar Gasing', kelas: 'tbl-utama', ikon: RPN.app.IKON.main, aksi: function () { luncurkan(); } },
          { teks: 'Ulang', ikon: RPN.app.IKON.ulang, aksi: function () { ulang(); RPN.audio.efek.klik(); } }
        ]));

        p.appendChild(U.catatan('kuning', '⚠️ Aturan uji adil',
          'Kalau kamu mengubah dua hal sekaligus lalu hasilnya berubah, kamu tidak akan tahu ' +
          'hal mana yang menyebabkannya. Ubah satu, tahan sisanya.'));
      }

      function panelBandingkan(p) {
        p.appendChild(U.tajukPanel('Langkah 3 · Bandingkan', 'Tantangan', 'hijau'));
        p.appendChild(el('p', 'teks-s lembut',
          'Cari susunan gasing yang <b>paling lama berputar</b>. Setiap kali gasing tumbang, ' +
          'hasilnya otomatis tercatat di tabel.'));

        tabel = U.tabelCatat(['Bentuk', 'Massa', 'Lebar', 'Lama']);
        p.appendChild(tabel);

        p.appendChild(U.aksi([
          { teks: 'Putar Gasing', kelas: 'tbl-utama', ikon: RPN.app.IKON.main, aksi: function () { luncurkan(); } },
          { teks: 'Kosongkan tabel', aksi: function () { tabel.kosong(); RPN.audio.efek.klik(); } }
        ]));
        p.appendChild(tombolLajuWaktu());

        p.appendChild(U.catatan('hijau', '🎯 Misi',
          '<b>a.</b> Coba ketiga bentuk dengan massa dan lebar yang sama persis.<br>' +
          '<b>b.</b> Lalu coba massa paling ringan vs paling berat.<br>' +
          '<b>c.</b> Terakhir, bandingkan lantai licin dengan lantai kasar.'));

        p.appendChild(U.catatan('', '🔍 Temuan yang diharapkan',
          'Gasing yang <b>berat</b>, <b>lebar</b>, dan <b>massanya menumpuk di tepi</b> berputar paling lama. ' +
          'Sebarnya massa ke pinggir membuat gasing lebih sulit diubah gerak putarnya. ' +
          'Itu sebabnya gasing aduan tradisional sering diberi cincin logam di tepinya.'));

        p.appendChild(U.catatan('ungu', '🏛️ Kaitan budaya',
          'Gasing dikenal di banyak daerah: <b>Gasing</b> di Melayu Riau, <b>Panggal</b> di Sunda, ' +
          '<b>Pathon</b> di Jawa, dan <b>Maggasing</b> di Bugis. Pembuatnya memilih kayu keras seperti asam ' +
          'atau jambu supaya berat dan tahan benturan — tanpa pernah membaca buku fisika.'));
      }

      /* ---------------- antarmuka modul ---------------- */
      return {
        gambarPanel: function (i, p) {
          langkahKini = i;
          if (i === 0) panelAmati(p);
          else if (i === 1) panelUbah(p);
          else panelBandingkan(p);
        },
        keLangkah: function (i) { langkahKini = i; if (i !== 2) tabel = null; },
        ukurUlang: function () { if (kanvas) RPN.panggung.siapkanKanvas(kanvas); },
        pindahWadah: function (d) { pasangDom(d); },
        lepas: function () {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = null;
          RPN.audio.hentikanMenerus('gasing');
        },
        _mulai: function () { waktuLalu = performance.now(); rafId = requestAnimationFrame(gelung); }
      };
    },

    kuis: [
      {
        tanya: 'Gasing berputar tanpa ada yang mendorongnya, tetapi lama-lama melambat lalu berhenti. Ke mana perginya energi gerak gasing?',
        opsi: [
          { teks: 'Berubah menjadi energi panas dan bunyi akibat gesekan', benar: true,
            alasan: 'Gesekan ujung gasing dengan lantai dan gesekan badannya dengan udara mengubah energi gerak menjadi panas dan sedikit bunyi.' },
          { teks: 'Hilang begitu saja karena energi memang bisa habis',
            alasan: 'Energi tidak pernah benar-benar hilang. Ia hanya berpindah atau berubah bentuk — ini disebut hukum kekekalan energi.' },
          { teks: 'Diserap seluruhnya oleh gaya gravitasi bumi',
            alasan: 'Gravitasi menarik gasing ke bawah, tetapi bukan gravitasi yang menghabiskan putarannya. Yang meremnya adalah gesekan.' },
          { teks: 'Disimpan di dalam kayu gasing untuk putaran berikutnya',
            alasan: 'Kayu gasing tidak menyimpan energi putar. Setiap putaran baru butuh tarikan tali yang baru pula.' }
        ],
        penguatan: 'Energi tidak dapat diciptakan atau dimusnahkan, hanya berubah bentuk.'
      },
      {
        tanya: 'Rani memutar gasing di lantai ubin yang licin, lalu memutar gasing yang sama di tanah. Di mana gasing akan berputar lebih lama?',
        petunjuk: 'Pikirkan permukaan mana yang lebih kasar.',
        opsi: [
          { teks: 'Di lantai ubin, karena gesekannya lebih kecil', benar: true,
            alasan: 'Permukaan licin memberi gaya gesek yang kecil, sehingga energi gerak gasing terkuras lebih lambat.' },
          { teks: 'Di tanah, karena tanah lebih kokoh menahan gasing',
            alasan: 'Tanah memang kokoh, tetapi permukaannya kasar. Gesekan yang besar justru mempercepat gasing berhenti.' },
          { teks: 'Sama saja, karena gasingnya sama',
            alasan: 'Gasingnya memang sama, tetapi permukaan lantai adalah variabel yang berbeda — dan permukaan sangat menentukan besar gesekan.' }
        ],
        penguatan: 'Makin kasar permukaan, makin besar gaya geseknya, makin cepat benda berhenti.'
      },
      {
        tanya: 'Dari tiga gasing bermassa sama ini, mana yang paling lama berputar?',
        opsi: [
          { teks: 'Gasing lebar dengan massa terkumpul di bagian tepi', benar: true,
            alasan: 'Massa yang tersebar jauh dari pusat membuat gasing jauh lebih sulit diubah gerak putarnya, sehingga putarannya bertahan lebih lama.' },
          { teks: 'Gasing kecil dengan massa terkumpul di bagian tengah',
            alasan: 'Justru sebaliknya. Massa yang menumpuk di tengah membuat gasing mudah diperlambat, jadi lebih cepat tumbang.' },
          { teks: 'Ketiganya sama lama karena massanya sama',
            alasan: 'Massa yang sama belum tentu memberi hasil sama. Yang menentukan bukan hanya berapa massanya, tetapi juga <i>di mana</i> massa itu diletakkan.' }
        ],
        penguatan: 'Bukan cuma berapa beratnya, tapi di mana beratnya diletakkan.'
      },
      {
        tanya: 'Andi ingin membuktikan bahwa gasing yang lebih berat berputar lebih lama. Rancangan percobaan mana yang paling tepat?',
        petunjuk: 'Dalam uji adil, hanya satu hal yang boleh berbeda.',
        opsi: [
          { teks: 'Dua gasing bentuk & ukuran sama, massa berbeda, ditarik sama kuat di lantai sama', benar: true,
            alasan: 'Hanya massa yang dibedakan. Jadi kalau hasilnya berbeda, penyebabnya pasti massa — inilah uji adil.' },
          { teks: 'Gasing berat di lantai licin dibandingkan gasing ringan di tanah',
            alasan: 'Ada dua hal yang berbeda sekaligus: massa dan lantai. Kamu tidak akan tahu mana penyebabnya.' },
          { teks: 'Gasing berat besar ditarik kuat, gasing ringan kecil ditarik pelan',
            alasan: 'Tiga hal berbeda sekaligus — massa, ukuran, dan kekuatan tarikan. Hasilnya tidak bisa disimpulkan.' },
          { teks: 'Satu gasing diputar berulang kali sambil ditambah beban tiap putaran',
            alasan: 'Menambah beban juga mengubah bentuk dan sebaran massanya, jadi bukan hanya massa yang berubah.' }
        ],
        penguatan: 'Uji adil = ubah satu variabel, tahan semua variabel lain.'
      }
    ]
  });
})(window.RPN = window.RPN || {});
