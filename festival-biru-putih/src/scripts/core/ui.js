/* ============================================================
   ui.js — potongan antarmuka yang dipakai berulang oleh modul:
   penggeser, panel ukur, pilihan preset, kotak catatan.
   ============================================================ */
(function (RPN) {
  'use strict';

  function el(tag, kelas, isi) {
    var n = document.createElement(tag);
    if (kelas) n.className = kelas;
    if (isi != null) n.innerHTML = isi;
    return n;
  }

  /**
   * Penggeser bernilai.
   * o = { nama, min, max, step, nilai, format(v), skala:[kiri,tengah,kanan], saatUbah(v) }
   */
  function penggeser(o) {
    var w = el('div', 'penggeser');
    var kepala = el('div', 'kepala');
    kepala.appendChild(el('span', 'nama', o.nama));
    var nilai = el('span', 'nilai', o.format ? o.format(o.nilai) : o.nilai);
    kepala.appendChild(nilai);
    w.appendChild(kepala);

    var inp = document.createElement('input');
    inp.type = 'range';
    inp.min = o.min; inp.max = o.max; inp.step = o.step; inp.value = o.nilai;
    inp.setAttribute('aria-label', o.nama);
    w.appendChild(inp);

    if (o.skala) {
      var sk = el('div', 'skala');
      o.skala.forEach(function (t) { sk.appendChild(el('span', '', t)); });
      w.appendChild(sk);
    }

    inp.addEventListener('input', function () {
      var v = parseFloat(inp.value);
      nilai.innerHTML = o.format ? o.format(v) : v;
      if (o.saatUbah) o.saatUbah(v);
    });

    w.setNilai = function (v) {
      inp.value = v;
      nilai.innerHTML = o.format ? o.format(v) : v;
    };
    return w;
  }

  /**
   * Panel ukur (HUD).
   * o = { nama, satuan, warna:'kuning|hijau|ungu|merah', maks }
   * Mengembalikan elemen dengan method .set(nilai, teksOpsional)
   */
  function ukur(o) {
    var w = el('div', 'ukur' + (o.warna ? ' ukur-' + o.warna : ''));
    w.appendChild(el('div', 'nama', o.nama));
    var baris = el('div', 'baris g1');
    baris.style.alignItems = 'baseline';
    var n = el('span', 'nilai', '0');
    baris.appendChild(n);
    if (o.satuan) baris.appendChild(el('span', 'satuan', o.satuan));
    w.appendChild(baris);
    var bar = el('div', 'bar', '<i></i>');
    w.appendChild(bar);
    var isiBar = bar.firstChild;

    w.set = function (v, teks) {
      n.textContent = teks != null ? teks : v;
      if (o.maks) isiBar.style.width = Math.max(0, Math.min(100, v / o.maks * 100)) + '%';
    };
    return w;
  }

  /**
   * Kelompok pilihan berbentuk kartu (preset).
   * o = { kolom, daftar:[{id, ikon, tajuk, ket}], terpilih, saatPilih(id) }
   */
  function pilihan(o) {
    var w = el('div', 'pilihan-grid');
    w.style.gridTemplateColumns = 'repeat(' + (o.kolom || o.daftar.length) + ', 1fr)';
    var tombol = {};
    o.daftar.forEach(function (d) {
      var b = el('button', 'pilihan');
      b.type = 'button';
      b.setAttribute('aria-pressed', d.id === o.terpilih ? 'true' : 'false');
      if (d.ikon) b.appendChild(el('span', 'ikon', d.ikon));
      b.appendChild(el('span', 'tajuk', d.tajuk));
      if (d.ket) b.appendChild(el('span', 'ket', d.ket));
      b.addEventListener('click', function () {
        for (var k in tombol) tombol[k].setAttribute('aria-pressed', 'false');
        b.setAttribute('aria-pressed', 'true');
        RPN.audio.efek.klik();
        if (o.saatPilih) o.saatPilih(d.id);
      });
      tombol[d.id] = b;
      w.appendChild(b);
    });
    w.pilih = function (id) {
      for (var k in tombol) tombol[k].setAttribute('aria-pressed', k === id ? 'true' : 'false');
    };
    return w;
  }

  /* Kotak catatan berwarna */
  function catatan(warna, tajuk, isi) {
    return el('div', 'catatan' + (warna ? ' catatan-' + warna : '') + ' teks-s',
      (tajuk ? '<span class="tajuk">' + tajuk + '</span>' : '') + isi);
  }

  /* Judul kecil untuk bagian panel */
  function tajukPanel(teks, lencana, warnaLencana) {
    var w = el('div', 'baris antara g2');
    w.appendChild(el('div', 'judul-s', teks));
    if (lencana) w.appendChild(el('span', 'lencana lencana-' + (warnaLencana || 'biru'), lencana));
    return w;
  }

  /* Baris tombol aksi */
  function aksi(daftar) {
    var w = el('div', 'baris g2 bungkus');
    daftar.forEach(function (d) {
      var b = el('button', 'tbl tbl-kecil ' + (d.kelas || 'tbl-garis'),
        (d.ikon ? d.ikon + ' ' : '') + '<span>' + d.teks + '</span>');
      b.type = 'button';
      b.addEventListener('click', d.aksi);
      if (d.simpan) d.simpan(b);
      w.appendChild(b);
    });
    return w;
  }

  /* Tabel kecil untuk mencatat hasil percobaan (Langkah "Bandingkan") */
  function tabelCatat(kolom) {
    var w = el('div', '');
    w.style.border = '1px solid var(--c-line)';
    w.style.borderRadius = 'var(--r-md)';
    w.style.overflow = 'hidden';
    var t = document.createElement('table');
    t.style.width = '100%';
    t.style.borderCollapse = 'collapse';
    t.style.fontSize = '12.5px';
    var thead = document.createElement('thead');
    var tr = document.createElement('tr');
    kolom.forEach(function (k) {
      var th = document.createElement('th');
      th.textContent = k;
      th.style.cssText = 'text-align:left;padding:7px 9px;background:var(--c-surface-2);' +
                         'font-size:11px;text-transform:uppercase;letter-spacing:.03em;color:var(--c-ink-faint)';
      tr.appendChild(th);
    });
    thead.appendChild(tr); t.appendChild(thead);
    var tbody = document.createElement('tbody');
    t.appendChild(tbody); w.appendChild(t);

    w.tambah = function (sel) {
      var r = document.createElement('tr');
      sel.forEach(function (s, i) {
        var td = document.createElement('td');
        td.innerHTML = s;
        td.style.cssText = 'padding:7px 9px;border-top:1px solid var(--c-line-soft);' +
                           (i === 0 ? 'font-weight:700;' : 'font-family:var(--f-num);');
        r.appendChild(td);
      });
      tbody.insertBefore(r, tbody.firstChild);
      while (tbody.children.length > 6) tbody.removeChild(tbody.lastChild);
    };
    w.kosong = function () { tbody.innerHTML = ''; };
    w.jumlahBaris = function () { return tbody.children.length; };
    return w;
  }

  RPN.ui = {
    el: el, penggeser: penggeser, ukur: ukur, pilihan: pilihan,
    catatan: catatan, tajukPanel: tajukPanel, aksi: aksi, tabelCatat: tabelCatat
  };
})(window.RPN = window.RPN || {});
