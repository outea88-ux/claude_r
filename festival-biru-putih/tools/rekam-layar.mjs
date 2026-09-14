/* ============================================================
   rekam-layar.mjs — merekam aplikasi yang sungguhan untuk
   dipakai sebagai cuplikan di video demonstrasi.

   Merekam 10 adegan sebagai berkas .webm terpisah pada
   1280x720, lalu perlu dikonversi ke MP4 1080p:

     ffmpeg -i R01.webm -vf "scale=1920:1080:flags=lanczos,fps=30" \
            -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p \
            -an -movflags +faststart R01.mp4

   Jalankan setelah `node tools/build.mjs`, karena skrip ini
   merekam dari dist/offline/index.html.

   Butuh: npm install playwright
   ============================================================ */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const APP  = 'file:///home/user/claude_r/festival-biru-putih/dist/offline/index.html';
const KELUAR = '/home/user/claude_r/festival-biru-putih/video/rekaman-layar';
const TMP = '/tmp/rekam-mentah';
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });
fs.mkdirSync(KELUAR, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--force-device-scale-factor=1', '--hide-scrollbars']
});

const jeda = (ms) => new Promise(r => setTimeout(r, ms));

/* Gerakan tetikus halus supaya terlihat seperti orang sungguhan */
async function keArah(page, sel, opsi = {}) {
  const el = page.locator(sel).first();
  const box = await el.boundingBox();
  if (!box) return null;
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.mouse.move(x, y, { steps: opsi.langkah || 22 });
  await jeda(opsi.tunggu ?? 320);
  return { x, y, box };
}
async function ketuk(page, sel, opsi = {}) {
  const p = await keArah(page, sel, opsi);
  if (!p) return false;
  await page.mouse.down(); await jeda(70); await page.mouse.up();
  await jeda(opsi.setelah ?? 420);
  return true;
}
/* Geser penggeser pelan-pelan agar perubahan angkanya terbaca */
async function geser(page, sel, arah = 1, jumlah = 8, jedaMs = 130) {
  const el = page.locator(sel).first();
  const box = await el.boundingBox();
  if (!box) return;
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height / 2, { steps: 18 });
  await jeda(250);
  await el.focus();
  for (let i = 0; i < jumlah; i++) {
    await page.keyboard.press(arah > 0 ? 'ArrowRight' : 'ArrowLeft');
    await jeda(jedaMs);
  }
}

const adegan = [];
async function rekam(nama, detik, aksi) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: TMP, size: { width: 1280, height: 720 } },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference'
  });
  const page = await ctx.newPage();
  await page.goto(APP);
  await page.waitForTimeout(700);
  await aksi(page);
  await page.waitForTimeout(500);
  const video = page.video();
  await ctx.close();
  const asal = await video.path();
  const tujuan = path.join(TMP, nama + '.webm');
  fs.renameSync(asal, tujuan);
  adegan.push({ nama, berkas: tujuan, target: detik });
  console.log(`  terekam: ${nama}`);
}

/* ============ R01 — Laman Muka ============ */
await rekam('R01-laman-muka', 7, async (page) => {
  await jeda(2200);
  await keArah(page, 'button:has-text("Mulai Belajar")');
  await jeda(600);
  await page.mouse.down(); await jeda(70); await page.mouse.up();
  await jeda(1400);
});

/* ============ R02 — Panduan ============ */
await rekam('R02-panduan', 9, async (page) => {
  await page.evaluate(() => RPN.app.buka('panduan'));
  await jeda(2600);
  await page.mouse.move(640, 360, { steps: 20 });
  await jeda(1800);
  await ketuk(page, 'button:has-text("Lanjut ke Menu")', { setelah: 1600 });
});

/* ============ R03 — Menu ============ */
await rekam('R03-menu', 9, async (page) => {
  await page.evaluate(() => RPN.app.buka('menu'));
  await jeda(1400);
  for (const i of [0, 1, 2, 3]) {
    await keArah(page, `.kartu-modul >> nth=${i}`, { langkah: 16, tunggu: 520 });
  }
  await jeda(900);
});

/* ============ R04 — Gasing: amati ============ */
await rekam('R04-gasing-amati', 14, async (page) => {
  await page.evaluate(() => RPN.app.buka('modul', 'gasing'));
  await jeda(1200);
  await ketuk(page, 'button:has-text("Putar Gasing")', { setelah: 300 });
  await page.mouse.move(430, 430, { steps: 25 });
  await jeda(9500);
});

/* ============ R05 — Gasing: ubah variabel ============ */
await rekam('R05-gasing-ubah', 14, async (page) => {
  await page.evaluate(() => {
    RPN.app.buka('modul', 'gasing');
    setTimeout(() => {
      const c = [...document.querySelectorAll('.tbl-kecil')].find(b => /Ubah/.test(b.textContent));
      if (c) c.click();
    }, 250);
  });
  await jeda(1500);
  await ketuk(page, '.pilihan:has-text("Berat di tepi")', { setelah: 700 });
  await geser(page, 'input[type=range] >> nth=1', 1, 6, 150);   // massa
  await jeda(500);
  await ketuk(page, 'button:has-text("Putar Gasing")', { setelah: 300 });
  await jeda(7000);
});

/* ============ R06 — Layang-layang ============ */
await rekam('R06-layangan', 15, async (page) => {
  await page.evaluate(() => {
    RPN.app.buka('modul', 'layangan');
    setTimeout(() => {
      const c = [...document.querySelectorAll('.tbl-kecil')].find(b => /Ubah/.test(b.textContent));
      if (c) c.click();
    }, 250);
  });
  await jeda(2000);
  await geser(page, 'input[type=range] >> nth=0', -1, 12, 150);  // angin turun
  await jeda(1600);
  await geser(page, 'input[type=range] >> nth=0', 1, 20, 130);   // angin naik
  await jeda(2600);
  await geser(page, 'input[type=range] >> nth=1', 1, 10, 150);   // kemiringan
  await jeda(2400);
});

/* ============ R07 — Ketapel ============ */
await rekam('R07-ketapel', 14, async (page) => {
  await page.evaluate(() => RPN.app.buka('modul', 'ketapel'));
  await jeda(1600);
  const kan = await page.locator('.panggung-sim canvas').boundingBox();
  const cw = await page.evaluate(() => document.querySelector('.panggung-sim canvas').clientWidth);
  const ch = await page.evaluate(() => document.querySelector('.panggung-sim canvas').clientHeight);
  const sx = kan.x + (150 / cw) * kan.width;
  const sy = kan.y + ((ch - 46 - 128) / ch) * kan.height;
  for (const [dx, dy] of [[-70, 38], [-95, 30], [-108, 22]]) {
    await page.mouse.move(sx, sy, { steps: 22 });
    await jeda(420);
    await page.mouse.down();
    await page.mouse.move(sx + dx, sy + dy, { steps: 26 });
    await jeda(750);
    await page.mouse.up();
    await jeda(2600);
  }
});

/* ============ R08 — Congklak: prediksi ============ */
await rekam('R08-congklak-prediksi', 16, async (page) => {
  await page.evaluate(() => {
    RPN.app.buka('modul', 'congklak');
    setTimeout(() => {
      const c = [...document.querySelectorAll('.tbl-kecil')].find(b => /Prediksi/.test(b.textContent));
      if (c) c.click();
    }, 250);
  });
  await jeda(1800);
  await ketuk(page, '[data-lubang="3"]', { setelah: 2600 });
  await ketuk(page, '[data-lubang="5"]', { setelah: 2600 });
  await ketuk(page, 'button:has-text("Jalankan langkah ini")', { setelah: 300 });
  await jeda(7000);
});

/* ============ R09 — Kuis & umpan balik ============ */
await rekam('R09-kuis-umpan-balik', 16, async (page) => {
  await page.evaluate(() => {
    RPN.app.buka('modul', 'ketapel');
    setTimeout(() => {
      const c = [...document.querySelectorAll('.tbl-kecil')].find(b => /Kuis/.test(b.textContent));
      if (c) c.click();
    }, 250);
  });
  await jeda(1800);
  await ketuk(page, '.opsi >> nth=2', { setelah: 300 });   // jawaban keliru
  await jeda(4200);                                         // umpan balik terbaca
  await ketuk(page, 'button:has-text("Soal berikutnya")', { setelah: 1400 });
  await ketuk(page, '.opsi >> nth=0', { setelah: 300 });   // jawaban benar
  await jeda(4200);
});

/* ============ R10 — Evaluasi akhir ============ */
await rekam('R10-evaluasi', 10, async (page) => {
  await page.evaluate(() => RPN.app.buka('evaluasi'));
  await jeda(2200);
  await ketuk(page, '.opsi >> nth=0', { setelah: 300 });
  await jeda(3800);
  await ketuk(page, 'button:has-text("Soal berikutnya")', { setelah: 1600 });
});

await browser.close();
fs.writeFileSync('/tmp/rekam-mentah/daftar.json', JSON.stringify(adegan, null, 2));
console.log('\nSelesai merekam ' + adegan.length + ' adegan.');
