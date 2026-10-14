// Mini-game Tetris. Mengikuti "slot" mini-game:
//   masuk : { target, interval, bom }  (modal dari hasil menjawab soal)
//   keluar: onEnd({ menang, baris })
window.Tetris = (function () {
  'use strict';

  const COLS = 10, ROWS = 20;
  const SHAPES = {
    I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]]
  };
  const COLORS = {
    I: '#6fd3e8', O: '#f2c14e', T: '#b58cf0', S: '#5cc8a0',
    Z: '#ff7a6b', J: '#7fa8ff', L: '#f2a33a'
  };

  function rotate(m) {
    return m[0].map((_, i) => m.map(r => r[i]).reverse());
  }

  function create(opts) {
    const canvas = opts.canvas, ctx = canvas.getContext('2d');
    const nextCanvas = opts.nextCanvas, nctx = nextCanvas.getContext('2d');
    let board, piece, nextType, bag, baris, interval, acc, last, raf, jalan, selesai, bom, cell;

    function newBoard() {
      return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    }
    function takeFromBag() {
      if (!bag.length) {
        bag = Object.keys(SHAPES);
        for (let i = bag.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [bag[i], bag[j]] = [bag[j], bag[i]];
        }
      }
      return bag.pop();
    }
    function collide(m, x, y) {
      for (let r = 0; r < m.length; r++) {
        for (let c = 0; c < m[r].length; c++) {
          if (!m[r][c]) continue;
          const bx = x + c, by = y + r;
          if (bx < 0 || bx >= COLS || by >= ROWS) return true;
          if (by >= 0 && board[by][bx]) return true;
        }
      }
      return false;
    }
    function spawn() {
      const type = nextType;
      nextType = takeFromBag();
      const m = SHAPES[type].map(r => r.slice());
      piece = { type, m, x: Math.floor((COLS - m[0].length) / 2), y: type === 'I' ? -1 : 0 };
      if (collide(piece.m, piece.x, piece.y)) end(false);
      drawNext();
    }
    function lock() {
      piece.m.forEach((row, r) => row.forEach((v, c) => {
        if (v && piece.y + r >= 0) board[piece.y + r][piece.x + c] = piece.type;
      }));
      let cleared = 0;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(Boolean)) {
          board.splice(r, 1);
          board.unshift(Array(COLS).fill(null));
          cleared++;
          r++;
        }
      }
      if (cleared) addLines(cleared);
      if (!selesai) spawn();
    }
    function addLines(n) {
      baris += n;
      interval = Math.max(220, interval - 25 * n);
      report();
      if (baris >= opts.target) end(true);
    }
    function move(dx) {
      if (!jalan) return;
      if (!collide(piece.m, piece.x + dx, piece.y)) { piece.x += dx; draw(); }
    }
    function turn() {
      if (!jalan) return;
      const m = rotate(piece.m);
      for (const k of [0, -1, 1, -2, 2]) {
        if (!collide(m, piece.x + k, piece.y)) { piece.m = m; piece.x += k; draw(); return; }
      }
    }
    function drop() {
      if (!jalan) return;
      if (!collide(piece.m, piece.x, piece.y + 1)) piece.y++;
      else lock();
      acc = 0;
      draw();
    }
    function hardDrop() {
      if (!jalan) return;
      while (!collide(piece.m, piece.x, piece.y + 1)) piece.y++;
      lock();
      acc = 0;
      draw();
    }
    // Bom Baris: hapus baris paling bawah, dihitung sebagai baris terhapus.
    function useBom() {
      if (!jalan || bom <= 0) return false;
      bom--;
      board.pop();
      board.unshift(Array(COLS).fill(null));
      if (opts.onBom) opts.onBom();
      addLines(1);
      draw();
      return true;
    }
    function report() {
      if (opts.onUpdate) opts.onUpdate({ baris, target: opts.target, bom });
    }
    function end(menang) {
      if (selesai) return;
      selesai = true;
      jalan = false;
      cancelAnimationFrame(raf);
      draw();
      opts.onEnd({ menang, baris });
    }

    function loop(t) {
      if (!jalan) return;
      acc += t - last;
      last = t;
      if (acc >= interval) drop();
      raf = requestAnimationFrame(loop);
    }

    function resize() {
      const wrap = canvas.parentElement;
      const byW = Math.floor(wrap.clientWidth / COLS);
      const byH = Math.floor((window.innerHeight - 250) / ROWS);
      cell = Math.max(14, Math.min(28, byW, byH));
      const dpr = window.devicePixelRatio || 1;
      canvas.width = COLS * cell * dpr;
      canvas.height = ROWS * cell * dpr;
      canvas.style.width = COLS * cell + 'px';
      canvas.style.height = ROWS * cell + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const ns = 18;
      nextCanvas.width = 4 * ns * dpr;
      nextCanvas.height = 4 * ns * dpr;
      nextCanvas.style.width = 4 * ns + 'px';
      nextCanvas.style.height = 4 * ns + 'px';
      nctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (board && nextType) { draw(); drawNext(); }
    }

    function block(c, x, y, s, color, ghost) {
      const pad = Math.max(1, s * 0.06), rad = s * 0.22;
      c.beginPath();
      c.roundRect(x + pad, y + pad, s - pad * 2, s - pad * 2, rad);
      if (ghost) {
        c.strokeStyle = color;
        c.globalAlpha = 0.45;
        c.lineWidth = 1.5;
        c.stroke();
        c.globalAlpha = 1;
      } else {
        c.fillStyle = color;
        c.fill();
        c.fillStyle = 'rgba(255,255,255,0.22)';
        c.beginPath();
        c.roundRect(x + pad * 2, y + pad * 2, s - pad * 4, (s - pad * 4) * 0.35, rad * 0.6);
        c.fill();
      }
    }
    function draw() {
      const w = COLS * cell, h = ROWS * cell;
      ctx.fillStyle = '#10152b';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(169,176,207,0.07)';
      ctx.lineWidth = 1;
      for (let c = 1; c < COLS; c++) { ctx.beginPath(); ctx.moveTo(c * cell + 0.5, 0); ctx.lineTo(c * cell + 0.5, h); ctx.stroke(); }
      for (let r = 1; r < ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * cell + 0.5); ctx.lineTo(w, r * cell + 0.5); ctx.stroke(); }
      board.forEach((row, r) => row.forEach((t, c) => { if (t) block(ctx, c * cell, r * cell, cell, COLORS[t]); }));
      if (piece && !selesai) {
        let gy = piece.y;
        while (!collide(piece.m, piece.x, gy + 1)) gy++;
        piece.m.forEach((row, r) => row.forEach((v, c) => {
          if (v && gy + r >= 0) block(ctx, (piece.x + c) * cell, (gy + r) * cell, cell, COLORS[piece.type], true);
        }));
        piece.m.forEach((row, r) => row.forEach((v, c) => {
          if (v && piece.y + r >= 0) block(ctx, (piece.x + c) * cell, (piece.y + r) * cell, cell, COLORS[piece.type]);
        }));
      }
    }
    function drawNext() {
      const s = 18, size = 4 * s;
      nctx.clearRect(0, 0, size, size);
      const m = SHAPES[nextType];
      const rows = m.filter(r => r.some(Boolean));
      const cols = m[0].map((_, i) => m.some(r => r[i])).filter(Boolean).length;
      const ox = (size - cols * s) / 2, oy = (size - rows.length * s) / 2;
      const firstCol = m[0].map((_, i) => m.some(r => r[i])).indexOf(true);
      rows.forEach((row, r) => row.forEach((v, c) => {
        if (v) block(nctx, ox + (c - firstCol) * s, oy + r * s, s, COLORS[nextType]);
      }));
    }

    function start() {
      board = newBoard();
      bag = [];
      baris = 0;
      bom = opts.bom || 0;
      interval = opts.interval;
      acc = 0;
      selesai = false;
      resize();
      nextType = takeFromBag();
      spawn();
      report();
      draw();
      resume();
    }
    function pause() {
      if (!jalan) return;
      jalan = false;
      cancelAnimationFrame(raf);
    }
    function resume() {
      if (jalan || selesai) return;
      jalan = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
    function destroy() {
      selesai = true;
      jalan = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    }

    window.addEventListener('resize', resize);
    start();

    return {
      left: () => move(-1), right: () => move(1), rotate: turn,
      down: drop, hardDrop, bom: useBom, pause, resume, destroy,
      get berjalan() { return jalan; }, get selesai() { return selesai; }
    };
  }

  return { create };
})();
