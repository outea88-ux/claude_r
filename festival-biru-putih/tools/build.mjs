#!/usr/bin/env node
/* ============================================================
   build.mjs — satu sumber, dua sasaran keluaran.

   1) dist/offline/index.html
      Seluruh CSS dan JavaScript disatukan ke dalam SATU berkas
      index.html. Inilah berkas yang dikirim ke lomba: berjalan
      dengan klik dua kali dari flashdisk, tanpa server, tanpa
      internet, tanpa plugin.

   2) dist/web/
      Versi berkas terpisah untuk dipasang di hosting statis
      (GitHub Pages, Netlify, Cloudflare Pages). Lebih mudah
      dirawat dan di-cache peramban.

   3) dist/RumahPermainanNusantara.zip
      Paket siap unggah: index.html di akar + panduan + LISENSI.

   Cara pakai:  node tools/build.mjs
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const AKAR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(AKAR, 'src');
const DIST = path.join(AKAR, 'dist');

const NAMA_PAKET = 'RumahPermainanNusantara';

/* ---------- utilitas ---------- */
const baca  = (p) => fs.readFileSync(p, 'utf8');
const tulis = (p, isi) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, isi); };
const kb    = (n) => (n / 1024).toFixed(1) + ' KB';

function salinRekursif(dari, ke) {
  fs.mkdirSync(ke, { recursive: true });
  for (const nama of fs.readdirSync(dari)) {
    const a = path.join(dari, nama), b = path.join(ke, nama);
    if (fs.statSync(a).isDirectory()) salinRekursif(a, b);
    else fs.copyFileSync(a, b);
  }
}

/* ---------- 1. Periksa: tidak boleh ada rujukan ke internet ---------- */
const POLA_LUAR = [
  /https?:\/\/(?!www\.w3\.org)/i,   // namespace SVG boleh, sisanya tidak
  /\/\/cdn\./i,
  /integrity\s*=/i,
  /crossorigin/i
];

function periksaMandiri() {
  const temuan = [];
  function telusuri(dir) {
    for (const nama of fs.readdirSync(dir)) {
      const p = path.join(dir, nama);
      if (fs.statSync(p).isDirectory()) { telusuri(p); continue; }
      if (!/\.(html|css|js)$/i.test(nama)) continue;
      const isi = baca(p);
      isi.split('\n').forEach((baris, i) => {
        for (const pola of POLA_LUAR) {
          if (pola.test(baris)) {
            temuan.push(`${path.relative(AKAR, p)}:${i + 1}  ${baris.trim().slice(0, 96)}`);
            break;
          }
        }
      });
    }
  }
  telusuri(SRC);
  return temuan;
}

/* ---------- 2. Susun berkas tunggal ---------- */
function susunSatuBerkas() {
  let html = baca(path.join(SRC, 'index.html'));

  // Ganti setiap <link rel="stylesheet"> dengan isi berkasnya
  html = html.replace(/[ \t]*<link\s+rel="stylesheet"\s+href="([^"]+)"\s*>\r?\n?/g, (_, href) => {
    const isi = baca(path.join(SRC, href));
    return `<style>\n/* ===== ${href} ===== */\n${isi}\n</style>\n`;
  });

  // Ganti setiap <script src="..."> dengan isi berkasnya
  html = html.replace(/[ \t]*<script\s+src="([^"]+)"\s*><\/script>\r?\n?/g, (_, src) => {
    const isi = baca(path.join(SRC, src));
    return `<script>\n/* ===== ${src} ===== */\n${isi}\n</script>\n`;
  });

  // Rapikan baris kosong berlebih
  html = html.replace(/\n{3,}/g, '\n\n');
  return html;
}

/* ---------- 3. Jalankan ---------- */
console.log('\n  Rumah Permainan Nusantara — pembangun paket\n  ' + '─'.repeat(52));

const pelanggaran = periksaMandiri();
if (pelanggaran.length) {
  console.error('\n  GAGAL: ditemukan rujukan ke sumber luar.');
  console.error('  Panduan lomba melarang aset/URL eksternal.\n');
  pelanggaran.forEach((t) => console.error('    ' + t));
  console.error('');
  process.exit(1);
}
console.log('  [1/4] Pemeriksaan mandiri ......... tidak ada rujukan internet');

fs.rmSync(DIST, { recursive: true, force: true });

/* Sasaran A: berkas tunggal untuk lomba */
const satuBerkas = susunSatuBerkas();
const jalurOffline = path.join(DIST, 'offline', 'index.html');
tulis(jalurOffline, satuBerkas);
console.log(`  [2/4] dist/offline/index.html ..... ${kb(Buffer.byteLength(satuBerkas))} (satu berkas)`);

/* Sasaran B: berkas terpisah untuk hosting */
salinRekursif(SRC, path.join(DIST, 'web'));
const jumlahWeb = (function hitung(d) {
  return fs.readdirSync(d).reduce((n, x) => {
    const p = path.join(d, x);
    return n + (fs.statSync(p).isDirectory() ? hitung(p) : 1);
  }, 0);
})(path.join(DIST, 'web'));
console.log(`  [3/4] dist/web/ ................... ${jumlahWeb} berkas (untuk hosting statis)`);

/* Sasaran C: paket ZIP siap unggah */
const stagingDir = path.join(DIST, '_paket');
fs.mkdirSync(stagingDir, { recursive: true });
fs.copyFileSync(jalurOffline, path.join(stagingDir, 'index.html'));

const panduanPdf = path.join(AKAR, 'docs', 'Panduan-Penggunaan.pdf');
if (fs.existsSync(panduanPdf)) {
  fs.copyFileSync(panduanPdf, path.join(stagingDir, 'Panduan-Penggunaan.pdf'));
} else {
  console.log('        catatan: docs/Panduan-Penggunaan.pdf belum ada — wajib dilampirkan sebelum unggah');
}
const lisensi = path.join(AKAR, 'LISENSI-ASET.md');
if (fs.existsSync(lisensi)) fs.copyFileSync(lisensi, path.join(stagingDir, 'LISENSI-ASET.md'));

const zipPath = path.join(DIST, `${NAMA_PAKET}.zip`);
try {
  execFileSync('zip', ['-r', '-q', '-9', zipPath, '.'], { cwd: stagingDir });
  const ukuran = fs.statSync(zipPath).size;
  console.log(`  [4/4] dist/${NAMA_PAKET}.zip ... ${kb(ukuran)}`);
  if (ukuran > 25 * 1024 * 1024) {
    console.log('        PERINGATAN: melebihi anjuran 25 MB dari panduan lomba.');
  }
} catch (e) {
  console.log('  [4/4] Perintah "zip" tidak tersedia. Kemas manual dari dist/_paket/');
}

console.log('\n  Selesai. Kirim dist/' + NAMA_PAKET + '.zip ke panitia,');
console.log('  atau pasang isi dist/web/ ke hosting statis.\n');
