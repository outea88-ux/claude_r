/* ============================================================
   MODUL 2 — LAYANG-LAYANG
   Fokus SMP (Fase D): gaya digambarkan sebagai anak panah,
   berat = massa x gravitasi, dan keseimbangan gaya (Hukum I
   Newton). Rumus SMA seperti koefisien angkat Bernoulli,
   tekanan dinamis, dan penjumlahan vektor tegangan tali
   tidak ditampilkan — tetapi tetap dipakai di balik layar.
   ============================================================ */
(function (RPN) {
  'use strict';
  var U = RPN.ui, el = U.el;

  var JENIS = {
    aduan:   { nama: 'Layangan Aduan', ket: 'Ringan & lincah', massa: 0.10, luas: 0.32, ekor: 0.8,
               ikon: '⚡', asal: 'Jawa – Sumatra' },
    kaghati: { nama: 'Kaghati Kolope', ket: 'Daun kolope, Muna', massa: 0.22, luas: 0.62, ekor: 2.0,
               ikon: '🍃', asal: 'Pulau Muna, Sultra' },
    bebean:  { nama: 'Bebean Bali',    ket: 'Besar & stabil',   massa: 0.50, luas: 1.15, ekor: 3.2,
               ikon: '🐟', asal: 'Bali' }
  };

  var G = 9.8;
  var RHO = 1.225;          // kerapatan udara (dipakai diam-diam)

  RPN.app.daftarkan({
    id: 'layangan',
    judul: 'Layang-Layang',
    ikon: '🪁',
    warna: 'biru',
    latar: 'linear-gradient(160deg,#dff0fd,#e9f6ea)',
    mapel: 'IPA · Gaya & Gerak',
    fase: 'Fase D · Kelas VII–VIII',
    ringkas: 'Empat gaya bekerja sekaligus. Bagaimana layangan bisa diam melayang di udara?',
    langkah: ['Amati', 'Ubah', 'Bandingkan'],

    buat: function (dom) {
      /* ---------------- keadaan ---------------- */
      var jenis = 'aduan';
      var angin = 8, sudutSerang = 25, massa = 0.10, luas = 0.32, ekor = 0.8, tali = 35;
      var tampilPanah = true, tampilAngin = true;

      var theta = 0.25;           // sudut tali dari tanah (radian)
      var kecepatanTheta = 0;
      var hembusSisa = 0, sentakSisa = 0;
      var rafId = null, waktuLalu = 0;
      var partikel = [];
      var kanvas, ctx, uTinggi, uAngkat, uBerat, uTali;
      var tabel = null, langkahKini = 0;

      for (var i = 0; i < 46; i++) {
        partikel.push({ x: Math.random() * 900, y: Math.random() * 500, v: Math.random() * .6 + .7, t: Math.random() * 2 + 1 });
      }

      function pasangDom(d) {
        d.sim.innerHTML = '';
        kanvas = document.createElement('canvas');
        kanvas.setAttribute('aria-label', 'Simulasi layang-layang terbang');
        d.sim.appendChild(kanvas);

        d.ukur.innerHTML = '';
        uTinggi = U.ukur({ nama: 'Ketinggian', satuan: 'meter', maks: 120 });
        uAngkat = U.ukur({ nama: 'Gaya Angkat Angin', satuan: 'newton', warna: 'ungu', maks: 30 });
        uBerat  = U.ukur({ nama: 'Berat Layangan', satuan: 'newton', warna: 'merah', maks: 10 });
        uTali   = U.ukur({ nama: 'Tarikan Tali', satuan: 'newton', warna: 'hijau', maks: 30 });
        [uTinggi, uAngkat, uBerat, uTali].forEach(function (u) { d.ukur.appendChild(u); });
      }
      pasangDom(dom);

      /* ---------------- fisika ---------------- */
      /* Layangan terikat tali sepanjang L, jadi ia hanya bisa
         bergerak pada busur lingkaran. Kita hitung gaya yang
         menyinggung busur itu, lalu integrasikan sudutnya. */
      function hitungGaya() {
        var v = angin + (hembusSisa > 0 ? 6 : 0);
        var a = sudutSerang * Math.PI / 180;
        var cAngkat = 2.0 * Math.sin(a) * Math.cos(a);
        var cHambat = 0.10 + 1.8 * Math.sin(a) * Math.sin(a) + ekor * 0.035;
        var tekanan = 0.5 * RHO * v * v;
        return {
          angkat: tekanan * luas * cAngkat + sentakSisa * 3.0,
          hambat: tekanan * luas * cHambat,
          berat: massa * G,
          angin: v
        };
      }

      function maju(dt) {
        if (hembusSisa > 0) hembusSisa -= dt;
        if (sentakSisa > 0) sentakSisa = Math.max(0, sentakSisa - dt * 4);

        var f = hitungGaya();

        /* Gaya sepanjang busur (mendorong layangan naik/turun) */
        var gayaBusur = (f.angkat - f.berat) * Math.cos(theta) - f.hambat * Math.sin(theta);
        var percepatan = gayaBusur / (massa * Math.max(5, tali));

        kecepatanTheta += percepatan * dt;
        kecepatanTheta *= 0.93;                     // redaman udara
        theta += kecepatanTheta * dt;

        if (theta < 0.02) { theta = 0.02; kecepatanTheta = Math.max(0, kecepatanTheta); }
        if (theta > 1.45) { theta = 1.45; kecepatanTheta = Math.min(0, kecepatanTheta); }

        /* Tarikan tali = gaya yang menarik menjauhi pemegang */
        var tarik = Math.max(0, (f.angkat - f.berat) * Math.sin(theta) + f.hambat * Math.cos(theta));

        return { f: f, tarik: tarik, tinggi: tali * Math.sin(theta) };
      }

      function status(f, tinggi) {
        if (f.angkat < f.berat * 0.95) return { t: 'Angin terlalu lemah — layangan turun', w: 'merah' };
        if (tinggi < 3) return { t: 'Layangan masih menyusur tanah', w: 'kuning' };
        return { t: 'Layangan terbang seimbang', w: 'hijau' };
      }

      /* ---------------- gambar ---------------- */
      function gambar(hasil) {
        ctx = RPN.panggung.siapkanKanvas(kanvas);
        var w = kanvas.clientWidth, h = kanvas.clientHeight;
        if (!w || !h) return;

        /* Langit */
        var lg = ctx.createLinearGradient(0, 0, 0, h);
        lg.addColorStop(0, '#7cc0f0');
        lg.addColorStop(0.62, '#c6e6fb');
        lg.addColorStop(1, '#eaf6e4');
        ctx.fillStyle = lg;
        ctx.fillRect(0, 0, w, h);

        var tanahY = h - 52;
        var pegangX = 74, pegangY = tanahY - 34;

        /* Awan sederhana */
        ctx.fillStyle = 'rgba(255,255,255,.72)';
        [[0.22, 0.16, 34], [0.55, 0.1, 26], [0.8, 0.22, 30]].forEach(function (a) {
          var cx = w * a[0], cy = h * a[1], r = a[2];
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.arc(cx + r * 0.8, cy + 5, r * 0.72, 0, Math.PI * 2);
          ctx.arc(cx - r * 0.8, cy + 6, r * 0.62, 0, Math.PI * 2);
          ctx.fill();
        });

        /* Garis aliran angin */
        if (tampilAngin) {
          ctx.strokeStyle = 'rgba(255,255,255,.8)';
          ctx.lineWidth = 2; ctx.lineCap = 'round';
          for (var i = 0; i < partikel.length; i++) {
            var p = partikel[i];
            p.x += (hasil.f.angin * p.v) * 1.05;
            if (p.x > w + 30) { p.x = -30; p.y = Math.random() * tanahY; }
            ctx.globalAlpha = 0.32 + p.v * 0.2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + 12 + hasil.f.angin * 0.9, p.y);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }

        /* Tanah */
        ctx.fillStyle = '#8cc06a';
        ctx.fillRect(0, tanahY, w, h - tanahY);
        ctx.strokeStyle = '#6ea24d'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, tanahY); ctx.lineTo(w, tanahY); ctx.stroke();

        /* Anak yang memegang tali */
        ctx.strokeStyle = '#33415c'; ctx.fillStyle = '#33415c';
        ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(pegangX, pegangY - 22, 9, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(pegangX, pegangY - 13); ctx.lineTo(pegangX, pegangY + 12);
        ctx.lineTo(pegangX - 9, tanahY);
        ctx.moveTo(pegangX, pegangY + 12); ctx.lineTo(pegangX + 9, tanahY);
        ctx.moveTo(pegangX, pegangY - 7); ctx.lineTo(pegangX + 15, pegangY - 15);
        ctx.stroke();

        /* Posisi layangan pada busur tali */
        var skala = Math.min((w - pegangX - 120) / Math.max(12, tali), (pegangY - 70) / Math.max(6, tali * 0.99));
        skala = Math.max(1.6, skala);
        var lx = pegangX + tali * Math.cos(theta) * skala;
        var ly = pegangY - tali * Math.sin(theta) * skala;

        /* Tali (melengkung sedikit bila tarikan kecil) */
        var lengkung = Math.max(0, 26 - hasil.tarik * 2.2);
        ctx.strokeStyle = 'rgba(60,70,90,.75)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(pegangX + 15, pegangY - 15);
        ctx.quadraticCurveTo((pegangX + lx) / 2, (pegangY + ly) / 2 + lengkung, lx, ly);
        ctx.stroke();

        /* Badan layangan */
        var putar = -theta + (sudutSerang * Math.PI / 180) * 0.6;
        var ukuran = Math.sqrt(luas) * 62;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(putar);
        gambarLayangan(ukuran);
        gambarEkor(ukuran);
        ctx.restore();

        /* Anak panah gaya */
        if (tampilPanah) {
          var s = 9;       // piksel per newton
          panah(lx, ly, lx, ly - hasil.f.angkat * s, '#6b3f96', 'Gaya angkat');
          panah(lx, ly, lx + hasil.f.hambat * s, ly, '#a86a08', 'Hambatan angin');
          panah(lx, ly, lx, ly + hasil.f.berat * s * 2.2, '#b3261e', 'Berat');
          var dx = pegangX + 15 - lx, dy = pegangY - 15 - ly;
          var d = Math.hypot(dx, dy) || 1;
          panah(lx, ly, lx + dx / d * hasil.tarik * s, ly + dy / d * hasil.tarik * s, '#1c6b45', 'Tarikan tali');
        }

        /* Penggaris ketinggian */
        ctx.strokeStyle = 'rgba(22,35,58,.28)';
        ctx.setLineDash([5, 5]); ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, tanahY); ctx.stroke();
        ctx.setLineDash([]);

        var st = status(hasil.f, hasil.tinggi);
        label(w / 2, 26, st.t, st.w);
      }

      function gambarLayangan(s) {
        if (jenis === 'aduan') {
          ctx.fillStyle = '#e24b52'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(0, -s * 1.15); ctx.lineTo(s * 0.85, 0);
          ctx.lineTo(0, s * 1.25);  ctx.lineTo(-s * 0.85, 0);
          ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(0, -s * 1.15); ctx.lineTo(0, s * 1.25);
          ctx.moveTo(-s * 0.85, 0); ctx.lineTo(s * 0.85, 0);
          ctx.stroke();
        } else if (jenis === 'kaghati') {
          ctx.fillStyle = '#cf9b3e'; ctx.strokeStyle = '#7a5216'; ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.ellipse(0, 0, s * 1.05, s * 0.8, 0, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
          ctx.strokeStyle = '#7a5216'; ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.8); ctx.lineTo(0, s * 0.8);
          ctx.stroke();
          for (var k = -3; k <= 3; k++) {
            ctx.beginPath();
            ctx.moveTo(0, k * s * 0.2);
            ctx.lineTo(s * 0.85, k * s * 0.2 + s * 0.22);
            ctx.moveTo(0, k * s * 0.2);
            ctx.lineTo(-s * 0.85, k * s * 0.2 + s * 0.22);
            ctx.stroke();
          }
        } else {
          ctx.fillStyle = '#8a5fc0'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(0, -s * 1.3);
          ctx.quadraticCurveTo(s * 1.2, -s * 0.45, s * 0.75, s * 0.75);
          ctx.lineTo(0, s * 0.45);
          ctx.lineTo(-s * 0.75, s * 0.75);
          ctx.quadraticCurveTo(-s * 1.2, -s * 0.45, 0, -s * 1.3);
          ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#e24b52';
          ctx.beginPath();
          ctx.moveTo(0, s * 0.45); ctx.lineTo(s * 1.0, s * 1.3);
          ctx.lineTo(0, s * 0.85);  ctx.lineTo(-s * 1.0, s * 1.3);
          ctx.closePath(); ctx.fill(); ctx.stroke();
        }
      }

      function gambarEkor(s) {
        if (ekor < 0.15) return;
        ctx.strokeStyle = '#e24b52'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
        ctx.beginPath();
        var x = 0, y = s * 1.2;
        ctx.moveTo(x, y);
        var ruas = 14, panjang = ekor * 20 / ruas, t = performance.now() * 0.006;
        for (var i = 1; i <= ruas; i++) {
          x += Math.sin(t - i * 0.45) * i * 0.55;
          y += panjang;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      function panah(x1, y1, x2, y2, warna, teks) {
        var dx = x2 - x1, dy = y2 - y1, p = Math.hypot(dx, dy);
        if (p < 9) return;
        var a = Math.atan2(dy, dx);
        ctx.save();
        ctx.strokeStyle = warna; ctx.fillStyle = warna;
        ctx.lineWidth = 3.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 11 * Math.cos(a - Math.PI / 7), y2 - 11 * Math.sin(a - Math.PI / 7));
        ctx.lineTo(x2 - 11 * Math.cos(a + Math.PI / 7), y2 - 11 * Math.sin(a + Math.PI / 7));
        ctx.closePath(); ctx.fill();
        ctx.font = '700 11.5px ' + getComputedStyle(document.body).fontFamily;
        var lw = ctx.measureText(teks).width;
        ctx.fillStyle = 'rgba(255,255,255,.9)';
        if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x2 + 5, y2 - 9, lw + 10, 17, 8); ctx.fill(); }
        ctx.fillStyle = warna;
        ctx.fillText(teks, x2 + 10, y2 + 3.5);
        ctx.restore();
      }

      function label(x, y, teks, warna) {
        var peta = { hijau: '#1c6b45', kuning: '#a86a08', merah: '#b3261e' };
        ctx.save();
        ctx.font = '700 14px ' + getComputedStyle(document.body).fontFamily;
        ctx.textAlign = 'center';
        var lw = ctx.measureText(teks).width;
        ctx.fillStyle = 'rgba(255,255,255,.92)';
        if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x - lw / 2 - 13, y - 15, lw + 26, 30, 15); ctx.fill(); }
        ctx.fillStyle = peta[warna] || '#16233a';
        ctx.fillText(teks, x, y + 5);
        ctx.restore();
      }

      /* ---------------- gelung ---------------- */
      function gelung(t) {
        var dt = Math.min(0.033, (t - waktuLalu) / 1000) || 0;
        waktuLalu = t;
        var hasil = maju(dt);
        gambar(hasil);
        uTinggi.set(hasil.tinggi, hasil.tinggi.toFixed(1));
        uAngkat.set(hasil.f.angkat, hasil.f.angkat.toFixed(1));
        uBerat.set(hasil.f.berat, hasil.f.berat.toFixed(1));
        uTali.set(hasil.tarik, hasil.tarik.toFixed(1));
        rafId = requestAnimationFrame(gelung);
      }

      /* Cari kecepatan angin terkecil yang membuat layangan naik */
      function anginMinimum() {
        var simpan = angin, hasil = null;
        for (var v = 1; v <= 25; v += 0.5) {
          angin = v;
          var f = hitungGaya();
          if (f.angkat > f.berat) { hasil = v; break; }
        }
        angin = simpan;
        return hasil;
      }

      /* ---------------- panel ---------------- */
      function panelAmati(p) {
        p.appendChild(U.tajukPanel('Langkah 1 · Amati', 'Mulai di sini', 'biru'));
        p.appendChild(el('p', 'teks-s lembut',
          'Ada empat anak panah berwarna pada layangan. Setiap panah adalah satu gaya: ' +
          'arah panah menunjukkan arah gaya, panjang panah menunjukkan besarnya.'));

        var daftar = el('div', 'kolom g2');
        [ ['#6b3f96', 'Gaya angkat', 'Dorongan angin yang mengangkat layangan ke atas.'],
          ['#a86a08', 'Hambatan angin', 'Dorongan angin yang menyeret layangan ke belakang.'],
          ['#b3261e', 'Berat', 'Tarikan bumi ke bawah = massa × gravitasi.'],
          ['#1c6b45', 'Tarikan tali', 'Tali menahan layangan supaya tidak terbang terbawa angin.']
        ].forEach(function (x) {
          var r = el('div', 'baris g2');
          r.style.alignItems = 'flex-start';
          var d = el('span', '');
          d.style.cssText = 'width:12px;height:12px;border-radius:3px;flex:none;margin-top:3px;background:' + x[0];
          r.appendChild(d);
          r.appendChild(el('div', 'teks-s', '<b>' + x[1] + '</b> — <span class="lembut">' + x[2] + '</span>'));
          daftar.appendChild(r);
        });
        p.appendChild(daftar);

        p.appendChild(U.aksi([
          { teks: 'Embusan angin!', kelas: 'tbl-utama', aksi: function () {
              hembusSisa = 2.6; RPN.audio.derau({ lama: 1.1, cutoff: 620, keras: .12 }); } },
          { teks: 'Sentak tali', aksi: function () { sentakSisa = 1; RPN.audio.efek.lenting(); } }
        ]));

        p.appendChild(U.catatan('kuning', '🤔 Pertanyaan pemantik',
          'Layangan terlihat <b>diam menggantung</b> di langit. Padahal ada empat gaya yang ' +
          'menariknya ke arah berbeda-beda. Kok bisa diam?'));

        p.appendChild(U.catatan('', '💡 Jawabannya',
          'Karena keempat gaya itu <b>saling meniadakan</b>. Dorongan ke atas dilawan berat, ' +
          'seretan angin dilawan tarikan tali. Kalau semua gaya seimbang, benda yang diam akan tetap diam. ' +
          'Ini yang disebut <b>Hukum I Newton</b>.'));
      }

      function panelUbah(p) {
        p.appendChild(U.tajukPanel('Langkah 2 · Ubah', 'Uji adil', 'kuning'));

        p.appendChild(el('div', 'teks-s', '<b>Jenis layangan tradisional</b>'));
        p.appendChild(U.pilihan({
          kolom: 3, terpilih: jenis,
          daftar: Object.keys(JENIS).map(function (k) {
            return { id: k, ikon: JENIS[k].ikon, tajuk: JENIS[k].nama.split(' ')[0], ket: JENIS[k].ket };
          }),
          saatPilih: function (id) {
            jenis = id;
            var j = JENIS[id];
            massa = j.massa; luas = j.luas; ekor = j.ekor;
            gsMassa.setNilai(massa); gsLuas.setNilai(luas); gsEkor.setNilai(ekor);
          }
        }));

        p.appendChild(U.penggeser({
          nama: 'Kecepatan angin', min: 1, max: 25, step: 0.5, nilai: angin,
          format: function (v) { return v.toFixed(1) + ' m/s'; },
          skala: ['Sepoi', 'Sedang', 'Kencang'],
          saatUbah: function (v) { angin = v; }
        }));

        p.appendChild(U.penggeser({
          nama: 'Kemiringan layangan terhadap angin', min: 5, max: 60, step: 1, nilai: sudutSerang,
          format: function (v) { return v + '°'; },
          skala: ['Datar', 'Pas (20–30°)', 'Curam'],
          saatUbah: function (v) { sudutSerang = v; }
        }));

        var gsMassa = U.penggeser({
          nama: 'Massa layangan', min: 0.04, max: 0.8, step: 0.02, nilai: massa,
          format: function (v) { return (v * 1000).toFixed(0) + ' gram'; },
          saatUbah: function (v) { massa = v; }
        });
        p.appendChild(gsMassa);

        var gsLuas = U.penggeser({
          nama: 'Luas layangan', min: 0.1, max: 1.5, step: 0.05, nilai: luas,
          format: function (v) { return v.toFixed(2) + ' m²'; },
          saatUbah: function (v) { luas = v; }
        });
        p.appendChild(gsLuas);

        var gsEkor = U.penggeser({
          nama: 'Panjang ekor', min: 0, max: 4, step: 0.2, nilai: ekor,
          format: function (v) { return v.toFixed(1) + ' meter'; },
          saatUbah: function (v) { ekor = v; }
        });
        p.appendChild(gsEkor);

        p.appendChild(U.penggeser({
          nama: 'Panjang tali yang diulur', min: 10, max: 120, step: 5, nilai: tali,
          format: function (v) { return v + ' meter'; },
          saatUbah: function (v) { tali = v; }
        }));

        p.appendChild(U.catatan('kuning', '👀 Coba perhatikan',
          'Naikkan kemiringan pelan-pelan dari 5°. Gaya angkat naik dulu, lalu ' +
          '<b>turun lagi</b> setelah sekitar 45°. Terlalu curam justru bikin layangan ' +
          'lebih banyak tertahan daripada terangkat.'));
      }

      function panelBandingkan(p) {
        p.appendChild(U.tajukPanel('Langkah 3 · Bandingkan', 'Tantangan', 'hijau'));
        p.appendChild(el('p', 'teks-s lembut',
          'Setiap layangan butuh angin minimum agar bisa naik. Cari angka itu untuk ketiga jenis layangan.'));

        tabel = U.tabelCatat(['Layangan', 'Massa', 'Luas', 'Angin min.']);
        p.appendChild(tabel);

        p.appendChild(U.aksi([
          { teks: 'Ukur angin minimum', kelas: 'tbl-utama', aksi: function () {
              var v = anginMinimum();
              RPN.audio.efek[v ? 'benar' : 'salah']();
              tabel.tambah([
                JENIS[jenis].nama.split(' ')[0],
                (massa * 1000).toFixed(0) + ' g',
                luas.toFixed(2) + ' m²',
                v ? '<b>' + v.toFixed(1) + ' m/s</b>' : '<b>tidak bisa</b>'
              ]);
            } },
          { teks: 'Kosongkan', aksi: function () { tabel.kosong(); RPN.audio.efek.klik(); } }
        ]));

        p.appendChild(U.catatan('hijau', '🎯 Misi',
          '<b>a.</b> Ukur angin minimum untuk ketiga jenis layangan pada kemiringan 25°.<br>' +
          '<b>b.</b> Lalu ubah kemiringan menjadi 10° dan ukur ulang. Apa yang terjadi?<br>' +
          '<b>c.</b> Terakhir, buat Bebean Bali bisa terbang dengan angin paling pelan.'));

        p.appendChild(U.catatan('', '🔍 Temuan yang diharapkan',
          'Layangan yang <b>berat</b> butuh angin lebih kencang, karena gaya angkat harus ' +
          'melebihi beratnya dulu. Tetapi layangan yang <b>lebar</b> menangkap lebih banyak angin, ' +
          'jadi menambah luas bisa menutupi kekurangan itu.'));

        p.appendChild(U.catatan('ungu', '🏛️ Kaitan budaya',
          '<b>Kaghati Kolope</b> dari Pulau Muna, Sulawesi Tenggara, terbuat dari daun umbi gadung ' +
          'yang dikeringkan, dengan rangka bambu dan tali serat nanas. Lukisan gua di Muna menunjukkan ' +
          'layangan ini sudah diterbangkan sekitar <b>4.000 tahun lalu</b> — jauh sebelum layangan ' +
          'sutra Tiongkok yang selama ini dianggap yang tertua di dunia.'));
      }

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
        lepas: function () { if (rafId) cancelAnimationFrame(rafId); rafId = null; },
        _mulai: function () { waktuLalu = performance.now(); rafId = requestAnimationFrame(gelung); }
      };
    },

    kuis: [
      {
        tanya: 'Sebuah layangan terlihat diam menggantung di langit, padahal ada empat gaya yang menariknya ke arah berbeda. Mengapa layangan bisa diam?',
        opsi: [
          { teks: 'Karena keempat gaya itu saling meniadakan sehingga resultannya nol', benar: true,
            alasan: 'Saat resultan gaya sama dengan nol, benda yang diam akan tetap diam. Inilah Hukum I Newton.' },
          { teks: 'Karena hanya gaya angkat yang bekerja, gaya lainnya sedang berhenti',
            alasan: 'Keempat gaya bekerja terus-menerus secara bersamaan. Yang membuat layangan diam bukan hilangnya gaya lain, tetapi keseimbangannya.' },
          { teks: 'Karena layangan lebih ringan daripada udara sehingga mengapung',
            alasan: 'Layangan lebih berat daripada udara. Ia tidak mengapung seperti balon gas, melainkan ditahan oleh dorongan angin dan tali.' },
          { teks: 'Karena tali menahannya sehingga gaya lain tidak berpengaruh',
            alasan: 'Tali memang menahan, tetapi tali hanyalah salah satu dari empat gaya. Kalau angin berhenti, tali saja tidak cukup membuat layangan tetap di atas.' }
        ],
        penguatan: 'Resultan gaya nol → benda diam tetap diam, benda bergerak tetap bergerak lurus beraturan.'
      },
      {
        tanya: 'Massa sebuah layangan 200 gram. Jika percepatan gravitasi 10 m/s², berapa berat layangan tersebut?',
        petunjuk: 'Berat = massa × gravitasi. Ubah dulu gram menjadi kilogram.',
        opsi: [
          { teks: '2 newton', benar: true,
            alasan: '200 gram = 0,2 kg. Berat = 0,2 × 10 = 2 newton.' },
          { teks: '200 newton',
            alasan: 'Satuan massanya belum diubah. 200 gram bukan 200 kilogram — bagi dulu dengan 1.000.' },
          { teks: '2.000 newton',
            alasan: 'Ini hasil dari 200 × 10 dengan massa masih dalam gram. Massa harus dalam kilogram dulu.' },
          { teks: '0,02 newton',
            alasan: 'Sepertinya massa dibagi 10.000. 200 gram = 0,2 kg, bukan 0,002 kg.' }
        ],
        penguatan: 'Massa satuannya kilogram, berat satuannya newton. Keduanya berbeda.'
      },
      {
        tanya: 'Budi menerbangkan layangan besar Bebean Bali, tetapi layangannya tidak mau naik. Angin saat itu cukup pelan. Apa yang sebaiknya ia lakukan?',
        opsi: [
          { teks: 'Menunggu angin lebih kencang atau memakai layangan yang lebih ringan', benar: true,
            alasan: 'Layangan baru naik kalau gaya angkat melebihi beratnya. Angin lebih kencang menambah gaya angkat; layangan lebih ringan mengurangi berat yang harus dilawan.' },
          { teks: 'Menambah panjang talinya supaya bisa terbang lebih tinggi',
            alasan: 'Tali yang panjang hanya menentukan seberapa jauh layangan bisa pergi, bukan apakah ia mampu naik. Kalau gaya angkatnya kurang, tali sepanjang apa pun tidak menolong.' },
          { teks: 'Menambah beban di ekor layangan supaya lebih stabil',
            alasan: 'Menambah beban justru menambah berat yang harus dilawan, sehingga layangan makin sulit naik.' },
          { teks: 'Membuat layangan lebih tegak, sekitar 80° terhadap angin',
            alasan: 'Terlalu curam membuat angin lebih banyak tertahan daripada mengangkat. Kemiringan paling efektif justru sekitar 20–30°.' }
        ],
        penguatan: 'Layangan naik bila gaya angkat > berat.'
      },
      {
        tanya: 'Apa fungsi utama ekor pada layangan tradisional?',
        opsi: [
          { teks: 'Menjaga keseimbangan supaya layangan tidak berputar-putar dan oleng', benar: true,
            alasan: 'Ekor memberi hambatan tambahan di bagian bawah, sehingga layangan tetap menghadap angin dengan posisi yang benar.' },
          { teks: 'Menambah gaya angkat sehingga layangan terbang lebih tinggi',
            alasan: 'Ekor justru menambah hambatan dan berat, jadi sedikit mengurangi gaya angkat. Manfaatnya ada pada kestabilan, bukan ketinggian.' },
          { teks: 'Sekadar hiasan agar layangan terlihat indah di langit',
            alasan: 'Hiasan memang salah satu alasannya, tetapi fungsi utamanya benar-benar teknis. Coba lepas ekornya di simulasi — layangan jadi jauh lebih liar.' }
        ],
        penguatan: 'Ekor = penyeimbang, bukan penambah daya angkat.'
      }
    ]
  });
})(window.RPN = window.RPN || {});
