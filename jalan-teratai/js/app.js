(function () {
  'use strict';

  const M = window.MATERI;
  const KEY = 'jalan-teratai-v1';
  const $layar = document.getElementById('layar');
  const $meta = document.getElementById('topbar-meta');

  // ---------- Aturan permainan ----------
  const LEVEL_XP = [0, 100, 250, 450];
  const TAHAP = {
    teratai: ['Benih', 'Tunas', 'Kuncup', 'Teratai Mekar'],
    bodhi: ['Biji', 'Tunas', 'Pohon Muda', 'Pohon Bodhi']
  };
  const WARNA = {
    merah: { nama: 'Merah muda', hex: '#ef8fb3' },
    putih: { nama: 'Putih', hex: '#f6f1e7' },
    biru: { nama: 'Biru', hex: '#7fb2ff' },
    emas: { nama: 'Emas', hex: '#f2c14e' }
  };
  const POIN = { pg: 10, esai: 15 };
  const XP_MISI = { menang: 40, kalah: 10 };
  const ITEM = {
    double: { nama: 'Double Poin', ket: 'Jawaban benar berikutnya bernilai 2×.', dari: 'Misi Tetris berhasil' },
    perisai: { nama: 'Perisai', ket: 'Streak tidak putus saat jawaban salah.', dari: 'Streak 3 jawaban benar' },
    petunjuk: { nama: 'Petunjuk', ket: 'PG: hapus 2 opsi salah. Esai: huruf pertama.', dari: 'Hadiah awal' },
    pilih: { nama: 'Pilih Soal', ket: 'Pilih sendiri PG atau esai untuk soal ini.', dari: 'Menyelesaikan 1 modul' },
    bom: { nama: 'Bom Baris', ket: 'Hapus baris paling bawah di Tetris.', dari: 'Jawaban esai benar' }
  };
  const IKON = {
    double: '<text x="12" y="16.5" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" font-family="Fredoka, sans-serif">×2</text>',
    perisai: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    petunjuk: '<circle cx="12" cy="10" r="5.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.5 18h5M10.5 21h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    pilih: '<rect x="3" y="5" width="8" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13" y="5" width="8" height="14" rx="2" fill="currentColor"/>',
    bom: '<circle cx="11" cy="14" r="6.5" fill="currentColor"/><path d="M15 9l3-3M18 6h2M18 6V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
  };
  const ikon = k => `<svg class="ikon" viewBox="0 0 24 24" aria-hidden="true">${IKON[k]}</svg>`;

  // ---------- Penyimpanan ----------
  function stateAwal() {
    return {
      profil: { nama: '', jenis: 'teratai', warna: 'merah' },
      xp: 0,
      inv: { double: 0, perisai: 0, petunjuk: 1, pilih: 0, bom: 0 },
      penguasaan: [],
      baru: true
    };
  }
  function muat() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw), a = stateAwal();
        return { ...a, ...s, profil: { ...a.profil, ...s.profil }, inv: { ...a.inv, ...s.inv } };
      }
    } catch (e) { /* penyimpanan tidak tersedia: mulai dari awal */ }
    return stateAwal();
  }
  function simpan() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* abaikan */ }
  }
  let S = muat();

  // ---------- Utilitas ----------
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const normal = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
  const acak = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  function level(xp) {
    let l = 0;
    LEVEL_XP.forEach((min, i) => { if (xp >= min) l = i; });
    return l; // 0..3
  }
  function namaPemain() { return S.profil.nama || 'Sahabat Dhamma'; }

  // ---------- Avatar ----------
  function wajah(cx, cy, s, gelap) {
    const w = gelap || '#2a1d14';
    return `<g>
      <circle cx="${cx - 4 * s}" cy="${cy}" r="${1.6 * s}" fill="${w}"/>
      <circle cx="${cx + 4 * s}" cy="${cy}" r="${1.6 * s}" fill="${w}"/>
      <path d="M${cx - 3 * s} ${cy + 3.2 * s} Q${cx} ${cy + 6 * s} ${cx + 3 * s} ${cy + 3.2 * s}" fill="none" stroke="${w}" stroke-width="${1.3 * s}" stroke-linecap="round"/>
      <circle cx="${cx - 7 * s}" cy="${cy + 3 * s}" r="${1.5 * s}" fill="#ef8fb3" opacity=".55"/>
      <circle cx="${cx + 7 * s}" cy="${cy + 3 * s}" r="${1.5 * s}" fill="#ef8fb3" opacity=".55"/>
    </g>`;
  }
  function avatarSVG(jenis, tahap, warna, label) {
    const c = WARNA[warna].hex;
    let isi = '';
    if (jenis === 'teratai') {
      isi += `<rect x="0" y="90" width="120" height="30" fill="#24386e"/>
        <path d="M0 92 Q15 87 30 92 T60 92 T90 92 T120 92" fill="none" stroke="#3b5aa3" stroke-width="2"/>`;
      if (tahap === 0) {
        isi += `<path d="M60 84 Q58 74 64 70" fill="none" stroke="#5cc8a0" stroke-width="3" stroke-linecap="round"/>
          <ellipse cx="66" cy="70" rx="6" ry="3.5" fill="#5cc8a0" transform="rotate(-30 66 70)"/>
          <ellipse cx="60" cy="94" rx="20" ry="15" fill="#9a6a45"/>
          <ellipse cx="54" cy="89" rx="6" ry="3" fill="#b8865f" opacity=".7"/>` + wajah(60, 95, 1);
      } else {
        isi += `<ellipse cx="60" cy="93" rx="38" ry="9" fill="#3fa37f"/>`;
        if (tahap === 1) {
          isi += `<path d="M60 90 Q57 74 60 62" fill="none" stroke="#3fa37f" stroke-width="4" stroke-linecap="round"/>
            <circle cx="60" cy="54" r="15" fill="#5cc8a0"/>
            <path d="M60 39 Q66 46 60 54" fill="none" stroke="#3fa37f" stroke-width="2"/>` + wajah(60, 55, 1);
        } else if (tahap === 2) {
          isi += `<path d="M60 90 Q57 74 60 64" fill="none" stroke="#3fa37f" stroke-width="4" stroke-linecap="round"/>
            <path d="M60 66 C40 60 40 40 52 30 C50 46 56 58 60 66Z" fill="${c}" opacity=".75"/>
            <path d="M60 66 C80 60 80 40 68 30 C70 46 64 58 60 66Z" fill="${c}" opacity=".75"/>
            <path d="M60 14 C78 32 76 56 60 66 C44 56 42 32 60 14Z" fill="${c}"/>
            <path d="M60 18 C70 32 68 50 60 60" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>` + wajah(60, 46, 1);
        } else {
          isi += `<circle cx="60" cy="52" r="44" fill="${c}" opacity=".14"/>
            <circle cx="60" cy="52" r="32" fill="${c}" opacity=".12"/>`;
          [-75, -45, 45, 75].forEach(a => {
            isi += `<ellipse cx="60" cy="40" rx="9" ry="24" fill="${c}" opacity=".7" transform="rotate(${a} 60 64)"/>`;
          });
          [-25, 0, 25].forEach(a => {
            isi += `<ellipse cx="60" cy="38" rx="10" ry="26" fill="${c}" transform="rotate(${a} 60 64)"/>`;
          });
          isi += `<ellipse cx="60" cy="64" rx="18" ry="9" fill="${c}"/>
            <circle cx="60" cy="56" r="13" fill="#f2c14e"/>` + wajah(60, 55, 0.9);
        }
      }
    } else {
      isi += `<rect x="0" y="94" width="120" height="26" fill="#5a3d2b"/>
        <path d="M0 95 H120" stroke="#7a5640" stroke-width="2"/>`;
      if (tahap === 0) {
        isi += `<path d="M60 86 Q58 76 63 72" fill="none" stroke="#5cc8a0" stroke-width="3" stroke-linecap="round"/>
          <path d="M63 72 C72 66 74 74 68 76 C66 77 64 75 63 72Z" fill="#5cc8a0"/>
          <ellipse cx="60" cy="96" rx="19" ry="14" fill="#b8865f"/>` + wajah(60, 97, 1);
      } else if (tahap === 1) {
        isi += `<path d="M60 95 Q58 76 60 58" fill="none" stroke="#3fa37f" stroke-width="4" stroke-linecap="round"/>
          <path d="M60 64 C46 58 40 46 48 40 C54 44 60 52 60 64Z" fill="#5cc8a0"/>
          <path d="M60 58 C74 52 80 40 72 34 C66 38 60 46 60 58Z" fill="#5cc8a0"/>
          <circle cx="60" cy="56" r="3" fill="${c}"/>
          <ellipse cx="60" cy="98" rx="16" ry="8" fill="#b8865f"/>` + wajah(60, 98, 0.8);
      } else {
        const besar = tahap === 3;
        const r = besar ? 30 : 20, cy = besar ? 40 : 50;
        isi += `${besar ? `<circle cx="60" cy="${cy}" r="56" fill="${c}" opacity=".1"/>` : ''}
          <path d="M${besar ? 50 : 54} 96 L${besar ? 53 : 56} ${cy + 6} L${besar ? 67 : 64} ${cy + 6} L${besar ? 70 : 66} 96Z" fill="#8a5a3b"/>
          <circle cx="60" cy="${cy}" r="${r}" fill="#3fa37f"/>
          <circle cx="${60 - r * 0.7}" cy="${cy + r * 0.25}" r="${r * 0.65}" fill="#3fa37f"/>
          <circle cx="${60 + r * 0.7}" cy="${cy + r * 0.25}" r="${r * 0.65}" fill="#3fa37f"/>
          <circle cx="${60 - r * 0.3}" cy="${cy - r * 0.3}" r="${r * 0.55}" fill="#5cc8a0"/>`;
        const buah = besar
          ? [[38, 30], [54, 18], [74, 24], [84, 44], [36, 52], [66, 40]]
          : [[50, 42], [68, 46], [58, 36]];
        buah.forEach(([x, y]) => { isi += `<circle cx="${x}" cy="${y}" r="${besar ? 3.5 : 3}" fill="${c}"/>`; });
        isi += wajah(60, besar ? 78 : 82, besar ? 1 : 0.8, '#f3ecd8');
      }
    }
    return `<svg class="avatar" viewBox="0 0 120 120" role="img" aria-label="${esc(label || '')}">${isi}</svg>`;
  }
  function avatarSaatIni(tahap) {
    const t = tahap === undefined ? level(S.xp) : tahap;
    return avatarSVG(S.profil.jenis, t, S.profil.warna, `Avatar ${TAHAP[S.profil.jenis][t]}`);
  }

  // ---------- Komponen ----------
  function kartuXP() {
    const l = level(S.xp);
    const maks = l === LEVEL_XP.length - 1;
    const dari = LEVEL_XP[l], ke = maks ? dari : LEVEL_XP[l + 1];
    const pct = maks ? 100 : Math.round((S.xp - dari) / (ke - dari) * 100);
    return `<div class="xp">
      <div class="xp-baris"><span>Level ${l + 1} · ${TAHAP[S.profil.jenis][l]}</span>
      <span class="angka">${maks ? `${S.xp} XP · level tertinggi` : `${S.xp} / ${ke} XP`}</span></div>
      <div class="xp-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div>
    </div>`;
  }
  function daftarItem(mode) {
    return Object.keys(ITEM).map(k => {
      const it = ITEM[k], n = S.inv[k];
      return `<li class="item ${n ? '' : 'kosong'}">
        <span class="item-ikon item-${k}">${ikon(k)}</span>
        <span class="item-teks"><b>${it.nama}</b><small>${it.ket}${mode === 'lengkap' ? ` Didapat dari: ${it.dari.toLowerCase()}.` : ''}</small></span>
        <span class="item-jumlah angka">×${n}</span>
      </li>`;
    }).join('');
  }
  function perbaruiMeta() {
    $meta.innerHTML = `<span>Lv ${level(S.xp) + 1}</span><span class="angka">${S.xp} XP</span>`;
  }
  function tampil(html, fokus) {
    $layar.innerHTML = html;
    perbaruiMeta();
    window.scrollTo(0, 0);
    const f = fokus && $layar.querySelector(fokus);
    if (f) f.focus();
  }

  // ---------- Layar: Beranda ----------
  function beranda() {
    if (S.baru) return layarAvatar(true);
    const riwayat = S.penguasaan.slice(-5).reverse();
    tampil(`
      <section class="kartu profil">
        <div class="profil-avatar">${avatarSaatIni()}</div>
        <div class="profil-info">
          <p class="label">Pemain</p>
          <h1>${esc(namaPemain())}</h1>
          ${kartuXP()}
          <button class="tombol kecil sekunder" data-aksi="avatar">Ubah avatar</button>
        </div>
      </section>

      <section class="modul">
        <p class="label">${esc(M.mapel)} · ${esc(M.jenjang)}</p>
        <h2>${esc(M.judul)}</h2>
        <p class="redup">1 slide bacaan · 5 soal · 1 misi Tetris (hapus ${M.tetris.targetBaris} baris)</p>
        <button class="tombol utama" data-aksi="mulai">Mulai modul</button>
      </section>

      <section>
        <h3>Tas item</h3>
        <ul class="daftar-item">${daftarItem('lengkap')}</ul>
      </section>

      <section>
        <h3>Catatan penguasaan materi</h3>
        <p class="redup kecil">Hanya menghitung jawaban benar. Item dan poin tidak memengaruhi catatan ini.</p>
        ${riwayat.length ? `<ul class="riwayat">${riwayat.map(r => `
          <li><span>${new Date(r.waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · ${esc(r.judul)}</span>
          <span class="angka"><b>${r.benar}/${r.total}</b> benar</span></li>`).join('')}</ul>`
        : '<p class="kosong-teks">Belum ada. Selesaikan modul pertama untuk mengisi catatan ini.</p>'}
      </section>

      <section class="reset">
        <button class="tombol teks" data-aksi="reset">Hapus semua progres</button>
        <div class="konfirmasi" id="konfirmasi-reset" hidden>
          <p>XP, item, avatar, dan catatan penguasaan akan dihapus dari perangkat ini.</p>
          <div class="baris-tombol">
            <button class="tombol bahaya kecil" data-aksi="reset-ya">Ya, hapus</button>
            <button class="tombol sekunder kecil" data-aksi="reset-batal">Batal</button>
          </div>
        </div>
      </section>
    `);
  }

  // ---------- Layar: Avatar ----------
  function layarAvatar(pertama) {
    const draf = { ...S.profil };
    const lv = level(S.xp);
    function render() {
      tampil(`
        <section class="kartu">
          <p class="label">${pertama ? 'Langkah pertama' : 'Avatar'}</p>
          <h1>${pertama ? 'Pilih teman perjalananmu' : 'Ubah avatar'}</h1>
          <p class="redup">Avatarmu tumbuh setiap kali kamu naik level.</p>
          <div class="pratinjau">${avatarSVG(draf.jenis, lv, draf.warna, 'Pratinjau avatar')}</div>
          <ol class="tahapan">${TAHAP[draf.jenis].map((n, i) => `
            <li class="${i === lv ? 'aktif' : ''}">${avatarSVG(draf.jenis, i, draf.warna, n)}<span>Lv ${i + 1}<br>${n}</span></li>`).join('')}
          </ol>

          <form id="form-avatar" class="form">
            <label for="nama">Nama panggilan</label>
            <input id="nama" name="nama" maxlength="16" autocomplete="off" placeholder="Sahabat Dhamma" value="${esc(draf.nama)}">

            <fieldset>
              <legend>Jenis avatar</legend>
              <div class="pilihan">
                ${['teratai', 'bodhi'].map(j => `
                  <label class="opsi-kartu ${draf.jenis === j ? 'dipilih' : ''}">
                    <input type="radio" name="jenis" value="${j}" ${draf.jenis === j ? 'checked' : ''}>
                    ${avatarSVG(j, 3, draf.warna, '')}
                    <span>${j === 'teratai' ? 'Teratai' : 'Pohon Bodhi'}</span>
                  </label>`).join('')}
              </div>
            </fieldset>

            <fieldset>
              <legend>Warna</legend>
              <div class="swatch">
                ${Object.keys(WARNA).map(w => `
                  <label class="sw ${draf.warna === w ? 'dipilih' : ''}" title="${WARNA[w].nama}">
                    <input type="radio" name="warna" value="${w}" ${draf.warna === w ? 'checked' : ''}>
                    <span style="background:${WARNA[w].hex}"></span><small>${WARNA[w].nama}</small>
                  </label>`).join('')}
              </div>
            </fieldset>

            <div class="baris-tombol">
              <button class="tombol utama" type="submit">${pertama ? 'Mulai perjalanan' : 'Simpan'}</button>
              ${pertama ? '' : '<button class="tombol sekunder" type="button" data-aksi="beranda">Batal</button>'}
            </div>
          </form>
        </section>`);
      const form = document.getElementById('form-avatar');
      form.addEventListener('change', e => {
        if (e.target.name === 'jenis' || e.target.name === 'warna') {
          draf.nama = form.nama.value;
          draf[e.target.name] = e.target.value;
          render();
          const el = document.querySelector(`input[name="${e.target.name}"][value="${e.target.value}"]`);
          if (el) el.focus();
        }
      });
      form.addEventListener('submit', e => {
        e.preventDefault();
        draf.nama = form.nama.value.trim();
        S.profil = draf;
        S.baru = false;
        simpan();
        beranda();
      });
    }
    render();
  }

  // ---------- Sesi modul ----------
  let sesi = null;

  function mulaiModul() {
    const pools = { pg: [], esai: [] };
    acak(M.soal).forEach(q => pools[q.tipe].push(q));
    sesi = {
      i: 0, total: M.pola.length, poin: 0, benar: 0, streak: 0,
      efek: { double: false, perisai: false },
      pools, soal: null, terjawab: false, petunjuk: false, pilihTerbuka: false, pilihDipakai: false,
      dapat: { bom: 0, perisai: 0 }, opsiTersembunyi: []
    };
    literasi();
  }

  function literasi() {
    const L = M.literasi;
    tampil(`
      <article class="kartu slide">
        <p class="label">Literasi · bacalah dulu</p>
        <h1>${esc(M.judul)}</h1>
        <p class="subjudul">${esc(M.subjudul)}</p>
        <p>${esc(L.pembuka)}</p>
        <dl class="istilah">${L.poin.map((p, i) => `
          <div><dt><span class="nomor angka">${i + 1}</span>${esc(p.istilah)}</dt><dd>${esc(p.arti)}</dd></div>`).join('')}
        </dl>
        <p class="perumpamaan">${esc(L.perumpamaan)}</p>
        <button class="tombol utama" data-aksi="soal-mulai">Saya sudah membaca, mulai soal</button>
      </article>`);
  }

  function ambilSoal(tipe) {
    const p = sesi.pools;
    const t = p[tipe].length ? tipe : (tipe === 'pg' ? 'esai' : 'pg');
    return p[t].pop();
  }
  function soalBaru() {
    sesi.soal = ambilSoal(M.pola[sesi.i]);
    sesi.terjawab = false;
    sesi.petunjuk = false;
    sesi.pilihTerbuka = false;
    sesi.pilihDipakai = false;
    sesi.opsiTersembunyi = [];
    renderSoal();
  }

  function tombolItem(k, aktif, bisa, labelAktif) {
    const n = S.inv[k];
    return `<button class="item-tombol ${aktif ? 'aktif' : ''}" data-item="${k}" ${bisa ? '' : 'disabled'} aria-pressed="${aktif}">
      <span class="item-ikon item-${k}">${ikon(k)}</span>
      <span>${aktif ? labelAktif : ITEM[k].nama}</span><span class="angka">×${n}</span></button>`;
  }

  function renderSoal(umpan) {
    const q = sesi.soal, ef = sesi.efek, jw = sesi.terjawab;
    const nilai = POIN[q.tipe] * (ef.double ? 2 : 1);
    let badan;
    if (q.tipe === 'pg') {
      badan = `<div class="opsi">${q.opsi.map((o, i) => {
        let kls = '';
        if (jw) kls = i === q.benar ? 'benar' : (i === sesi.dipilih ? 'salah' : '');
        const sembunyi = sesi.opsiTersembunyi.includes(i);
        return `<button class="opsi-tombol ${kls} ${sembunyi ? 'dicoret' : ''}" data-opsi="${i}" ${jw || sembunyi ? 'disabled' : ''}>
          <span class="huruf">${'ABCD'[i]}</span><span>${esc(o)}</span></button>`;
      }).join('')}</div>`;
    } else {
      const contoh = q.jawaban[0];
      badan = `<form id="form-esai" class="form esai">
        <label for="jawaban">Jawaban (satu kata)</label>
        ${sesi.petunjuk ? `<p class="petunjuk angka" aria-label="Petunjuk: huruf pertama ${contoh[0].toUpperCase()}, ${contoh.length} huruf">${contoh.toUpperCase().split('').map((h, i) => i === 0 ? h : '_').join(' ')}</p>` : ''}
        <div class="baris-input">
          <input id="jawaban" name="jawaban" autocomplete="off" autocapitalize="off" spellcheck="false" ${jw ? 'disabled' : ''} value="${esc(sesi.ketikan || '')}">
          <button class="tombol utama" type="submit" ${jw ? 'disabled' : ''}>Jawab</button>
        </div>
        <p class="galat" id="galat" hidden>Tulis jawabanmu dulu.</p>
      </form>`;
    }

    const bisaPilih = !jw && !sesi.petunjuk && !sesi.pilihDipakai && S.inv.pilih > 0;
    tampil(`
      <div class="hud">
        <span class="angka">Soal ${sesi.i + 1}/${sesi.total}</span>
        <span class="angka">${sesi.poin} poin</span>
        <span class="streak ${sesi.streak >= 2 ? 'panas' : ''} angka" title="Streak jawaban benar">Streak ${sesi.streak}</span>
      </div>
      <div class="progres"><span style="width:${(sesi.i + (jw ? 1 : 0)) / sesi.total * 100}%"></span></div>

      <section class="kartu soal">
        <p class="label">${q.tipe === 'pg' ? 'Pilihan ganda' : 'Esai singkat'} · ${nilai} poin${ef.double ? ' (Double aktif)' : ''}</p>
        <h2>${esc(q.tanya)}</h2>
        ${badan}
        ${umpan || ''}
      </section>

      ${jw ? '' : `<section class="tas-soal" aria-label="Item">
        ${tombolItem('double', ef.double, !ef.double && S.inv.double > 0, 'Double aktif')}
        ${tombolItem('perisai', ef.perisai, !ef.perisai && S.inv.perisai > 0, 'Perisai aktif')}
        ${tombolItem('petunjuk', sesi.petunjuk, !sesi.petunjuk && S.inv.petunjuk > 0, 'Petunjuk dipakai')}
        ${tombolItem('pilih', sesi.pilihTerbuka, bisaPilih, 'Pilih tipe:')}
        ${sesi.pilihTerbuka ? `<div class="pilih-tipe">
          <button class="tombol sekunder kecil" data-tipe="pg" ${sesi.pools.pg.length || q.tipe === 'pg' ? '' : 'disabled'}>Pilihan ganda · ${POIN.pg} poin</button>
          <button class="tombol sekunder kecil" data-tipe="esai" ${sesi.pools.esai.length || q.tipe === 'esai' ? '' : 'disabled'}>Esai · ${POIN.esai} poin</button>
        </div>` : ''}
      </section>`}
    `, jw ? '#lanjut' : (q.tipe === 'esai' ? '#jawaban' : null));

    const f = document.getElementById('form-esai');
    if (f) {
      f.addEventListener('input', () => { sesi.ketikan = f.jawaban.value; });
      f.addEventListener('submit', e => {
        e.preventDefault();
        const v = f.jawaban.value;
        if (!normal(v)) { document.getElementById('galat').hidden = false; f.jawaban.focus(); return; }
        jawab(q.jawaban.some(a => normal(a) === normal(v)), v);
      });
    }
  }

  function pakaiItem(k) {
    const ef = sesi.efek, q = sesi.soal;
    if (sesi.terjawab || S.inv[k] <= 0) return;
    if (k === 'double' && !ef.double) { S.inv.double--; ef.double = true; }
    else if (k === 'perisai' && !ef.perisai) { S.inv.perisai--; ef.perisai = true; }
    else if (k === 'petunjuk' && !sesi.petunjuk) {
      S.inv.petunjuk--; sesi.petunjuk = true; sesi.pilihTerbuka = false;
      if (q.tipe === 'pg') {
        sesi.opsiTersembunyi = acak(q.opsi.map((_, i) => i).filter(i => i !== q.benar)).slice(0, 2);
      }
    } else if (k === 'pilih' && !sesi.pilihDipakai && !sesi.petunjuk) {
      sesi.pilihTerbuka = !sesi.pilihTerbuka;
      renderSoal();
      return;
    } else return;
    simpan();
    renderSoal();
  }

  function pilihTipe(tipe) {
    const q = sesi.soal;
    S.inv.pilih--;
    sesi.pilihDipakai = true;
    sesi.pilihTerbuka = false;
    if (tipe !== q.tipe && sesi.pools[tipe].length) {
      sesi.pools[q.tipe].unshift(q);
      sesi.soal = sesi.pools[tipe].pop();
      sesi.ketikan = '';
    }
    simpan();
    renderSoal();
  }

  function jawab(benar, teks) {
    const q = sesi.soal, ef = sesi.efek;
    sesi.terjawab = true;
    const hadiah = [];
    if (benar) {
      const kali = ef.double ? 2 : 1;
      const dapat = POIN[q.tipe] * kali;
      sesi.poin += dapat;
      sesi.benar++;
      sesi.streak++;
      hadiah.push(`+${dapat} poin${kali > 1 ? ' (Double Poin)' : ''}`);
      ef.double = false;
      if (q.tipe === 'esai') { S.inv.bom++; sesi.dapat.bom++; hadiah.push('+1 Bom Baris untuk Tetris'); }
      if (sesi.streak % 3 === 0) { S.inv.perisai++; sesi.dapat.perisai++; hadiah.push(`Streak ${sesi.streak}: +1 Perisai`); }
    } else if (ef.perisai) {
      ef.perisai = false;
      hadiah.push(`Perisai menjaga streak ${sesi.streak}`);
    } else {
      if (sesi.streak) hadiah.push(`Streak ${sesi.streak} terputus`);
      sesi.streak = 0;
    }
    simpan();

    const kunci = q.tipe === 'pg' ? q.opsi[q.benar] : q.jawaban[0];
    const terakhir = sesi.i + 1 >= sesi.total;
    renderSoal(`
      <div class="umpan ${benar ? 'ok' : 'nok'}" role="status">
        <p class="umpan-judul">${benar ? 'Benar!' : 'Belum tepat'}</p>
        ${!benar && q.tipe === 'esai' ? `<p>Jawabanmu: <b>${esc(teks)}</b>. Jawaban yang diterima: <b>${esc(q.jawaban.join(', '))}</b>.</p>`
          : !benar ? `<p>Jawaban benar: <b>${esc(kunci)}</b>.</p>` : ''}
        <p>${esc(q.penjelasan)}</p>
        ${hadiah.length ? `<ul class="hadiah">${hadiah.map(h => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
        <button class="tombol utama" id="lanjut" data-aksi="lanjut">${terakhir ? 'Lanjut ke misi Tetris' : 'Soal berikutnya'}</button>
      </div>`);
    if (q.tipe === 'pg') sesi.dipilih = undefined;
  }

  function lanjut() {
    sesi.i++;
    sesi.ketikan = '';
    if (sesi.i >= sesi.total) praTetris();
    else soalBaru();
  }

  // ---------- Misi Tetris ----------
  function intervalAwal() { return 650 + 50 * sesi.benar; }

  function praTetris() {
    const lambat = Math.round((intervalAwal() / 650 - 1) * 100);
    tampil(`
      <section class="kartu">
        <p class="label">Misi</p>
        <h1>Hapus ${M.tetris.targetBaris} baris</h1>
        <p class="redup">Modal dari hasil menjawab soal:</p>
        <ul class="modal">
          <li><b class="angka">${sesi.benar}/${sesi.total}</b><span>jawaban benar. Fokusmu membuat blok jatuh ${lambat}% lebih lambat.</span></li>
          <li><b class="angka">×${S.inv.bom}</b><span>Bom Baris. Tiap bom menghapus baris paling bawah dan dihitung untuk misi.</span></li>
        </ul>
        <p class="redup kecil">Misi berhasil: +1 Double Poin dan +${XP_MISI.menang} XP. Gagal: tetap +${XP_MISI.kalah} XP.</p>
        <p class="redup kecil">Kendali: panah kiri/kanan geser, panah atas putar, panah bawah turun, spasi jatuhkan, B bom, P jeda.</p>
        <button class="tombol utama" data-aksi="tetris-mulai">Mulai Tetris</button>
      </section>`, '[data-aksi="tetris-mulai"]');
  }

  let game = null;
  function layarTetris() {
    tampil(`
      <div class="hud tetris-hud">
        <span class="angka" id="t-baris">Baris 0/${M.tetris.targetBaris}</span>
        <span class="t-next"><small>Berikutnya</small><canvas id="t-next"></canvas></span>
      </div>
      <div class="progres"><span id="t-progres" style="width:0%"></span></div>
      <div class="papan"><canvas id="t-papan" aria-label="Papan Tetris"></canvas>
        <div class="jeda" id="t-jeda" hidden><p>Jeda</p><button class="tombol utama kecil" data-t="resume">Lanjutkan</button></div>
      </div>
      <div class="kendali" aria-label="Kendali Tetris">
        <button data-t="left" aria-label="Geser kiri"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <button data-t="rotate" aria-label="Putar"><svg viewBox="0 0 24 24"><path d="M19 12a7 7 0 1 1-2.1-5M19 4v4h-4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <button data-t="right" aria-label="Geser kanan"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <button data-t="down" aria-label="Turun"><svg viewBox="0 0 24 24"><path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <button data-t="hardDrop" aria-label="Jatuhkan"><svg viewBox="0 0 24 24"><path d="M5 6l7 6 7-6M5 12l7 6 7-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <button data-t="bom" class="tombol-bom" id="t-bom" aria-label="Pakai Bom Baris">${ikon('bom')}<span class="angka" id="t-bom-n">×${S.inv.bom}</span></button>
      </div>`);

    game = window.Tetris.create({
      canvas: document.getElementById('t-papan'),
      nextCanvas: document.getElementById('t-next'),
      target: M.tetris.targetBaris,
      interval: intervalAwal(),
      bom: S.inv.bom,
      onBom: () => { S.inv.bom--; simpan(); },
      onUpdate: ({ baris, target, bom }) => {
        document.getElementById('t-baris').textContent = `Baris ${Math.min(baris, target)}/${target}`;
        document.getElementById('t-progres').style.width = Math.min(100, baris / target * 100) + '%';
        document.getElementById('t-bom-n').textContent = '×' + bom;
        document.getElementById('t-bom').disabled = bom <= 0;
      },
      onEnd: ({ menang, baris }) => {
        setTimeout(() => hasil(menang, baris), 700);
      }
    });
  }

  function jedaTetris(ya) {
    if (!game || game.selesai) return;
    if (ya) game.pause(); else game.resume();
    const j = document.getElementById('t-jeda');
    if (j) j.hidden = !ya;
  }

  // ---------- Hasil ----------
  function hasil(menang, baris) {
    if (game) { game.destroy(); game = null; }
    const lvSebelum = level(S.xp);
    const poinBaris = baris * 5;
    const bonus = menang ? XP_MISI.menang : XP_MISI.kalah;
    const xp = sesi.poin + poinBaris + bonus;
    S.xp += xp;
    if (menang) S.inv.double++;
    S.inv.pilih++;
    S.penguasaan.push({ waktu: new Date().toISOString(), modul: M.id, judul: M.judul, benar: sesi.benar, total: sesi.total });
    simpan();
    const lvSesudah = level(S.xp);
    const naik = lvSesudah > lvSebelum;

    const item = [];
    if (menang) item.push('+1 Double Poin (misi Tetris)');
    item.push('+1 Pilih Soal (modul selesai)');
    if (sesi.dapat.bom) item.push(`+${sesi.dapat.bom} Bom Baris (jawaban esai benar)`);
    if (sesi.dapat.perisai) item.push(`+${sesi.dapat.perisai} Perisai (streak)`);

    tampil(`
      <section class="kartu hasil ${naik ? 'naik' : ''}">
        <p class="label">${menang ? 'Misi berhasil' : 'Misi belum berhasil'}</p>
        <h1>${naik ? `Naik ke level ${lvSesudah + 1}!` : 'Modul selesai'}</h1>
        ${naik ? `<div class="evolusi">
            <div>${avatarSaatIni(lvSebelum)}<span>${TAHAP[S.profil.jenis][lvSebelum]}</span></div>
            <svg class="panah" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <div class="baru">${avatarSaatIni(lvSesudah)}<span>${TAHAP[S.profil.jenis][lvSesudah]}</span></div>
          </div>` : `<div class="pratinjau kecil">${avatarSaatIni()}</div>`}

        <div class="dua-kolom">
          <div class="angka-kartu">
            <p class="label">Penguasaan materi</p>
            <p class="besar angka">${sesi.benar}/${sesi.total}</p>
            <p class="kecil redup">Jawaban benar. Tidak dipengaruhi item.</p>
          </div>
          <div class="angka-kartu">
            <p class="label">XP didapat</p>
            <p class="besar angka">+${xp}</p>
            <p class="kecil redup">${sesi.poin} poin soal + ${poinBaris} dari ${baris} baris + ${bonus} bonus misi</p>
          </div>
        </div>
        ${kartuXP()}

        <h3>Item didapat</h3>
        <ul class="hadiah">${item.map(i => `<li>${esc(i)}</li>`).join('')}</ul>

        <div class="baris-tombol">
          <button class="tombol utama" data-aksi="mulai">Ulangi modul</button>
          <button class="tombol sekunder" data-aksi="beranda">Ke beranda</button>
        </div>
      </section>`, '[data-aksi="mulai"]');
    sesi = null;
  }

  // ---------- Event ----------
  $layar.addEventListener('click', e => {
    const t = e.target.closest('button');
    if (!t || t.disabled) return;
    const a = t.dataset.aksi;
    if (a === 'mulai') mulaiModul();
    else if (a === 'avatar') layarAvatar(false);
    else if (a === 'beranda') beranda();
    else if (a === 'soal-mulai') soalBaru();
    else if (a === 'lanjut') lanjut();
    else if (a === 'tetris-mulai') layarTetris();
    else if (a === 'reset') document.getElementById('konfirmasi-reset').hidden = false;
    else if (a === 'reset-batal') document.getElementById('konfirmasi-reset').hidden = true;
    else if (a === 'reset-ya') { S = stateAwal(); simpan(); beranda(); }
    else if (t.dataset.item) pakaiItem(t.dataset.item);
    else if (t.dataset.tipe) pilihTipe(t.dataset.tipe);
    else if (t.dataset.opsi !== undefined) {
      const i = Number(t.dataset.opsi);
      sesi.dipilih = i;
      jawab(i === sesi.soal.benar);
    }
    else if (t.dataset.t === 'resume') jedaTetris(false);
  });

  // Kendali sentuh Tetris: geser dan turun berulang selama ditahan.
  let ulang = null;
  function hentiUlang() { clearTimeout(ulang); clearInterval(ulang); ulang = null; }
  $layar.addEventListener('pointerdown', e => {
    const t = e.target.closest('[data-t]');
    if (!t || !game || t.dataset.t === 'resume') return;
    e.preventDefault();
    const aksi = t.dataset.t;
    game[aksi]();
    if (['left', 'right', 'down'].includes(aksi)) {
      hentiUlang();
      ulang = setTimeout(() => { ulang = setInterval(() => game && game[aksi](), 60); }, 180);
    }
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => $layar.addEventListener(ev, hentiUlang));

  document.addEventListener('keydown', e => {
    if (!game || game.selesai) return;
    const peta = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'rotate', x: 'rotate', ArrowDown: 'down', ' ': 'hardDrop', b: 'bom', B: 'bom' };
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') { e.preventDefault(); jedaTetris(game.berjalan); return; }
    const aksi = peta[e.key];
    if (aksi && game.berjalan) { e.preventDefault(); game[aksi](); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) jedaTetris(true); });

  beranda();
})();
