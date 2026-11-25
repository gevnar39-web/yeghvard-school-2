/* 3D Britain + Channel Tunnel + Big Ben with the live London time. */
(function () {
  'use strict';
  const canvas = document.getElementById('stage');
  if (!canvas) return;
  const $ = (s, r) => (r || document).querySelector(s) || document.createElement('div');
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const CATCOL = { city: '#1f5f8b', nature: '#2f9e6b', chan: '#d99a2b' };
  const CATKEY = { city: 'c_city', nature: 'c_nature', chan: 'c_chan' };

  /* ---------- live time ---------- */
  const fmtL = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZoneName: 'short' });
  const fmtY = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Yerevan', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  function parts(fmt, d) {
    const o = {}; fmt.formatToParts(d).forEach(p => { o[p.type] = p.value; });
    return { h: (+o.hour) % 24, m: +o.minute, s: +o.second, tz: o.timeZoneName || '' };
  }
  const two = n => String(n).padStart(2, '0');
  window.GeoTime = {
    london() { const p = parts(fmtL, new Date()); return two(p.h) + ':' + two(p.m) + ':' + two(p.s) + ' ' + p.tz; }
  };

  let sel = null, mode = 'map', V = null;      // V = 3D API, null when WebGL is not available
  const marker = id => MARKERS.find(m => m.id === id);

  /* ---------- side panel (works without WebGL too) ---------- */
  function renderParts() {
    $('#partsList').innerHTML = MARKERS.map(m => `<button class="pbtn" style="--c:${CATCOL[m.cat]}" data-id="${m.id}" aria-pressed="${sel === m.id}"><i></i>${pick(m.name)}</button>`).join('');
  }
  function renderInfo() {
    const el = $('#info');
    if (!sel) { el.style.setProperty('--bar', ''); el.innerHTML = `<span class="badge"><i></i>3D</span><h3>${t('info_empty_t')}</h3><p>${t('info_empty_d')}</p>`; return; }
    const m = marker(sel), col = CATCOL[m.cat];
    el.style.setProperty('--bar', col);
    const btn = (sel === 'bigben' && V && mode !== 'ben') ? `<button class="btn" id="openBen">${t('open_ben')} →</button>` : '';
    el.innerHTML = `<span class="badge" style="--c:${col}"><i></i>${t(CATKEY[m.cat])}</span><h3>${pick(m.name)}</h3><p>${pick(m.d)}</p>${btn}`;
  }
  function renderModes() { $$('#modeSeg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode))); }
  function choose(id) { sel = id; renderParts(); renderInfo(); if (V) V.focus(id); }

  $('#partsList').addEventListener('click', e => { const b = e.target.closest('.pbtn'); if (b) choose(b.dataset.id); });
  $('#info').addEventListener('click', e => { if (e.target.id === 'openBen') setMode('ben'); });
  $('#modeSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setMode(b.dataset.mode); });
  $('#zIn').addEventListener('click', () => V && V.zoom(0.78));
  $('#zOut').addEventListener('click', () => V && V.zoom(1.28));
  $('#zReset').addEventListener('click', () => { mode = 'map'; sel = null; renderModes(); renderParts(); renderInfo(); if (V) V.overview(); });
  $$('[data-layer]').forEach(c => c.addEventListener('change', () => V && V.layer(c.dataset.layer, c.checked)));
  $('#autoRot').addEventListener('change', e => V && V.auto(e.target.checked));
  function setMode(m) {
    mode = m; renderModes();
    if (m === 'ben') { sel = 'bigben'; if (V) V.bigBen(); } else if (V) V.overview();
    renderParts(); renderInfo();
  }

  /* ---------- clock box ---------- */
  function tickClock() {
    const now = new Date(), L = parts(fmtL, now), Y = parts(fmtY, now);
    $('#clkL').textContent = two(L.h) + ':' + two(L.m) + ':' + two(L.s);
    $('#clkTz').textContent = L.tz;
    $('#clkY').textContent = two(Y.h) + ':' + two(Y.m);
    const rem = L.m === 0 && L.s === 0 ? 0 : 3600 - (L.m * 60 + L.s);
    $('#clkNext').textContent = two(Math.floor(rem / 60)) + ':' + two(rem % 60);
    const diff = (Y.h - L.h + 24) % 24;
    $('#clkDiff').textContent = t('clk_ahead').replace('{n}', diff);
    if (V) V.setTime(L);
  }
  function renderClockLabels() {
    $('#clkTitle').textContent = t('clk_big'); $('#clkLL').textContent = t('clk_london'); $('#clkYL').textContent = t('clk_yer'); $('#clkNL').textContent = t('clk_next');
  }

  /* ---------- WebGL ---------- */
  function build() {
    if (!window.THREE) throw new Error('no three');
    const THREE = window.THREE, wrap = $('#stageWrap');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x3b5a80, 0.95));
    const sun = new THREE.DirectionalLight(0xffffff, 0.7); sun.position.set(5, 10, 6); scene.add(sun);

    const KX = 0.62, X = lon => lon * KX, Z = lat => -(lat - 53);
    const BASE = -0.3, TOP = 0.12;
    const world = new THREE.Group(); scene.add(world);

    const shapeOf = pts => { const s = new THREE.Shape(); pts.forEach((p, i) => { const x = X(p[0]), y = p[1] - 53; if (i) s.lineTo(x, y); else s.moveTo(x, y); }); s.closePath(); return s; };
    function slab(pts, color) {
      const m = new THREE.Mesh(new THREE.ExtrudeGeometry(shapeOf(pts), { depth: TOP - BASE, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color, roughness: 0.95 }));
      m.rotation.x = -Math.PI / 2; m.position.y = BASE; world.add(m); return m;
    }
    /* simplified coast lines [lon, lat] */
    const GB = [[-5.71, 50.07], [-5.2, 49.96], [-4.15, 50.35], [-3.65, 50.22], [-3.4, 50.6], [-2.45, 50.52], [-1.95, 50.7], [-1.3, 50.78], [-0.78, 50.72], [-0.14, 50.82], [0.25, 50.73], [0.58, 50.85], [0.97, 50.91], [1.17, 51.08], [1.37, 51.13], [1.44, 51.37], [1.03, 51.37], [0.75, 51.45], [0.72, 51.53], [0.95, 51.62], [1.15, 51.79], [1.28, 51.94], [1.35, 51.96], [1.75, 52.48], [1.73, 52.61], [1.3, 52.93], [0.85, 52.97], [0.5, 52.95], [0.4, 52.76], [0.05, 52.95], [0.35, 53.15], [0.11, 53.58], [-0.15, 53.91], [-0.08, 54.12], [-0.4, 54.28], [-0.61, 54.49], [-1.06, 54.62], [-1.18, 54.69], [-1.38, 54.91], [-1.42, 55.02], [-1.6, 55.4], [-1.99, 55.77], [-2.52, 56.0], [-2.9, 56.2], [-2.59, 56.28], [-3.0, 56.45], [-2.58, 56.56], [-2.45, 56.72], [-2.2, 56.96], [-2.07, 57.14], [-1.78, 57.5], [-2.0, 57.69], [-2.96, 57.68], [-3.28, 57.72], [-3.87, 57.59], [-4.2, 57.5], [-4.05, 57.82], [-3.65, 58.1], [-3.08, 58.44], [-3.02, 58.64], [-3.37, 58.67], [-4.0, 58.6], [-5.0, 58.63], [-5.05, 58.45], [-5.2, 58.15], [-5.7, 57.7], [-5.7, 57.28], [-5.83, 57.0], [-6.2, 56.73], [-5.47, 56.41], [-5.55, 56.1], [-5.8, 55.31], [-4.8, 55.64], [-4.63, 55.46], [-4.85, 55.24], [-4.86, 54.63], [-4.4, 54.7], [-4.05, 54.84], [-3.26, 54.98], [-3.4, 54.87], [-3.6, 54.55], [-3.25, 54.1], [-2.9, 54.07], [-3.05, 53.82], [-3.0, 53.65], [-3.0, 53.4], [-3.2, 53.4], [-3.4, 53.35], [-3.83, 53.33], [-4.5, 53.42], [-4.65, 53.3], [-4.3, 53.15], [-4.6, 52.8], [-4.4, 52.9], [-4.05, 52.72], [-4.08, 52.41], [-4.67, 52.1], [-5.3, 51.88], [-5.05, 51.7], [-4.7, 51.67], [-3.95, 51.6], [-3.3, 51.4], [-3.18, 51.46], [-2.98, 51.55], [-2.7, 51.5], [-2.85, 51.44], [-2.98, 51.34], [-3.47, 51.21], [-4.1, 51.21], [-4.52, 51.02], [-4.95, 50.55], [-5.08, 50.42], [-5.5, 50.2]];
    const IE = [[-7.38, 55.38], [-6.5, 55.25], [-5.8, 54.85], [-5.9, 54.6], [-5.5, 54.4], [-6.1, 54.0], [-6.15, 53.35], [-6.0, 52.97], [-6.3, 52.33], [-7.0, 52.15], [-8.3, 51.8], [-9.8, 51.45], [-10.4, 51.95], [-10.4, 52.15], [-9.8, 52.55], [-9.3, 53.2], [-10.1, 53.4], [-9.9, 53.8], [-10.0, 54.25], [-8.6, 54.3], [-8.45, 54.62], [-8.5, 55.0], [-7.6, 55.27]];
    const FR = [[-4.78, 48.4], [-3.98, 48.73], [-3.45, 48.75], [-3.0, 48.78], [-2.7, 48.55], [-2.0, 48.65], [-1.5, 48.64], [-1.6, 48.83], [-1.6, 49.0], [-1.8, 49.38], [-1.95, 49.72], [-1.62, 49.67], [-1.27, 49.7], [-1.2, 49.4], [-0.7, 49.35], [-0.37, 49.3], [0.23, 49.42], [0.1, 49.5], [0.37, 49.76], [1.08, 49.93], [1.37, 50.06], [1.55, 50.22], [1.57, 50.4], [1.58, 50.73], [1.58, 50.87], [1.71, 50.93], [1.77, 50.95], [1.85, 50.97], [2.1, 51.0], [2.37, 51.05], [2.55, 51.09], [2.92, 51.23], [3.2, 51.33], [3.55, 51.45], [4.0, 51.6], [4.0, 47.6], [-4.2, 47.6]];
    slab(FR, 0xb5b783); slab(IE, 0x8dbb85); slab(GB, 0x6aa86a);

    /* sea + seabed */
    const seabed = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x0e3550, roughness: 1 }));
    seabed.rotation.x = -Math.PI / 2; seabed.position.y = BASE - 0.01; world.add(seabed);
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x2f86b0, transparent: true, opacity: 0.55, depthWrite: false, roughness: 0.4 }));
    sea.rotation.x = -Math.PI / 2; sea.position.y = 0.0; sea.renderOrder = 2; world.add(sea);

    /* mountains */
    const mountains = new THREE.Group(); world.add(mountains);
    [[-5.0, 56.8, 0.42, 0.2], [-4.0, 57.0, 0.3, 0.2], [-3.7, 57.1, 0.3, 0.18], [-4.8, 57.5, 0.26, 0.2], [-5.5, 57.3, 0.28, 0.18], [-3.5, 55.4, 0.16, 0.2], [-3.1, 54.5, 0.2, 0.15],
      [-2.2, 54.0, 0.16, 0.18], [-2.1, 53.5, 0.14, 0.16], [-4.05, 53.06, 0.26, 0.14], [-3.8, 52.6, 0.14, 0.16], [-3.5, 51.9, 0.12, 0.14], [-3.9, 50.6, 0.09, 0.14]].forEach(c => {
      const m = new THREE.Mesh(new THREE.ConeGeometry(c[3], c[2], 7), new THREE.MeshStandardMaterial({ color: c[2] > 0.25 ? 0xe9eef3 : 0x8d7f6c, flatShading: true, roughness: 1 }));
      m.position.set(X(c[0]), TOP + c[2] / 2, Z(c[1])); mountains.add(m);
    });

    /* Channel Tunnel under the sea */
    const tunnelG = new THREE.Group(); world.add(tunnelG);
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(X(1.12), -0.1, Z(51.1)), new THREE.Vector3(X(1.3), -0.17, Z(51.03)), new THREE.Vector3(X(1.55), -0.17, Z(50.97)), new THREE.Vector3(X(1.8), -0.1, Z(50.93))]);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0xffc233, emissive: 0xff9d00, emissiveIntensity: 0.8 });
    tunnelG.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.035, 8, false), tubeMat));
    const train = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffffff })); tunnelG.add(train);

    /* Big Ben */
    const ben = new THREE.Group(); const BS = 1.2;
    const stone = new THREE.MeshStandardMaterial({ color: 0xd9c590, roughness: 0.9 }), dark = new THREE.MeshStandardMaterial({ color: 0x46535f, roughness: 0.8 }), gold = new THREE.MeshStandardMaterial({ color: 0xd4a72c, metalness: 0.6, roughness: 0.4 });
    const addBox = (w, h, y, mat) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), mat); b.position.y = y + h / 2; ben.add(b); return b; };
    addBox(0.11, 0.3, 0, stone); addBox(0.125, 0.025, 0.3, gold); addBox(0.14, 0.13, 0.325, stone); addBox(0.12, 0.08, 0.455, stone); addBox(0.13, 0.015, 0.535, gold);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.1, 4), dark); roof.rotation.y = Math.PI / 4; roof.position.y = 0.6; ben.add(roof);
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.01, 0.07, 6), gold); spire.position.y = 0.685; ben.add(spire);
    const cc = document.createElement('canvas'); cc.width = cc.height = 256; const cx = cc.getContext('2d');
    const clockTex = new THREE.CanvasTexture(cc); let lastSec = -1;
    function drawClock(p) {
      cx.clearRect(0, 0, 256, 256);
      cx.fillStyle = '#d4a72c'; cx.beginPath(); cx.arc(128, 128, 126, 0, 7); cx.fill();
      cx.fillStyle = '#fbf6e6'; cx.beginPath(); cx.arc(128, 128, 112, 0, 7); cx.fill();
      cx.fillStyle = '#1b2438'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.font = 'bold 26px serif';
      ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].forEach((r, i) => {
        const a = i * Math.PI / 6; cx.save(); cx.translate(128 + Math.sin(a) * 86, 128 - Math.cos(a) * 86); cx.rotate(a); cx.fillText(r, 0, 0); cx.restore();
      });
      for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30, l = i % 5 ? 5 : 9; cx.lineWidth = i % 5 ? 1 : 2; cx.beginPath(); cx.moveTo(128 + Math.sin(a) * 111, 128 - Math.cos(a) * 111); cx.lineTo(128 + Math.sin(a) * (111 - l), 128 - Math.cos(a) * (111 - l)); cx.stroke(); }
      const hand = (ang, len, w) => { cx.lineWidth = w; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(128 - Math.sin(ang) * 14, 128 + Math.cos(ang) * 14); cx.lineTo(128 + Math.sin(ang) * len, 128 - Math.cos(ang) * len); cx.stroke(); };
      cx.strokeStyle = '#1b2438';
      hand(((p.h % 12) + p.m / 60 + p.s / 3600) * Math.PI / 6, 58, 9);
      hand((p.m + p.s / 60) * Math.PI / 30, 92, 5);
      cx.fillStyle = '#1b2438'; cx.beginPath(); cx.arc(128, 128, 8, 0, 7); cx.fill();
      clockTex.needsUpdate = true;
    }
    drawClock({ h: 10, m: 10, s: 0 });
    const faceMat = new THREE.MeshBasicMaterial({ map: clockTex });
    [0, 1, 2, 3].forEach(i => {
      const f = new THREE.Mesh(new THREE.CircleGeometry(0.05, 48), faceMat); f.userData.mid = 'bigben';
      const a = i * Math.PI / 2; f.position.set(Math.sin(a) * 0.0715, 0.39, Math.cos(a) * 0.0715); f.rotation.y = a; ben.add(f);
    });
    ben.traverse(o => { if (o.isMesh) o.userData.mid = 'bigben'; });
    const bm = marker('bigben'); ben.position.set(X(bm.lon), TOP, Z(bm.lat)); ben.scale.setScalar(BS); world.add(ben);

    /* pins + labels */
    const pins = new THREE.Group(); world.add(pins);
    const labelBox = $('#labels'), hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const pinOf = {}, lblOf = {};
    MARKERS.forEach(m => {
      const col = new THREE.Color(CATCOL[m.cat]), g = new THREE.Group();
      if (m.id !== 'bigben') {
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 8), new THREE.MeshStandardMaterial({ color: 0xffffff })); stem.position.y = 0.1;
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 12), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.4 })); head.position.y = 0.23; head.userData.mid = m.id;
        const hit = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), hitMat); hit.position.y = 0.23; hit.userData.mid = m.id;
        g.add(stem, head, hit);
        g.position.set(X(m.lon), m.id === 'channel' ? 0.0 : TOP, Z(m.lat)); pins.add(g);
      }
      pinOf[m.id] = g;
      const d = document.createElement('span'); d.className = 'lbl'; d.style.setProperty('--c', CATCOL[m.cat]); d.addEventListener('click', () => choose(m.id)); labelBox.appendChild(d); lblOf[m.id] = d;
    });
    const labelPos = id => {
      const m = marker(id), v = new THREE.Vector3(X(m.lon), (id === 'channel' ? 0 : TOP) + (id === 'bigben' ? 0.9 * BS : 0.36), Z(m.lat)); return v;
    };


    /* ---------- animations that play when an object is selected ---------- */
    const fxG = new THREE.Group(); world.add(fxG);
    const glow = (col, op) => new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide });
    const rings = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 56), glow(0xffffff, 0)); m.rotation.x = -Math.PI / 2; m.renderOrder = 4; fxG.add(m); return m; });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.5, 14, 1, true), glow(0xffffff, 0)); beam.renderOrder = 4; fxG.add(beam);

    // Channel: flowing waves, ferries, cargo ships and the 33 km measuring line
    const chG = new THREE.Group(); chG.visible = false; world.add(chG);
    const wc = document.createElement('canvas'); wc.width = 256; wc.height = 128; const wx = wc.getContext('2d');
    wx.strokeStyle = 'rgba(255,255,255,.9)'; wx.lineWidth = 3; wx.lineCap = 'round';
    [20, 58, 96].forEach((y0, k) => { wx.beginPath(); for (let x = 0; x <= 256; x += 4) { const y = y0 + Math.sin((x / 256) * Math.PI * 2 + k) * 9; if (x) wx.lineTo(x, y); else wx.moveTo(x, y); } wx.stroke(); });
    const waveTex = new THREE.CanvasTexture(wc); waveTex.wrapS = waveTex.wrapT = THREE.RepeatWrapping; waveTex.repeat.set(7, 3);
    const chW = 8.0 * KX, chD = 2.2, chX = X(-1.6), chZ = Z(50.2);
    const tint = new THREE.Mesh(new THREE.PlaneGeometry(chW, chD), glow(0x5fd0f0, 0)); tint.rotation.x = -Math.PI / 2; tint.position.set(chX, 0.025, chZ); tint.renderOrder = 3; chG.add(tint);
    const waves = new THREE.Mesh(new THREE.PlaneGeometry(chW, chD), new THREE.MeshBasicMaterial({ map: waveTex, transparent: true, opacity: 0, depthWrite: false })); waves.rotation.x = -Math.PI / 2; waves.position.set(chX, 0.03, chZ); waves.renderOrder = 3; chG.add(waves);
    function makeShip(col, len) {
      const g = new THREE.Group(), white = new THREE.MeshStandardMaterial({ color: 0xffffff }), c = new THREE.MeshStandardMaterial({ color: col });
      const hull = new THREE.Mesh(new THREE.BoxGeometry(len, 0.045, 0.07), c); hull.position.y = 0.03;
      const deck = new THREE.Mesh(new THREE.BoxGeometry(len * 0.6, 0.035, 0.06), white); deck.position.set(-len * 0.05, 0.068, 0);
      const bow = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.07, 4), c); bow.rotation.z = -Math.PI / 2; bow.rotation.x = Math.PI / 4; bow.position.set(len / 2 + 0.03, 0.03, 0);
      g.add(hull, deck, bow); chG.add(g); return g;
    }
    const ferries = [0, 1, 2].map(() => makeShip(0x1f5f8b, 0.2));
    const cargo = [0, 1].map(i => makeShip(i ? 0xc8932a : 0x2e7d5b, 0.26));
    const dv = new THREE.Vector3(X(1.36), 0.035, Z(51.12)), ca = new THREE.Vector3(X(1.86), 0.035, Z(50.99));
    const lane = new THREE.CatmullRomCurve3([[-5.2, 49.85], [-2.5, 50.25], [0.0, 50.42], [1.0, 50.7], [1.55, 51.02], [2.3, 51.3]].map(p => new THREE.Vector3(X(p[0]), 0.035, Z(p[1]))));
    const gris = new THREE.Vector3(X(1.58), 0.06, Z(50.87)), dov = new THREE.Vector3(X(1.31), 0.06, Z(51.13));
    const mline = new THREE.Line(new THREE.BufferGeometry().setFromPoints([dov, gris]), new THREE.LineDashedMaterial({ color: 0xffd36b, dashSize: 0.05, gapSize: 0.03 })); mline.computeLineDistances(); chG.add(mline);
    [dov, gris].forEach(p => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffd36b })); b.position.copy(p); chG.add(b); });
    const widthLbl = document.createElement('span'); widthLbl.className = 'lbl on'; widthLbl.style.setProperty('--c', '#d99a2b'); labelBox.appendChild(widthLbl);
    const widthText = { hy: '≈ 33 կմ', ru: '≈ 33 км', en: '≈ 33 km' };
    // Tunnel: extra trains running through it
    const trains = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.05), new THREE.MeshBasicMaterial({ color: 0xffffff })); m.visible = false; tunnelG.add(m); return m; });
    const fk = { ch: 0, tun: 0 };
    const TUN = ['dover', 'folkestone', 'coquelles'];
    const tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3();
    function shipAlong(g, a, b, u, flip, tNow) {
      g.position.lerpVectors(a, b, u); const dx = b.x - a.x, dz = b.z - a.z;
      g.rotation.y = -Math.atan2(dz, dx) + (flip ? Math.PI : 0);
      g.position.y = 0.035 + Math.sin(tNow * 3 + u * 9) * 0.008; g.rotation.z = Math.sin(tNow * 2.2 + u * 7) * 0.05;
    }
    function animateFx(dt, tNow) {
      const isCh = sel === 'channel', isTun = TUN.includes(sel);
      fk.ch += ((isCh ? 1 : 0) - fk.ch) * Math.min(1, dt * 4); fk.tun += ((isTun ? 1 : 0) - fk.tun) * Math.min(1, dt * 4);
      // Channel
      chG.visible = fk.ch > 0.02;
      if (chG.visible) {
        waveTex.offset.x -= dt * 0.35; tint.material.opacity = 0.2 * fk.ch; waves.material.opacity = 0.55 * fk.ch;
        ferries.forEach((f, i) => { const ph = tNow * 0.45 + i * 2.1, u = (Math.sin(ph) + 1) / 2; shipAlong(f, dv, ca, u, Math.cos(ph) < 0, tNow); });
        cargo.forEach((c, i) => {
          const u = (tNow * 0.035 + i * 0.5) % 1; lane.getPoint(u, tmpP); lane.getTangent(u, tmpT);
          c.position.set(tmpP.x, 0.035 + Math.sin(tNow * 2 + i) * 0.008, tmpP.z); c.rotation.y = -Math.atan2(tmpT.z, tmpT.x);
        });
        mline.material.dashSize = 0.05 + 0.015 * Math.sin(tNow * 4);
      }
      // Tunnel: see-through sea, glowing tube, trains
      sea.material.opacity = 0.55 - 0.36 * fk.tun;
      tubeMat.emissiveIntensity = 0.8 + fk.tun * (0.9 + 0.6 * Math.sin(tNow * 6));
      trains.forEach((m, i) => {
        m.visible = fk.tun > 0.05; if (!m.visible) return;
        const base = (tNow * 0.18 + i * 0.33) % 1, u = i % 2 ? 1 - base : base;
        curve.getPoint(u, tmpP); curve.getTangent(u, tmpT); m.position.copy(tmpP); m.rotation.y = -Math.atan2(tmpT.z, tmpT.x);
      });
      // Ripples + light beam on the selected place (the Channel has its own animation)
      const mk = sel ? marker(sel) : null;
      rings.forEach((r, i) => {
        if (!mk || isCh) { r.material.opacity = 0; return; }
        const p = (tNow * 0.6 + i / 3) % 1, R = isTun ? 0.45 : sel === 'bigben' ? 0.7 : 0.9;
        r.position.set(X(mk.lon), TOP + 0.015, Z(mk.lat));
        r.scale.setScalar(0.1 + p * R); r.material.color.set(CATCOL[mk.cat]); r.material.opacity = (1 - p) * 0.75;
      });
      if (mk && !isCh && !isTun) { beam.position.set(X(mk.lon), TOP + 0.75, Z(mk.lat)); beam.material.color.set(CATCOL[mk.cat]); beam.material.opacity = 0.16 + 0.1 * Math.sin(tNow * 4); } else beam.material.opacity = 0;
    }

    /* camera: custom orbit */
    const S = { tx: -1.3, ty: 0, tz: -1.3, th: 0, ph: 0.7, r: 16 }, G = Object.assign({}, S);
    const OV = { tx: -1.3, ty: 0, tz: -1.3, ph: 0.7, r: 16 };
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    function place() {
      const sp = Math.sin(S.ph);
      cam.position.set(S.tx + S.r * sp * Math.sin(S.th), S.ty + S.r * Math.cos(S.ph), S.tz + S.r * sp * Math.cos(S.th));
      cam.lookAt(S.tx, S.ty, S.tz);
    }
    const wrapAng = a => Math.atan2(Math.sin(a), Math.cos(a));
    let autoRot = false;
    function goTo(o) { Object.assign(G, o); if (o.th !== undefined) G.th = S.th + wrapAng(o.th - S.th); }

    /* input */
    const ptrs = new Map(); let moved = 0, pinch = 0;
    canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = 0; pinch = 0; });
    canvas.addEventListener('pointermove', e => {
      const p = ptrs.get(e.pointerId);
      if (!p) { hover(e); return; }
      if (ptrs.size === 2) {
        const a = Array.from(ptrs.values()), before = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
        p.x = e.clientX; p.y = e.clientY;
        const b = Array.from(ptrs.values()), now = Math.hypot(b[0].x - b[1].x, b[0].y - b[1].y);
        if (before > 0) G.r = clamp(G.r * before / now, 0.6, 26);
        moved = 99; return;
      }
      const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
      G.th -= dx * 0.006; S.th -= dx * 0.006; G.ph = clamp(G.ph - dy * 0.005, 0.12, 1.5); S.ph = clamp(S.ph - dy * 0.005, 0.12, 1.5);
      if (moved > 4) auto(false, true);
    });
    const up = e => {
      if (ptrs.has(e.pointerId) && ptrs.size === 1 && moved < 5) clickAt(e);
      ptrs.delete(e.pointerId);
    };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', e => ptrs.delete(e.pointerId));
    canvas.addEventListener('wheel', e => { e.preventDefault(); G.r = clamp(G.r * (e.deltaY > 0 ? 1.1 : 0.9), 0.6, 26); }, { passive: false });
    function auto(on, fromUser) { autoRot = on; if (fromUser) $('#autoRot').checked = false; }

    /* picking */
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), targets = [];
    scene.traverse(o => { if (o.isMesh && o.userData.mid) targets.push(o); });
    function pickAt(e) {
      const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, cam); const h = ray.intersectObjects(targets, false)[0]; return h ? h.object.userData.mid : null;
    }
    function clickAt(e) { const id = pickAt(e); if (id) { if (id === 'bigben') { sel = 'bigben'; renderParts(); renderInfo(); V.focus('bigben'); } else choose(id); } }
    const tip = $('#tip');
    function hover(e) {
      if (e.pointerType === 'touch') return;
      const id = pickAt(e); canvas.style.cursor = id ? 'pointer' : '';
      if (!id) { tip.hidden = true; return; }
      const r = wrap.getBoundingClientRect(); tip.textContent = pick(marker(id).name); tip.style.left = (e.clientX - r.left) + 'px'; tip.style.top = (e.clientY - r.top) + 'px'; tip.hidden = false;
    }

    function resize() {
      const w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
      OV.r = 15.5 * Math.max(1, Math.sqrt(1.1 / (w / h)));      // keep the whole island in view on narrow screens
      if (mode === 'map' && !sel) G.r = OV.r;
    }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(wrap); window.addEventListener('resize', resize); resize();

    const ALWAYS = new Set(['bigben', 'edinburgh', 'cardiff', 'nevis', 'snowdon', 'channel']);
    let tt = 0, last = performance.now(), labelsOn = true;
    const v3 = new THREE.Vector3();
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; tt += dt;
      if (autoRot && !ptrs.size) G.th += dt * 0.25;
      ['tx', 'ty', 'tz', 'th', 'ph', 'r'].forEach(k => { S[k] += (G[k] - S[k]) * Math.min(1, dt * 7); });
      place();
      train.position.copy(curve.getPoint((Math.sin(tt * 0.6) + 1) / 2));
      Object.keys(pinOf).forEach(id => { const p = pinOf[id]; if (id !== 'bigben') p.scale.setScalar(id === sel ? 1.4 + Math.sin(tt * 5) * 0.08 : 1); });
      // labels
      const w = wrap.clientWidth, h = wrap.clientHeight;
      MARKERS.forEach(m => {
        const d = lblOf[m.id]; v3.copy(labelPos(m.id)); v3.project(cam);
        const wanted = ALWAYS.has(m.id) || m.id === sel || S.r < 4.5;
        const show = labelsOn && wanted && v3.z < 1 && Math.abs(v3.x) < 1.05 && Math.abs(v3.y) < 1.05 && (mode === 'map' ? true : m.id === 'bigben');
        d.style.display = show ? '' : 'none';
        if (show) { d.style.transform = `translate(${(v3.x * 0.5 + 0.5) * w}px,${(-v3.y * 0.5 + 0.5) * h}px) translate(-50%,-100%)`; d.textContent = pick(m.name); d.classList.toggle('on', m.id === sel); }
      });
      animateFx(dt, tt);
      if (chG.visible) {
        v3.copy(dov).lerp(gris, 0.5); v3.y += 0.12; v3.project(cam);
        widthLbl.style.display = ''; widthLbl.style.transform = `translate(${(v3.x * 0.5 + 0.5) * w}px,${(-v3.y * 0.5 + 0.5) * h}px) translate(-50%,-100%)`; widthLbl.textContent = widthText[GEO.lang];
      } else widthLbl.style.display = 'none';
      renderer.render(scene, cam);
      requestAnimationFrame(frame);
    }
    place(); requestAnimationFrame(frame);

    return {
      focus(id) {
        if (id === 'bigben') { if (mode === 'ben') goTo({ tx: ben.position.x, ty: TOP + 0.4 * BS, tz: ben.position.z, r: 2.7, ph: 1.28, th: 0 }); else goTo({ tx: ben.position.x, ty: 0, tz: ben.position.z, r: 5, ph: 0.9 }); return; }
        if (id === 'channel') { goTo({ tx: X(-0.5), ty: 0, tz: Z(50.45), r: 7.5, ph: 0.8, th: 0 }); return; }
        if (TUN.includes(id)) { goTo({ tx: X(1.46), ty: 0, tz: Z(51.02), r: 4.8, ph: 0.72, th: 0 }); return; }
        const m = marker(id); goTo({ tx: X(m.lon), ty: 0, tz: Z(m.lat), r: 5, ph: 0.9 });
      },
      overview() { goTo({ tx: OV.tx, ty: OV.ty, tz: OV.tz, r: OV.r, ph: OV.ph, th: 0 }); },
      bigBen() { goTo({ tx: ben.position.x, ty: TOP + 0.4 * BS, tz: ben.position.z, r: 2.7, ph: 1.28, th: 0 }); },
      zoom(k) { G.r = clamp(G.r * k, 0.6, 26); },
      auto(on) { autoRot = on; },
      layer(name, on) { if (name === 'tunnel') tunnelG.visible = on; if (name === 'mountains') mountains.visible = on; if (name === 'labels') labelsOn = on; },
      setTime(p) { if (p.s !== lastSec) { lastSec = p.s; drawClock(p); } }
    };
  }

  /* ---------- start ---------- */
  GEO.onLang(() => { renderParts(); renderInfo(); renderModes(); renderClockLabels(); });
  try { V = build(); } catch (err) { $('#noGL').hidden = false; V = null; if (window.console) console.warn('3D disabled:', err && err.message); }
  tickClock(); setInterval(tickClock, 250);
  GEO.onLang(renderInfo);
})();
