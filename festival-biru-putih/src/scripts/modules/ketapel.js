/* ============================================================
   MODUL 3 — KETAPEL
   Fokus SMP (Fase D): perubahan bentuk energi (energi potensial
   elastis -> energi kinetik), energi kinetik Ek = 1/2 m v^2,
   dan lintasan parabola.
   Materi SMA dihapus: rumus Hukum Hooke Ep = 1/2 k x^2,
   konstanta pegas k dalam N/m, serta impuls & momentum
   (F = m v / dt). Kekuatan karet kini disajikan sebagai
   tingkatan yang bisa dirasakan murid, bukan konstanta.
   ============================================================ */
(function (RPN) {
  'use strict';
  var U = RPN.ui, el = U.el;

  var KARET = {
    lentur: { k: 90,  nama: 'Lentur',  ket: 'Karet tipis', ikon: '🧵' },
    sedang: { k: 250, nama: 'Sedang',  ket: 'Karet biasa', ikon: '🔗' },
    kaku:   { k: 520, nama: 'Kaku',    ket: 'Karet tebal', ikon: '💪' }
  };

  var GRAVITASI = {
    bumi:    { g: 9.8,  nama: 'Bumi',    ikon: '🌍' },
    bulan:   { g: 1.6,  nama: 'Bulan',   ikon: '🌑' },
    yupiter: { g: 24.8, nama: 'Yupiter', ikon: '🪐' }
  };

  var SKALA = 34;          // piksel per meter untuk jarak & lintasan
  var TARIK_MAKS = 118;    // panjang tarikan maksimum di layar (piksel)
  /* Tarikan penuh sebuah ketapel tangan kira-kira 45 cm. Karena di
     layar tarikan itu digambar sepanjang 118 piksel, konversinya
     berbeda dari skala dunia di atas. Tanpa pemisahan ini, tarikan
     akan terbaca 3,5 meter dan tenaganya menjadi tidak masuk akal. */
  var TARIK_MAKS_METER = 0.45;
  var SKALA_TARIK = TARIK_MAKS / TARIK_MAKS_METER;   // ~262 piksel per meter

  RPN.app.daftarkan({
    id: 'ketapel',
    judul: 'Ketapel',
    ikon: '🎯',
    warna: 'kuning',
    latar: 'linear-gradient(150deg,#fdf1dc,#fce9e7)',
    mapel: 'IPA · Energi & Gerak',
    fase: 'Fase D · Kelas VIII',
    ringkas: 'Karet yang ditarik menyimpan tenaga. Ke mana tenaga itu pergi saat dilepaskan?',
    langkah: ['Amati', 'Ubah', 'Bandingkan'],

    buat: function (dom) {
      /* ---------------- keadaan ---------------- */
      var massa = 0.20, karet = 'sedang', planet = 'bumi';
      var tampilLintasan = true, tampilJejak = true;

      var tiang = { x: 150, y: 0 };
      var kantong = { x: 150, y: 0 };
      var seret = false, terbang = false;
      var peluru = { x: 0, y: 0, vx: 0, vy: 0, r: 10, jejak: [] };
      var sasaran = [], percik = [], teksMelayang = [];
      var susunan = 'menara';
      var tenagaKaret = 0, lajuLontar = 0, jarakTembak = 0, mulaiX = 0;
      var tembakan = 0, kena = 0;
      var kanvas, ctx, uTenaga, uLaju, uGerak, uJarak;
      var tabel = null, langkahKini = 0;
      var rafId = null, waktuLalu = 0, pewaktuInfo = null;

      function g() { return GRAVITASI[planet].g; }
      function k() { return KARET[karet].k; }

      function pasangDom(d) {
        d.sim.innerHTML = '';
        kanvas = document.createElement('canvas');
        kanvas.setAttribute('aria-label', 'Simulasi ketapel: tarik kantong lalu lepaskan');
        kanvas.style.cursor = 'grab';
        d.sim.appendChild(kanvas);
        pasangPenunjuk();

        d.ukur.innerHTML = '';
        uTenaga = U.ukur({ nama: 'Tenaga di Karet', satuan: 'joule', warna: 'ungu', maks: 55 });
        uLaju   = U.ukur({ nama: 'Kecepatan Lontar', satuan: 'm/s', maks: 35 });
        uGerak  = U.ukur({ nama: 'Energi Gerak', satuan: 'joule', warna: 'kuning', maks: 55 });
        uJarak  = U.ukur({ nama: 'Jarak Tembak', satuan: 'meter', warna: 'hijau', maks: 30 });
        [uTenaga, uLaju, uGerak, uJarak].forEach(function (u) { d.ukur.appendChild(u); });
      }

      /* ---------------- sasaran ---------------- */
      function Balok(x, y, w, h, jenis) {
        this.x = x; this.y = y; this.w = w; this.h = h; this.jenis = jenis;
        this.nyawa = jenis === 'batu' ? 55 : jenis === 'kaca' ? 8 : 22;
        this.nyawaAwal = this.nyawa;
        this.hancur = false;
      }

      function susunSasaran(pola) {
        susunan = pola || susunan;
        sasaran = [];
        var w = kanvas.clientWidth || 900, h = kanvas.clientHeight || 500;
        var tanah = h - 46;
        var mulai = w - Math.min(250, w * 0.32);

        if (susunan === 'menara') {
          for (var b = 0; b < 4; b++) for (var c = 0; c < 2; c++)
            sasaran.push(new Balok(mulai + c * 44, tanah - b * 44 - 20, 40, 40, 'kayu'));
        } else if (susunan === 'piramida') {
          var kol = 4;
          for (var r = 0; r < 4; r++) {
            var geser = (4 - kol) * 21;
            for (var q = 0; q < kol; q++)
              sasaran.push(new Balok(mulai + geser + q * 42, tanah - r * 42 - 19, 38, 38,
                                     r % 2 === 0 ? 'kayu' : 'kaca'));
            kol--;
          }
        } else {
          for (var s = 0; s < 3; s++) {
            sasaran.push(new Balok(mulai, tanah - s * 50 - 24, 46, 46, 'batu'));
            sasaran.push(new Balok(mulai + 52, tanah - s * 50 - 24, 46, 46, 'batu'));
          }
        }
      }

      /* ---------------- interaksi tarik-lepas ---------------- */
      function pasangPenunjuk() {
        kanvas.addEventListener('pointerdown', function (e) {
          if (terbang) return;
          var p = RPN.panggung.titikKanvas(kanvas, e);
          if (Math.hypot(p.x - kantong.x, p.y - kantong.y) < 52) {
            seret = true;
            kanvas.style.cursor = 'grabbing';
            kanvas.setPointerCapture(e.pointerId);
          }
        });
        kanvas.addEventListener('pointermove', function (e) {
          if (!seret) return;
          var p = RPN.panggung.titikKanvas(kanvas, e);
          var dx = p.x - tiang.x, dy = p.y - tiang.y;
          var jarak = Math.hypot(dx, dy);
          if (jarak > TARIK_MAKS) { dx = dx / jarak * TARIK_MAKS; dy = dy / jarak * TARIK_MAKS; }
          kantong.x = tiang.x + dx;
          kantong.y = tiang.y + dy;
          peluru.x = kantong.x; peluru.y = kantong.y;
          hitungTarikan();
          if (Math.random() < 0.16) RPN.audio.nada({ dari: 110 + jarak * 2.6, lama: .05, keras: .05, bentuk: 'triangle' });
        });
        function lepas(e) {
          if (!seret) return;
          seret = false;
          kanvas.style.cursor = 'grab';
          tembak();
        }
        kanvas.addEventListener('pointerup', lepas);
        kanvas.addEventListener('pointercancel', lepas);
      }

      function hitungTarikan() {
        var jarakPx = Math.hypot(tiang.x - kantong.x, tiang.y - kantong.y);
        var regang = jarakPx / SKALA_TARIK;              // meter
        tenagaKaret = 0.5 * k() * regang * regang;       // joule (rumus disembunyikan)
        lajuLontar = Math.sqrt(2 * tenagaKaret / massa);
        return { jarakPx: jarakPx, regang: regang };
      }

      function tembak() {
        var t = hitungTarikan();
        if (t.jarakPx < 16) { kembalikan(); return; }
        var sudut = Math.atan2(tiang.y - kantong.y, tiang.x - kantong.x);
        peluru.vx = Math.cos(sudut) * lajuLontar * SKALA;
        peluru.vy = Math.sin(sudut) * lajuLontar * SKALA;
        peluru.x = tiang.x; peluru.y = tiang.y;
        peluru.jejak = [];
        mulaiX = tiang.x;
        terbang = true;
        tembakan++;
        kantong.x = tiang.x; kantong.y = tiang.y;
        RPN.audio.efek.lenting();
        RPN.simpanan.catatPercobaan('ketapel');
      }

      function kembalikan() {
        terbang = false;
        kantong.x = tiang.x; kantong.y = tiang.y;
        peluru.x = tiang.x; peluru.y = tiang.y;
        peluru.vx = peluru.vy = 0;
      }

      /* ---------------- fisika ---------------- */
      function maju(dt) {
        var h = kanvas.clientHeight || 500, w = kanvas.clientWidth || 900;
        var tanah = h - 46;

        if (terbang) {
          peluru.vy += g() * SKALA * dt;
          peluru.x += peluru.vx * dt;
          peluru.y += peluru.vy * dt;
          peluru.jejak.push({ x: peluru.x, y: peluru.y });
          if (peluru.jejak.length > 220) peluru.jejak.shift();
          jarakTembak = Math.max(0, (peluru.x - mulaiX) / SKALA);

          if (peluru.y + peluru.r >= tanah) {
            peluru.y = tanah - peluru.r;
            letupkan(peluru.x, peluru.y, '#9a8062', 10);
            RPN.audio.efek.tumbuk(.35);
            kembalikan();
          } else if (peluru.x > w + 120 || peluru.x < -120) {
            kembalikan();
          } else {
            for (var i = 0; i < sasaran.length; i++) {
              var s = sasaran[i];
              if (s.hancur) continue;
              var cx = Math.max(s.x - s.w / 2, Math.min(peluru.x, s.x + s.w / 2));
              var cy = Math.max(s.y - s.h / 2, Math.min(peluru.y, s.y + s.h / 2));
              if (Math.hypot(peluru.x - cx, peluru.y - cy) < peluru.r) { tumbuk(s, cx, cy); break; }
            }
          }
        }

        for (var p = percik.length - 1; p >= 0; p--) {
          var q = percik[p];
          q.x += q.vx; q.y += q.vy; q.vy += 0.25; q.hidup -= q.luruh;
          if (q.hidup <= 0) percik.splice(p, 1);
        }
        for (var t = teksMelayang.length - 1; t >= 0; t--) {
          var m = teksMelayang[t];
          m.y -= 1.3; m.a -= 0.016;
          if (m.a <= 0) teksMelayang.splice(t, 1);
        }
      }

      function tumbuk(s, cx, cy) {
        var laju = Math.hypot(peluru.vx, peluru.vy) / SKALA;
        var energi = 0.5 * massa * laju * laju;     // energi gerak saat menumbuk
        s.nyawa -= energi;
        kena++;
        RPN.audio.efek.tumbuk(Math.min(1, energi / 30));
        teksMelayang.push({ teks: energi.toFixed(1) + ' J', x: s.x - 14, y: s.y - 24, a: 1,
                            warna: energi > 20 ? '#b3261e' : '#a86a08' });
        if (s.nyawa <= 0) {
          s.hancur = true;
          letupkan(s.x, s.y, s.jenis === 'kaca' ? '#5ab0e8' : s.jenis === 'batu' ? '#8d97a8' : '#c98a3c', 22);
          if (sasaran.every(function (b) { return b.hancur; })) {
            RPN.audio.efek.hebat();
            teksMelayang.push({ teks: 'Semua roboh!', x: s.x - 40, y: s.y - 46, a: 1.6, warna: '#1c6b45' });
            catatHasil();
          }
        } else {
          letupkan(cx, cy, '#d9c3a2', 9);
        }
        kembalikan();
      }

      function letupkan(x, y, warna, n) {
        for (var i = 0; i < n; i++) {
          var a = Math.random() * Math.PI * 2, v = Math.random() * 5.5 + 1.5;
          percik.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.5,
                        r: Math.random() * 3.4 + 1.6, warna: warna, hidup: 1, luruh: Math.random() * .028 + .016 });
        }
      }

      function catatHasil() {
        if (!tabel || langkahKini !== 2) return;
        tabel.tambah([susunanNama(), KARET[karet].nama, (massa * 1000).toFixed(0) + ' g',
                      '<b>' + tembakan + '×</b>']);
        tembakan = 0; kena = 0;
      }

      function susunanNama() {
        return susunan === 'menara' ? 'Menara' : susunan === 'piramida' ? 'Piramida' : 'Batu';
      }

      /* ---------------- gambar ---------------- */
      function gambar() {
        ctx = RPN.panggung.siapkanKanvas(kanvas);
        var w = kanvas.clientWidth, h = kanvas.clientHeight;
        if (!w || !h) return;
        var tanah = h - 46;

        if (!tiang.y) {
          tiang.y = tanah - 128; kantong.x = tiang.x; kantong.y = tiang.y;
          peluru.x = tiang.x; peluru.y = tiang.y;
          susunSasaran();
        }

        var lg = ctx.createLinearGradient(0, 0, 0, h);
        lg.addColorStop(0, '#e8f3fc'); lg.addColorStop(1, '#fdf8ee');
        ctx.fillStyle = lg; ctx.fillRect(0, 0, w, h);

        /* Kisi bantu ukur (tiap 1 meter) */
        ctx.strokeStyle = 'rgba(22,35,58,.06)'; ctx.lineWidth = 1;
        for (var x = 0; x < w; x += SKALA) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, tanah); ctx.stroke();
        }
        for (var y = tanah; y > 0; y -= SKALA) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        /* Tanah */
        ctx.fillStyle = '#cdb38b'; ctx.fillRect(0, tanah, w, h - tanah);
        ctx.strokeStyle = '#a88a5f'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, tanah); ctx.lineTo(w, tanah); ctx.stroke();

        /* Ramalan lintasan saat ditarik */
        if (seret && tampilLintasan) {
          var t0 = hitungTarikan();
          if (lajuLontar > 0.8) {
            var a = Math.atan2(tiang.y - kantong.y, tiang.x - kantong.x);
            var vx = Math.cos(a) * lajuLontar * SKALA, vy = Math.sin(a) * lajuLontar * SKALA;
            ctx.fillStyle = 'rgba(20,80,155,.45)';
            for (var t = 0.06; t < 3; t += 0.06) {
              var px = tiang.x + vx * t, py = tiang.y + vy * t + 0.5 * g() * SKALA * t * t;
              if (py >= tanah || px > w) break;
              ctx.beginPath(); ctx.arc(px, py, 2.6, 0, Math.PI * 2); ctx.fill();
            }
          }
        }

        /* Jejak peluru */
        if (tampilJejak && peluru.jejak.length > 1) {
          ctx.strokeStyle = 'rgba(168,106,8,.45)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
          ctx.beginPath();
          for (var j = 0; j < peluru.jejak.length; j++) {
            var pt = peluru.jejak[j];
            if (j === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
          }
          ctx.stroke();
        }

        /* Sasaran */
        sasaran.forEach(function (s) {
          if (s.hancur) return;
          var isi = s.jenis === 'kayu' ? '#c98a3c' : s.jenis === 'kaca' ? 'rgba(90,176,232,.55)' : '#8d97a8';
          var garis = s.jenis === 'kayu' ? '#8a5a2b' : s.jenis === 'kaca' ? '#3f8fc4' : '#5f6a7d';
          ctx.fillStyle = isi; ctx.strokeStyle = garis; ctx.lineWidth = 2;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h, 5);
          else ctx.rect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h);
          ctx.fill(); ctx.stroke();
          if (s.nyawa < s.nyawaAwal) {
            var pct = Math.max(0, s.nyawa / s.nyawaAwal);
            ctx.fillStyle = 'rgba(0,0,0,.16)';
            ctx.fillRect(s.x - s.w / 2, s.y - s.h / 2 - 9, s.w, 4.5);
            ctx.fillStyle = pct > 0.5 ? '#1c6b45' : '#b3261e';
            ctx.fillRect(s.x - s.w / 2, s.y - s.h / 2 - 9, s.w * pct, 4.5);
          }
        });

        /* Karet belakang */
        ctx.strokeStyle = '#c0403c'; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tiang.x - 16, tiang.y - 22); ctx.lineTo(kantong.x, kantong.y); ctx.stroke();

        /* Gagang kayu bercabang */
        ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 11; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tiang.x, tanah);
        ctx.lineTo(tiang.x, tiang.y + 30);
        ctx.lineTo(tiang.x - 18, tiang.y - 20);
        ctx.moveTo(tiang.x, tiang.y + 30);
        ctx.lineTo(tiang.x + 18, tiang.y - 20);
        ctx.stroke();

        /* Karet depan + kantong kulit */
        ctx.strokeStyle = '#e05a54'; ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(tiang.x + 16, tiang.y - 22); ctx.lineTo(kantong.x, kantong.y); ctx.stroke();
        ctx.fillStyle = '#5b3a1a';
        ctx.beginPath(); ctx.arc(kantong.x, kantong.y, 12, 0, Math.PI * 2); ctx.fill();

        /* Peluru */
        ctx.fillStyle = '#4a5568'; ctx.strokeStyle = '#98a3b5'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(peluru.x, peluru.y, peluru.r, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        /* Percikan & teks */
        percik.forEach(function (p) {
          ctx.globalAlpha = Math.max(0, p.hidup);
          ctx.fillStyle = p.warna;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1;

        ctx.font = '800 14px ' + getComputedStyle(document.body).fontFamily;
        teksMelayang.forEach(function (m) {
          ctx.globalAlpha = Math.max(0, Math.min(1, m.a));
          ctx.fillStyle = m.warna;
          ctx.fillText(m.teks, m.x, m.y);
        });
        ctx.globalAlpha = 1;

        /* Petunjuk */
        if (!terbang && !seret && peluru.jejak.length === 0) {
          ctx.font = '700 13.5px ' + getComputedStyle(document.body).fontFamily;
          var teks = '👆 Tarik kantong ketapel ke belakang, lalu lepaskan';
          var lw = ctx.measureText(teks).width;
          ctx.fillStyle = 'rgba(255,255,255,.92)';
          if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(16, 14, lw + 24, 30, 15); ctx.fill(); }
          ctx.fillStyle = '#16233a';
          ctx.fillText(teks, 28, 33);
        }

        /* Penanda planet */
        ctx.font = '700 12.5px ' + getComputedStyle(document.body).fontFamily;
        ctx.fillStyle = 'rgba(22,35,58,.55)';
        ctx.textAlign = 'right';
        ctx.fillText(GRAVITASI[planet].ikon + '  gravitasi ' + g() + ' m/s²', w - 14, 26);
        ctx.textAlign = 'left';
      }

      function gelung(t) {
        var dt = Math.min(0.033, (t - waktuLalu) / 1000) || 0;
        waktuLalu = t;
        maju(dt);
        gambar();
        var lajuKini = terbang ? Math.hypot(peluru.vx, peluru.vy) / SKALA : lajuLontar;
        uTenaga.set(tenagaKaret, tenagaKaret.toFixed(1));
        uLaju.set(lajuKini, lajuKini.toFixed(1));
        uGerak.set(0.5 * massa * lajuKini * lajuKini, (0.5 * massa * lajuKini * lajuKini).toFixed(1));
        uJarak.set(jarakTembak, jarakTembak.toFixed(1));
        rafId = requestAnimationFrame(gelung);
      }

      pasangDom(dom);

      /* ---------------- panel ---------------- */
      function panelAmati(p) {
        p.appendChild(U.tajukPanel('Langkah 1 · Amati', 'Mulai di sini', 'kuning'));
        p.appendChild(el('p', 'teks-s lembut',
          'Tarik kantong ketapel ke belakang, tahan sebentar, lalu lepaskan. ' +
          'Perhatikan keempat angka di bawah gambar saat kamu menarik dan saat peluru melesat.'));

        p.appendChild(U.catatan('ungu', '🔋 Saat karet ditarik',
          'Angka <b>Tenaga di Karet</b> naik. Karet yang teregang menyimpan tenaga, ' +
          'persis seperti baterai yang terisi. Namanya <b>energi potensial elastis</b>.'));

        p.appendChild(U.catatan('kuning', '🚀 Saat dilepaskan',
          'Tenaga di karet langsung berpindah ke peluru dan berubah menjadi <b>energi gerak</b> ' +
          '(energi kinetik). Perhatikan: angkanya hampir sama besar — tenaganya tidak hilang, hanya pindah.'));

        p.appendChild(U.aksi([
          { teks: 'Susun ulang sasaran', kelas: 'tbl-utama', aksi: function () {
              susunSasaran(); kembalikan(); peluru.jejak = []; RPN.audio.efek.klik(); } },
          { teks: 'Hapus jejak', aksi: function () {
              peluru.jejak = []; percik = []; teksMelayang = []; RPN.audio.efek.klik(); } }
        ]));

        p.appendChild(U.catatan('kuning', '🤔 Pertanyaan pemantik',
          'Peluru dilontarkan lurus ke depan, tapi lintasannya melengkung ke bawah. ' +
          'Padahal tidak ada yang menariknya. <b>Siapa yang membelokkan?</b>'));

        p.appendChild(U.catatan('', '💡 Jawabannya',
          'Gravitasi bumi. Selama melayang, peluru terus ditarik ke bawah sambil tetap bergerak maju. ' +
          'Gabungan dua gerak inilah yang membentuk lengkungan yang disebut <b>lintasan parabola</b>.'));
      }

      function panelUbah(p) {
        p.appendChild(U.tajukPanel('Langkah 2 · Ubah', 'Uji adil', 'kuning'));

        p.appendChild(el('div', 'teks-s', '<b>Kekuatan karet</b>'));
        p.appendChild(U.pilihan({
          kolom: 3, terpilih: karet,
          daftar: Object.keys(KARET).map(function (x) {
            return { id: x, ikon: KARET[x].ikon, tajuk: KARET[x].nama, ket: KARET[x].ket };
          }),
          saatPilih: function (id) { karet = id; hitungTarikan(); }
        }));

        p.appendChild(U.penggeser({
          nama: 'Massa peluru', min: 0.05, max: 1.0, step: 0.05, nilai: massa,
          format: function (v) { return (v * 1000).toFixed(0) + ' gram'; },
          skala: ['Ringan', '500 g', 'Berat'],
          saatUbah: function (v) { massa = v; hitungTarikan(); }
        }));

        p.appendChild(el('div', 'teks-s', '<b>Tempat bermain</b>'));
        p.appendChild(U.pilihan({
          kolom: 3, terpilih: planet,
          daftar: Object.keys(GRAVITASI).map(function (x) {
            return { id: x, ikon: GRAVITASI[x].ikon, tajuk: GRAVITASI[x].nama,
                     ket: GRAVITASI[x].g + ' m/s²' };
          }),
          saatPilih: function (id) { planet = id; }
        }));

        p.appendChild(el('div', 'teks-s', '<b>Susunan sasaran</b>'));
        p.appendChild(U.pilihan({
          kolom: 3, terpilih: susunan,
          daftar: [
            { id: 'menara', ikon: '🧱', tajuk: 'Menara', ket: 'Kayu' },
            { id: 'piramida', ikon: '🔺', tajuk: 'Piramida', ket: 'Kayu + kaca' },
            { id: 'batu', ikon: '🪨', tajuk: 'Batu', ket: 'Sangat kuat' }
          ],
          saatPilih: function (id) { susunSasaran(id); kembalikan(); tembakan = 0; }
        }));

        p.appendChild(U.catatan('kuning', '👀 Coba perhatikan',
          'Tarik sejauh yang sama, tapi ganti massa peluru dari 50 g ke 1.000 g. ' +
          '<b>Tenaga karetnya sama</b>, tetapi kecepatan lontarnya jauh berbeda. Mengapa?'));

        p.appendChild(U.catatan('', '💡 Jawabannya',
          'Tenaga yang sama harus mendorong benda yang lebih berat, jadi hasil kecepatannya lebih kecil. ' +
          'Tapi karena massanya besar, <b>energi geraknya tetap besar</b> — makanya peluru berat lebih ampuh ' +
          'merobohkan sasaran walaupun terbangnya pelan.'));
      }

      function panelBandingkan(p) {
        p.appendChild(U.tajukPanel('Langkah 3 · Bandingkan', 'Tantangan', 'hijau'));
        p.appendChild(el('p', 'teks-s lembut',
          'Robohkan seluruh sasaran dengan <b>tembakan sesedikit mungkin</b>. ' +
          'Setiap kali semua sasaran roboh, hasilnya tercatat otomatis.'));

        tabel = U.tabelCatat(['Sasaran', 'Karet', 'Peluru', 'Tembakan']);
        p.appendChild(tabel);

        var info = el('div', 'catatan catatan-kuning teks-s');
        function segarkan() {
          info.innerHTML = '<span class="tajuk">Percobaan berjalan</span>Tembakan: <b>' + tembakan +
            '</b> · Sasaran tersisa: <b>' +
            sasaran.filter(function (s) { return !s.hancur; }).length + '</b>';
        }
        segarkan();
        if (pewaktuInfo) clearInterval(pewaktuInfo);
        pewaktuInfo = setInterval(segarkan, 400);
        p.appendChild(info);

        p.appendChild(U.aksi([
          { teks: 'Susun ulang & mulai lagi', kelas: 'tbl-utama', aksi: function () {
              susunSasaran(); kembalikan(); tembakan = 0; peluru.jejak = []; RPN.audio.efek.klik(); } },
          { teks: 'Kosongkan tabel', aksi: function () { tabel.kosong(); RPN.audio.efek.klik(); } }
        ]));

        p.appendChild(U.catatan('hijau', '🎯 Misi',
          '<b>a.</b> Robohkan Menara memakai karet lentur, lalu karet kaku. Bandingkan jumlah tembakannya.<br>' +
          '<b>b.</b> Robohkan susunan Batu. Kombinasi apa yang paling hemat tembakan?<br>' +
          '<b>c.</b> Coba tembak di Bulan. Apa yang berubah pada bentuk lintasannya?'));

        p.appendChild(U.catatan('', '🔍 Temuan yang diharapkan',
          'Sasaran roboh bila <b>energi gerak peluru</b> saat menumbuk cukup besar. ' +
          'Energi gerak dipengaruhi massa peluru dan kecepatannya. Di Bulan, gravitasinya kecil ' +
          'sehingga lintasan peluru jauh lebih landai dan bisa terbang lebih jauh.'));

        p.appendChild(U.catatan('ungu', '🏛️ Kaitan budaya',
          'Ketapel atau <b>plintheng</b> (Jawa), <b>bedil karet</b> (Sunda), dan <b>ali-ali</b> ' +
          'dulu dipakai anak-anak desa untuk menjaga sawah dari serbuan burung pipit. ' +
          'Cabang kayu berbentuk Y dipilih dari pohon jambu atau kopi karena lentur tapi tidak mudah patah.'));
      }

      return {
        gambarPanel: function (i, p) {
          langkahKini = i;
          if (i === 0) panelAmati(p);
          else if (i === 1) panelUbah(p);
          else panelBandingkan(p);
        },
        keLangkah: function (i) {
          langkahKini = i;
          if (i !== 2) {
            tabel = null;
            if (pewaktuInfo) { clearInterval(pewaktuInfo); pewaktuInfo = null; }
          }
        },
        ukurUlang: function () {
          if (!kanvas) return;
          RPN.panggung.siapkanKanvas(kanvas);
          tiang.y = 0;      // paksa hitung ulang posisi & sasaran
        },
        pindahWadah: function (d) { pasangDom(d); tiang.y = 0; },
        lepas: function () {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = null;
          if (pewaktuInfo) { clearInterval(pewaktuInfo); pewaktuInfo = null; }
        },
        _mulai: function () { waktuLalu = performance.now(); rafId = requestAnimationFrame(gelung); }
      };
    },

    kuis: [
      {
        tanya: 'Saat karet ketapel ditarik ke belakang lalu ditahan, energi apa yang tersimpan di dalam karet?',
        opsi: [
          { teks: 'Energi potensial elastis', benar: true,
            alasan: 'Benda lentur yang diregangkan atau ditekan menyimpan energi potensial elastis, siap dilepaskan kapan saja.' },
          { teks: 'Energi kinetik',
            alasan: 'Energi kinetik adalah energi benda yang sedang bergerak. Saat ditahan, karet dan peluru justru sedang diam.' },
          { teks: 'Energi panas',
            alasan: 'Karet memang sedikit menghangat saat diregangkan, tetapi hampir seluruh energinya tersimpan sebagai energi elastis, bukan panas.' },
          { teks: 'Energi potensial gravitasi',
            alasan: 'Energi potensial gravitasi muncul karena benda berada di ketinggian tertentu. Di sini yang berubah adalah regangan karet, bukan ketinggian peluru.' }
        ],
        penguatan: 'Benda lentur yang diregangkan menyimpan energi potensial elastis.'
      },
      {
        tanya: 'Peluru ketapel bermassa 0,2 kg melesat dengan kecepatan 10 m/s. Berapa energi kinetiknya?',
        petunjuk: 'Energi kinetik = ½ × massa × kecepatan × kecepatan.',
        opsi: [
          { teks: '10 joule', benar: true,
            alasan: '½ × 0,2 × 10 × 10 = ½ × 0,2 × 100 = 10 joule.' },
          { teks: '2 joule',
            alasan: 'Sepertinya kecepatannya hanya dikalikan sekali. Kecepatan harus dikuadratkan dulu: 10 × 10 = 100.' },
          { teks: '20 joule',
            alasan: 'Hasil ini lupa dikalikan ½. Rumusnya ½ × m × v², bukan m × v².' },
          { teks: '100 joule',
            alasan: 'Ini hanya nilai v² saja. Masih harus dikalikan massa dan ½.' }
        ],
        penguatan: 'Ek = ½ × m × v². Perhatikan kecepatan harus dikuadratkan.'
      },
      {
        tanya: 'Dengan tarikan karet yang sama persis, Sari menembakkan peluru 50 gram lalu peluru 500 gram. Mana yang benar?',
        opsi: [
          { teks: 'Peluru 50 gram melesat lebih cepat, tetapi peluru 500 gram lebih kuat merobohkan sasaran', benar: true,
            alasan: 'Tenaga karetnya sama, jadi peluru ringan mendapat kecepatan lebih tinggi. Tetapi energi gerak juga bergantung pada massa, sehingga peluru berat tetap menumbuk lebih kuat.' },
          { teks: 'Peluru 500 gram melesat lebih cepat karena massanya besar',
            alasan: 'Justru sebaliknya. Dengan tenaga yang sama, benda yang lebih berat lebih sulit dipercepat sehingga kecepatannya lebih rendah.' },
          { teks: 'Keduanya melesat sama cepat karena tarikan karetnya sama',
            alasan: 'Tenaga yang diberikan memang sama, tetapi tenaga yang sama pada massa berbeda menghasilkan kecepatan yang berbeda.' },
          { teks: 'Peluru 50 gram lebih kuat merobohkan karena kecepatannya tinggi',
            alasan: 'Kecepatan tinggi memang menambah energi gerak, tetapi massa yang 10 kali lebih kecil membuat energi totalnya tetap kalah. Coba buktikan di simulasi.' }
        ],
        penguatan: 'Tenaga sama + massa berbeda = kecepatan berbeda.'
      },
      {
        tanya: 'Mengapa peluru ketapel bergerak melengkung ke bawah, bukan lurus mendatar?',
        opsi: [
          { teks: 'Karena gravitasi terus menarik peluru ke bawah selama ia melayang', benar: true,
            alasan: 'Peluru tetap bergerak maju, tetapi pada saat bersamaan ditarik ke bawah oleh gravitasi. Gabungan keduanya membentuk lintasan parabola.' },
          { teks: 'Karena tenaga peluru habis sehingga peluru menjadi lelah dan jatuh',
            alasan: 'Peluru tidak "kehabisan tenaga" lalu jatuh. Lintasannya sudah melengkung sejak awal karena gravitasi bekerja sejak detik pertama.' },
          { teks: 'Karena hambatan udara mendorong peluru ke bawah',
            alasan: 'Hambatan udara melawan arah gerak, bukan menekan ke bawah. Bahkan tanpa udara sama sekali, lintasannya tetap melengkung.' },
          { teks: 'Karena karet ketapel melontarkannya dengan arah miring ke bawah',
            alasan: 'Meski dilontarkan mendatar sempurna, lintasannya tetap akan melengkung. Coba di simulasi: tarik lurus mendatar, hasilnya tetap parabola.' }
        ],
        penguatan: 'Gerak maju + tarikan gravitasi ke bawah = lintasan parabola.'
      }
    ]
  });
})(window.RPN = window.RPN || {});
