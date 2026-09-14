# Peta Kurikulum — Fase D (SMP)

Indikator berbobot paling besar dalam penilaian adalah *Kesesuaian Kurikulum*
(15%) dan *Akurasi Keilmuan* (15%). Dokumen ini memetakan tiap modul ke Capaian
Pembelajaran Fase D, sekaligus mencatat materi apa saja yang **dibuang** karena
sebenarnya milik jenjang SMA/SMK.

---

## Ringkasan pemetaan

| Modul | Mapel | Elemen CP Fase D | Kelas |
|---|---|---|---|
| Gasing | IPA | Gerak & gaya; Usaha & energi | VII–VIII |
| Layang-Layang | IPA | Gerak & gaya; keseimbangan gaya | VII–VIII |
| Ketapel | IPA | Usaha, energi, perubahan bentuk energi | VIII |
| Congklak | Matematika | Bilangan: pembagian bersisa; Pola bilangan | VII–VIII |

---

## Modul 1 — Gasing

**Tujuan Pembelajaran**
1. Menjelaskan bahwa gaya gesek mengubah energi gerak menjadi energi panas.
2. Menganalisis pengaruh massa, ukuran, dan kekasaran permukaan terhadap lama
   berputarnya benda.
3. Merancang percobaan uji adil dengan mengubah satu variabel.

**Yang dihapus dari versi awal (materi SMA/SMK):**

| Dihapus | Alasan |
|---|---|
| Vektor momentum sudut $\vec{L} = I\omega$ | Vektor & perkalian silang baru di SMA XI |
| Torsi $\vec{\tau} = \vec{r} \times \vec{F}$ | Perkalian silang vektor — SMA XI |
| Laju presesi $\Omega_p = mgr_{cm}/(I\omega)$ | Dinamika giroskop — SMA/perguruan tinggi |
| Momen inersia $I = k\,m\,r^2$ | Momen inersia — SMA XI |
| Energi rotasi $E_{rot} = \tfrac12 I\omega^2$ | Turunan momen inersia — SMA XI |
| Nutasi & kecepatan sudut kritis | Di luar jangkauan SMP |

**Yang menggantikan:** panel ukur "Kecepatan Putar (putaran/menit)", "Lama
Berputar (detik)", "Sisa Tenaga Putar (%)", dan "Kemiringan (derajat)" — semua
besaran yang bisa langsung diamati dan dihitung murid SMP.

> **Catatan keilmuan.** Model fisikanya **tidak** disederhanakan, hanya
> rumusnya yang tidak ditampilkan. Momen inersia, laju presesi, dan torsi gesek
> tetap dihitung di balik layar, sehingga perilaku simulasi benar. Tetapan
> geseknya ditera agar lama putar masuk akal: 8–90 detik, seperti gasing kayu
> sungguhan.

---

## Modul 2 — Layang-Layang

**Tujuan Pembelajaran**
1. Mengidentifikasi gaya-gaya yang bekerja pada benda dan menggambarkannya
   sebagai anak panah.
2. Menghitung berat benda dari massa dan percepatan gravitasi.
3. Menjelaskan keadaan setimbang ketika resultan gaya bernilai nol (Hukum I Newton).

**Yang dihapus dari versi awal:**

| Dihapus | Alasan |
|---|---|
| $F_L = \tfrac12 \rho v^2 A C_L$ | Tekanan dinamis & koefisien angkat — SMA XI |
| $C_L \approx 2\pi \sin\alpha\cos\alpha$ | Trigonometri lanjut + aerodinamika |
| $C_D = C_{D0} + C_L^2/(\pi AR)$ | *Induced drag*, rasio aspek sayap |
| $T = \sqrt{(F_L - mg)^2 + F_D^2}$ | Penjumlahan vektor & Pythagoras gaya — SMA X |
| Torsi pemulih ekor $\tau = F_D \cdot d$ | Momen gaya — SMA XI |

**Yang menggantikan:** empat anak panah berwarna dengan nama berbahasa
Indonesia (Gaya angkat, Hambatan angin, Berat, Tarikan tali). Panjang panah
menunjukkan besar gaya — representasi baku gaya di SMP.

> **Catatan keilmuan.** Perhitungan gaya tetap memakai model pelat tipis yang
> benar. Layangan dimodelkan terikat pada busur lingkaran sepanjang talinya,
> lalu gaya penyinggung busur diintegrasikan. Cara ini lebih stabil sekaligus
> lebih benar daripada pendekatan berbasis batasan di berkas awal.

---

## Modul 3 — Ketapel

**Tujuan Pembelajaran**
1. Mengidentifikasi energi potensial elastis pada benda lentur yang diregangkan.
2. Menjelaskan perubahan energi potensial elastis menjadi energi kinetik.
3. Menghitung energi kinetik dengan $E_k = \tfrac12 m v^2$.
4. Menjelaskan bentuk lintasan parabola sebagai akibat gravitasi.

**Yang dihapus dari versi awal:**

| Dihapus | Alasan |
|---|---|
| $E_p = \tfrac12 k \Delta x^2$ | Hukum Hooke & tetapan pegas — SMA XI |
| Tetapan karet $k$ dalam N/m | Besaran SMA; diganti tingkatan Lentur/Sedang/Kaku |
| $F_{impact} = \Delta p/\Delta t$ | Impuls & momentum — SMA X |
| Perubahan momentum $\Delta p = mv$ | Momentum — SMA X |

**Yang dipertahankan:** $E_k = \tfrac12 m v^2$ **tetap ditampilkan** karena
rumus ini memang materi Fase D pada bab Usaha dan Energi.

> **Perbaikan keilmuan penting.** Pada berkas awal, jarak tarikan karet
> dikonversi memakai skala dunia (34 piksel/meter), sehingga tarikan sepanjang
> 118 piksel terbaca **3,5 meter** dan menghasilkan tenaga **720 joule** pada
> kecepatan **85 m/s** — setara ketapel raksasa, bukan mainan tangan. Skala
> tarikan kini dipisahkan (tarikan penuh = 45 cm), sehingga nilainya menjadi
> 9–53 joule pada 4–46 m/s, sesuai ketapel sungguhan.

---

## Modul 4 — Congklak

**Tujuan Pembelajaran**
1. Menggunakan pembagian bersisa untuk memprediksi posisi pada pola berulang.
2. Mengenali pola bilangan pada lintasan melingkar.
3. Menyusun strategi berdasarkan perhitungan, bukan tebakan.

**Yang dihapus dari versi awal:**

| Dihapus | Alasan |
|---|---|
| Algoritma Minimax | Ilmu komputer tingkat lanjut |
| Pemangkasan Alfa-Beta | Ilmu komputer tingkat lanjut |
| Teori permainan *zero-sum* | Perguruan tinggi |
| Fungsi evaluasi heuristik $V(s)$ | Perguruan tinggi |
| Tabel matriks keputusan 3-*ply* | Turunan Minimax |
| Istilah "aritmatika modulo" | Nama universitas untuk konsep SMP |

**Yang menggantikan:** "Asisten Prediksi" yang menampilkan hitungan terbuka —
nomor urut asal + jumlah biji, lalu dibagi 15 dan diambil sisanya. Lawan
komputer memakai strategi satu langkah ke depan yang bisa dijelaskan ke murid:
*"pilih langkah yang paling banyak menambah biji di rumah sendiri."*

> ### Perbaikan keilmuan paling penting di seluruh karya
>
> Berkas awal menyatakan rumus penaburan congklak adalah
> $\text{Pit}_{next} = (\text{Pit}_{curr} + 1) \bmod 16$.
>
> **Ini keliru.** Papan congklak memang punya 16 lubang, tetapi setiap pemain
> **selalu melewati rumah lawan**. Jadi satu putaran penuh seorang pemain hanya
> melewati **15 lubang**: 7 lubang sendiri + 1 rumah sendiri + 7 lubang lawan.
>
> Dengan modulus 16, prediksi letak biji terakhir akan meleset begitu jumlah
> biji melewati satu putaran — persis pada kasus yang paling sering ditemui
> murid. Seluruh modul kini memakai modulus **15** yang benar, dan angka 15 itu
> justru dijadikan pertanyaan pemantik di Langkah 1.
>
> Ini juga kabar baik secara kurikulum: "sisa pembagian" adalah materi
> Matematika **Kelas VII**, sedangkan "aritmatika modulo" terdengar seperti
> materi kuliah. Konsepnya sama, namanya saja yang perlu diturunkan.

---

## Asesmen

| Jenis | Jumlah | Letak |
|---|---|---|
| Formatif | 4 soal × 4 modul = **16 soal** | Langkah 4 tiap modul |
| Sumatif | **10 soal** | Layar Evaluasi Akhir |
| **Total** | **26 soal** | — |

Panduan mensyaratkan minimal 3 soal dengan tingkat kesulitan bervariasi.
Sebaran taksonomi di karya ini: C1–C2 (mengingat & memahami) 9 soal,
C3 (menerapkan, termasuk hitungan) 10 soal, C4 (menganalisis, termasuk
merancang percobaan) 7 soal.

**Setiap pilihan jawaban memiliki penjelasannya sendiri** — bukan hanya kunci
jawabannya. Pengecoh disusun dari miskonsepsi yang benar-benar umum, misalnya
lupa mengubah gram ke kilogram, lupa mengkuadratkan kecepatan, atau mengira
energi bisa lenyap.
