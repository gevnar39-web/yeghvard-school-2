(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s) || document.createElement('div'); }; // missing elements: harmless dummy (each page has only some sections)
  var LANGS = ['hy', 'ru', 'en'];
  var lang = 'hy';
  try { var saved = localStorage.getItem('geom_lang'); if (LANGS.indexOf(saved) >= 0) lang = saved; } catch (e) {}
  var T = function (k) { return window.GEO[lang][k]; };
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- helpers ---------- */
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function fmt(n) { return (Math.round(n * 1000) / 1000).toString(); }
  function pts(arr, X, Y) { return arr.map(function (p) { return X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(' '); }

  /* ---------- 1. Explorer ---------- */
  var aR = $('#aR'), bR = $('#bR');
  function drawExplorer() {
    if (!document.getElementById('exSvg')) return;
    var a = +aR.value, b = +bR.value, c = Math.sqrt(a * a + b * b);
    $('#aVal').textContent = a; $('#bVal').textContent = b;
    var minX = -b, maxX = a + b, minY = -(a + b), maxY = a;
    var W = maxX - minX, H = maxY - minY, VW = 520, VH = 520, pad = 14;
    var s = Math.min((VW - 2 * pad) / W, (VH - 2 * pad) / H);
    var ox = pad + (VW - 2 * pad - W * s) / 2 - minX * s;
    var oy = pad + (VH - 2 * pad - H * s) / 2 - minY * s;
    var X = function (x) { return ox + x * s; }, Y = function (y) { return oy + y * s; };
    var sa = [[0, 0], [a, 0], [a, a], [0, a]];
    var sb = [[0, 0], [-b, 0], [-b, -b], [0, -b]];
    var sc = [[a, 0], [0, -b], [b, -b - a], [a + b, -a]];
    var g = '';
    g += '<polygon points="' + pts(sa, X, Y) + '" fill="rgba(31,95,139,.28)" stroke="#1f5f8b" stroke-width="2"/>';
    g += '<polygon points="' + pts(sb, X, Y) + '" fill="rgba(46,125,91,.28)" stroke="#2e7d5b" stroke-width="2"/>';
    g += '<polygon points="' + pts(sc, X, Y) + '" fill="rgba(217,154,43,.30)" stroke="#d99a2b" stroke-width="2"/>';
    // unit grids on the leg squares
    var grid = '';
    for (var i = 1; i < a; i++) {
      grid += '<line x1="' + X(i) + '" y1="' + Y(0) + '" x2="' + X(i) + '" y2="' + Y(a) + '"/>';
      grid += '<line x1="' + X(0) + '" y1="' + Y(i) + '" x2="' + X(a) + '" y2="' + Y(i) + '"/>';
    }
    for (var j = 1; j < b; j++) {
      grid += '<line x1="' + X(-j) + '" y1="' + Y(0) + '" x2="' + X(-j) + '" y2="' + Y(-b) + '"/>';
      grid += '<line x1="' + X(0) + '" y1="' + Y(-j) + '" x2="' + X(-b) + '" y2="' + Y(-j) + '"/>';
    }
    g += '<g stroke="rgba(12,45,76,.22)" stroke-width="1">' + grid + '</g>';
    g += '<polygon points="' + pts([[0, 0], [a, 0], [0, -b]], X, Y) + '" fill="#fff" fill-opacity=".92" stroke="#0c2d4c" stroke-width="2.5" stroke-linejoin="round"/>';
    var m = Math.min(a, b) * 0.22;
    g += '<polyline points="' + pts([[m, 0], [m, -m], [0, -m]], X, Y) + '" fill="none" stroke="#0c2d4c" stroke-width="1.5"/>';
    var label = function (x, y, txt, size) {
      return '<text x="' + X(x).toFixed(1) + '" y="' + Y(y).toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" font-size="' + size + '" font-weight="800" fill="#0c2d4c">' + txt + '</text>';
    };
    var fs = function (side) { return Math.max(11, Math.min(26, side * s * 0.2)); };
    if (a * s > 34) g += label(a / 2, a / 2, 'a² = ' + a * a, fs(a));
    if (b * s > 34) g += label(-b / 2, -b / 2, 'b² = ' + b * b, fs(b));
    if (c * s > 34) g += label((a + b) / 2, -(a + b) / 2, 'c² = ' + fmt(a * a + b * b), fs(c));
    var tl = function (px, py, t) { return '<text x="' + px.toFixed(1) + '" y="' + py.toFixed(1) + '" text-anchor="middle" font-size="15" font-weight="700" fill="#0c2d4c">' + t + '</text>'; };
    g += tl(X(a / 2), Y(0) - 7, 'a') + tl(X(0) + 14, Y(-b / 2) + 5, 'b') + tl(X(a / 2) + 2, Y(-b / 2) - 4, 'c').replace('text-anchor="middle"', 'text-anchor="start"');
    $('#exSvg').innerHTML = g;

    var s2 = a * a + b * b, cInt = Math.abs(c - Math.round(c)) < 1e-9;
    $('#exEq').innerHTML = a + '² + ' + b + '² = ' + a * a + ' + ' + b * b + ' = <b>' + s2 + '</b><br>c = √' + s2 + ' ' + (cInt ? '= <b>' + Math.round(c) + '</b>' : '≈ <b>' + c.toFixed(3) + '</b>');
    $('#exNote').textContent = cInt ? T('ex_int') : T('ex_nint');
  }
  [[3, 4], [5, 12], [6, 8], [8, 15], [1, 1], [2, 5]].forEach(function (p) {
    var bt = document.createElement('button');
    bt.textContent = p[0] + ' · ' + p[1];
    bt.addEventListener('click', function () { aR.value = p[0]; bR.value = p[1]; drawExplorer(); });
    $('#presets').appendChild(bt);
  });
  aR.addEventListener('input', drawExplorer); bR.addEventListener('input', drawExplorer);

  /* ---------- 2. Rearrangement proof (a = 3, b = 4) ---------- */
  var pa = 3, pb = 4, PS = pa + pb, K = 40, OFF = 20;
  var TA = [ // arrangement 1: four corner triangles {R, Pa, Pb}
    [[PS, 0], [PS, pa], [pa, 0]],
    [[PS, PS], [pb, PS], [PS, pa]],
    [[0, PS], [0, pb], [pb, PS]],
    [[0, 0], [pa, 0], [0, pb]]
  ];
  var TB = [ // arrangement 2: around the a^2 and b^2 squares
    [[PS, 0], [PS, pa], [pa, 0]],
    [[pa, pa], [pa, 0], [PS, pa]],
    [[0, pa], [pa, pa], [0, PS]],
    [[pa, PS], [0, PS], [pa, pa]]
  ];
  var COL = ['#9ec6dd', '#8fd0b0', '#9ec6dd', '#8fd0b0'];
  function ang(v, r) { return Math.atan2(v[1] - r[1], v[0] - r[0]); }
  var MOVES = TA.map(function (t, i) {
    var th = ang(TB[i][1], TB[i][0]) - ang(t[1], t[0]);
    while (th > Math.PI) th -= 2 * Math.PI;
    while (th <= -Math.PI) th += 2 * Math.PI;
    return th;
  });
  function drawProof(t) {
    if (!document.getElementById('prSvg')) return;
    var X = function (x) { return OFF + x * K; }, Y = function (y) { return OFF + y * K; };
    var hole = [[pa, 0], [PS, pa], [pb, PS], [0, pb]];
    var g = '<rect x="' + OFF + '" y="' + OFF + '" width="' + PS * K + '" height="' + PS * K + '" fill="#f4f8fa" stroke="#0c2d4c" stroke-width="2"/>';
    g += '<g opacity="' + (1 - t).toFixed(3) + '"><polygon points="' + pts(hole, X, Y) + '" fill="rgba(217,154,43,.45)" stroke="#d99a2b" stroke-width="2"/>' +
      '<text x="' + X(PS / 2) + '" y="' + Y(PS / 2) + '" text-anchor="middle" dominant-baseline="middle" font-size="26" font-weight="800" fill="#7a4e00">c²</text></g>';
    g += '<g opacity="' + t.toFixed(3) + '">' +
      '<rect x="' + X(0) + '" y="' + Y(0) + '" width="' + pa * K + '" height="' + pa * K + '" fill="rgba(31,95,139,.35)" stroke="#1f5f8b" stroke-width="2"/>' +
      '<rect x="' + X(pa) + '" y="' + Y(pa) + '" width="' + pb * K + '" height="' + pb * K + '" fill="rgba(46,125,91,.35)" stroke="#2e7d5b" stroke-width="2"/>' +
      '<text x="' + X(pa / 2) + '" y="' + Y(pa / 2) + '" text-anchor="middle" dominant-baseline="middle" font-size="24" font-weight="800" fill="#0c2d4c">a²</text>' +
      '<text x="' + X(pa + pb / 2) + '" y="' + Y(pa + pb / 2) + '" text-anchor="middle" dominant-baseline="middle" font-size="26" font-weight="800" fill="#0c2d4c">b²</text></g>';
    TA.forEach(function (tri, i) {
      var R = tri[0], th = MOVES[i] * t, cs = Math.cos(th), sn = Math.sin(th);
      var dx = (TB[i][0][0] - R[0]) * t, dy = (TB[i][0][1] - R[1]) * t;
      var p = tri.map(function (v) {
        var rx = v[0] - R[0], ry = v[1] - R[1];
        return [R[0] + dx + rx * cs - ry * sn, R[1] + dy + rx * sn + ry * cs];
      });
      g += '<polygon points="' + pts(p, X, Y) + '" fill="' + COL[i] + '" stroke="#0c2d4c" stroke-width="2" stroke-linejoin="round"/>';
    });
    $('#prSvg').innerHTML = g;
  }
  var prT = $('#prT'), playing = false, raf = 0;
  prT.addEventListener('input', function () { drawProof(prT.value / 100); });
  $('#prPlay').addEventListener('click', function () {
    if (playing) return;
    var from = +prT.value >= 100 ? 100 : +prT.value, to = from >= 100 ? 0 : 100;
    var t0 = performance.now(), dur = 2200 * Math.abs(to - from) / 100 || 1;
    playing = true;
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      var v = from + (to - from) * e;
      prT.value = v; drawProof(v / 100);
      if (k < 1) raf = requestAnimationFrame(step); else playing = false;
    })(t0);
  });

  /* ---------- 3. Egyptian rope: 12 knots, 3-4-5 ---------- */
  (function () {
    var s = 38, ox = 40, oy = 180, g = '';
    var P = [[0, 0], [4, 0], [0, -3]]; // legs 4 and 3 -> hyp 5
    var X = function (x) { return ox + x * s; }, Y = function (y) { return oy + y * s; };
    g += '<polygon points="' + pts(P, X, Y) + '" fill="rgba(46,125,91,.1)" stroke="#8a6b3d" stroke-width="3" stroke-linejoin="round"/>';
    g += '<polyline points="' + pts([[0.55, 0], [0.55, -0.55], [0, -0.55]], X, Y) + '" fill="none" stroke="#0c2d4c" stroke-width="1.5"/>';
    var k = [];
    // 12 knots equally spaced along the 12-unit perimeter: (0,0)->(4,0)->(0,-3)->(0,0)
    for (var n = 0; n < 12; n++) {
      var d = n, x, y;
      if (d <= 4) { x = d; y = 0; }
      else if (d <= 9) { var f = (d - 4) / 5; x = 4 - 4 * f; y = -3 * f; }
      else { x = 0; y = -3 + (d - 9); }
      k.push([x, y]);
    }
    k.forEach(function (p) { g += '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="5.5" fill="#d99a2b" stroke="#fff" stroke-width="2"/>'; });
    var tx = function (x, y, t) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="16" font-weight="800" fill="#0c2d4c">' + t + '</text>'; };
    g += tx(X(2), Y(0) + 24, '4') + tx(X(0) - 16, Y(-1.5) + 5, '3') + tx(X(2) + 14, Y(-1.5) - 8, '5');
    $('#ropeSvg').innerHTML = g;
  })();

  /* ---------- 4. Right-triangle checker ---------- */
  $('#cBtn').addEventListener('click', function () {
    var v = ['#cx', '#cy', '#cz'].map(function (id) { return parseFloat($(id).value); });
    var out = $('#cRes');
    if (v.some(function (n) { return !(n > 0); })) { out.className = 'result warn'; out.textContent = T('res_bad'); return; }
    v.sort(function (p, q) { return p - q; });
    if (v[0] + v[1] <= v[2]) { out.className = 'result warn'; out.textContent = T('res_tri'); return; }
    var l = v[0] * v[0] + v[1] * v[1], r = v[2] * v[2], eps = 1e-9 * Math.max(l, r);
    var key = Math.abs(l - r) <= eps ? 'res_right' : (l > r ? 'res_acute' : 'res_obtuse');
    out.className = 'result ' + (key === 'res_right' ? 'ok' : 'warn');
    out.textContent = T(key) + ' — ' + fmt(v[0]) + '² + ' + fmt(v[1]) + '² = ' + fmt(l) + ', ' + fmt(v[2]) + '² = ' + fmt(r);
  });

  /* ---------- 5. Triples table ---------- */
  function renderTriples() {
    var th = T('tr_th'), rows = [];
    for (var m = 2; m <= 10; m++) for (var n = 1; n < m; n++) {
      if (gcd(m, n) !== 1 || (m - n) % 2 === 0) continue;
      var a = m * m - n * n, b = 2 * m * n, c = m * m + n * n;
      if (c > 100) continue;
      rows.push([m, n, Math.min(a, b), Math.max(a, b), c]);
    }
    rows.sort(function (x, y) { return x[4] - y[4]; });
    $('#trTbl thead').innerHTML = '<tr>' + th.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr>';
    $('#trTbl tbody').innerHTML = rows.map(function (r) {
      return '<tr><td>' + r.slice(0, 5).join('</td><td>') + '</td><td>' + r[2] * r[2] + ' + ' + r[3] * r[3] + ' = ' + r[4] * r[4] + '</td></tr>';
    }).join('');
  }

  /* ---------- 6. Missing-side calculator ---------- */
  $('#kBtn').addEventListener('click', function () {
    var ids = ['#ka', '#kb', '#kc'], out = $('#kRes');
    var vals = ids.map(function (id) { var s = $(id).value.trim(); return s === '' ? null : parseFloat(s); });
    var filled = vals.filter(function (v) { return v !== null; });
    if (filled.length !== 2 || filled.some(function (v) { return !(v > 0); })) { out.className = 'result warn'; out.textContent = T('calc_need'); return; }
    var a = vals[0], b = vals[1], c = vals[2], txt, res;
    if (c === null) { res = Math.sqrt(a * a + b * b); txt = 'c = √(' + fmt(a) + '² + ' + fmt(b) + '²) = √' + fmt(a * a + b * b) + ' = ' + fmt(res); }
    else {
      var known = a === null ? b : a, name = a === null ? 'a' : 'b';
      if (c <= known) { out.className = 'result warn'; out.textContent = T('calc_bigleg'); return; }
      res = Math.sqrt(c * c - known * known);
      txt = name + ' = √(' + fmt(c) + '² − ' + fmt(known) + '²) = √' + fmt(c * c - known * known) + ' = ' + fmt(res);
    }
    out.className = 'result ok'; out.textContent = T('calc_res') + ': ' + txt;
  });

  /* ---------- 7. Pythagoras facts + timeline ---------- */
  function renderPy() {
    $('#pyFacts').innerHTML = T('py_facts').map(function (f) { return '<li>' + f + '</li>'; }).join('');
    $('#timeline').innerHTML = T('timeline').map(function (e) { return '<li><b>' + e.y + '</b>' + e.t + '</li>'; }).join('');
  }

  /* ---------- i18n ---------- */
  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.innerHTML = T(el.getAttribute('data-i18n')); });
    document.querySelectorAll('#lang button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false'); });
    var pg = document.body.getAttribute('data-page'), hit = (window.PY_PAGES || []).filter(function (p) { return p[0] === pg; })[0];
    document.title = (hit ? T(hit[1]) : T('hero_title')) + ' · ' + T('brand');
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) { el.placeholder = T(el.getAttribute('data-i18n-ph')); });
    window.PY_LANG = lang;
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
    drawExplorer(); renderTriples(); renderPy();
    $('#cRes').textContent = ''; $('#kRes').textContent = '';
  }
  document.querySelectorAll('#lang button').forEach(function (b) {
    b.addEventListener('click', function () {
      lang = b.dataset.lang;
      try { localStorage.setItem('geom_lang', lang); } catch (e) {}
      applyLang();
    });
  });

  drawProof(0);
  applyLang();

  /* reveal on scroll */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.12 });
    document.querySelectorAll('.sec .h, .sec .sub, .sec .card, .timeline li, .fact').forEach(function (el) { el.classList.add('rv'); io.observe(el); });
  }
})();
