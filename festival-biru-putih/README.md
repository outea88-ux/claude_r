# Rumah Permainan Nusantara

Media pembelajaran interaktif jenjang **SMP (Fase D)** yang membedah empat
permainan tradisional Indonesia menjadi percobaan maya IPA dan Matematika.

Disiapkan untuk **Festival Biru Putih 2026**, Direktorat Sekolah Menengah
Pertama, Kemendikdasmen.

| Modul | Mapel | Pertanyaan kunci |
|---|---|---|
| Gasing | IPA · Gerak & Energi | Ke mana perginya tenaga putar gasing? |
| Layang-Layang | IPA · Gaya & Gerak | Kok bisa diam padahal empat gaya menariknya? |
| Ketapel | IPA · Energi & Gerak | Ke mana tenaga karet pergi saat dilepaskan? |
| Congklak | Matematika · Pola & Sisa Bagi | Di mana biji terakhir akan jatuh? |

---

## Menjalankan

```bash
# Versi sumber — cukup buka berkasnya, tanpa server
xdg-open src/index.html

# Membangun paket lomba + versi hosting
node tools/build.mjs

# Versi persis seperti yang akan dibuka juri
xdg-open dist/offline/index.html
```

Hasil build:

| Keluaran | Isi | Ukuran |
|---|---|---|
| `dist/offline/index.html` | Satu berkas, semua disatukan | 178 KB |
| `dist/web/` | Berkas terpisah untuk hosting statis | 16 berkas |
| `dist/RumahPermainanNusantara.zip` | Paket siap unggah | 46 KB |

---

## Struktur

```
festival-biru-putih/
├── src/
│   ├── index.html                 Satu-satunya halaman (SPA)
│   ├── styles/
│   │   ├── tokens.css             Warna, jarak, huruf
│   │   ├── base.css               Dasar + panggung 16:9
│   │   └── components.css         Tombol, kartu, kuis, penggeser
│   └── scripts/
│       ├── core/
│       │   ├── bus.js             Penyampai pesan antar bagian
│       │   ├── stage.js           Penskalaan 16:9 lintas perangkat
│       │   ├── audio.js           Seluruh bunyi dari Web Audio API
│       │   ├── store.js           Kemajuan belajar + cadangan memori
│       │   ├── ui.js              Komponen siap pakai
│       │   ├── quiz.js            Mesin kuis berumpan balik
│       │   ├── evaluasi.js        10 soal sumatif
│       │   └── app.js             Kerangka & perpindahan layar
│       └── modules/
│           ├── gasing.js
│           ├── layangan.js
│           ├── ketapel.js
│           └── congklak.js
├── tools/build.mjs                Pembangun paket + pemeriksa kemandirian
└── docs/
    ├── 01-analisis-panduan.md     Analisis panduan lomba & kepatuhan
    ├── 02-peta-kurikulum.md       Pemetaan CP Fase D & materi yang dibuang
    ├── 03-roadmap-modul.md        Usulan modul tambahan
    ├── 04-pipeline-deploy.md      Penyatuan platform & pipeline publikasi
    └── Panduan-Penggunaan.pdf     Panduan pengguna (wajib dilampirkan)
```

---

## Prinsip yang dipegang

**Mandiri sepenuhnya.** Tidak ada satu pun rujukan ke internet. Tidak ada CDN,
tidak ada berkas huruf yang diunduh, tidak ada pustaka luar. Seluruh gambar
digambar oleh kode Canvas; seluruh bunyi dibangkitkan Web Audio API. Panduan
lomba melarang aset eksternal, dan `tools/build.mjs` akan **menggagalkan build**
bila ada yang menyusup. Pengujian peramban mengonfirmasi nol permintaan jaringan.

**Satu halaman, tanpa perpindahan berkas.** Seluruh perpindahan tampilan diatur
JavaScript. Memakai `<script src>` biasa, bukan modul ES, supaya berkas tetap
berjalan saat dibuka lewat `file://` — seperti yang akan dilakukan juri.

**Setingkat SMP, tetapi tidak dipalsukan.** Rumus tingkat SMA dihapus dari
tampilan, namun model fisikanya tetap dihitung dengan benar di balik layar.
Murid melihat "Gaya Angkat 9,6 newton", bukan `F_L = ½ρv²AC_L` — sementara
angka 9,6 itu memang hasil perhitungan yang sah.

**Umpan balik yang mengajar.** Setiap pilihan jawaban punya penjelasannya
sendiri. Jawaban salah tidak sekadar ditandai merah; murid diberi tahu mengapa
pemikirannya keliru sebelum ditunjukkan jawaban yang benar.

---

## Perbaikan keilmuan dari rancangan awal

| Modul | Temuan | Perbaikan |
|---|---|---|
| Congklak | Rumus penaburan ditulis `mod 16` | Satu putaran pemain hanya melewati **15 lubang** karena rumah lawan selalu dilewati. Seluruh prediksi kini memakai modulus 15. |
| Ketapel | Tarikan terbaca 3,5 m → 720 joule pada 85 m/s | Skala tarikan dipisahkan dari skala dunia (tarikan penuh 45 cm) → 9–53 joule pada 4–46 m/s. |
| Gasing | Gasing tumbang dalam ±2 detik | Tetapan gesek ditera ulang → 8–90 detik, seperti gasing kayu sungguhan. |
| Layang-layang | Dinamika berbasis batasan yang bergetar | Dimodelkan sebagai gerak pada busur tali; stabil dan lebih benar. |
| Semua | Tiga rujukan CDN eksternal | Nol rujukan luar. |

Rinciannya di [`docs/02-peta-kurikulum.md`](docs/02-peta-kurikulum.md).

---

## Menambah modul baru

Satu berkas di `src/scripts/modules/`, satu baris `<script>` di `index.html`.
Menu, indikator progres, navigasi, penyimpanan, dan pengemasan ikut menyesuaikan
sendiri. Contoh kerangkanya ada di
[`docs/03-roadmap-modul.md`](docs/03-roadmap-modul.md).

---

## Sebelum diunggah ke panitia

- [ ] Isi nama kreator pada `<meta name="author">` di `src/index.html`
- [ ] Buat video demonstrasi MP4 maksimal 3 menit (wajib untuk kategori Lab Maya)
- [ ] Tanda tangani Surat Pernyataan & Integritas bermeterai Rp10.000 (Lampiran 1 panduan)
- [ ] Siapkan keterangan penggunaan AI beserta dokumen desain (prompting)
- [ ] Jalankan `node tools/build.mjs` dan unggah `dist/RumahPermainanNusantara.zip`

Daftar lengkapnya di [`docs/01-analisis-panduan.md`](docs/01-analisis-panduan.md).
