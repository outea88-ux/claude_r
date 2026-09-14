/* ============================================================
   quiz.js — mesin asesmen formatif.
   Setiap pilihan punya penjelasan sendiri, sehingga umpan balik
   tidak berhenti di "benar/salah" tetapi meluruskan miskonsepsi.
   ============================================================ */
(function (RPN) {
  'use strict';

  var HURUF = ['A', 'B', 'C', 'D', 'E'];

  function el(tag, kelas, isi) {
    var n = document.createElement(tag);
    if (kelas) n.className = kelas;
    if (isi != null) n.innerHTML = isi;
    return n;
  }

  /**
   * Membuat sesi kuis.
   * @param {HTMLElement} wadah  tempat kuis digambar
   * @param {Array} soal        daftar soal
   * @param {Object} opsi       { judul, saatSelesai(benar, total) }
   */
  function buat(wadah, soal, opsi) {
    opsi = opsi || {};
    var ke = 0, benar = 0, terjawab = false;

    function gambar() {
      wadah.innerHTML = '';
      if (ke >= soal.length) return selesai();

      var s = soal[ke];
      var kotak = el('div', 'kolom g4 muncul');

      /* Kepala: nomor soal + indikator progres */
      var kepala = el('div', 'baris antara g3');
      kepala.appendChild(el('span', 'lencana', 'Soal ' + (ke + 1) + ' dari ' + soal.length));
      var skor = el('span', 'teks-s lembut angka', 'Benar: ' + benar);
      kepala.appendChild(skor);
      kotak.appendChild(kepala);

      /* Pertanyaan */
      kotak.appendChild(el('p', 'kuis-soal', s.tanya));

      if (s.petunjuk) {
        kotak.appendChild(el('div', 'catatan catatan-kuning teks-s',
          '<span class="tajuk">Petunjuk</span>' + s.petunjuk));
      }

      /* Pilihan jawaban */
      var daftar = el('div', 'kuis-opsi');
      s.opsi.forEach(function (o, i) {
        var b = el('button', 'opsi');
        b.type = 'button';
        b.appendChild(el('span', 'huruf', HURUF[i]));
        b.appendChild(el('span', '', o.teks));
        b.addEventListener('click', function () { jawab(i, daftar, kotak, s); });
        daftar.appendChild(b);
      });
      kotak.appendChild(daftar);

      wadah.appendChild(kotak);
      terjawab = false;
    }

    function jawab(pilih, daftar, kotak, s) {
      if (terjawab) return;
      terjawab = true;

      var tombol = daftar.querySelectorAll('.opsi');
      var betul = s.opsi[pilih].benar === true;
      if (betul) benar++;

      for (var i = 0; i < tombol.length; i++) {
        tombol[i].disabled = true;
        if (s.opsi[i].benar) tombol[i].classList.add('benar');
        else if (i === pilih) tombol[i].classList.add('salah');
      }

      RPN.audio.efek[betul ? 'benar' : 'salah']();

      /* Umpan balik konstruktif: alasan pilihan yang dipilih,
         lalu penguatan konsep yang benar. */
      var umpan = el('div', 'catatan ' + (betul ? 'catatan-hijau' : 'catatan-merah') + ' muncul');
      var judul = betul ? 'Tepat sekali!' : 'Belum tepat — ini sebabnya';
      var isi = '<span class="tajuk">' + judul + '</span>' + (s.opsi[pilih].alasan || '');
      if (!betul) {
        var kunci = s.opsi.filter(function (o) { return o.benar; })[0];
        if (kunci) isi += '<br><br><b>Jawaban yang tepat:</b> ' + kunci.teks +
                          (kunci.alasan ? ' — ' + kunci.alasan : '');
      }
      if (s.penguatan) isi += '<br><br><b>Ingat:</b> ' + s.penguatan;
      umpan.innerHTML = isi;
      kotak.appendChild(umpan);

      var kaki = el('div', 'baris tengah g3');
      var lanjut = el('button', 'tbl tbl-utama',
        (ke + 1 < soal.length ? 'Soal berikutnya' : 'Lihat hasil') +
        ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>');
      lanjut.type = 'button';
      lanjut.addEventListener('click', function () { ke++; RPN.audio.efek.klik(); gambar(); });
      kaki.appendChild(lanjut);
      kotak.appendChild(kaki);
      /* Fokus tanpa menggulung paksa, lalu geser seperlunya saja
         supaya pertanyaan di atas tidak ikut terpotong. */
      lanjut.focus({ preventScroll: true });
      if (umpan.scrollIntoView) umpan.scrollIntoView({ block: 'nearest' });
    }

    function selesai() {
      var persen = Math.round(benar / soal.length * 100);
      var lulus = persen >= 60;
      var kotak = el('div', 'kolom g4 muncul');
      kotak.style.textAlign = 'center';
      kotak.style.alignItems = 'center';

      kotak.appendChild(el('div', '', '<div style="font-size:56px;line-height:1">' +
        (persen === 100 ? '🏆' : lulus ? '🎉' : '💪') + '</div>'));
      kotak.appendChild(el('h3', 'judul-l', lulus ? 'Kerja bagus!' : 'Ayo coba sekali lagi'));
      kotak.appendChild(el('p', 'teks lembut',
        'Kamu menjawab benar <b>' + benar + ' dari ' + soal.length + '</b> soal (' + persen + '%).'));

      if (!lulus) {
        kotak.appendChild(el('div', 'catatan catatan-kuning teks-s',
          '<span class="tajuk">Saran</span>Buka kembali simulasinya, ubah satu pengaturan saja, ' +
          'lalu amati apa yang berubah. Setelah itu kerjakan kuis ini lagi.'));
      }

      var kaki = el('div', 'baris tengah g3 bungkus');
      var ulang = el('button', 'tbl tbl-garis', 'Ulangi kuis');
      ulang.type = 'button';
      ulang.addEventListener('click', function () {
        ke = 0; benar = 0; RPN.audio.efek.klik(); gambar();
      });
      kaki.appendChild(ulang);
      kotak.appendChild(kaki);

      wadah.innerHTML = '';
      wadah.appendChild(kotak);

      if (persen === 100) RPN.audio.efek.hebat();
      if (opsi.saatSelesai) opsi.saatSelesai(benar, soal.length);
    }

    gambar();
    return { ulangi: function () { ke = 0; benar = 0; gambar(); } };
  }

  RPN.kuis = { buat: buat };
})(window.RPN = window.RPN || {});
