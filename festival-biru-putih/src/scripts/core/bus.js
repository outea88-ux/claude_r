/* ============================================================
   bus.js — penyampai pesan sederhana antar bagian aplikasi
   ============================================================ */
(function (RPN) {
  'use strict';
  var peta = {};
  RPN.bus = {
    dengar: function (nama, fn) {
      (peta[nama] = peta[nama] || []).push(fn);
      return function () { RPN.bus.lepas(nama, fn); };
    },
    lepas: function (nama, fn) {
      var a = peta[nama]; if (!a) return;
      var i = a.indexOf(fn); if (i > -1) a.splice(i, 1);
    },
    pancar: function (nama, data) {
      var a = peta[nama]; if (!a) return;
      for (var i = 0; i < a.length; i++) {
        try { a[i](data); } catch (e) { /* satu pendengar gagal tidak menghentikan sisanya */ }
      }
    }
  };
})(window.RPN = window.RPN || {});
