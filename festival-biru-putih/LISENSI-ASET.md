# Keterangan Aset Digital

Disusun untuk memenuhi BAB II butir 3 Panduan Festival Biru Putih 2026
mengenai hak cipta aset digital.

## Ringkasan

**Karya ini tidak memuat satu pun berkas aset eksternal.** Tidak ada berkas
gambar, suara, video, huruf, atau pustaka pihak ketiga di dalam paket.

| Jenis aset | Sumber | Keterangan |
|---|---|---|
| Ilustrasi & gambar | Digambar oleh kode | Seluruh visual dibangkitkan HTML5 Canvas 2D pada saat program berjalan. Tidak ada berkas `.png`, `.jpg`, `.svg`, atau `.gif`. |
| Ikon antarmuka | Digambar oleh kode | SVG ditulis langsung di dalam kode program. |
| Emoji | Huruf bawaan sistem | Ditampilkan memakai huruf emoji milik sistem operasi pengguna, tidak disertakan dalam paket. |
| Bunyi & efek suara | Dibangkitkan program | Seluruh bunyi disintesis Web Audio API saat dijalankan. Tidak ada berkas `.mp3` atau `.wav`. |
| Huruf (font) | Huruf bawaan sistem | Memakai tumpukan huruf sistem. Tidak ada huruf yang diunduh atau disertakan. |
| Pustaka JavaScript | Tidak ada | Seluruh kode ditulis sendiri. Tanpa kerangka kerja, tanpa pustaka. |
| Isi materi & soal | Disusun sendiri | Merujuk Capaian Pembelajaran Fase D, Kurikulum Merdeka. |

## Keterangan penggunaan kecerdasan buatan

### Berkas program (index.html dan seluruh isinya)

Tidak ada gambar, suara, atau video hasil generator AI di dalam berkas program.

Kode program, naskah materi, dan butir soal disusun dengan bantuan asisten AI,
kemudian ditinjau, diuji, dan disunting oleh pengembang. Model fisika pada
setiap modul diperiksa ulang secara numerik agar nilainya masuk akal — proses
ini menemukan dan memperbaiki beberapa kekeliruan keilmuan dari rancangan awal,
yang dicatat di `docs/02-peta-kurikulum.md`.

Dokumen desain proses pengembangan dilampirkan terpisah sesuai ketentuan
panduan.

### Video demonstrasi

Video demonstrasi terdiri atas dua jenis bahan yang berbeda dan harus
dibedakan dengan jelas:

| Bahan | Sumber | Keterangan |
|---|---|---|
| Cuplikan aplikasi | **Bukan AI** | Rekaman layar sungguhan dari `dist/offline/index.html`, direkam otomatis dengan `tools/rekam-layar.mjs` |
| Klip suasana (B-roll) | **Dibangkitkan AI** | Google Flow (model Veo). Menampilkan anak bermain permainan tradisional, bukan tampilan aplikasi |
| Narasi suara | **Bukan AI** | Direkam langsung oleh pengembang |
| Teks & grafis layar | **Bukan AI** | Ditambahkan saat penyuntingan |

Seluruh prompt yang dipakai untuk membangkitkan klip B-roll tercatat lengkap di
`video/02-prompt-sesi-flow.md`. Dokumen itu berfungsi sebagai dokumen desain
(prompting) yang diwajibkan panduan.

Klip yang dibangkitkan Google Flow membawa penanda SynthID — penanda tak
terlihat yang menyatakan konten dibangkitkan AI dan bertahan setelah
penyuntingan. Penanda ini sengaja tidak dihilangkan.

Tidak ada satu pun klip AI yang menampilkan antarmuka aplikasi. Seluruh
tampilan karya yang muncul di video berasal dari rekaman layar yang
sebenarnya.

## Rujukan budaya

Nama dan penjelasan permainan tradisional yang disebut dalam karya ini
(gasing, panggal, pathon, maggasing; kaghati kolope, bebean; ketapel,
plintheng, bedil karet; congklak, dakon, congkak, mokaotan, nogarata)
merupakan pengetahuan budaya yang bersifat umum dan bukan objek hak cipta
perorangan.
