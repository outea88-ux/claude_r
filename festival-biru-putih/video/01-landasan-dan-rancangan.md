# Landasan Teori & Rancangan Video

Dokumen ini menjawab "konsep pembuatan seperti apa yang cocok" sebelum satu pun
prompt ditulis. Prompt yang tidak berlandas teori hanya menghasilkan video yang
enak ditonton tetapi tidak mengajar apa pun.

---

## 1. Tiga keputusan yang harus diambil lebih dulu

### Keputusan 1 — Video ini untuk apa?

Panduan lomba menyebut dua jenis video yang sama sekali berbeda:

| | Video Demonstrasi | Video Pembelajaran |
|---|---|---|
| Status | **Wajib** untuk Lab Maya & Gim Edukasi | Kategori lomba **tersendiri** |
| Durasi | Maksimal **3 menit** | Maksimal **15 menit** |
| Isi | "**menunjukkan cara penggunaan** Lab Maya" | Menjelaskan konsep keilmuan |
| Penilaian | Kelengkapan berkas | Dinilai penuh dengan rubrik sendiri |

Dokumen ini merancang **Video Demonstrasi** — yang wajib dilampirkan bersama
ZIP karya. Karena kata kuncinya "menunjukkan cara penggunaan", isi utamanya
**harus rekaman aplikasi yang sungguhan**, bukan animasi AI.

### Keputusan 2 — Apa yang boleh dan tidak boleh dibuat AI

Ini batas yang tidak boleh dilanggar:

| AI **boleh** membuat | AI **tidak boleh** membuat |
|---|---|
| Suasana anak bermain gasing di halaman | Tampilan antarmuka aplikasi |
| Layangan di atas sawah | Grafik, angka, atau panel ukur "aplikasi" |
| Tangan menabur biji congklak | Layar laptop yang isinya terbaca jelas |
| Suasana kelas, transisi, pembuka/penutup | Apa pun yang mengaku sebagai cuplikan karya |

Alasannya bukan sekadar aturan lomba. Video demonstrasi yang memperlihatkan
antarmuka buatan AI **menyesatkan juri** tentang wujud karya yang sebenarnya.
Kalau juri lalu membuka ZIP-nya dan menemukan tampilan yang berbeda, yang
hilang bukan cuma nilai — melainkan kepercayaan.

Karena itu arsitekturnya: **AI untuk dunia nyata, rekaman layar untuk aplikasi.**
Justru di situ kekuatannya. Video jadi punya dua dunia yang saling menjelaskan:
permainan di halaman rumah, dan ilmu yang selama ini bekerja diam-diam di
baliknya.

### Keputusan 3 — Narasi direkam manusia, bukan AI

Ini rekomendasi berbasis bukti, bukan selera. **Prinsip Suara (Voice Principle)**
dalam Teori Kognitif Pembelajaran Multimedia menemukan bahwa murid belajar lebih
baik dari suara manusia yang ramah daripada suara mesin. Efeknya konsisten di
banyak percobaan.

Tambahan pertimbangan praktis: penilaian juga melihat "suara narator terdengar
jelas, artikulasi jelas, volume stabil". Suara guru sendiri — dengan logat
Indonesia yang wajar — lebih meyakinkan daripada TTS yang datar.

Jadi Veo dipakai untuk **gambar dan bunyi suasana (SFX)** saja. Dialog dan
narasi tidak dibangkitkan AI.

---

## 2. Landasan teori yang dipakai

### Teori Kognitif Pembelajaran Multimedia (Mayer)

Teori ini berangkat dari tiga asumsi: manusia punya dua saluran pemrosesan
(visual dan verbal), masing-masing berkapasitas terbatas, dan belajar bermakna
menuntut pemrosesan aktif. Dari situ lahir prinsip-prinsip perancangan berikut.
Tujuh di antaranya dipakai langsung dalam rancangan ini:

| Prinsip | Isi | Penerapan di video ini |
|---|---|---|
| **Koherensi** | Buang kata, gambar, dan bunyi yang tidak perlu | Tanpa musik dramatis berlebihan, tanpa transisi berputar, tanpa stok video generik |
| **Pemenggalan** (*segmenting*) | Sajikan dalam penggal-penggal, bukan aliran panjang | Klip 8 detik memaksa satu gagasan per penggal — batas Veo justru menguntungkan |
| **Penanda** (*signaling*) | Beri isyarat pada informasi penting | Lingkaran/panah muncul di angka panel ukur saat disebut narasi |
| **Modalitas** | Gambar + narasi lisan lebih baik daripada gambar + teks panjang | Layar tidak dipenuhi teks saat narator berbicara |
| **Redundansi** | Jangan bacakan teks yang sama persis dengan yang tertulis | Narasi menjelaskan, bukan membacakan tulisan di layar |
| **Suara** | Suara manusia lebih baik daripada suara mesin | Narasi direkam sendiri |
| **Personalisasi** | Gaya percakapan lebih baik daripada gaya formal | Pakai "kamu" dan "kita", bukan "peserta didik diharapkan" |

### Teori Beban Kognitif

Beban kerja otak dibagi tiga: beban **intrinsik** (kerumitan materinya sendiri),
beban **asing** (akibat penyajian yang buruk), dan beban **germane** (usaha
membangun pemahaman). Tugas perancang: tekan beban asing, sisakan ruang untuk
beban germane.

Terjemahan praktisnya di sini: satu klip = satu gagasan. Jangan ada gerakan
kamera rumit saat angka penting sedang muncul. Jangan ada musik menghentak saat
narator menjelaskan rumus.

### Panduan video pendidikan (Brame)

Empat pengungkit utama: **memendekkan durasi**, **menyelaraskan modalitas
audio-visual**, **memakai gaya percakapan**, dan **membuang yang tidak perlu**
(*weeding*). Studi keterlibatan pada video daring menemukan perhatian penonton
merosot tajam setelah beberapa menit — yang justru mendukung batas 3 menit dari
panduan lomba, bukan melawannya.

### Hubungannya dengan rubrik penilaian

| Prinsip | Indikator rubrik yang terbantu |
|---|---|
| Koherensi & weeding | *Editing* (4%), *Durasi* (4%) |
| Penanda | *Teks dan Grafis* (4%), *Kejelasan Instruksi* (4%) |
| Suara manusia | *Kualitas Audio* (5%) |
| B-roll budaya | **Kontekstualisasi (5%)**, *Daya Tarik* (5%) |
| Rekaman aplikasi asli | *Fungsionalitas* (8%), *Akurasi Keilmuan* (15%) |

---

## 3. Struktur video

Mengikuti struktur wajib pada BAB VI panduan: **Pembuka (pemantik + tujuan) →
Isi (materi inti) → Penutup (simpulan + refleksi)**.

```
0:00 ─────────────────────────────────────────────────────── 2:52
│ PEMBUKA │           I S I           │ PENUTUP │
│  0:24   │           1:52            │  0:16   │
└─────────┴───────────────────────────┴─────────┘
   AI         rekaman layar + AI          AI
```

| Blok | Waktu | Isi | Sumber gambar |
|---|---|---|---|
| Pembuka | 0:00–0:08 | Hook: anak bermain di halaman kampung | Sesi 01 (AI) |
| Pembuka | 0:08–0:16 | Pemantik: gasing melambat lalu tumbang | Sesi 02 (AI) |
| Pembuka | 0:16–0:24 | Tujuan + judul karya | Sesi 06 (AI) + teks |
| Isi | 0:24–0:36 | Laman Muka, Panduan, Menu | R01, R02, R03 |
| Isi | 0:36–0:44 | Gasing di dunia nyata | Sesi 03 (AI) |
| Isi | 0:44–1:06 | Modul Gasing: amati & ubah variabel | R04, R05 |
| Isi | 1:06–1:14 | Layang-layang di dunia nyata | Sesi 04 (AI) |
| Isi | 1:14–1:30 | Modul Layang-layang: empat gaya | R06 |
| Isi | 1:30–1:38 | Ketapel di dunia nyata | Sesi 05 (AI) |
| Isi | 1:38–1:52 | Modul Ketapel: tarik, lepas, parabola | R07 |
| Isi | 1:52–2:00 | Congklak di dunia nyata | Sesi 07 (AI) |
| Isi | 2:00–2:14 | Modul Congklak: prediksi sisa bagi | R08 |
| Isi | 2:14–2:28 | Kuis & umpan balik konstruktif | R09 |
| Isi | 2:28–2:36 | Murid memakai aplikasi di kelas | Sesi 08 (AI) |
| Penutup | 2:36–2:44 | Diskusi kelas, simpulan | Sesi 09 (AI) |
| Penutup | 2:44–2:52 | Refleksi: kembali bermain | Sesi 10 (AI) |

**Total 2 menit 52 detik** — di bawah batas 3 menit, dengan sisa aman 8 detik.

Porsi: rekaman aplikasi asli **± 62%**, B-roll AI **± 38%**. Seimbang: cukup
untuk disebut "demonstrasi", cukup pula untuk punya jiwa.

---

## 4. Spesifikasi teknis keluaran

Mengikuti BAB VI panduan, walaupun video demonstrasi hanya diminta "MP4 maksimal
3 menit". Memenuhi standar yang lebih tinggi tidak merugikan.

| Aspek | Nilai | Sumber ketentuan |
|---|---|---|
| Rasio | 16:9 lanskap | BAB VI.D.2 |
| Resolusi | 1920×1080 (Full HD) | BAB VI.D.2 — minimum 720p |
| Laju bingkai | 30 fps | BAB VI.D.2 — minimum 24 fps |
| Kodek video | H.264 | BAB VI.E |
| Bitrate video | ≥ 5000 kbps | BAB VI.E |
| Audio | AAC, ≥128 kbps, stereo | BAB VI.E |
| Musik latar | maksimal 20% volume narasi | BAB VI.D.3 |
| Teks di layar | setara ≥24pt, tampil ≥3 detik | BAB VI.D.4 |
| Ukuran berkas | maksimal 500 MB | BAB VI.E |
| Thumbnail | 1280×720 JPG/PNG | BAB VI.E |

Rekaman layar di `rekaman-layar/` sudah dibuat sesuai spesifikasi ini:
1920×1080, 30 fps, H.264, profil high.

---

## 5. Peringatan: watermark pada keluaran Flow

Panduan lomba menyatakan:

> "Karya tidak diijinkan menyertakan tanda hak cipta, **watermark** atau
> simbol/logo tertentu yang berpotensi pada keuntungan finansial, kecuali logo
> resmi instansi ... serta logo resmi Kemendikdasmen."

Keluaran Google Flow pada paket gratis dan paket menengah membawa **lencana
"Veo" yang terlihat** di sudut bingkai. Lencana itu adalah logo pihak ketiga,
sehingga berisiko dianggap melanggar butir di atas.

Dua jalan yang aman:

1. **Pakai paket yang keluarannya tanpa lencana.** Paket tertinggi Google AI
   menghilangkan lencana tampak pada keluaran Veo. Ini cara paling bersih.
2. **Rancang bingkai dengan ruang lebih.** Semua prompt di dokumen berikutnya
   sengaja memakai komposisi yang menyisakan ruang kosong di tepi bawah, supaya
   pemotongan ringan (sekitar 6–8% tinggi bingkai) tetap aman. Setelah dipotong,
   skalakan kembali ke 1920×1080.

Jangan memakai alat pihak ketiga yang mengklaim "menghapus watermark" — itu
menyiasati ketentuan penyedia layanan, dan justru menambah masalah baru di
lomba yang menjunjung integritas.

**Catatan tambahan:** seluruh keluaran Veo tetap membawa **SynthID**, penanda
tak terlihat yang menyatakan video itu buatan AI, dan penanda ini bertahan
walaupun video diedit. Ini bukan masalah — justru sejalan dengan kewajiban
mendeklarasikan penggunaan AI. Deklarasikan saja sejak awal; jangan berpura-pura
klipnya rekaman kamera.

---

## 6. Alur kerja menjalankan sesi

Sesi dijalankan satu per satu, bukan sekaligus. Urutannya penting karena
sesi 01 menghasilkan "bahan" (*ingredients*) yang dipakai ulang sesi berikutnya
agar tokoh dan gayanya konsisten.

```
   1. Siapkan Ingredients  ──▶  kunci tokoh + gaya visual
            │
            ▼
   2. Jalankan Sesi 01     ──▶  periksa kriteria terima
            │                        │
            │                   tidak lolos ──▶ ulang dengan variasi prompt
            ▼
   3. Sesi 02 ... Sesi 10   ──▶  masing-masing diperiksa sebelum lanjut
            │
            ▼
   4. Rakit di penyunting video bersama rekaman-layar/
            │
            ▼
   5. Rekam narasi ──▶ tempel ──▶ sunting ──▶ ekspor MP4
```

Prompt lengkap tiap sesi ada di [`02-prompt-sesi-flow.md`](02-prompt-sesi-flow.md).
Naskah narasi Indonesia ada di [`03-naskah-narasi.md`](03-naskah-narasi.md).

---

## Rujukan

- Mayer, R. E. *Cognitive Theory of Multimedia Learning* — prinsip koherensi,
  pemenggalan, penanda, modalitas, redundansi, suara, dan personalisasi.
- Sweller, J. *Cognitive Load Theory* — beban intrinsik, asing, dan germane.
- Brame, C. J. (2016). *Effective educational videos: Principles and guidelines
  for maximizing student learning from video content.* CBE—Life Sciences Education.
- Guo, P. J., Kim, J., & Rubin, R. (2014). *How video production affects student
  engagement.* Proceedings of ACM Learning at Scale.
- Panduan Kegiatan Festival Biru Putih Tahun 2026, BAB V & BAB VI.
