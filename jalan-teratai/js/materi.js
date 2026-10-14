// Konten modul. Ubah teks, soal, dan jawaban di file ini saja.
// Esai satu kata: jawaban dicocokkan tanpa memperhatikan huruf besar/kecil,
// spasi di awal/akhir, dan tanda diakritik (ā, ṇ, dst.), jadi "Nibbana",
// "nibbāna", dan " NIBBANA " dianggap sama. Tambahkan ejaan lain yang ingin
// diterima ke daftar `jawaban`.
window.MATERI = {
  id: 'empat-kebenaran-mulia',
  mapel: 'Pendidikan Agama Buddha',
  jenjang: 'SMP',
  judul: 'Empat Kebenaran Mulia',
  subjudul: 'Cattāri Ariya Saccāni',

  literasi: {
    pembuka:
      'Setelah mencapai Penerangan Sempurna, Buddha Gotama menyampaikan khotbah pertama kepada lima petapa (Pañcavaggiya) di Taman Rusa Isipatana, dekat kota Benares. Khotbah ini disebut Dhammacakkappavattana Sutta, khotbah Pemutaran Roda Dhamma. Isinya adalah Empat Kebenaran Mulia.',
    poin: [
      { istilah: 'Dukkha', arti: 'Hidup mengandung penderitaan: lahir, tua, sakit, mati, berpisah dengan yang dicintai, dan tidak mendapat apa yang diinginkan.' },
      { istilah: 'Samudaya', arti: 'Asal mula penderitaan, yaitu taṇhā atau nafsu keinginan.' },
      { istilah: 'Nirodha', arti: 'Lenyapnya penderitaan. Padamnya taṇhā sepenuhnya disebut Nibbāna.' },
      { istilah: 'Magga', arti: 'Jalan menuju lenyapnya penderitaan, yaitu Jalan Mulia Berunsur Delapan.' }
    ],
    perumpamaan:
      'Seperti dokter yang baik: mengenali penyakitnya (dukkha), mencari penyebabnya (samudaya), memastikan penyakit bisa sembuh (nirodha), lalu memberi obatnya (magga).'
  },

  // Bank soal: 3 pilihan ganda + 3 esai satu kata. Satu sesi memakai 5 soal.
  soal: [
    {
      id: 'pg-samudaya', tipe: 'pg',
      tanya: 'Kebenaran Mulia tentang asal mula penderitaan disebut ...',
      opsi: ['Dukkha', 'Samudaya', 'Nirodha', 'Magga'],
      benar: 1,
      penjelasan: 'Samudaya adalah Kebenaran Mulia kedua: asal mula penderitaan.'
    },
    {
      id: 'pg-tanha', tipe: 'pg',
      tanya: 'Menurut Kebenaran Mulia kedua, penyebab penderitaan adalah ...',
      opsi: ['Nasib buruk', 'Kurangnya harta', 'Taṇhā (nafsu keinginan)', 'Hukuman dari luar diri'],
      benar: 2,
      penjelasan: 'Penderitaan bersumber dari taṇhā, nafsu keinginan di dalam diri sendiri.'
    },
    {
      id: 'pg-isipatana', tipe: 'pg',
      tanya: 'Khotbah pertama Buddha kepada lima petapa disampaikan di ...',
      opsi: ['Taman Lumbini', 'Taman Rusa Isipatana', 'Kusinara', 'Bodh Gaya'],
      benar: 1,
      penjelasan: 'Dhammacakkappavattana Sutta disampaikan di Taman Rusa Isipatana, dekat Benares.'
    },
    {
      id: 'es-dukkha', tipe: 'esai',
      tanya: 'Kebenaran Mulia pertama, yang menyatakan bahwa hidup mengandung penderitaan, disebut ...',
      jawaban: ['dukkha', 'dukha'],
      penjelasan: 'Dukkha adalah Kebenaran Mulia pertama.'
    },
    {
      id: 'es-nibbana', tipe: 'esai',
      tanya: 'Padamnya taṇhā sepenuhnya disebut ...',
      jawaban: ['nibbana', 'nirvana', 'nirwana'],
      penjelasan: 'Lenyapnya taṇhā sepenuhnya disebut Nibbāna (Sanskerta: Nirvāṇa).'
    },
    {
      id: 'es-delapan', tipe: 'esai',
      tanya: 'Jalan menuju lenyapnya penderitaan disebut Jalan Mulia Berunsur ...',
      jawaban: ['delapan', '8'],
      penjelasan: 'Magga adalah Jalan Mulia Berunsur Delapan (Ariya Aṭṭhaṅgika Magga).'
    }
  ],

  // Urutan tipe soal default dalam satu sesi. Item "Pilih Soal" bisa menggantinya.
  pola: ['pg', 'esai', 'pg', 'esai', 'pg'],

  tetris: { targetBaris: 6 }
};
