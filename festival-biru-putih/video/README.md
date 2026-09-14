# Video Demonstrasi

Berkas kerja untuk video demonstrasi wajib (maksimal 3 menit, MP4) yang harus
dilampirkan bersama karya kategori Lab Maya.

| Berkas | Isi |
|---|---|
| [`01-landasan-dan-rancangan.md`](01-landasan-dan-rancangan.md) | Landasan teori, tiga keputusan awal, struktur video, spesifikasi teknis |
| [`02-prompt-sesi-flow.md`](02-prompt-sesi-flow.md) | **10 sesi prompt Google Flow**, masing-masing 8 detik |
| [`03-naskah-narasi.md`](03-naskah-narasi.md) | Naskah narasi Indonesia + teks layar + panduan audio |
| `rekaman-layar/` | **Rekaman aplikasi sungguhan**, 10 klip, 1080p 30fps H.264 |

---

## Yang sudah jadi dan yang belum

| | Status |
|---|---|
| Rekaman aplikasi (10 klip, 135 detik) | **Selesai** — ada di `rekaman-layar/` |
| Naskah narasi lengkap dengan penandaan waktu | **Selesai** |
| 10 prompt Flow siap salin | **Selesai** |
| Klip B-roll dari Flow | Dijalankan sendiri, satu per satu |
| Rekaman suara narasi | Direkam sendiri |
| Perakitan & ekspor akhir | Setelah dua butir di atas |

---

## Rekaman layar yang tersedia

Seluruhnya 1920×1080, 30 fps, H.264 profil high, tanpa audio (narasi ditempel
saat penyuntingan). Direkam langsung dari `dist/offline/index.html` — berkas
yang sama persis dengan yang dikirim ke panitia.

| Berkas | Durasi | Isi | Bagian terbaik |
|---|---|---|---|
| `R01-laman-muka.mp4` | 6,2 s | Laman muka + tujuan pembelajaran | 0:00–0:04 |
| `R02-panduan.mp4` | 8,4 s | Layar panduan penggunaan | 0:01–0:05 |
| `R03-menu.mp4` | 7,0 s | Menu empat modul | 0:01–0:06 |
| `R04-gasing-amati.mp4` | 14,8 s | Gasing diluncurkan, panel ukur bergerak | 0:02–0:12 |
| `R05-gasing-ubah.mp4` | 15,9 s | Ganti bentuk ke "berat di tepi", geser massa | 0:01–0:11 |
| `R06-layangan.mp4` | 19,3 s | Angin dikecilkan lalu dibesarkan, kemiringan diubah | 0:02–0:17 |
| `R07-ketapel.mp4` | 18,9 s | Tiga kali tarik-lepas, lintasan parabola, sasaran roboh | 0:01–0:14 |
| `R08-congklak-prediksi.mp4` | 17,9 s | Asisten Prediksi, hitungan sisa bagi, langkah dijalankan | 0:02–0:16 |
| `R09-kuis-umpan-balik.mp4` | 15,9 s | Jawaban salah → penjelasan → jawaban benar | 0:01–0:14 |
| `R10-evaluasi.mp4` | 10,7 s | Evaluasi akhir | 0:01–0:08 |

Kalau perlu direkam ulang — misalnya setelah mengubah tampilan aplikasi —
skrip perekamnya ada di `tools/rekam-layar.mjs`.

---

## Urutan pengerjaan

**1. Jalankan sesi Flow satu per satu.**
Buka [`02-prompt-sesi-flow.md`](02-prompt-sesi-flow.md). Kerjakan Langkah 0
(Ingredients) dulu, baru sesi 01. Periksa daftar kriteria terima tiap sesi
sebelum lanjut. Simpan hasilnya di folder `b-roll/` dengan nama
`S01-halaman-kampung.mp4`, `S02-gasing-tumbang.mp4`, dan seterusnya.

**2. Rekam narasi.**
Ikuti [`03-naskah-narasi.md`](03-naskah-narasi.md). Rekam per segmen.

**3. Rakit di penyunting video.**
Urutan potongannya ada di tabel struktur pada
[`01-landasan-dan-rancangan.md`](01-landasan-dan-rancangan.md) bagian 3.

**4. Ekspor** dengan spesifikasi di bagian 4 dokumen yang sama.

---

## Daftar periksa sebelum ekspor

- [ ] Durasi total **di bawah 3 menit**
- [ ] Rasio 16:9, resolusi 1920×1080, 30 fps
- [ ] Tidak ada lencana "Veo" atau logo pihak ketiga mana pun di bingkai
- [ ] Tidak ada tampilan antarmuka buatan AI — semua cuplikan aplikasi berasal
      dari `rekaman-layar/`
- [ ] Volume musik latar maksimal 20% volume narasi
- [ ] Setiap teks di layar tampil minimal 3 detik
- [ ] Narasi terdengar jelas tanpa gema dan tanpa desis
- [ ] Sasaran ketapel di klip B-roll bukan makhluk hidup
- [ ] Thumbnail 1280×720 sudah dibuat
- [ ] Penggunaan AI sudah dicatat di `LISENSI-ASET.md`

---

## Catatan integritas

Klip B-roll dibangkitkan AI dan **harus dinyatakan demikian**. Panduan lomba
mewajibkan keterangan penggunaan AI beserta dokumen desain (prompting).
Dokumen [`02-prompt-sesi-flow.md`](02-prompt-sesi-flow.md) berisi seluruh
prompt yang dipakai — itulah dokumen desain yang diminta; lampirkan apa adanya.

Seluruh keluaran Veo juga membawa SynthID, penanda tak terlihat yang menyatakan
video dibangkitkan AI dan bertahan walaupun video diedit. Jadi
menyembunyikannya bukan cuma tidak jujur, tetapi juga sia-sia.

Sebaliknya, **rekaman di `rekaman-layar/` bukan AI** — itu tangkapan layar
sungguhan dari aplikasi yang berjalan. Bedakan keduanya dengan jelas saat
menulis keterangan.
