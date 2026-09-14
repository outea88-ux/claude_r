# Menyatukan Karya & Memilih Pipeline Publikasi

Dua pertanyaan: apakah keempat berkas bisa disatukan dalam satu platform, dan
pipeline seperti apa yang cocok untuk memublikasikannya.

---

## 1. Bisakah disatukan? Bukan cuma bisa — memang harus

Panduan lomba sebenarnya sudah memaksa ke arah itu:

> "Tidak boleh melakukan redirecting ke halaman html lain dan aplikasi yang
> dibuat harus berupa **Single Page Application (SPA)**."
>
> "File webpage diberi nama '**index.html**' dan diletakkan di **root
> directory** dari file .zip."

Artinya empat berkas HTML terpisah **tidak bisa** dikirim apa adanya sebagai
satu karya. Menaruh keempatnya dalam satu ZIP lalu menautkannya dari halaman
menu justru melanggar larangan *redirecting* secara langsung.

Satu-satunya bentuk yang sah adalah **satu `index.html`** yang berpindah
tampilan lewat JavaScript, tanpa pernah berpindah berkas. Itulah yang sudah
dibangun di repositori ini.

### Apa yang berubah setelah disatukan

| Sebelum | Sesudah |
|---|---|
| 4 berkas terpisah, tanpa beranda | 1 SPA: Muka → Panduan → Menu → Modul → Evaluasi |
| Tanpa laman muka, panduan, menu, evaluasi | Keempat struktur wajib tersedia |
| Tidak ada kemajuan belajar | Indikator progres, skor per modul tersimpan |
| Bergantung 3 CDN internet | Nol rujukan luar |
| 4 sistem desain berbeda | Satu berkas token warna |
| Asesmen tidak ada | 26 soal berumpan balik konstruktif |
| Rasio layar bebas | Panggung tetap 16:9 |

Yang tak kalah penting: menyatukan membuat **satu cerita** terbentuk. Empat
simulasi terpisah adalah empat alat. Satu platform bertema "rahasia ilmu di
balik permainan nenek moyang" adalah sebuah karya — dan itu yang dinilai pada
indikator Orisinalitas serta Daya Tarik.

---

## 2. Pipeline: satu sumber, dua sasaran

Kebutuhan lomba dan kebutuhan publikasi daring saling bertentangan:

- **Lomba** menuntut satu berkas mandiri, tanpa internet, bisa dibuka dari
  flashdisk dengan klik dua kali.
- **Publikasi daring** lebih nyaman dengan berkas terpisah supaya bisa
  di-*cache* peramban dan mudah dirawat.

Menulis dua versi secara manual adalah undangan bagi keduanya untuk berbeda
diam-diam. Karena itu dipakai satu sumber dengan dua sasaran keluaran:

```
                 src/  (sumber yang dirawat)
                  |
                  |  node tools/build.mjs
                  v
    +-------------+--------------------------+
    |                                        |
    v                                        v
dist/offline/index.html              dist/web/
satu berkas, semua disatukan         berkas terpisah
178 KB                               16 berkas
    |                                        |
    v                                        v
dist/RumahPermainanNusantara.zip     hosting statis
46 KB -> unggah ke panitia           -> URL publik
```

### Yang dikerjakan pembangun paket

1. **Memeriksa kemandirian.** Menelusuri seluruh HTML/CSS/JS untuk mencari
   `http://`, `https://`, `//cdn.`, `integrity=`, `crossorigin`. Bila ada satu
   saja, proses **dihentikan**. Pagar ini yang mencegah pelanggaran ketentuan
   terulang tanpa disadari.
2. **Menyatukan berkas.** Setiap `<link rel="stylesheet">` dan
   `<script src>` diganti isi berkasnya, menghasilkan satu `index.html`.
3. **Menyalin versi web** untuk hosting.
4. **Mengemas ZIP** dengan `index.html` di akar, beserta PDF panduan dan
   berkas lisensi aset.

Menjalankannya:

```bash
node tools/build.mjs
```

### Mengapa skrip biasa, bukan modul ES

Berkas sumber sengaja memakai `<script src>` biasa, bukan
`<script type="module">`. Alasannya praktis: modul ES diblokir kebijakan CORS
saat halaman dibuka lewat `file://`. Kalau juri mengunduh ZIP, mengekstraknya,
lalu mengeklik dua kali `index.html` — hal yang sangat mungkin terjadi —
versi modul ES akan **gagal total** tanpa pesan apa pun di layar.

Dengan skrip biasa dan versi tunggal yang sudah disatukan, membuka dari
`file://` berjalan sempurna. Ini sudah diuji.

---

## 3. Pilihan hosting untuk publikasi daring

Karya ini murni statis: tidak ada basis data, tidak ada server, tidak ada
proses di sisi belakang. Semua penyedia di bawah ini gratis untuk keperluan ini.

| Penyedia | Cocok bila | Catatan |
|---|---|---|
| **GitHub Pages** | Kode sudah di GitHub | Paling sederhana; otomatis dari cabang |
| **Cloudflare Pages** | Ingin akses cepat dari Indonesia | Jaringan tercepat di Asia Tenggara |
| **Netlify** | Ingin pratinjau tiap perubahan | Ada URL pratinjau per perubahan |
| **Vercel** | Sudah terbiasa memakainya | Setara Netlify |

**Rekomendasi: GitHub Pages.** Repositori sudah ada, tidak perlu mendaftar
layanan baru, dan URL-nya (`namapengguna.github.io/...`) terasa netral serta
pantas dicantumkan di berkas portofolio guru.

### Penerbitan otomatis dengan GitHub Actions

Simpan sebagai `.github/workflows/terbitkan.yml`:

```yaml
name: Terbitkan ke GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  bangun:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      # Pemeriksaan kemandirian ikut berjalan di sini.
      # Bila ada URL eksternal menyusup, penerbitan gagal.
      - name: Bangun paket
        run: node festival-biru-putih/tools/build.mjs

      - uses: actions/upload-pages-artifact@v3
        with:
          path: festival-biru-putih/dist/web

      # Simpan juga ZIP siap unggah sebagai lampiran hasil build
      - uses: actions/upload-artifact@v4
        with:
          name: paket-lomba
          path: festival-biru-putih/dist/RumahPermainanNusantara.zip

  terbitkan:
    needs: bangun
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - id: deploy
        uses: actions/deploy-pages@v4
```

Setelah itu, satu kali `git push` akan sekaligus:
1. memeriksa tidak ada rujukan internet yang menyusup,
2. membangun kedua sasaran keluaran,
3. menerbitkan versi daring,
4. menyiapkan ZIP siap unggah sebagai lampiran yang bisa diunduh.

---

## 4. Catatan penting soal urutan publikasi

Panduan menyatakan syarat orisinalitas:

> "Orisinalitas: Karya asli Peserta dan **belum pernah dipublikasikan**."

Dan pada surat pernyataan (Lampiran 1):

> "Karya ini **belum pernah dipublikasikan secara komersial**, belum pernah
> diikutsertakan dalam kompetisi sejenis ..."

Kedua kalimat ini tidak persis sama bunyinya, dan itulah masalahnya. Butir di
BAB II berbunyi "belum pernah dipublikasikan" tanpa kata "komersial", sementara
surat pernyataannya memakai "secara komersial". Penafsiran mana yang dipakai
penilai tidak bisa dipastikan dari dokumen ini saja.

**Saran yang aman: jangan terbitkan ke URL publik sebelum pengumuman hasil.**
Gunakan pipeline-nya sekarang untuk membangun dan menguji, tetapi jadikan
repositorinya privat, atau tunda langkah `terbitkan` sampai lomba selesai.
Kalau memang ingin memastikan, tanyakan langsung ke panitia lewat kanal resmi
sebelum menerbitkan.

Setelah lomba, URL publik justru sangat berguna: guru lain bisa memakainya di
kelas, dan tautannya bisa masuk ke berkas portofolio serta pengajuan angka
kredit jabatan fungsional.

---

## 5. Ringkasan perintah

```bash
# Membangun kedua sasaran + ZIP siap unggah
node tools/build.mjs

# Mencoba versi sumber saat mengembangkan
#   (cukup buka berkasnya langsung, tanpa server)
xdg-open src/index.html

# Mencoba persis seperti yang akan dilihat juri
xdg-open dist/offline/index.html
```
