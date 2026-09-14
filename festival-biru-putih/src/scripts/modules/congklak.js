/* ============================================================
   MODUL 4 — CONGKLAK
   Fokus SMP (Fase D Matematika): pola bilangan berulang dan
   pembagian bersisa (Kelas VII), serta penalaran logis.

   Materi tingkat lanjut dihapus: algoritma Minimax, pemangkasan
   alfa-beta, teori permainan zero-sum, dan fungsi evaluasi V(s).
   Lawan komputer kini memakai strategi satu langkah ke depan
   yang bisa dijelaskan kepada murid.

   CATATAN KEILMUAN: satu putaran penuh seorang pemain melewati
   15 lubang, bukan 16, karena rumah lawan selalu dilewati.
   Jadi pembagian bersisanya memakai angka 15.
   ============================================================ */
(function (RPN) {
  'use strict';
  var U = RPN.ui, el = U.el;

  var RUMAH_1 = 7, RUMAH_2 = 15;
  /* Urutan lubang yang dilewati tiap pemain (15 posisi) */
  var JALUR = {
    1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    2: [8, 9, 10, 11, 12, 13, 14, 15, 0, 1, 2, 3, 4, 5, 6]
  };

  RPN.app.daftarkan({
    id: 'congklak',
    judul: 'Congklak',
    ikon: '🐚',
    warna: 'hijau',
    latar: 'linear-gradient(150deg,#f4e7d6,#e4f2ea)',
    mapel: 'Matematika · Pola & Sisa Bagi',
    fase: 'Fase D · Kelas VII–VIII',
    ringkas: 'Menghitung mundur sebelum melangkah: temukan pola putaran 15 lubang.',
    langkah: ['Amati', 'Prediksi', 'Bertanding'],

    buat: function (dom) {
      /* ---------------- keadaan ---------------- */
      var papan = null, pemain = 1, sedangJalan = false;
      var lawanKomputer = false, kecepatan = 230;
      var bijiAwal = 7;
      var menang = { p1: 0, p2: 0, seri: 0 };
      var langkahKini = 0, tabel = null;
      var elPapan = null, elLubang = [], elJumlah = [], elPesan = null;
      var uGiliran, uRumah1, uRumah2, uPesan;
      var prediksiAktif = false;

      function barus() {
        papan = [];
        for (var i = 0; i < 16; i++) papan[i] = bijiAwal;
        papan[RUMAH_1] = 0; papan[RUMAH_2] = 0;
        pemain = 1;
      }
      barus();

      /* ---------------- bangun papan ---------------- */
      function pasangDom(d) {
        d.sim.innerHTML = '';
        d.sim.style.background = 'linear-gradient(160deg,#fdf6ea,#f2e3cd)';
        d.sim.style.display = 'flex';
        d.sim.style.alignItems = 'center';
        d.sim.style.justifyContent = 'center';
        d.sim.style.padding = '14px';

        elPapan = el('div', '');
        elPapan.style.cssText =
          'display:grid;grid-template-columns:78px 1fr 78px;gap:12px;align-items:center;' +
          'width:100%;max-width:780px;background:linear-gradient(150deg,#8a5a2b,#6b4420);' +
          'border:3px solid #5a3616;border-radius:30px;padding:14px;' +
          'box-shadow:inset 0 3px 12px rgba(0,0,0,.35), 0 8px 20px rgba(90,54,22,.3)';

        elLubang = []; elJumlah = [];

        elPapan.appendChild(buatRumah(RUMAH_2, 'Rumah\nLawan'));

        var tengah = el('div', '');
        tengah.style.cssText = 'display:flex;flex-direction:column;gap:9px';

        var barisAtas = el('div', '');
        barisAtas.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:7px';
        [14, 13, 12, 11, 10, 9, 8].forEach(function (i) { barisAtas.appendChild(buatLubang(i, 2)); });
        tengah.appendChild(barisAtas);

        var panah = el('div', '');
        panah.style.cssText = 'display:flex;justify-content:space-between;padding:0 6px;' +
                              'font-size:10.5px;font-weight:700;color:rgba(255,255,255,.72)';
        panah.innerHTML = '<span>← arah jalan Lawan</span><span>arah jalanmu →</span>';
        tengah.appendChild(panah);

        var barisBawah = el('div', '');
        barisBawah.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:7px';
        [0, 1, 2, 3, 4, 5, 6].forEach(function (i) { barisBawah.appendChild(buatLubang(i, 1)); });
        tengah.appendChild(barisBawah);

        elPapan.appendChild(tengah);
        elPapan.appendChild(buatRumah(RUMAH_1, 'Rumah\nKamu'));
        d.sim.appendChild(elPapan);

        d.ukur.innerHTML = '';
        uGiliran = U.ukur({ nama: 'Giliran', satuan: '' });
        uRumah1  = U.ukur({ nama: 'Biji di Rumahmu', satuan: 'biji', warna: 'hijau', maks: 98 });
        uRumah2  = U.ukur({ nama: 'Biji Rumah Lawan', satuan: 'biji', warna: 'merah', maks: 98 });
        uPesan   = U.ukur({ nama: 'Kejadian Terakhir', satuan: '', warna: 'kuning' });
        [uGiliran, uRumah1, uRumah2, uPesan].forEach(function (u) { d.ukur.appendChild(u); });
        segarkan();
      }

      function buatLubang(i, sisi) {
        var b = el('button', '');
        b.type = 'button';
        b.dataset.lubang = i;
        b.style.cssText =
          'position:relative;aspect-ratio:1;min-height:44px;border-radius:50%;border:2px solid #5a3616;' +
          'background:radial-gradient(circle at 50% 38%, #3d2109 0%, #52300f 70%, #6b4420 100%);' +
          'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;' +
          'box-shadow:inset 0 5px 9px rgba(0,0,0,.7);transition:transform .15s, box-shadow .15s, border-color .15s;' +
          'cursor:pointer;padding:2px';
        var no = el('span', '');
        no.style.cssText = 'font-size:9px;font-family:var(--f-num);color:rgba(255,255,255,.42);line-height:1';
        no.textContent = '#' + i;
        var jml = el('span', '');
        jml.style.cssText = 'font-size:17px;font-weight:800;color:' + (sisi === 1 ? '#ffd88a' : '#a9e3c2') + ';line-height:1';
        b.appendChild(no); b.appendChild(jml);
        b.addEventListener('click', function () { klikLubang(i); });
        elLubang[i] = b; elJumlah[i] = jml;
        return b;
      }

      function buatRumah(i, nama) {
        var w = el('div', '');
        w.style.cssText =
          'height:160px;border-radius:39px;border:3px solid #5a3616;' +
          'background:radial-gradient(circle at 50% 30%, #3d2109 0%, #52300f 75%, #6b4420 100%);' +
          'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;' +
          'box-shadow:inset 0 7px 14px rgba(0,0,0,.75)';
        var lbl = el('span', '');
        lbl.style.cssText = 'font-size:9.5px;font-weight:800;text-align:center;line-height:1.25;' +
                            'color:' + (i === RUMAH_1 ? '#ffd88a' : '#a9e3c2') + ';white-space:pre-line';
        lbl.textContent = nama;
        var jml = el('span', '');
        jml.style.cssText = 'font-size:26px;font-weight:800;font-family:var(--f-num);' +
                            'color:' + (i === RUMAH_1 ? '#ffd88a' : '#a9e3c2');
        w.appendChild(lbl); w.appendChild(jml);
        elLubang[i] = w; elJumlah[i] = jml;
        return w;
      }

      /* ---------------- aturan permainan ---------------- */
      function milikku(i) { return i >= 0 && i <= 6; }
      function milikLawan(i) { return i >= 8 && i <= 14; }
      function seberang(i) { return 14 - i; }

      function lubangBerikut(sekarang, plr) {
        var jalur = JALUR[plr];
        var idx = jalur.indexOf(sekarang);
        return jalur[(idx + 1) % 15];
      }

      /* Prediksi tempat biji terakhir jatuh, lengkap dengan
         hitungan pembagian bersisa untuk ditampilkan ke murid. */
      function ramal(asal, plr) {
        var jalur = JALUR[plr];
        var n = papan[asal];
        if (n === 0) return null;
        var idxAsal = jalur.indexOf(asal);
        var total = idxAsal + n;
        var putaran = Math.floor(total / 15);
        var sisa = total % 15;
        return {
          jumlah: n, idxAsal: idxAsal, total: total,
          putaran: putaran, sisa: sisa, tujuan: jalur[sisa],
          jalur: jalur
        };
      }

      function tunda(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

      async function jalan(asal) {
        sedangJalan = true;
        var plr = pemain;
        var tangan = papan[asal];
        papan[asal] = 0;
        segarkan();

        var kini = asal, catatan = '';

        while (tangan > 0) {
          kini = lubangBerikut(kini, plr);
          tangan--;
          papan[kini]++;
          sorot(kini);
          if (kini === RUMAH_1 || kini === RUMAH_2) RPN.audio.efek.lonceng();
          else RPN.audio.efek.kayu();
          segarkan('Biji di tangan: ' + tangan);
          await tunda(kecepatan);
          lepasSorot(kini);

          if (tangan === 0) {
            var rumahSendiri = plr === 1 ? RUMAH_1 : RUMAH_2;
            if (kini === rumahSendiri) {
              catatan = 'Berhenti di rumah sendiri — jalan lagi!';
              RPN.audio.efek.hebat();
              break;                      // giliran tidak berpindah
            }
            if (papan[kini] > 1) {
              catatan = 'Lubang #' + kini + ' terisi — ambil semua, lanjut jalan';
              segarkan(catatan);
              await tunda(kecepatan);
              tangan = papan[kini];
              papan[kini] = 0;
              segarkan();
              continue;
            }
            /* Lubang tadinya kosong */
            var punyaSendiri = (plr === 1 && milikku(kini)) || (plr === 2 && milikLawan(kini));
            var lawanIsi = papan[seberang(kini)];
            if (punyaSendiri && lawanIsi > 0) {
              var rebut = lawanIsi + 1;
              papan[seberang(kini)] = 0;
              papan[kini] = 0;
              papan[rumahSendiri] += rebut;
              catatan = 'TEMBAK! Merebut ' + rebut + ' biji dari lubang #' + seberang(kini);
              RPN.audio.efek.hebat();
            } else {
              catatan = 'Mati di lubang #' + kini + ' — giliran berpindah';
              RPN.audio.efek.salah();
            }
            pemain = plr === 1 ? 2 : 1;
            break;
          }
        }

        sedangJalan = false;
        segarkan(catatan);

        if (selesai()) { umumkan(); return; }
        if (lawanKomputer && pemain === 2) {
          await tunda(520);
          langkahKomputer();
        }
      }

      function langkahLegal(plr) {
        var a = [], mulai = plr === 1 ? 0 : 8;
        for (var i = mulai; i < mulai + 7; i++) if (papan[i] > 0) a.push(i);
        return a;
      }

      /* Lawan komputer: melihat satu langkah ke depan, memilih
         yang paling menambah biji di rumahnya. Sederhana dan
         bisa dijelaskan kepada murid. */
      function langkahKomputer() {
        var pilihan = langkahLegal(2);
        if (!pilihan.length) { pemain = 1; segarkan(); return; }
        var terbaik = pilihan[0], nilaiTerbaik = -Infinity;
        pilihan.forEach(function (p) {
          var r = ramal(p, 2);
          var nilai = 0;
          if (r) {
            if (r.tujuan === RUMAH_2) nilai += 12;                       // dapat jalan lagi
            if (papan[r.tujuan] === 0 && milikLawan(r.tujuan)) nilai += papan[seberang(r.tujuan)];
            nilai += Math.floor((r.idxAsal + r.jumlah) / 15) * 2;        // melewati rumah sendiri
          }
          if (nilai > nilaiTerbaik) { nilaiTerbaik = nilai; terbaik = p; }
        });
        jalan(terbaik);
      }

      function klikLubang(i) {
        if (sedangJalan) return;
        if (papan[i] === 0) return;
        if (lawanKomputer && pemain === 2) return;
        if (pemain === 1 && !milikku(i)) return;
        if (pemain === 2 && !milikLawan(i)) return;
        if (prediksiAktif && langkahKini === 1) { tampilkanRamalan(i); return; }
        jalan(i);
      }

      function selesai() {
        return langkahLegal(1).length === 0 || langkahLegal(2).length === 0;
      }

      function umumkan() {
        /* Sisa biji masuk ke rumah pemiliknya */
        for (var i = 0; i <= 6; i++) { papan[RUMAH_1] += papan[i]; papan[i] = 0; }
        for (var j = 8; j <= 14; j++) { papan[RUMAH_2] += papan[j]; papan[j] = 0; }
        var a = papan[RUMAH_1], b = papan[RUMAH_2];
        var hasil = a > b ? 'Kamu menang!' : b > a ? 'Lawan menang' : 'Seri';
        if (a > b) menang.p1++; else if (b > a) menang.p2++; else menang.seri++;
        segarkan(hasil + ' (' + a + ' : ' + b + ')');
        RPN.audio.efek[a > b ? 'hebat' : 'salah']();
        if (tabel && langkahKini === 2) {
          tabel.tambah([lawanKomputer ? 'vs Komputer' : 'vs Teman', a, b, '<b>' + hasil + '</b>']);
        }
      }

      function sorot(i) {
        if (!elLubang[i]) return;
        elLubang[i].style.borderColor = '#f0c14b';
        elLubang[i].style.transform = 'scale(1.07)';
        elLubang[i].style.boxShadow = 'inset 0 4px 8px rgba(0,0,0,.6), 0 0 16px rgba(240,193,75,.8)';
      }
      function lepasSorot(i) {
        if (!elLubang[i]) return;
        elLubang[i].style.borderColor = '#5a3616';
        elLubang[i].style.transform = '';
        elLubang[i].style.boxShadow = 'inset 0 5px 9px rgba(0,0,0,.7)';
      }

      function segarkan(pesan) {
        for (var i = 0; i < 16; i++) if (elJumlah[i]) elJumlah[i].textContent = papan[i];

        for (var j = 0; j < 16; j++) {
          if (j === RUMAH_1 || j === RUMAH_2 || !elLubang[j]) continue;
          var bisa = !sedangJalan && papan[j] > 0 &&
                     ((pemain === 1 && milikku(j) && !(lawanKomputer && pemain === 2)) ||
                      (pemain === 2 && milikLawan(j) && !lawanKomputer));
          elLubang[j].style.opacity = bisa ? '1' : '.62';
          elLubang[j].style.cursor = bisa ? 'pointer' : 'default';
          elLubang[j].style.outline = bisa ? '2px solid rgba(240,193,75,.5)' : 'none';
          elLubang[j].style.outlineOffset = '2px';
        }

        if (uGiliran) {
          uGiliran.set(0, pemain === 1 ? 'Kamu' : (lawanKomputer ? 'Komputer' : 'Lawan'));
          uRumah1.set(papan[RUMAH_1], papan[RUMAH_1]);
          uRumah2.set(papan[RUMAH_2], papan[RUMAH_2]);
          if (pesan !== undefined) uPesan.set(0, pesan || '—');
        }
      }

      /* ---------------- panel ---------------- */
      function panelAmati(p) {
        p.appendChild(U.tajukPanel('Langkah 1 · Amati', 'Mulai di sini', 'hijau'));
        p.appendChild(el('p', 'teks-s lembut',
          'Ketuk salah satu lubang di baris <b>bawah</b> (milikmu). Semua bijinya akan ditaburkan ' +
          'satu per satu searah panah. Amati ke mana biji terakhir jatuh.'));

        p.appendChild(U.catatan('hijau', '📖 Empat aturan congklak',
          '<b>1.</b> Biji ditaburkan satu per satu, searah jarum jam.<br>' +
          '<b>2.</b> Kamu mengisi rumahmu sendiri, tapi <b>melewati</b> rumah lawan.<br>' +
          '<b>3.</b> Biji terakhir jatuh di lubang <b>terisi</b> → ambil semua, lanjut jalan.<br>' +
          '<b>4.</b> Biji terakhir jatuh di lubang <b>kosong milikmu</b> → <b>tembak!</b> ' +
          'Rebut semua biji di lubang seberangnya.'));

        p.appendChild(U.aksi([
          { teks: 'Papan baru', kelas: 'tbl-utama', ikon: RPN.app.IKON.ulang,
            aksi: function () { if (sedangJalan) return; barus(); segarkan('—'); RPN.audio.efek.klik(); } },
          { teks: 'Pelan', aksi: function () { kecepatan = 420; RPN.audio.efek.klik(); } },
          { teks: 'Cepat', aksi: function () { kecepatan = 110; RPN.audio.efek.klik(); } }
        ]));

        p.appendChild(U.catatan('kuning', '🤔 Pertanyaan pemantik',
          'Lubangmu ada 7, ditambah rumahmu, ditambah 7 lubang lawan. Rumah lawan tidak kamu isi. ' +
          'Jadi dalam <b>satu putaran penuh</b>, berapa lubang yang kamu lewati?'));

        p.appendChild(U.catatan('', '💡 Jawabannya',
          '7 + 1 + 7 = <b>15 lubang</b>. Angka 15 inilah kunci seluruh perhitungan congklak. ' +
          'Kalau kamu punya 15 biji di satu lubang, biji terakhir akan jatuh tepat di lubang asalmu lagi!'));
      }

      function panelPrediksi(p) {
        prediksiAktif = true;
        p.appendChild(U.tajukPanel('Langkah 2 · Prediksi', 'Sisa bagi', 'ungu'));
        p.appendChild(el('p', 'teks-s lembut',
          'Sekarang kita hitung dulu <b>sebelum</b> melangkah. Ketuk salah satu lubangmu, ' +
          'dan aku tunjukkan cara menebak di mana biji terakhir akan jatuh.'));

        var kotak = el('div', 'catatan catatan-ungu teks-s');
        kotak.innerHTML = '<span class="tajuk">Belum ada lubang dipilih</span>' +
                          'Ketuk salah satu lubang di baris bawah untuk melihat hitungannya.';
        p.appendChild(kotak);
        p._kotakRamal = kotak;

        p.appendChild(U.aksi([
          { teks: 'Jalankan langkah ini', kelas: 'tbl-utama', aksi: function () {
              if (p._pilihan == null || sedangJalan) return;
              prediksiAktif = false;
              jalan(p._pilihan);
              p._pilihan = null;
              setTimeout(function () { prediksiAktif = true; }, 60);
            } },
          { teks: 'Papan baru', ikon: RPN.app.IKON.ulang, aksi: function () {
              if (sedangJalan) return; barus(); segarkan('—'); RPN.audio.efek.klik(); } }
        ]));

        p.appendChild(U.catatan('', '📐 Cara menghitungnya',
          'Nomor urut lubang asal <b>+</b> jumlah biji <b>=</b> nomor urut tujuan.<br>' +
          'Kalau hasilnya lebih dari 15, bagi dengan 15 lalu ambil <b>sisanya</b>. ' +
          'Sisa itulah nomor urut tempat biji terakhir jatuh.'));

        p.appendChild(U.catatan('kuning', '🎯 Tantangan',
          'Cari lubang yang membuat biji terakhirmu jatuh <b>tepat di rumahmu</b> ' +
          '(nomor urut ke-7). Kalau berhasil, kamu dapat giliran tambahan!'));

        panelRamalRef = p;
      }

      var panelRamalRef = null;

      function tampilkanRamalan(i) {
        if (!panelRamalRef || !panelRamalRef._kotakRamal) return;
        var r = ramal(i, 1);
        if (!r) return;
        panelRamalRef._pilihan = i;
        RPN.audio.efek.klik();

        var namaTujuan = r.tujuan === RUMAH_1 ? '<b>RUMAHMU</b> 🏠'
                       : r.tujuan === RUMAH_2 ? 'rumah lawan'
                       : 'lubang #' + r.tujuan;
        var hitung = '';
        if (r.total < 15) {
          hitung = 'Urutan asal <b>' + r.idxAsal + '</b> + <b>' + r.jumlah + '</b> biji = urutan ke-<b>' +
                   r.total + '</b><br><span class="samar">(belum sampai satu putaran, jadi tidak perlu dibagi)</span>';
        } else {
          hitung = 'Urutan asal <b>' + r.idxAsal + '</b> + <b>' + r.jumlah + '</b> biji = <b>' + r.total + '</b><br>' +
                   '<b>' + r.total + '</b> ÷ 15 = <b>' + r.putaran + '</b> putaran <b>sisa ' + r.sisa + '</b><br>' +
                   '<span class="samar">Jadi berhenti di urutan ke-' + r.sisa + '.</span>';
        }

        var akibat = '';
        if (r.tujuan === RUMAH_1) akibat = '🎉 Kamu akan dapat <b>jalan lagi</b>!';
        else if (papan[r.tujuan] === 0 && milikku(r.tujuan)) {
          var rebut = papan[seberang(r.tujuan)];
          akibat = rebut > 0
            ? '💥 <b>Tembak!</b> Kamu akan merebut ' + (rebut + 1) + ' biji.'
            : '😔 Lubang seberang kosong, jadi kamu hanya <b>mati</b> di sana.';
        } else if (papan[r.tujuan] > 0) {
          akibat = '🔁 Lubang tujuan terisi, jadi kamu akan <b>mengambil ' +
                   papan[r.tujuan] + ' biji</b> lalu lanjut berjalan.';
        }

        panelRamalRef._kotakRamal.innerHTML =
          '<span class="tajuk">Lubang #' + i + ' berisi ' + r.jumlah + ' biji</span>' +
          hitung + '<br><br>Biji terakhir jatuh di ' + namaTujuan + '.<br>' + akibat;

        for (var k = 0; k < 16; k++) if (k !== r.tujuan) lepasSorot(k);
        sorot(r.tujuan);
      }

      function panelBertanding(p) {
        prediksiAktif = false;
        p.appendChild(U.tajukPanel('Langkah 3 · Bertanding', 'Tantangan', 'hijau'));
        p.appendChild(el('p', 'teks-s lembut',
          'Pakai kemampuan berhitungmu untuk mengalahkan lawan. Hasil tiap pertandingan dicatat.'));

        p.appendChild(el('div', 'teks-s', '<b>Lawan main</b>'));
        p.appendChild(U.pilihan({
          kolom: 2, terpilih: lawanKomputer ? 'komputer' : 'teman',
          daftar: [
            { id: 'teman', ikon: '👥', tajuk: 'Dua Pemain', ket: 'Bergantian satu perangkat' },
            { id: 'komputer', ikon: '🤖', tajuk: 'Lawan Komputer', ket: 'Berhitung 1 langkah' }
          ],
          saatPilih: function (id) {
            lawanKomputer = (id === 'komputer');
            if (sedangJalan) return;
            barus(); segarkan('—');
          }
        }));

        p.appendChild(U.penggeser({
          nama: 'Biji awal tiap lubang', min: 3, max: 7, step: 1, nilai: bijiAwal,
          format: function (v) { return v + ' biji (putaran tetap 15 lubang)'; },
          skala: ['3', '5', '7'],
          saatUbah: function (v) { bijiAwal = v; if (!sedangJalan) { barus(); segarkan('—'); } }
        }));

        tabel = U.tabelCatat(['Lawan', 'Kamu', 'Dia', 'Hasil']);
        p.appendChild(tabel);

        p.appendChild(U.aksi([
          { teks: 'Mulai pertandingan baru', kelas: 'tbl-utama', ikon: RPN.app.IKON.ulang,
            aksi: function () { if (sedangJalan) return; barus(); segarkan('—'); RPN.audio.efek.klik(); } }
        ]));

        p.appendChild(U.catatan('', '🤖 Cara komputer berpikir',
          'Komputer tidak menebak-nebak. Untuk setiap lubang yang boleh ia ambil, ia menghitung ' +
          'dulu ke mana biji terakhir jatuh, lalu memilih langkah yang <b>paling banyak menambah biji ' +
          'di rumahnya</b>. Kamu bisa melakukan hal yang sama — itu bukan sihir, hanya berhitung.'));

        p.appendChild(U.catatan('ungu', '🏛️ Kaitan budaya',
          'Permainan ini punya banyak nama di Nusantara: <b>Congklak</b> (Jawa/Betawi), ' +
          '<b>Dakon</b> (Jawa Tengah), <b>Congkak</b> (Melayu), <b>Mokaotan</b> (Minahasa), dan ' +
          '<b>Nogarata</b> (Rote). Papan tertua dari batu ditemukan di berbagai situs kuno — ' +
          'permainan berhitung ini diperkirakan sudah berumur ribuan tahun.'));
      }

      pasangDom(dom);

      return {
        gambarPanel: function (i, p) {
          langkahKini = i;
          if (i === 0) panelAmati(p);
          else if (i === 1) panelPrediksi(p);
          else panelBertanding(p);
        },
        keLangkah: function (i) {
          langkahKini = i;
          prediksiAktif = (i === 1);
          if (i !== 2) tabel = null;
          for (var k = 0; k < 16; k++) lepasSorot(k);
          segarkan();
        },
        ukurUlang: function () {},
        pindahWadah: function (d) { pasangDom(d); },
        lepas: function () { sedangJalan = false; }
      };
    },

    kuis: [
      {
        tanya: 'Dalam congklak, seorang pemain mengisi 7 lubang miliknya, rumahnya sendiri, dan 7 lubang lawan — tetapi melewati rumah lawan. Berapa lubang yang dilewati dalam satu putaran penuh?',
        petunjuk: 'Jumlahkan: lubang sendiri + rumah sendiri + lubang lawan.',
        opsi: [
          { teks: '15 lubang', benar: true,
            alasan: '7 lubang sendiri + 1 rumah sendiri + 7 lubang lawan = 15. Rumah lawan tidak dihitung karena selalu dilewati.' },
          { teks: '16 lubang',
            alasan: 'Angka 16 adalah jumlah seluruh lubang di papan. Tetapi rumah lawan tidak pernah diisi, jadi tidak ikut dihitung dalam putaranmu.' },
          { teks: '14 lubang',
            alasan: '14 adalah jumlah lubang kecil saja. Rumahmu sendiri juga diisi, jadi harus ikut dihitung.' },
          { teks: '7 lubang',
            alasan: 'Tujuh hanyalah jumlah lubang di sisimu. Penaburan biji juga berlanjut melewati rumahmu dan masuk ke wilayah lawan.' }
        ],
        penguatan: 'Satu putaran congklak = 15 lubang.'
      },
      {
        tanya: 'Rani mengambil 20 biji dari lubang yang nomor urutnya 0. Berapa sisa pembagian 20 dengan 15, dan di urutan ke berapa biji terakhirnya jatuh?',
        petunjuk: '20 ÷ 15 = berapa putaran, sisa berapa?',
        opsi: [
          { teks: '1 putaran sisa 5, jadi jatuh di urutan ke-5', benar: true,
            alasan: '20 = (1 × 15) + 5. Setelah satu putaran penuh, tersisa 5 langkah lagi, jadi berhenti di urutan ke-5.' },
          { teks: '1 putaran sisa 20, jadi jatuh di urutan ke-20',
            alasan: 'Sisa pembagian tidak mungkin lebih besar daripada pembaginya. Kalau sisanya 20, artinya masih bisa dibagi 15 sekali lagi.' },
          { teks: '2 putaran sisa 0, jadi jatuh di urutan ke-0',
            alasan: 'Dua putaran berarti 30 biji, padahal Rani hanya punya 20. Cek lagi: 20 ÷ 15 hanya cukup untuk satu putaran.' },
          { teks: '0 putaran sisa 20, jadi jatuh di urutan ke-20',
            alasan: '20 lebih besar daripada 15, jadi pasti ada minimal satu putaran penuh yang selesai.' }
        ],
        penguatan: 'Sisa pembagian selalu lebih kecil daripada pembaginya.'
      },
      {
        tanya: 'Kapan seorang pemain congklak mendapat giliran tambahan ("jalan lagi")?',
        opsi: [
          { teks: 'Ketika biji terakhir jatuh tepat di rumahnya sendiri', benar: true,
            alasan: 'Hanya biji terakhir yang mendarat pas di rumah sendiri yang memberi giliran tambahan. Inilah yang dikejar pemain berpengalaman.' },
          { teks: 'Ketika biji terakhir jatuh di lubang kosong miliknya',
            alasan: 'Itu peristiwa "tembak" — pemain merebut biji lawan, tetapi gilirannya tetap berakhir.' },
          { teks: 'Ketika biji terakhir jatuh di lubang yang masih terisi',
            alasan: 'Saat itu pemain memang melanjutkan menabur, tetapi itu masih dalam giliran yang sama, bukan giliran tambahan yang baru.' },
          { teks: 'Ketika berhasil melewati rumah lawan tanpa mengisinya',
            alasan: 'Melewati rumah lawan adalah aturan biasa yang terjadi setiap putaran, bukan hadiah khusus.' }
        ],
        penguatan: 'Biji terakhir di rumah sendiri = bonus giliran.'
      },
      {
        tanya: 'Lubang milikmu yang nomor urutnya 3 berisi 4 biji. Ke mana biji terakhir akan jatuh, dan apa akibatnya?',
        petunjuk: 'Rumahmu ada di urutan ke-7. Hitung: 3 + 4 = ?',
        opsi: [
          { teks: 'Tepat di rumahmu, sehingga kamu dapat jalan lagi', benar: true,
            alasan: '3 + 4 = 7, dan urutan ke-7 adalah rumahmu sendiri. Biji terakhir mendarat pas di sana, jadi kamu mendapat giliran tambahan.' },
          { teks: 'Di lubang lawan, sehingga gilirannya berpindah',
            alasan: 'Lubang lawan baru dimulai dari urutan ke-8. Hasil hitunganmu 3 + 4 = 7, masih berhenti tepat di rumahmu.' },
          { teks: 'Di lubang kosong milikmu, sehingga terjadi tembak',
            alasan: 'Urutan ke-7 bukan lubang kecil, melainkan rumahmu sendiri. Peristiwa tembak hanya terjadi di lubang kecil.' },
          { teks: 'Kembali ke lubang asal karena satu putaran penuh',
            alasan: 'Kembali ke lubang asal butuh tepat 15 biji. Di sini bijinya hanya 4, jadi belum satu putaran.' }
        ],
        penguatan: 'Hitung dulu sebelum melangkah — itulah matematika congklak.'
      }
    ]
  });
})(window.RPN = window.RPN || {});
