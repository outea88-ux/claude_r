# Jalan Teratai

Prototipe LMS bergamifikasi untuk Pendidikan Agama Buddha SMP (sisi siswa saja).

Alur satu modul: 1 slide literasi → 5 soal (PG dan esai satu kata) → misi Tetris → XP, item, dan avatar naik level.

## Menjalankan

Buka `index.html` di browser. Tidak perlu server, login, atau instalasi.
Progres siswa disimpan di browser perangkat itu saja (localStorage), jadi akan hilang jika ganti perangkat atau data browser dihapus.

## Mengubah materi

Semua konten ada di `js/materi.js`: teks literasi, bank soal, jawaban yang diterima, urutan tipe soal, dan target baris Tetris.
Jawaban esai dicocokkan tanpa memperhatikan huruf besar/kecil, spasi di awal/akhir, dan tanda diakritik.

## Aturan permainan (diatur di `js/app.js`)

| Hal | Nilai |
|---|---|
| Poin benar | PG 10, esai 15 (×2 dengan Double Poin) |
| Jawaban salah | Poin tidak berkurang, streak putus (kecuali Perisai aktif) |
| Level | 0 / 100 / 250 / 450 XP → 4 tahap avatar |
| Misi Tetris | Hapus 6 baris. Berhasil: +1 Double Poin, +40 XP. Gagal: +10 XP |
| Kecepatan Tetris | Tiap jawaban benar membuat blok jatuh lebih lambat |
| Catatan penguasaan | Hanya jumlah jawaban benar, tidak dipengaruhi item |

| Item | Efek | Didapat dari |
|---|---|---|
| Double Poin | Jawaban benar berikutnya ×2 | Misi Tetris berhasil |
| Perisai | Streak tidak putus saat salah | Streak kelipatan 3 |
| Petunjuk | PG: hapus 2 opsi salah. Esai: huruf pertama + jumlah huruf | Hadiah awal |
| Pilih Soal | Pilih PG atau esai untuk soal saat ini | Menyelesaikan modul |
| Bom Baris | Hapus baris terbawah di Tetris (dihitung untuk misi) | Jawaban esai benar |
