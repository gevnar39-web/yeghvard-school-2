/* Shared logic: language, header + menu, footer, content pages, quiz, videos. */
const LANGS = ['hy', 'ru', 'en'];
const GEO = { lang: 'hy', hooks: [] };
try { const s = localStorage.getItem('geo-lang'); if (LANGS.includes(s)) GEO.lang = s; } catch (e) { /* storage may be blocked */ }

const li = () => LANGS.indexOf(GEO.lang);
const pick = a => (Array.isArray(a) ? a[li()] : a);
const t = k => (UI[GEO.lang] && UI[GEO.lang][k]) || UI.en[k] || k;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
GEO.onLang = fn => { GEO.hooks.push(fn); fn(); };
const $ = (s, r) => (r || document).querySelector(s);

(function () {
  'use strict';
  const PAGES = [['index.html', 'n_home', 'home'], ['britain.html', 'n_brit', 'brit'], ['manche.html', 'n_manche', 'manche'],
    ['tunnel.html', 'n_tunnel', 'tunnel'], ['quiz.html', 'n_quiz', 'quiz'], ['video.html', 'n_video', 'video']];
  const cur = document.body.dataset.page;

  /* ---------- header, slide-in menu, footer (same as the heart site) ---------- */
  const h = document.getElementById('siteHeader');
  if (h) h.outerHTML = `<header class="top">
    <a class="brand" href="index.html" aria-label="Աշխարհագրություն">
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="#0f3558"/><path d="M9 11c3-3 6-2 7 1s-1 5-1 8c-3-1-7-4-6-9zM19 7c3 0 6 2 6 5-3 0-4 2-6 1s-1-4 0-6zM19 19c3-1 6 0 6 3-2 3-5 4-7 3 2-2 1-4 1-6z" fill="#7fd1a8"/></svg>
      <span>Նախագծային <b>աշխատանք</b></span></a>
    <div class="lang" role="group" aria-label="Language"><button data-lang="hy">ՀԱՅ</button><button data-lang="ru">РУС</button><button data-lang="en">ENG</button></div>
    <button type="button" class="menu-btn" id="menuBtn" aria-label="Menu" aria-expanded="false" aria-controls="drawer"><span></span><span></span><span></span></button></header>`;
  const dr = document.createElement('div');
  dr.innerHTML = `<div class="drawer-bg" id="drawerBg" hidden></div>
    <nav class="drawer" id="drawer" aria-label="Pages" aria-hidden="true">
      <div class="drawer-head"><strong>Աշխարհագրություն</strong><button type="button" class="drawer-x" id="drawerX" aria-label="Close">✕</button></div>
      ${PAGES.map((p, i) => `<a href="${p[0]}" ${p[2] === cur ? 'class="active" aria-current="page"' : ''}><em>${i + 1}</em><span data-i18n="${p[1]}"></span></a>`).join('')}
    </nav>`;
  while (dr.firstChild) document.body.appendChild(dr.firstChild);
  const drawer = $('#drawer'), bg = $('#drawerBg'), mbtn = $('#menuBtn');
  const setMenu = open => {
    drawer.classList.toggle('open', open); drawer.setAttribute('aria-hidden', String(!open));
    mbtn.setAttribute('aria-expanded', String(open)); bg.hidden = !open; document.body.classList.toggle('menu-open', open);
    if (open) { const a = drawer.querySelector('a.active') || drawer.querySelector('a'); if (a) a.focus({ preventScroll: true }); } else mbtn.focus({ preventScroll: true });
  };
  mbtn.addEventListener('click', () => setMenu(!drawer.classList.contains('open')));
  $('#drawerX').addEventListener('click', () => setMenu(false));
  bg.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('open')) setMenu(false); });
  drawer.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });

  const f = document.getElementById('siteFooter');
  // The footer is always in Armenian, whatever language is selected.
  if (f) f.outerHTML = `<footer class="foot" lang="hy"><div class="wrap foot-in">
    <strong class="foot-title">Աշխարհագրություն</strong>
    <span>Եղվարդի թիվ 2 դպրոցի աշակերտների համար</span>
    <span>Հեղինակ՝ <b>Գևորգ</b></span>
    <a class="foot-ig" href="https://www.instagram.com/gev_nikoghosyan_official/" target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></svg>
      Instagram</a></div></footer>`;

  $('.lang').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    GEO.lang = b.dataset.lang;
    try { localStorage.setItem('geo-lang', GEO.lang); } catch (err) { /* ignore */ }
    apply();
  });

  function apply() {
    document.documentElement.lang = GEO.lang;
    document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === GEO.lang)));
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    GEO.hooks.forEach(fn => fn());
  }
  GEO.apply = apply;

  /* ---------- home: cards linking to the pages ---------- */
  const hl = $('#hlCards');
  if (hl) GEO.onLang(() => {
    hl.innerHTML = PAGES.slice(1).map((p, i) => `<a class="card hl" href="${p[0]}"><em>${i + 1}</em><h3>${esc(t(p[1]))}</h3><p>${esc(t('d_' + p[2]))}</p></a>`).join('');
  });

  /* ---------- content pages: facts + cards ---------- */
  const D = PAGEDATA[cur];
  if (D) GEO.onLang(() => {
    $('#facts').innerHTML = D.facts.map(f => `<div class="fact"><dt>${esc(pick(f[0]))}</dt><dd>${esc(pick(f[1]))}</dd></div>`).join('');
    $('#cards').innerHTML = D.cards.map(c => `<article class="card"><h3>${esc(pick(c[0]))}</h3><p>${esc(pick(c[1]))}</p></article>`).join('');
  });

  /* ---------- quiz ---------- */
  const box = $('#quizBox');
  if (box) {
    let idx = 0, score = 0, picked = -1;
    const order = QUIZ.map((_, i) => i);
    const render = () => {
      if (idx >= order.length) {
        const r = score / order.length, g = r >= 0.85 ? 'qz_g1' : r >= 0.55 ? 'qz_g2' : 'qz_g3';
        box.innerHTML = `<div class="qz-end"><div>${t('qz_score')}</div><div class="big-num">${score}/${order.length}</div><p>${t(g)}</p><button class="btn btn-solid" id="qzAgain">${t('qz_again')}</button></div>`;
        $('#qzAgain').onclick = () => { idx = 0; score = 0; picked = -1; render(); };
        return;
      }
      const q = QUIZ[order[idx]];
      let html = `<div class="qz-top"><span>${t('qz_q')} ${idx + 1}/${order.length}</span><div class="fbar"><i style="width:${idx / order.length * 100}%"></i></div></div><h3>${esc(pick(q.q))}</h3><div class="qz-opts">`;
      q.o.forEach((o, k) => {
        let cls = '';
        if (picked >= 0) cls = k === q.a ? 'right' : k === picked ? 'wrong' : 'dim';
        html += `<button class="qz-opt ${cls}" data-k="${k}" ${picked >= 0 ? 'disabled' : ''}>${esc(pick(o))}</button>`;
      });
      html += '</div>';
      if (picked >= 0) {
        const ok = picked === q.a;
        html += `<div class="qz-fb ${ok ? 'good' : 'bad'}"><b>${ok ? t('qz_right') : t('qz_wrong') + ' ' + esc(pick(q.o[q.a]))}</b> ${esc(pick(q.e))}</div>
          <button class="btn btn-solid" id="qzNext">${idx + 1 === order.length ? t('qz_finish') : t('qz_next')}</button>`;
      }
      box.innerHTML = html;
    };
    box.addEventListener('click', e => {
      const o = e.target.closest('.qz-opt');
      if (o && picked < 0) { picked = +o.dataset.k; if (picked === QUIZ[order[idx]].a) score++; render(); return; }
      if (e.target.id === 'qzNext') { idx++; picked = -1; render(); }
    });
    GEO.onLang(render);
  }

  /* ---------- videos: video/hy.mp4, video/ru.mp4, video/en.mp4 ---------- */
  const vids = $('#vidList');
  if (vids) {
    vids.innerHTML = LANGS.map(l => `<section class="vid" data-l="${l}"><h2 class="h" data-i18n="v_${l}"></h2>
      <div class="video-wrap"><video controls preload="metadata" playsinline><source src="video/${l}.mp4" type="video/mp4"></video>
      <div class="video-missing" hidden data-i18n="v_miss"></div></div></section>`).join('');
    vids.querySelectorAll('.vid').forEach(s => {
      const miss = s.querySelector('.video-missing');
      s.querySelector('source').addEventListener('error', () => { miss.hidden = false; });
    });
  }

  apply();
})();
