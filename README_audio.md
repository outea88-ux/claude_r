# Produksi Audio Bahan Belajar — Disertasi Herman

Pipeline yang mengubah `naskah_audio_disertasi_herman.md` (41 segmen) menjadi
satu berkas audio bahan belajar lengkap dengan penanda bab, transkrip, dan
manifest.

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt          # edge-tts
# ffmpeg wajib ada di PATH

python build_audio.py all                # backend edge-tts (mutu terbaik)
```

Tiap tahap juga bisa dijalankan sendiri: `plan`, `synth`, `master`, `qc`.
Tahap `synth` aman diulang — potongan yang berkasnya sudah ada dilewati,
jadi kegagalan di potongan ke-130 tidak memaksa mengulang dari nol.

---

## PENTING — kenapa audio di repo ini bukan pakai edge-tts

Audio yang tersedia di sini **tidak** memakai `id-ID-ArdiNeural` /
`id-ID-GadisNeural`. Sesi pembuatannya berjalan di dalam sandbox Claude Code
yang seluruh lalu lintas keluarnya lewat proxy penegak kebijakan, dan
edge-tts terhalang di dua titik yang berdiri sendiri:

1. **Host diblokir kebijakan jaringan.** Permintaan CONNECT ke
   `speech.platform.bing.com:443` dijawab `403` oleh gateway.
2. **Upgrade WebSocket tidak didukung proxy.** Setelah masalah sertifikat CA
   diperbaiki dan koneksi TLS berhasil, handshake WebSocket ke
   `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1`
   tetap dijawab `403 Invalid response status`. Dokumentasi proxy memang
   mencantumkan WebSocket sebagai protokol yang tidak dilayani.

`pip install --upgrade edge-tts` sudah dilakukan (versi terpasang 7.2.8,
terbaru) — jadi ini bukan kasus token autentikasi kedaluwarsa. Ini batas
jaringan sandbox, bukan masalah versi.

**Piper, cadangan yang Anda tunjuk, juga tidak bisa dipakai di sini**, karena
dua hal:

- Seluruh model Piper dihosting di `huggingface.co`, yang juga dijawab `403`
  oleh gateway yang sama.
- Lebih mendasar: **Piper tidak punya suara Indonesia.** Berkas `VOICES.md`
  resmi Piper (berhasil diunduh dari GitHub) tidak memuat satu pun entri
  `id_ID`. Tabel perbandingan di prompt keliru pada baris ini.

Yang tersisa dan benar-benar bisa dijangkau dari sandbox adalah suara
Indonesia Google Translate. Itu yang dipakai, lewat `--backend gtrans`,
dan hasilnya sengaja diberi nama berakhiran `_gtrans` supaya tidak pernah
tertukar dengan versi neural.

### Cara mendapatkan versi neural yang sebenarnya

Di mesin Anda sendiri (tanpa proxy sandbox), cukup satu perintah:

```bash
python build_audio.py all            # backend edge-tts adalah default
```

Seluruh tahap lain identik. Yang berubah hanya sumber suaranya. Hasilnya
akan bernama `bahan_belajar_disertasi_herman.mp3` (tanpa akhiran `_gtrans`).

### Apa yang berbeda pada versi cadangan

| | edge-tts (dituju) | gtrans (yang ada di sini) |
|---|---|---|
| Suara | ArdiNeural (pria) + GadisNeural (wanita) | satu suara saja |
| Mutu | neural | non-neural, lebih datar |
| Kecepatan alami | ±140 kata/menit | ±98 kata/menit |
| Durasi total | ±72 menit | ±101 menit |
| `rate=` per segmen | diterapkan TTS | tidak diterapkan (lihat di bawah) |
| Pergantian suara SEG 38–39 | ganti penutur | geser pitch +7% |

Dua keputusan produksi yang perlu Anda tahu:

- **Rate naskah tidak diterapkan pada versi cadangan.** Penanda `rate=-2%`
  sampai `-6%` berarti "lebih lambat dari kecepatan bicara alami", dengan
  sasaran ±135 kata/menit. Suara cadangan sudah berjalan di 98 kata/menit —
  sudah jauh di bawah sasaran itu. Memperlambatnya lagi justru melawan
  maksud naskah. Mempercepatnya juga tidak dilakukan, karena Anda melarang
  mengejar durasi dengan cara itu. Jadi dibiarkan apa adanya, dan
  konsekuensinya durasi meleset dari rentang 68–82 menit. Perilaku ini bisa
  diubah dengan `--apply-rate`.
- **Pergantian suara SEG 38–39 ditiru dengan geseran pitch +7%** (`asetrate`
  + `atempo` balik, jadi durasi tidak berubah). Bukan penutur kedua yang
  sesungguhnya, tapi perubahan timbre-nya tetap terdengar, sehingga fungsi
  pedagogisnya — membangunkan perhatian setelah satu jam — tidak hilang.

Pada backend edge-tts kedua kompensasi ini mati sendiri: rate dan pitch
dikerjakan TTS-nya langsung, dan suara keduanya memang berbeda penutur.

---

## Tahapan

| Tahap | Perintah | Keluaran |
|---|---|---|
| 1–2 | `plan` | `build/plan.json`, `build/text_raw/`, `build/text_spoken/` |
| 3 | `synth` | `build/audio/NNN.mp3`, `build/meta/NNN.json` |
| 4 | `master` | `output/*.mp3`, `*.m4b`, `transkrip.srt`, `transkrip.txt`, `manifest.json` |
| 5 | `qc` | laporan pemeriksaan mutu ke stdout |

### Tahap 1 — parser

Hanya teks di dalam blok segmen yang diproses. Baris pembuka berpola
`=== SEG nn | voice=… | rate=… | pitch=… | judul ===`, penutup `=== END ===`.
Semua baris di luar blok — termasuk seluruh catatan dan tabel peta bab di
awal berkas — diabaikan total. `[[PAUSE n]]` memotong segmen jadi potongan
bicara dan hening bergantian; `[[SFX chime]]` jadi hening 1,2 detik.
Paragraf digabung, baris kosong berlebih dibuang, tanda baca tidak pernah
disentuh. Potongan di atas 1.800 karakter dipecah di batas kalimat terdekat.

Hasilnya: **136 potongan bicara + 106 potongan hening** dari 41 segmen.

### Tahap 2 — kamus pelafalan

Penggantian dilakukan dalam **satu kali sapuan** dengan satu pola
beralternasi yang diurutkan dari kunci terpanjang ke terpendek. Ini dua
sekaligus: "Mixed-Effects Random Forest" tidak bisa dipecah lebih dulu oleh
"Random Forest", dan hasil penggantian tidak bisa tergantikan lagi oleh
aturan lain. Pola case-sensitive, jadi `shap` huruf kecil tidak ikut
berubah, hanya `SHAP`.

Lima entri **ditambahkan** di luar kamus yang Anda berikan, karena lolos ke
pemeriksaan mutu butir 4. Semuanya terkumpul di `LEXICON_EXTRA` supaya
gampang dicabut:

| Pola | Jadi | Alasan |
|---|---|---|
| `A-I` | `a i` | naskah menulis "explainable A-I"; tanda hubung berisiko terbaca "strip" |
| `AI` | `a i` | jaga-jaga |
| `SHapley` | `syeplei` | kepanjangan SHAP; kamus asli hanya punya `Shapley` |
| `Additive` | `editif` | idem |
| `exPlanations` | `eksplenesyens` | idem |

### Tahap 4 — penyambungan

Tidak ada `-c copy` di mana pun. Tiap potongan didekode ke WAV 24 kHz mono,
disambung dengan `concat` demuxer, dinormalisasi loudness **dua tahap**
(`loudnorm=I=-16:TP=-1.5:LRA=11` — ukur dulu, baru terapkan dengan angka
hasil ukuran), lalu di-encode 96 kbps mono 24 kHz dengan tag ID3.

Versi `.m4b` memakai encoder AAC dengan penanda bab dari judul tiap segmen
lewat berkas `ffmetadata`, sehingga bisa melompat langsung ke bagian
kosakata atau bagian antisipasi penguji.

### Transkrip

`transkrip.srt` memakai **teks asli sebelum kamus pelafalan**, jadi tetap
terbaca manusia — bukan "syap" melainkan "SHAP". Cue dibuat setingkat
kalimat. Karena kamus hanya mengganti kata dan tidak pernah menyentuh tanda
baca, jumlah kalimat versi asli dan versi terucap selalu sama, sehingga
keduanya bisa dipasangkan satu-satu.

Waktunya dijumlahkan kumulatif per potongan. Pada backend edge-tts,
posisi tiap kalimat diambil dari `WordBoundary` milik `SubMaker`. Pada
backend cadangan yang tidak menyediakan word boundary, durasi potongan
dibagi proporsional menurut panjang kalimat — pendekatan, dan disebut di
sini supaya jelas.

---

## Memecah hasil akhir

```bash
python build_audio.py split
```

Memecah berkas akhir di **batas segmen** jadi beberapa mp3 yang masing-masing
tetap bisa diputar sendiri (bukan pecahan biner yang harus disatukan lagi),
dengan tag nomor trek. Dipakai di sini karena batas unggah 30 MiB sementara
berkas utuhnya 68 MiB. Hasilnya tiga bagian ±22,7 MB:

| Bagian | Segmen | Isi | Durasi |
|---|---|---|---|
| 1 | 01–15 | pembuka, prolog, dan hampir seluruh kosakata | 33,3 menit |
| 2 | 16–28 | sisa kosakata, tiga celah, teori, rumusan masalah | 32,7 menit |
| 3 | 29–41 | desain, pengolahan data, antisipasi penguji, latihan | 32,8 menit |

Jumlah durasi ketiganya 5.930,93 detik versus 5.930,81 detik berkas utuh —
selisih 0,12 detik dari padding encoder di dua titik sambung.

---

## Hasil pemeriksaan mutu (Tahap 5)

Laporan lengkap ada di `output/qc_report.txt`. Ringkasnya:

| Butir | Hasil |
|---|---|
| 1. Durasi total | 98,85 menit — **di luar** rentang 68–82 menit, lihat catatan di bawah |
| 2. Jumlah potongan | 136 bicara + 106 hening, 41/41 segmen — **lulus**, nol selisih |
| 3. Marker teknis di teks terucap | **nol** temuan untuk `===`, `[[`, `\|`, `**` — lulus |
| 4. Akronim lolos kamus | **nol** di seluruh naskah, bukan cuma di tiga sampel — lulus |
| 5. Loudness akhir | −16,4 LUFS, true peak −1,6 dBFS — lulus |

Soal butir 1: rentang 68–82 menit itu benar, dan yang dijaganya juga tercapai.
Tujuannya mendeteksi segmen hilang atau ganda — dan butir 2 membuktikan tidak
ada yang hilang maupun ganda. Selisihnya murni datang dari kecepatan bicara
suara cadangan: 98 kata/menit, bukan ±140 kata/menit seperti suara neural.
Dihitung dengan jumlah kata naskah yang sama pada kecepatan edge-tts,
durasinya **71,7 menit** — tepat di tengah rentang yang disyaratkan.

Angka LRA 2,6 LU jauh di bawah "11" bukan kegagalan: pada `loudnorm`, LRA
adalah batas atas rentang dinamika, bukan sasaran yang harus dikejar. Satu
penutur yang membaca dengan tenang memang punya rentang dinamika sempit.

### Verifikasi tambahan

- **Penyambungan tanpa hanyut.** Durasi hasil `concat` sama persis dengan
  jumlah durasi tiap potongan.
- **Tidak ada hening tak sengaja.** Sapuan `silencedetect` pada berkas akhir
  tidak menemukan satu pun hening di atas 10 detik (jeda terpanjang yang
  disengaja adalah 7 detik di SEG 41).
- **Geseran suara SEG 38–39 benar-benar terdengar.** Diukur dengan
  autokorelasi: F0 median naik dari 242,4 Hz ke 258,1 Hz (rasio 1,065 dari
  target 1,07) sementara durasi tetap 16,70 detik — jadi yang bergeser
  pitch-nya, bukan temponya.
- **Transkrip memakai teks asli.** Kata "syap" nol kali di `transkrip.srt`;
  yang muncul "SHAP", "S-M-P", "X-G-Boost" seperti di naskah.
