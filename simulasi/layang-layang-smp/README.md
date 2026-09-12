# Petualangan Layang-Layang — versi SMP

Simulasi IPA interaktif untuk siswa SMP (kelas 7–9): atur angin, kemiringan, massa, luas,
panjang tali, dan panjang ekor sebuah layang-layang tradisional, lalu amati gaya-gaya yang
bekerja padanya secara langsung.

Satu berkas, tanpa proses build. Buka `index.html` di peramban mana pun.

## Model fisika

Keadaan tunak (*quasi-static*) layang-layang dengan angin horizontal:

| Besaran | Rumus |
|---|---|
| Koefisien gaya normal pelat datar | `C_N = 2 sin α` |
| Gaya angkat | `L = ½ ρ v² A · C_N cos α` |
| Gaya hambat | `D = ½ ρ v² A · (C_D0 + C_ekor + C_N sin α)` |
| Berat | `W = m · g` |
| Sudut tali setimbang | `θ = arctan((L − W) / D)` |
| Tegangan tali | `T = √((L − W)² + D²)` |
| Ketinggian | `h = L_tali · sin θ` |

`g = 10 m/s²` dan `ρ = 1,2 kg/m³` mengikuti kebiasaan buku IPA SMP.

Sudut `θ` tidak dipatok langsung, melainkan dikejar oleh pegas teredam ringan, sehingga
layangan mengayun sebentar sebelum tenang saat slider digeser atau tali disentak.

**Kestabilan ekor.** Panjang ekor yang dibutuhkan dimodelkan sebagai
`L_butuh = 0,35 + 0,055 v + 0,9 A`. Kekurangan ekor menimbulkan goyangan dan menurunkan
sudut tali; ekor berlebih menambah hambatan sehingga layangan terbang rendah. Trade-off
inilah yang membuat slider ekor punya arti.

Konsekuensi yang sengaja dipertahankan karena bernilai didaktis: **gaya angkat** memuncak di
`α ≈ 45°`, sedangkan **ketinggian** memuncak di `α ≈ 20°` — karena hambatan ikut tumbuh lebih
cepat daripada angkatnya.

## Kaitan kurikulum

| Bagian | Materi IPA SMP |
|---|---|
| Neraca Gaya, panah gaya | Gaya, resultan gaya, satuan newton (kelas 7–8) |
| Chip "SEIMBANG ✓" | Hukum I Newton — resultan gaya nol (kelas 8) |
| Hint di slider massa | Berat vs massa, `w = m · g` (kelas 8) |
| Zona tekanan di kanvas | Tekanan udara; cepat = tekanan rendah (kelas 8) |
| Slider ekor | Gaya hambat udara, kesetimbangan (kelas 8) |

Semua notasi LaTeX dan turunan tingkat SMA (Bernoulli formal, koefisien `C_L`/`C_D`,
penguraian vektor, torsi, *aspect ratio*) dibuang dari antarmuka.

## Yang ada di dalam

- Kanvas simulasi: aliran angin, zona tekanan, empat panah gaya berskala sama, busur sudut
  tali, garis ketinggian bersatuan meter, ekor yang tertiup angin.
- **Neraca Gaya** — perbandingan gaya angkat vs berat memakai satu skala, plus kalimat
  vonis yang berubah mengikuti keadaan.
- **6 misi** yang tercentang otomatis, dan **kuis 6 soal** dengan penjelasan langsung.
- Tiga preset layangan tradisional Indonesia: Aduan, Kaghati Kolope (Muna), Bebean (Bali).

## Perbaikan dari berkas asal

- Tombol mode SMA menyembunyikan panelnya sendiri (`scienceSmaView` di-`remove` lalu
  langsung di-`add` kembali) sehingga panel SMA tidak pernah tampil.
- 26 potong LaTeX (`$F_L$`, `$\vec{T}$`, …) tampil apa adanya karena MathJax/KaTeX tidak
  pernah dimuat.
- `resizeCanvas()` memanggil `ctx.scale()` berulang sehingga skala menumpuk tiap kali
  jendela diubah ukurannya.
- Integrasi gaya mencampur satuan meter dan piksel, dan redamannya bergantung *frame rate*.
- Panah gaya berskala tetap 8 px/N — pada angin kencang panjangnya bisa ribuan piksel.
- `C_L = 2,2 sin α cos α` memuncak di 45°, bertentangan dengan label "Optimal 20–30°".
- AudioContext dibuat sebelum ada interaksi pengguna sehingga diblokir peramban.
- Di layar ponsel, HUD, legenda, dan bilah tombol saling menumpuk di atas kanvas.
