/* ============================================================
   audio.js — seluruh bunyi dibangkitkan Web Audio API.
   Tidak ada berkas suara eksternal sama sekali.
   ============================================================ */
(function (RPN) {
  'use strict';

  var ctx = null, nyala = true, master = null;
  var nadaBerjalan = {};   // bunyi menerus (putaran gasing, desir angin)

  function hidupkan() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    return ctx;
  }

  function bolehBunyi() {
    if (!nyala) return false;
    return !!hidupkan();
  }

  /* --- Nada pendek (klik, benar, salah) --- */
  function nada(opsi) {
    if (!bolehBunyi()) return;
    var t = ctx.currentTime + (opsi.tunda || 0);
    var osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = opsi.bentuk || 'sine';
    osc.frequency.setValueAtTime(opsi.dari, t);
    if (opsi.ke) osc.frequency.exponentialRampToValueAtTime(Math.max(1, opsi.ke), t + (opsi.lama || .15));
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(opsi.keras || .16, t + .012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (opsi.lama || .15));
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + (opsi.lama || .15) + .02);
  }

  /* --- Derau tersaring (benturan, gesekan, angin) --- */
  function derau(opsi) {
    if (!bolehBunyi()) return;
    var lama = opsi.lama || .18;
    var n = Math.floor(ctx.sampleRate * lama);
    var buf = ctx.createBuffer(1, n, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var src = ctx.createBufferSource(); src.buffer = buf;
    var f = ctx.createBiquadFilter();
    f.type = opsi.saring || 'lowpass';
    f.frequency.value = opsi.cutoff || 900;
    var g = ctx.createGain();
    g.gain.setValueAtTime(opsi.keras || .2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + lama);
    src.connect(f); f.connect(g); g.connect(master);
    src.start();
  }

  /* --- Bunyi menerus yang bisa diatur nada & kerasnya --- */
  function mulaiMenerus(kunci, opsi) {
    if (!bolehBunyi()) return null;
    if (nadaBerjalan[kunci]) return nadaBerjalan[kunci];
    var osc = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    osc.type = (opsi && opsi.bentuk) || 'sawtooth';
    osc.frequency.value = (opsi && opsi.dari) || 120;
    f.type = 'lowpass'; f.frequency.value = 700;
    g.gain.value = 0.0001;
    osc.connect(f); f.connect(g); g.connect(master);
    osc.start();
    return (nadaBerjalan[kunci] = { osc: osc, f: f, g: g });
  }

  function aturMenerus(kunci, freq, keras, cutoff) {
    var n = nadaBerjalan[kunci];
    if (!n || !ctx) return;
    var t = ctx.currentTime;
    n.osc.frequency.setTargetAtTime(Math.max(20, freq), t, .05);
    n.g.gain.setTargetAtTime(nyala ? Math.max(0.0001, keras) : 0.0001, t, .06);
    if (cutoff) n.f.frequency.setTargetAtTime(cutoff, t, .06);
  }

  function hentikanMenerus(kunci) {
    var n = nadaBerjalan[kunci];
    if (!n || !ctx) return;
    n.g.gain.setTargetAtTime(0.0001, ctx.currentTime, .05);
  }

  function bersihkanSemua() {
    for (var k in nadaBerjalan) hentikanMenerus(k);
  }

  /* --- Bunyi siap pakai --- */
  var efek = {
    klik:    function () { nada({ dari: 620, ke: 880, lama: .07, keras: .09, bentuk: 'triangle' }); },
    pindah:  function () { nada({ dari: 430, ke: 660, lama: .12, keras: .10, bentuk: 'sine' }); },
    benar:   function () {
      [523.25, 659.25, 783.99].forEach(function (f, i) {
        nada({ dari: f, lama: .22, keras: .13, tunda: i * .075, bentuk: 'sine' });
      });
    },
    salah:   function () { nada({ dari: 300, ke: 150, lama: .28, keras: .13, bentuk: 'triangle' }); },
    hebat:   function () {
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach(function (f, i) {
        nada({ dari: f, lama: .3, keras: .12, tunda: i * .085, bentuk: 'sine' });
      });
    },
    tumbuk:  function (kuat) { derau({ lama: .2, cutoff: 380 + (kuat || .5) * 900, keras: Math.min(.32, .1 + (kuat || .5) * .25) }); },
    kayu:    function () { nada({ dari: 420 + Math.random() * 170, ke: 120, lama: .06, keras: .14, bentuk: 'triangle' }); },
    lonceng: function () { nada({ dari: 880, lama: .3, keras: .12 }); nada({ dari: 1320, lama: .3, keras: .07 }); },
    lenting: function () { nada({ dari: 180, ke: 620, lama: .11, keras: .13, bentuk: 'triangle' }); }
  };

  RPN.audio = {
    efek: efek,
    nada: nada,
    derau: derau,
    mulaiMenerus: mulaiMenerus,
    aturMenerus: aturMenerus,
    hentikanMenerus: hentikanMenerus,
    bersihkanSemua: bersihkanSemua,
    hidupkan: hidupkan,
    get nyala() { return nyala; },
    set nyala(v) {
      nyala = !!v;
      if (!nyala) bersihkanSemua();
      RPN.bus.pancar('audio:ubah', nyala);
    }
  };
})(window.RPN = window.RPN || {});
