/* Shared header + footer. The top links open separate pages. */
(function () {
  'use strict';
  var PAGES = [['theorem', 'n_thm'], ['proofs', 'n_proof'], ['converse', 'n_conv'], ['triples', 'n_trip'], ['uses', 'n_use'], ['pythagoras', 'n_pyth'], ['video', 'n_video'], ['quiz', 'n_quiz']];
  window.PY_PAGES = PAGES;
  var cur = document.body.getAttribute('data-page');
  var nav = PAGES.map(function (p) {
    return '<a href="' + p[0] + '.html" data-i18n="' + p[1] + '"' + (p[0] === cur ? ' aria-current="page"' : '') + '></a>';
  }).join('');
  var h = document.getElementById('siteHeader');
  if (h) h.outerHTML =
    '<header class="top"><a class="brand" href="index.html"><svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true"><path d="M5 27V7l22 20z" fill="#2e7d5b"/><path d="M5 27h22" stroke="#0c2d4c" stroke-width="2"/></svg><b data-i18n="brand"></b></a>' +
    '<nav class="nav">' + nav + '</nav>' +
    '<div class="lang" id="lang"><button data-lang="hy" aria-pressed="true">HY</button><button data-lang="ru" aria-pressed="false">RU</button><button data-lang="en" aria-pressed="false">EN</button></div></header>';
  var f = document.getElementById('siteFooter');
  if (f) f.outerHTML = '<footer class="foot"><div class="wrap"><b data-i18n="brand"></b> · <span data-i18n="foot"></span></div></footer>';
})();
