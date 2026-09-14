# Analisis Panduan Festival Biru Putih 2026

Ringkasan pembacaan *Panduan Kegiatan Festival Biru Putih Tahun 2026*
(Direktorat SMP, Kemendikdasmen) dan implikasinya terhadap karya ini.

---

## 1. Konteks lomba

| Hal | Isi |
|---|---|
| Penyelenggara | Direktorat Sekolah Menengah Pertama, Kemendikdasmen |
| Sasaran peserta | **Guru & Tenaga Kependidikan SMP**, ber-NUPTK aktif |
| Jenjang sasaran karya | **SMP saja** (Fase D) |
| Kategori | GIM Edukasi · **Media Interaktif** · **Lab Maya** · Video Pembelajaran |
| Bobot penilaian | Substansi **60%** · Media **25%** · Inovasi & Kreativitas **15%** |

Bobot terbesar ada di **substansi**, bukan di kemewahan tampilan. Dua indikator
paling berat masing-masing 15%: *Kesesuaian Kurikulum* dan *Akurasi Keilmuan*.
Itu sebabnya seluruh penyederhanaan materi di karya ini dilakukan dengan tetap
mempertahankan model fisika yang benar di balik layar.

---

## 2. Temuan paling kritis pada keempat berkas awal

Panduan BAB IV & V menyatakan, untuk Media Interaktif maupun Lab Maya:

> "Semua aset yang digunakan oleh webpage tersebut **tidak diperkenankan
> mencantumkan aset / URL eksternal**."
>
> "**Tidak boleh melakukan redirecting ke halaman html lain** dan aplikasi yang
> dibuat harus berupa **Single Page Application (SPA)**."
>
> "File webpage diberi nama '**index.html**' dan diletakkan di **root directory**
> dari file .zip."

Keempat berkas HTML awal semuanya memuat rujukan ke internet:

| Rujukan luar | Berkas |
|---|---|
| `https://cdn.tailwindcss.com` | keempatnya |
| `https://cdnjs.cloudflare.com/.../font-awesome` | keempatnya |
| `https://fonts.googleapis.com` + `fonts.gstatic.com` | keempatnya |

Akibatnya bukan sekadar "kurang rapi". Saat juri membuka berkas di komputer
tanpa internet — hal yang lumrah pada penjurian luring — **seluruh tata letak
runtuh, ikon hilang, dan huruf berubah**. Secara administratif ini juga
melanggar ketentuan teknis yang tertulis eksplisit, sehingga berisiko gugur di
tahap seleksi.

Karya ini dibangun ulang tanpa satu pun rujukan keluar. Pemeriksaannya
diotomatiskan di `tools/build.mjs` dan akan **menggagalkan proses build** bila
ada URL eksternal yang tidak sengaja masuk. Pengujian peramban juga
mengonfirmasi **nol permintaan jaringan**.

---

## 3. Daftar periksa kepatuhan teknis

### Struktur wajib (BAB IV.D.1)

| Ketentuan | Status | Keterangan |
|---|---|---|
| Laman Muka (opening) | Ada | Judul, tujuan pembelajaran, tombol mulai |
| Panduan (petunjuk penggunaan) | Ada | Layar tersendiri sebelum menu |
| Menu (daftar isi/materi) | Ada | Empat kartu modul + pintu evaluasi |
| Evaluasi (soal/asesmen) | Ada | 10 soal sumatif + 4 soal formatif per modul |
| Tombol navigasi konsisten | Ada | Sebelumnya/Berikutnya tetap di bilah bawah |
| Alur linier & logis | Ada | Muka → Panduan → Menu → Modul → Evaluasi |
| Instruksi di bagian awal | Ada | Layar Panduan + kotak petunjuk tiap langkah |

### Interaksi & fungsionalitas (BAB IV.D.2)

| Ketentuan | Status | Keterangan |
|---|---|---|
| Minimal 3 interaksi relevan | Terlampaui | 9–12 interaksi bermakna per modul |
| Ragam jenis interaksi | Ada | Penggeser, pilihan kartu, seret-lepas, ketuk papan, kuis |
| Seluruh elemen berfungsi | Diuji | Nol galat konsol pada 4 ukuran layar |
| Waktu respons < 2 detik | Ada | Respons seketika, 60 bingkai/detik |
| Lintas perangkat | Diuji | 1366×768, 1024×768, 844×390, 390×844 |

### Umpan balik (BAB IV.D.3)

| Ketentuan | Status |
|---|---|
| Langsung, jelas, mudah dipahami | Ada — muncul seketika setelah tiap interaksi |
| **Bukan sekadar benar/salah** | Ada — **setiap pilihan** punya penjelasannya sendiri |
| Berupa teks, visual, atau audio | Ada — ketiganya |

Ini bagian yang paling sering terlewat peserta lomba. Pada karya ini, memilih
jawaban salah tidak hanya ditandai merah: murid diberi tahu **mengapa
pemikirannya keliru**, baru kemudian ditunjukkan jawaban benarnya.

### Desain visual & antarmuka (BAB IV.D.4)

| Ketentuan | Status | Keterangan |
|---|---|---|
| Kontras warna terjaga | Ada | Teks utama 14,2:1; teks sekunder 6,4:1 |
| Tidak ada elemen dekoratif yang menutupi | Ada | Tanpa *backdrop blur*, tanpa titik berkedip |
| Ikon & warna konsisten | Ada | Satu berkas token warna |
| Tombol minimal 44×44 px | Ada | Ditetapkan lewat variabel `--touch` |
| Ilustrasi relevan | Ada | Seluruh gambar digambar langsung oleh kode |
| **Rasio 16:9** | Ada | Panggung tetap 1280×720, diskalakan |

### Format berkas (BAB IV.E)

| Ketentuan | Status |
|---|---|
| HTML5 / web standar | Ada |
| Dikemas ZIP, struktur jelas | Ada — `tools/build.mjs` |
| Maks. 100 MB (anjuran ≤ 25 MB) | **46 KB** |
| index.html di akar ZIP | Ada |
| Tanpa plugin pihak ketiga | Ada — HTML, CSS, JS murni |
| Kompatibel Chrome/Firefox/Safari/Edge | Ada — tanpa API eksperimental |

---

## 4. Kategori mana yang paling tepat?

Perkiraan awal "ini Media Interaktif" **perlu ditinjau ulang**. Bandingkan
definisi di panduan:

**Media Interaktif (BAB IV.B)**
> "Struktur materi bersifat **linier** dan **tidak memiliki aturan permainan
> tertentu**." Jenisnya: pendalaman materi, kuis & teka-teki, seri latihan soal.

**Lab Maya (BAB V.A & V.C)**
> "Simulasi Virtual: **model simulasi fenomena alam** ... yang divisualisasikan
> secara interaktif." Kriteria: pengguna dapat "**memilih alat, mengatur
> variabel, serta menjalankan prosedural/eksperimen/pengujian tanpa
> laboratorium fisik**", tersedia "**eksplorasi lanjutan seperti membandingkan
> skenario berbeda**", dan "mendukung kompetensi **psikomotorik dan
> prosedural**".

Gasing, layang-layang, dan ketapel adalah **persis** uraian Lab Maya: murid
mengatur variabel, menjalankan percobaan, dan membandingkan skenario. Ketiganya
bukan "pendalaman materi" yang linier.

### Rekomendasi

**Kirim ke kategori Lab Maya.** Alasannya:

1. Tiga dari empat modul memenuhi definisi Lab Maya kata per kata.
2. Struktur *Amati → Ubah → Bandingkan → Kuis* langsung menjawab tuntutan
   "indikator progres atau panduan langkah, misalnya *Langkah 1 dari 4*".
3. Tuntutan "setiap tahapan dapat diakses kembali tanpa mengulang dari awal"
   sudah dipenuhi lewat cip langkah yang bisa diklik bebas.
4. Persaingan di Media Interaktif biasanya paling ramai karena kategori itu
   paling mudah dimasuki. Lab Maya menuntut simulasi bervariabel — dan justru
   di situlah kekuatan karya ini.

**Catatan tambahan untuk Lab Maya:** kategori ini mewajibkan **video
demonstrasi maksimal 3 menit (MP4)**, yang tidak diminta pada Media Interaktif.
Lihat daftar kelengkapan di bawah.

Bila ingin mengirim ke dua kategori sekaligus, congklak berpeluang dikembangkan
menjadi entri **Gim Edukasi** tersendiri — ia sudah punya aturan permainan,
lawan, dan skor. Yang perlu ditambahkan: sistem level bertingkat, nyawa/misi,
dan lencana penghargaan.

---

## 5. Kelengkapan yang masih harus disiapkan peserta

Di luar berkas program, panduan mewajibkan:

- [ ] **PDF panduan penggunaan** → sudah disiapkan: `docs/Panduan-Penggunaan.pdf`
- [ ] **Video demonstrasi MP4, maks. 3 menit** (wajib untuk Lab Maya & Gim Edukasi)
- [ ] **Surat Pernyataan & Integritas bermeterai Rp10.000** (Lampiran 1 panduan)
- [ ] **Nama kreator** pada `<meta name="author">` di `src/index.html` — masih kosong
- [ ] **Keterangan penggunaan AI beserta dokumen desain (prompting)**

Butir terakhir perlu perhatian jujur. Panduan menyatakan:

> "Jika dibuat oleh AI perlu dituliskan keterangan (contoh: 'Gambar ini dibuat
> oleh AI') serta wajib menyertakan dokumen desain (prompting)."

Karya ini tidak memuat satu pun gambar hasil generator AI — seluruh visual
digambar oleh kode Canvas. Namun kode dan naskahnya disusun dengan bantuan AI.
Ketentuan panduan menyebut "aset digital", sehingga penafsirannya bisa berbeda
antar penilai. Cara paling aman: lampirkan dokumen proses pengembangan secara
terbuka. Kejujuran di titik ini jauh lebih murah daripada risiko diskualifikasi
di kemudian hari, mengingat sanksinya mencakup pencabutan penghargaan.
