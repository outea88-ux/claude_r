/* ============================================================
   evaluasi.js — asesmen sumatif lintas modul (10 soal).
   Tingkat kesulitan sengaja dibuat berjenjang: C1-C2 (mengingat
   & memahami) di awal, C3-C4 (menerapkan & menganalisis) di akhir.
   ============================================================ */
(function (RPN) {
  'use strict';

  RPN.soalEvaluasi = [
    {
      tanya: 'Gasing yang berputar di atas lantai licin akan berputar lebih lama daripada di atas tanah. Faktor apa yang menyebabkannya?',
      opsi: [
        { teks: 'Besarnya gaya gesek permukaan', benar: true,
          alasan: 'Lantai licin memberi gaya gesek kecil, sehingga energi gerak gasing terkuras lebih lambat.' },
        { teks: 'Besarnya gaya gravitasi di tempat itu',
          alasan: 'Gravitasi sama saja di kedua tempat. Yang berbeda adalah kekasaran permukaannya.' },
        { teks: 'Jumlah udara di sekitar gasing',
          alasan: 'Hambatan udara memang ada, tetapi jumlahnya sama di kedua lantai. Pembedanya adalah gesekan dengan lantai.' }
      ],
      penguatan: 'Gesekan mengubah energi gerak menjadi panas.'
    },
    {
      tanya: 'Sebuah layang-layang bermassa 150 gram diterbangkan. Jika gravitasi 10 m/s², berapa berat layang-layang itu?',
      petunjuk: 'Ubah gram ke kilogram dulu, lalu kalikan gravitasi.',
      opsi: [
        { teks: '1,5 newton', benar: true, alasan: '150 gram = 0,15 kg. Berat = 0,15 × 10 = 1,5 newton.' },
        { teks: '15 newton', alasan: 'Sepertinya massanya dianggap 1,5 kg. 150 gram = 0,15 kg, bukan 1,5 kg.' },
        { teks: '150 newton', alasan: 'Massa masih dalam gram. Bagi dulu dengan 1.000 agar menjadi kilogram.' },
        { teks: '0,15 newton', alasan: 'Ini nilai massanya dalam kg, belum dikalikan gravitasi.' }
      ],
      penguatan: 'Berat (N) = massa (kg) × gravitasi (m/s²).'
    },
    {
      tanya: 'Urutan perubahan energi yang benar pada ketapel adalah...',
      opsi: [
        { teks: 'Energi potensial elastis → energi kinetik', benar: true,
          alasan: 'Karet yang teregang menyimpan energi elastis, lalu seluruhnya berpindah menjadi energi gerak peluru.' },
        { teks: 'Energi kinetik → energi potensial elastis',
          alasan: 'Urutannya terbalik. Karet diregangkan dulu (menyimpan energi), baru kemudian peluru bergerak.' },
        { teks: 'Energi panas → energi kinetik',
          alasan: 'Panas memang muncul sedikit sebagai efek samping, tetapi bukan sumber tenaga lontaran peluru.' },
        { teks: 'Energi potensial gravitasi → energi kinetik',
          alasan: 'Itu terjadi pada benda yang jatuh dari ketinggian. Pada ketapel, sumber tenaganya adalah regangan karet.' }
      ]
    },
    {
      tanya: 'Dalam congklak, seorang pemain melewati 15 lubang dalam satu putaran penuh. Jika ia mengambil 15 biji dari sebuah lubang, di mana biji terakhirnya jatuh?',
      petunjuk: '15 ÷ 15 = berapa, sisa berapa?',
      opsi: [
        { teks: 'Tepat kembali di lubang asalnya', benar: true,
          alasan: '15 ÷ 15 = 1 putaran sisa 0. Sisa nol berarti kembali persis ke titik awal.' },
        { teks: 'Di rumahnya sendiri',
          alasan: 'Rumah sendiri ada di urutan ke-7, bukan ke-0. Dengan 15 biji, ia melewati rumah lalu kembali ke lubang asal.' },
        { teks: 'Di lubang terakhir milik lawan',
          alasan: 'Lubang lawan yang terakhir berada di urutan ke-14. Dengan 15 biji, ia sudah melewatinya satu langkah.' },
        { teks: 'Di rumah lawan',
          alasan: 'Rumah lawan tidak pernah diisi sama sekali — selalu dilewati, jadi tidak masuk hitungan.' }
      ],
      penguatan: 'Sisa 0 berarti kembali ke titik awal.'
    },
    {
      tanya: 'Gasing A dan gasing B punya massa sama, tetapi massa gasing A terkumpul di tengah sedangkan massa gasing B tersebar di tepi. Jika diputar sama kencang, mana yang berputar lebih lama?',
      opsi: [
        { teks: 'Gasing B, karena massanya tersebar jauh dari pusat', benar: true,
          alasan: 'Massa yang jauh dari sumbu membuat gasing lebih sulit diperlambat, sehingga putarannya bertahan lebih lama.' },
        { teks: 'Gasing A, karena massanya terpusat sehingga lebih stabil',
          alasan: 'Massa yang terpusat justru membuat gasing lebih mudah diperlambat dan lebih cepat tumbang.' },
        { teks: 'Sama lama, karena massanya sama',
          alasan: 'Massa yang sama belum tentu memberi hasil sama. Letak massanya juga sangat menentukan.' }
      ]
    },
    {
      tanya: 'Peluru ketapel bermassa 0,5 kg bergerak dengan kecepatan 4 m/s. Berapa energi kinetiknya?',
      petunjuk: 'Ek = ½ × m × v²',
      opsi: [
        { teks: '4 joule', benar: true, alasan: '½ × 0,5 × 4² = ½ × 0,5 × 16 = 4 joule.' },
        { teks: '1 joule', alasan: 'Kecepatan sepertinya tidak dikuadratkan. 4² = 16, bukan 4.' },
        { teks: '8 joule', alasan: 'Hasil ini lupa dikalikan ½.' },
        { teks: '16 joule', alasan: 'Ini baru nilai v² saja, belum dikalikan massa dan ½.' }
      ]
    },
    {
      tanya: 'Manakah rancangan percobaan yang paling tepat untuk membuktikan bahwa luas layang-layang memengaruhi kemampuannya terbang?',
      opsi: [
        { teks: 'Dua layangan dengan massa & kemiringan sama, luas berbeda, diterbangkan pada angin yang sama', benar: true,
          alasan: 'Hanya luas yang dibedakan, sehingga perbedaan hasilnya pasti disebabkan oleh luas. Inilah uji adil.' },
        { teks: 'Layangan besar diterbangkan pagi hari, layangan kecil diterbangkan sore hari',
          alasan: 'Kecepatan angin pagi dan sore bisa jauh berbeda, sehingga ada dua variabel yang berubah sekaligus.' },
        { teks: 'Layangan besar yang berat dibandingkan layangan kecil yang ringan',
          alasan: 'Massa dan luas berubah bersamaan, jadi tidak bisa disimpulkan mana penyebabnya.' },
        { teks: 'Satu layangan diterbangkan berulang kali sambil dipotong kertasnya sedikit demi sedikit',
          alasan: 'Memotong kertas mengubah luas sekaligus massa dan keseimbangannya, jadi bukan hanya luas yang berubah.' }
      ],
      penguatan: 'Uji adil = ubah satu variabel saja.'
    },
    {
      tanya: 'Sebuah lubang congklak yang nomor urutnya 5 berisi 9 biji. Di urutan ke berapa biji terakhir jatuh?',
      petunjuk: '5 + 9 = ? Bandingkan hasilnya dengan 15.',
      opsi: [
        { teks: 'Urutan ke-14', benar: true,
          alasan: '5 + 9 = 14. Karena 14 masih lebih kecil daripada 15, belum ada putaran penuh, jadi langsung berhenti di urutan ke-14.' },
        { teks: 'Urutan ke-9', alasan: 'Angka 9 adalah jumlah bijinya, bukan tempat berhentinya. Nomor urut asalnya juga harus ditambahkan.' },
        { teks: 'Urutan ke-4', alasan: 'Sepertinya 14 sudah dikurangi 10. Pembaginya adalah 15, dan 14 masih lebih kecil dari 15 sehingga tidak perlu dibagi.' },
        { teks: 'Urutan ke-0', alasan: 'Kembali ke urutan 0 butuh tepat 10 biji dari lubang urutan ke-5 (5 + 10 = 15, sisa 0).' }
      ]
    },
    {
      tanya: 'Ketapel yang sama ditembakkan di Bumi dan di Bulan dengan tarikan yang sama. Apa yang terjadi pada lintasan peluru di Bulan?',
      opsi: [
        { teks: 'Lebih landai dan jatuh lebih jauh, karena gravitasi Bulan lebih kecil', benar: true,
          alasan: 'Gravitasi Bulan hanya sekitar 1,6 m/s², sehingga peluru ditarik ke bawah jauh lebih pelan dan sempat terbang lebih jauh.' },
        { teks: 'Lebih melengkung tajam dan jatuh lebih dekat',
          alasan: 'Lintasan menukik tajam justru terjadi saat gravitasi besar, seperti di Yupiter. Di Bulan gravitasinya kecil.' },
        { teks: 'Lurus sempurna tanpa melengkung sama sekali',
          alasan: 'Bulan tetap punya gravitasi, hanya lebih kecil. Lintasannya tetap melengkung, hanya lebih landai.' },
        { teks: 'Sama persis, karena tarikan karetnya sama',
          alasan: 'Kecepatan awalnya memang sama, tetapi gravitasi yang berbeda membuat bentuk lintasannya berbeda.' }
      ]
    },
    {
      tanya: 'Kesimpulan mana yang paling tepat tentang hubungan permainan tradisional dengan ilmu pengetahuan?',
      opsi: [
        { teks: 'Hukum alam sudah bekerja pada permainan itu jauh sebelum rumusnya ditemukan dan dituliskan', benar: true,
          alasan: 'Pembuat gasing dan layangan menemukan bentuk terbaik lewat coba-coba selama bergenerasi. Ilmu pengetahuan kemudian menjelaskan mengapa bentuk itu bekerja.' },
        { teks: 'Permainan tradisional dibuat oleh ilmuwan yang sudah menghitung rumusnya lebih dulu',
          alasan: 'Sebagian besar permainan ini jauh lebih tua daripada ilmu fisika modern. Pengetahuannya lahir dari pengalaman turun-temurun, bukan dari rumus.' },
        { teks: 'Permainan tradisional tidak berkaitan dengan sains, hanya hiburan semata',
          alasan: 'Justru sebaliknya — seluruh modul ini menunjukkan gaya, energi, dan pola bilangan bekerja nyata di dalamnya.' },
        { teks: 'Ilmu pengetahuan modern membuat permainan tradisional menjadi tidak berguna lagi',
          alasan: 'Ilmu pengetahuan justru membantu kita memahami dan menghargai kecerdasan yang ada di balik permainan warisan ini.' }
      ],
      penguatan: 'Sains bukan menggantikan kearifan lokal, melainkan menjelaskannya.'
    }
  ];
})(window.RPN = window.RPN || {});
