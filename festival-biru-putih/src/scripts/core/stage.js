/* ============================================================
   stage.js — menjaga rasio 16:9 di semua perangkat
   Panggung berukuran tetap 1280x720 lalu diskalakan agar pas
   di layar apa pun (laptop, tablet, ponsel) tanpa distorsi.
   ============================================================ */
(function (RPN) {
  'use strict';

  var LEBAR = 1280, TINGGI = 720;
  var el, wrap, siapPutar = false;

  function pasang() {
    el   = document.getElementById('panggung');
    wrap = document.getElementById('panggung-wrap');
    if (!el) return;
    skala();
    window.addEventListener('resize', skala, { passive: true });
    window.addEventListener('orientationchange', function () { setTimeout(skala, 120); });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', skala, { passive: true });
    }
  }

  function skala() {
    var lw = wrap.clientWidth, lh = wrap.clientHeight;
    var s  = Math.min(lw / LEBAR, lh / TINGGI);

    // Pada layar sangat kecil & tegak, minta pengguna memutar perangkat.
    var tegakSempit = lh > lw && lw < 640;
    document.body.classList.toggle('perlu-putar', tegakSempit);

    el.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
    RPN.skalaPanggung = s;
    RPN.bus.pancar('panggung:skala', s);
  }

  /* Ubah koordinat penunjuk layar menjadi koordinat di dalam kanvas,
     sudah memperhitungkan penskalaan panggung. */
  function titikKanvas(kanvas, ev) {
    var r = kanvas.getBoundingClientRect();
    var cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
    var cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
    return {
      x: (cx - r.left) / r.width  * kanvas.clientWidth,
      y: (cy - r.top)  / r.height * kanvas.clientHeight
    };
  }

  /* Siapkan kanvas agar tajam di layar ber-DPI tinggi.
     Penting: reset transform dulu supaya skala tidak menumpuk
     setiap kali ukuran berubah. */
  function siapkanKanvas(kanvas) {
    var ctx = kanvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = kanvas.clientWidth, h = kanvas.clientHeight;
    if (!w || !h) return ctx;
    var wantW = Math.round(w * dpr), wantH = Math.round(h * dpr);
    if (kanvas.width !== wantW || kanvas.height !== wantH) {
      kanvas.width = wantW; kanvas.height = wantH;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);   // reset, bukan menumpuk
    return ctx;
  }

  RPN.panggung = {
    pasang: pasang,
    skala: skala,
    titikKanvas: titikKanvas,
    siapkanKanvas: siapkanKanvas,
    LEBAR: LEBAR,
    TINGGI: TINGGI
  };
})(window.RPN = window.RPN || {});
