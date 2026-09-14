# Prompt Sesi — Google Flow (Veo)

Sepuluh sesi, masing-masing **8 detik**, dijalankan satu per satu.

**Mengapa harus tepat 8 detik:** Veo hanya menghasilkan 1080p pada klip
8 detik. Klip 4 atau 6 detik terkunci di 720p. Karena panduan lomba
menganjurkan 1080p, semua sesi dibuat 8 detik lalu dipotong saat penyuntingan
bila perlu.

**Pengaturan Flow untuk semua sesi:**

| Pengaturan | Nilai |
|---|---|
| Model | Veo (versi terbaru yang tersedia di paket Anda) |
| Rasio | **16:9** |
| Resolusi | **1080p** |
| Durasi | **8 detik** |
| Mode | Text-to-Video (kecuali Sesi 02, lihat catatannya) |

Prompt ditulis dalam **bahasa Inggris** karena model ini paling patuh pada
bahasa Inggris. Narasi Indonesia direkam terpisah — lihat
[`03-naskah-narasi.md`](03-naskah-narasi.md).

Rumus prompt yang dipakai mengikuti anjuran resmi:
**[Sinematografi] + [Subjek] + [Aksi] + [Konteks] + [Gaya & Suasana]**,
ditambah teknik penandaan waktu `[00:00-00:04]` untuk klip yang berisi dua
gerakan kamera.

---

## Langkah 0 — Siapkan Ingredients (kunci tokoh & gaya)

Kerjakan ini **sebelum** sesi mana pun. Tanpa langkah ini, wajah dan gaya
warna akan berubah-ubah antarsesi, dan videonya terasa seperti tempelan.

Di Flow, buka **Ingredients to Video**, lalu buat tiga bahan berikut:

**Bahan A — Tokoh "Arif" (murid laki-laki)**
```
Portrait of a 13-year-old Indonesian boy, short black hair, warm brown skin,
wearing a simple white short-sleeve school shirt, friendly and curious
expression, natural daylight, plain neutral background, photographic,
sharp focus, no text.
```

**Bahan B — Tokoh "Sari" (murid perempuan)**
```
Portrait of a 13-year-old Indonesian girl, black hair tied in a ponytail,
warm brown skin, wearing a simple white short-sleeve school shirt, bright
curious expression, natural daylight, plain neutral background, photographic,
sharp focus, no text.
```

**Bahan C — Gaya visual**
```
Warm late-afternoon Indonesian village light, golden hour, soft natural
shadows, earthy palette of terracotta, bamboo green and warm cream,
documentary photography style, shallow depth of field, gentle film grain,
no color grading extremes.
```

Kunci ketiganya di proyek. Setiap sesi berikutnya diawali kalimat rujukan
yang sudah disiapkan di tiap prompt.

---

## Cara membaca tiap sesi

| Bagian | Maksud |
|---|---|
| **Posisi** | Letaknya di garis waktu video akhir |
| **Tujuan** | Apa yang harus dicapai klip ini, dan prinsip mana yang dilayani |
| **Prompt** | Salin apa adanya ke Flow |
| **Negative prompt** | Salin ke kolom negative prompt bila tersedia |
| **Kriteria terima** | Periksa ini sebelum lanjut ke sesi berikutnya |

---

# SESI 01 — Pembuka: halaman kampung

**Posisi:** 0:00–0:08 · **Blok:** Pembuka (hook)

**Tujuan.** Menarik perhatian dalam tiga detik pertama dan menetapkan bahwa ini
tentang anak Indonesia, bukan stok video generik. Melayani *kontekstualisasi*
dan *daya tarik* pada rubrik.

**Prompt**
```
Using the provided style reference, a wide establishing shot slowly pushing in.
Four Indonesian children around 12 to 14 years old play traditional games
together in the packed-earth front yard of a village house. One boy crouches
winding string around a wooden spinning top, two children hold a paper kite,
a girl sits cross-legged beside a carved wooden congklak board. Coconut palms
and a bamboo fence frame the background, warm late-afternoon golden light rakes
across the yard, dust motes float in the air. Documentary photography style,
shallow depth of field, gentle film grain, natural unposed movement.
SFX: distant children laughing, soft breeze through palm leaves, a rooster
far away. No music.
```

**Negative prompt**
```
subtitles, captions, on-screen text, watermark, logo, brand marks, modern
plastic toys, smartphones, cars, western suburban houses, studio lighting,
distorted hands, extra fingers, warped faces
```

**Kriteria terima**
- [ ] Tidak ada tulisan apa pun di bingkai
- [ ] Wajah anak tampak wajar, jari tangan tidak cacat
- [ ] Keempat permainan terlihat, minimal sekilas
- [ ] Ada ruang kosong di tepi bawah bingkai (untuk jaga-jaga pemotongan lencana)

---

# SESI 02 — Pemantik: gasing melambat lalu tumbang

**Posisi:** 0:08–0:16 · **Blok:** Pembuka (pertanyaan pemantik)

**Tujuan.** Memunculkan pertanyaan yang dijawab seluruh video: *kenapa gasing
berhenti sendiri?* Melayani prinsip **pemenggalan** — satu klip, satu gagasan.

**Prompt**
```
Using the provided style reference, an extreme close-up at ground level with a
macro lens, camera perfectly still.
[00:00-00:04] A wooden spinning top with a steel tip spins fast on hard packed
earth, its painted stripes blurred into smooth rings, tiny dust particles
orbiting around its base.
[00:04-00:08] The spin visibly slows, the top begins to wobble in widening
circles, leans further and further, then topples onto its side and rolls to a
stop. Warm late-afternoon light from the left, long soft shadow stretching
across the ground. Documentary photography style, very shallow depth of field,
gentle film grain.
SFX: the steady low hum of a spinning wooden top, gradually dropping in pitch,
ending with a soft wooden clatter as it falls. No music.
```

**Negative prompt**
```
subtitles, captions, on-screen text, watermark, logo, hands entering frame,
plastic toys, fast camera movement, motion blur on the camera, slow motion
ramping
```

**Kriteria terima**
- [ ] Perlambatan putaran terlihat jelas, bukan berhenti mendadak
- [ ] Gasingnya kayu dengan ujung logam, bukan mainan plastik
- [ ] Bunyinya ikut merendah seiring melambat
- [ ] Kamera diam — gerakan kamera akan merusak fokus pada gasingnya

> **Catatan.** Kalau hasilnya kurang meyakinkan setelah dua kali percobaan,
> pakai **Frames to Video**: bingkai awal gasing tegak berputar, bingkai akhir
> gasing tergeletak. Flow akan mengisi transisinya.

---

# SESI 03 — Gasing di dunia nyata

**Posisi:** 0:36–0:44 · **Blok:** Isi (jembatan ke modul Gasing)

**Tujuan.** Menghubungkan gerakan tangan sungguhan dengan penggeser "kekuatan
tarikan tali" di aplikasi. Melayani prinsip **kontiguitas temporal**: gambar
dan narasi bicara hal yang sama di detik yang sama.

**Prompt**
```
Using the provided character and style references, a tight medium shot at
child's eye level, camera following the action.
[00:00-00:03] Close on the hands of a 13-year-old Indonesian boy carefully
winding rough cotton string around the grooved waist of a wooden spinning top.
[00:03-00:08] He swings his arm down and releases, the string unspools in a
sharp snap, and the top lands spinning on the packed earth as the camera
follows it down and settles. Warm late-afternoon light, bamboo fence softly
blurred in the background. Documentary photography style, shallow depth of
field, gentle film grain.
SFX: the dry rasp of string unwinding, a sharp snap of release, the low hum of
the top settling into its spin. No music.
```

**Negative prompt**
```
subtitles, captions, on-screen text, watermark, logo, distorted hands, extra
fingers, blurred faces, plastic toys, indoor setting, night
```

**Kriteria terima**
- [ ] Tangannya utuh dan gerakannya masuk akal
- [ ] Gasing benar-benar berputar setelah dilepas, bukan diam
- [ ] Wajah tokoh cocok dengan Bahan A

---

# SESI 04 — Layang-layang di dunia nyata

**Posisi:** 1:06–1:14 · **Blok:** Isi (jembatan ke modul Layang-Layang)

**Tujuan.** Memperlihatkan empat gaya bekerja tanpa satu kata pun: tali tegang,
layangan miring, angin menerpa. Melayani prinsip **pra-pelatihan** — murid
melihat benda dan kata kuncinya sebelum diberi penjelasan gayanya.

**Prompt**
```
Using the provided character and style references, a low angle wide shot
looking up past the subject into the sky.
[00:00-00:04] An Indonesian girl around 13 stands in an open field of green
rice paddies, both hands gripping a taut kite string, her shirt and hair pushed
sideways by steady wind, she leans back slightly against the pull.
[00:04-00:08] The camera tilts up along the string to a colorful diamond paper
kite with a long ribbon tail, riding high and steady against a bright sky with
scattered white clouds, the tail rippling in the wind. Warm late-afternoon
light, documentary photography style, deep focus, gentle film grain.
SFX: strong steady wind, the paper kite fluttering and snapping, distant
insects in the paddy. No music.
```

**Negative prompt**
```
subtitles, captions, on-screen text, watermark, logo, modern sport kite,
parafoil kite, drone, airplane, city skyline, power lines, distorted hands
```

**Kriteria terima**
- [ ] Talinya tampak **tegang lurus**, bukan menggantung lemas — ini kunci
      konsep gaya yang akan dijelaskan
- [ ] Layangannya berbentuk belah ketupat berekor, bukan layangan modern
- [ ] Arah angin pada baju dan pada ekor layangan **searah**

---

# SESI 05 — Ketapel di dunia nyata

**Posisi:** 1:30–1:38 · **Blok:** Isi (jembatan ke modul Ketapel)

**Tujuan.** Menampilkan karet teregang — wujud nyata "energi tersimpan" —
lalu pelepasannya. Melayani prinsip **penanda**: mata penonton diarahkan ke
karet yang menegang.

**Prompt**
```
Using the provided character and style references, a tight over-the-shoulder
medium shot, camera steady.
[00:00-00:04] A 13-year-old Indonesian boy holds a Y-shaped wooden slingshot
made from a tree branch, slowly drawing the rubber band back beside his cheek,
the rubber visibly stretching thin and taut, his eyes narrowed in concentration.
[00:04-00:08] He releases; the rubber snaps forward and the camera whips to
follow a small stone arcing away over a grassy field toward a row of empty tin
cans on a wooden plank. Warm late-afternoon light, documentary photography
style, shallow depth of field, gentle film grain.
SFX: the creak of stretching rubber, a sharp snap on release, a faint whistle
through the air, a distant metallic ping. No music.
```

**Negative prompt**
```
subtitles, captions, on-screen text, watermark, logo, aiming at animals,
aiming at people, birds, metal commercial slingshot, weapons, blood,
distorted hands, extra fingers
```

**Kriteria terima**
- [ ] Sasarannya **kaleng kosong**, bukan makhluk hidup — ini penting, panduan
      melarang unsur kekerasan
- [ ] Peregangan karet terlihat jelas di paruh pertama klip
- [ ] Gagangnya cabang kayu, bukan ketapel logam pabrikan

> **Catatan keamanan.** Kalau hasil generasi memperlihatkan sasaran hidup,
> buang klipnya dan jalankan ulang. Jangan diperbaiki dengan pemotongan.

---

# SESI 06 — Jembatan: dari halaman ke layar

**Posisi:** 0:16–0:24 · **Blok:** Pembuka (tujuan + judul)

**Tujuan.** Transisi dari dunia nyata ke dunia digital. Di sinilah judul karya
muncul sebagai teks yang ditambahkan **saat penyuntingan**, bukan dibangkitkan AI.

**Prompt**
```
Using the provided character and style references, a slow dolly-in medium shot
at table height.
Two Indonesian students around 13, a boy and a girl, sit side by side on a
woven bamboo mat on a shaded veranda. A wooden spinning top, a folded paper
kite, and a wooden congklak board rest on the mat in front of them. The girl
opens a laptop and turns it slightly toward them; the screen is angled away
from camera and stays completely out of view. Both lean in with curious
expressions. Warm late-afternoon light from the side, documentary photography
style, shallow depth of field, gentle film grain.
SFX: a soft laptop lid opening, quiet birdsong, gentle breeze. No music.
```

**Negative prompt**
```
subtitles, captions, on-screen text, watermark, logo, visible computer screen,
readable screen content, user interface, app interface, graphs, charts,
glowing monitor facing camera, distorted hands
```

**Kriteria terima**
- [ ] **Layar laptop benar-benar tidak terlihat isinya** — ini syarat mutlak
- [ ] Ketiga benda permainan terlihat di depan mereka
- [ ] Ada ruang kosong di sepertiga atas bingkai untuk menempatkan judul

> Kalau layarnya tetap terlihat isinya setelah dua percobaan, ubah kalimatnya
> menjadi `the laptop screen faces completely away from the camera, only its
> back lid is visible`.

---

# SESI 07 — Congklak di dunia nyata

**Posisi:** 1:52–2:00 · **Blok:** Isi (jembatan ke modul Congklak)

**Tujuan.** Menampilkan ritme berhitung: satu biji, satu lubang. Melayani
prinsip **pemenggalan** dan menyiapkan gagasan "menghitung sebelum melangkah".

**Prompt**
```
Using the provided style reference, a top-down overhead close-up, camera
locked off and perfectly still.
A pair of young Indonesian hands moves across a dark carved teak congklak
board with two rows of seven shallow bowls and one larger store at each end.
The hands scoop a handful of small white cowrie shells from one bowl, then drop
them one at a time into consecutive bowls with a steady rhythm, each shell
landing with a soft click. The board rests on a woven bamboo mat, warm
late-afternoon light falls from the upper left casting soft shadows inside each
bowl. Documentary photography style, macro lens, shallow depth of field,
gentle film grain.
SFX: the soft repeated click of shells dropping into wooden bowls, in an even
unhurried rhythm. No music.
```

**Negative prompt**
```
subtitles, captions, on-screen text, watermark, logo, plastic board, glass
marbles, modern board game, distorted hands, extra fingers, fast motion,
camera movement
```

**Kriteria terima**
- [ ] Papannya kayu berukir dengan **7 lubang per baris** — periksa jumlahnya
- [ ] Bijinya kerang atau biji-bijian, bukan kelereng kaca
- [ ] Ritme jatuhnya biji terdengar **teratur**, tidak tergesa

---

# SESI 08 — Murid memakai aplikasi di kelas

**Posisi:** 2:28–2:36 · **Blok:** Isi (penutup bagian aplikasi)

**Tujuan.** Menunjukkan penggunaan nyata di ruang kelas tanpa memalsukan
tampilan aplikasi. Kamera sengaja berada di belakang bahu dengan layar jauh
di luar fokus.

**Prompt**
```
Using the provided character and style references, an over-the-shoulder medium
shot from behind and to the side, the laptop screen far out of focus and
unreadable, extremely shallow depth of field with focus locked on the students'
faces.
Two Indonesian students around 13 sit together at a simple wooden classroom
desk, both looking at a laptop, one pointing at it and turning to the other
with a surprised delighted expression as if something just clicked. Soft
daylight from a classroom window on the left, plain painted wall behind them.
Documentary photography style, gentle film grain, natural unposed movement.
SFX: quiet classroom murmur, a soft laugh, a pencil tapping the desk. No music.
```

**Negative prompt**
```
subtitles, captions, on-screen text, watermark, logo, readable screen, sharp
screen, user interface, app interface, graphs, charts, numbers on screen,
glowing monitor, distorted hands
```

**Kriteria terima**
- [ ] Layar **kabur total** sampai tidak bisa ditebak isinya
- [ ] Fokus jelas berada di wajah, bukan di layar
- [ ] Ekspresinya "baru ngerti", bukan sekadar tersenyum ke kamera

---

# SESI 09 — Diskusi kelas

**Posisi:** 2:36–2:44 · **Blok:** Penutup (simpulan)

**Tujuan.** Memperlihatkan hasil belajar berupa percakapan, bukan skor.
Melayani prinsip **personalisasi** — nuansanya manusiawi, bukan korporat.

**Prompt**
```
Using the provided character and style references, a slow lateral tracking
shot at seated eye level.
A small group of four Indonesian students around 13 sit in a loose circle on
the classroom floor, a wooden spinning top and a paper kite on the floor
between them. One girl gestures with her hands as if explaining an idea, the
others lean in and nod, one boy raises a finger as if adding something. A
teacher crouches at the edge of the group listening. Soft daylight from a
window, plain classroom wall. Documentary photography style, shallow depth of
field, gentle film grain, natural unposed movement.
SFX: overlapping quiet student voices, a warm laugh, chairs shifting. No music.
```

**Negative prompt**
```
subtitles, captions, on-screen text, watermark, logo, whiteboard with writing,
posters with text, laptops, phones, distorted hands, staring into camera
```

**Kriteria terima**
- [ ] Tidak ada tulisan terbaca di papan tulis atau poster dinding
- [ ] Tidak ada yang menatap kamera
- [ ] Ada benda permainan di antara mereka — menjaga benang merah cerita

---

# SESI 10 — Penutup: bermain dengan mata baru

**Posisi:** 2:44–2:52 · **Blok:** Penutup (refleksi)

**Tujuan.** Menutup lingkaran: kembali ke halaman rumah, tetapi sekarang anak
itu **mengamati** permainannya. Melayani prinsip **koherensi** — akhir yang
menutup pembukaan, tanpa tambahan apa pun.

**Prompt**
```
Using the provided character and style references, a slow pull-back wide shot
rising gently.
[00:00-00:04] Close on a 13-year-old Indonesian boy crouching beside a spinning
wooden top in the village yard, watching it intently, tilting his head as if
measuring how long it lasts.
[00:04-00:08] The camera pulls back and rises to reveal the whole yard: another
child running with a kite trailing behind, two children bent over a congklak
board on the porch, warm golden light flooding the scene, palm trees swaying.
Documentary photography style, deep focus in the wide, gentle film grain.
SFX: children laughing, wind in palm leaves, the hum of the spinning top fading
into the ambience. No music.
```

**Negative prompt**
```
subtitles, captions, on-screen text, watermark, logo, sunset cliche lens flare,
slow motion, modern buildings, vehicles, distorted faces
```

**Kriteria terima**
- [ ] Suasananya menyambung dengan Sesi 01 — terasa halaman yang sama
- [ ] Gerakan mundur kameranya halus, tidak tersentak
- [ ] Ada ruang kosong di tengah bawah untuk teks penutup

---

## Ringkasan sesi

| Sesi | Isi | Posisi | Mode Flow |
|---|---|---|---|
| 01 | Halaman kampung, empat permainan | 0:00–0:08 | Text-to-Video |
| 02 | Gasing melambat lalu tumbang | 0:08–0:16 | Text-to-Video / Frames-to-Video |
| 06 | Jembatan ke layar + judul | 0:16–0:24 | Text-to-Video |
| 03 | Gasing dilempar | 0:36–0:44 | Text-to-Video |
| 04 | Layangan di atas sawah | 1:06–1:14 | Text-to-Video |
| 05 | Ketapel dibidik | 1:30–1:38 | Text-to-Video |
| 07 | Congklak ditabur | 1:52–2:00 | Text-to-Video |
| 08 | Murid memakai aplikasi | 2:28–2:36 | Text-to-Video |
| 09 | Diskusi kelas | 2:36–2:44 | Text-to-Video |
| 10 | Penutup, bermain lagi | 2:44–2:52 | Text-to-Video |

**Total B-roll: 80 detik.** Urutan pengerjaan yang disarankan: 01 → 02 → 06
(supaya gaya visualnya terkunci dulu) → 03 → 04 → 05 → 07 → 08 → 09 → 10.

---

## Kalau hasilnya belum sesuai

| Masalah | Yang harus diubah |
|---|---|
| Wajah berubah antarsesi | Pastikan kalimat `Using the provided character references` ada, dan Ingredients benar-benar terpasang |
| Muncul teks/subtitle di bingkai | Tambahkan lagi `no text of any kind anywhere in the frame` di akhir prompt |
| Terlalu seperti iklan | Hapus kata sifat berlebihan, tambahkan `unpolished, candid, handheld feel` |
| Gerakan terlalu cepat | Tambahkan `slow deliberate movement, calm pacing` |
| Suasananya bukan Indonesia | Pertegas: `rural Java, Indonesia`, `bamboo`, `woven mat`, `packed earth yard` |
| Tangan cacat | Kurangi jumlah tangan dalam bingkai, pakai bidikan yang lebih lebar |
| Layar laptop terbaca | Perkuat negative prompt dan ubah sudut kamera jadi dari belakang |
