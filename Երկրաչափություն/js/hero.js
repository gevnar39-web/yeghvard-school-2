/* Hero animations: floating geometry canvas + a live breathing right triangle. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero = document.querySelector('.hero'), cv = document.getElementById('heroBg'), svg = document.getElementById('heroSvg'), live = document.getElementById('heroLive');
  if (!hero) return;
  var visible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(hero);

  /* ---- background canvas ---- */
  if (cv) {
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), items = [];
    var WORDS = ['a²', 'b²', 'c²', 'π', '√2', '3·4·5', '90°', '5·12·13', 'Δ', '∠'];
    function size() {
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function make(i) {
      var r = Math.random;
      return { t: i % 3, x: r() * W, y: r() * H, s: 18 + r() * 38, a: r() * 6.28, va: (r() - .5) * .012,
        vx: (r() - .5) * .35, vy: (r() - .5) * .35, al: .08 + r() * .16, w: WORDS[Math.floor(r() * WORDS.length)] };
    }
    function init() { size(); items = []; for (var i = 0; i < Math.max(18, Math.min(40, W / 36)); i++) items.push(make(i)); }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'; ctx.lineWidth = 1.5;
      items.forEach(function (o) {
        if (!reduce) { o.x += o.vx; o.y += o.vy; o.a += o.va; }
        if (o.x < -60) o.x = W + 60; if (o.x > W + 60) o.x = -60; if (o.y < -60) o.y = H + 60; if (o.y > H + 60) o.y = -60;
        ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.a); ctx.globalAlpha = o.al;
        if (o.t === 0) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(o.s * 1.3, 0); ctx.lineTo(0, -o.s); ctx.closePath(); ctx.stroke();
          ctx.strokeRect(0, 0, 7, -7); }
        else if (o.t === 1) { ctx.strokeRect(-o.s / 2, -o.s / 2, o.s, o.s); }
        else { ctx.font = '700 ' + Math.round(o.s * .8) + 'px "Noto Sans",sans-serif'; ctx.textAlign = 'center'; ctx.fillText(o.w, 0, 0); }
        ctx.restore();
      });
    }
    function loop() { if (visible) frame(); if (!reduce) requestAnimationFrame(loop); }
    init(); frame();
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { init(); frame(); }, 150); });
    if (!reduce) requestAnimationFrame(loop);
  }

  /* ---- live triangle ---- */
  if (svg) {
    var s = 20, ox = 125, oy = 235;
    var X = function (x) { return (ox + x * s).toFixed(1); }, Y = function (y) { return (oy + y * s).toFixed(1); };
    var P = function (arr) { return arr.map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join(' '); };
    function draw(t) {
      var a = 3.6 + 1.9 * Math.sin(t * .0007), b = 4.4 + 1.6 * Math.sin(t * .0005 + 1.3);
      var c2 = a * a + b * b;
      var sa = [[0, 0], [a, 0], [a, a], [0, a]], sb = [[0, 0], [-b, 0], [-b, -b], [0, -b]], sc = [[a, 0], [0, -b], [b, -b - a], [a + b, -a]];
      var g = '<defs><filter id="gl"><feGaussianBlur stdDeviation="3"/></filter></defs>';
      g += '<polygon points="' + P(sc) + '" fill="rgba(217,154,43,.35)" stroke="#f3c969" stroke-width="2"/>';
      g += '<polygon points="' + P(sa) + '" fill="rgba(127,196,214,.35)" stroke="#9fd3e6" stroke-width="2"/>';
      g += '<polygon points="' + P(sb) + '" fill="rgba(127,209,168,.35)" stroke="#9be3bf" stroke-width="2"/>';
      g += '<polygon points="' + P([[0, 0], [a, 0], [0, -b]]) + '" fill="rgba(255,255,255,.9)" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>';
      var m = Math.min(a, b) * .2;
      g += '<polyline points="' + P([[m, 0], [m, -m], [0, -m]]) + '" fill="none" stroke="#08213a" stroke-width="1.5"/>';
      var tx = function (x, y, txt) { return '<text x="' + X(x) + '" y="' + Y(y) + '" text-anchor="middle" dominant-baseline="middle" font-size="19" font-weight="800" fill="#fff">' + txt + '</text>'; };
      g += tx(a / 2, a / 2, 'a²') + tx(-b / 2, -b / 2, 'b²') + tx((a + b) / 2, -(a + b) / 2, 'c²');
      svg.innerHTML = g;
      if (live) live.innerHTML = '<span class="ca">' + (a * a).toFixed(1) + '</span> + <span class="cb">' + (b * b).toFixed(1) + '</span> = <span class="cc">' + c2.toFixed(1) + '</span>';
    }
    draw(0);
    if (!reduce) (function tick(t) { if (visible) draw(t); requestAnimationFrame(tick); })(0);
  }
})();
