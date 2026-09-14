/* ============================================================
   store.js — menyimpan kemajuan belajar murid.
   Memakai localStorage bila tersedia; bila diblokir (mode privat,
   berkas dibuka langsung dari disk), otomatis jatuh ke memori
   sehingga aplikasi tetap berjalan normal.
   ============================================================ */
(function (RPN) {
  'use strict';

  var KUNCI = 'rpn.kemajuan.v1';
  var cadangan = {};                 // penyimpanan memori
  var adaLocal = (function () {
    try {
      var t = '__uji__';
      window.localStorage.setItem(t, '1');
      window.localStorage.removeItem(t);
      return true;
    } catch (e) { return false; }
  })();

  function bacaMentah() {
    if (!adaLocal) return cadangan;
    try { return JSON.parse(window.localStorage.getItem(KUNCI) || '{}'); }
    catch (e) { return {}; }
  }

  function tulisMentah(obj) {
    if (!adaLocal) { cadangan = obj; return; }
    try { window.localStorage.setItem(KUNCI, JSON.stringify(obj)); }
    catch (e) { cadangan = obj; }
  }

  var awal = {
    dikunjungi: {},     // idModul -> true
    kuis: {},           // idModul -> { benar, total }
    percobaan: {},      // idModul -> jumlah percobaan simulasi
    evaluasi: null      // { benar, total, waktu }
  };

  function muat() {
    var d = bacaMentah();
    return {
      dikunjungi: d.dikunjungi || {},
      kuis: d.kuis || {},
      percobaan: d.percobaan || {},
      evaluasi: d.evaluasi || null
    };
  }

  var data = muat();

  var api = {
    get data() { return data; },
    tersimpanPermanen: adaLocal,

    kunjungi: function (id) {
      if (data.dikunjungi[id]) return;
      data.dikunjungi[id] = true;
      tulisMentah(data);
      RPN.bus.pancar('kemajuan:ubah', data);
    },

    catatKuis: function (id, benar, total) {
      var lama = data.kuis[id];
      // simpan hasil terbaik agar murid terdorong mencoba lagi
      if (!lama || benar > lama.benar) {
        data.kuis[id] = { benar: benar, total: total };
        tulisMentah(data);
        RPN.bus.pancar('kemajuan:ubah', data);
      }
    },

    catatPercobaan: function (id) {
      data.percobaan[id] = (data.percobaan[id] || 0) + 1;
      tulisMentah(data);
    },

    catatEvaluasi: function (benar, total) {
      data.evaluasi = { benar: benar, total: total, waktu: Date.now() };
      tulisMentah(data);
      RPN.bus.pancar('kemajuan:ubah', data);
    },

    /* Berapa modul yang sudah dituntaskan (dikunjungi + kuis lulus) */
    ringkas: function (daftarModul) {
      var tuntas = 0, dibuka = 0;
      daftarModul.forEach(function (m) {
        if (data.dikunjungi[m.id]) dibuka++;
        var k = data.kuis[m.id];
        if (k && k.total > 0 && k.benar / k.total >= 0.6) tuntas++;
      });
      return { dibuka: dibuka, tuntas: tuntas, total: daftarModul.length };
    },

    hapus: function () {
      data = { dikunjungi: {}, kuis: {}, percobaan: {}, evaluasi: null };
      tulisMentah(data);
      RPN.bus.pancar('kemajuan:ubah', data);
    }
  };

  RPN.simpanan = api;
})(window.RPN = window.RPN || {});
