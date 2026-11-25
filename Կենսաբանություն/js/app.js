/* HemoAtlas — page logic */
(function () {
  'use strict';
  // Missing elements (this script runs on every page) get a harmless detached <div>.
  const $ = (s, r) => (r || document).querySelector(s) || document.createElement('div');
  const PAGES = [['index.html', 'nav_explore', 'home'], ['ecg.html', 'nav_ecg', 'ecg'],['blood.html', 'nav_blood', 'blood'], ['transfusion.html', 'nav_transfusion', 'transfusion'],
    ['find.html', 'nav_find', 'find'], ['cholesterol.html', 'nav_chol', 'cholesterol'], ['vitamins.html', 'nav_vit', 'vitamins'],
    ['pressure.html', 'nav_pressure', 'pressure'], ['clot.html', 'nav_clot', 'clot'], ['heartcare.html', 'nav_habits', 'habits'], ['quiz.html', 'nav_quiz', 'quiz'], ['video.html', 'nav_video', 'video']];
  (function injectChrome() {
    const cur = document.body.dataset.page;
    const h = document.getElementById('siteHeader');
    if (h) h.outerHTML = `<header class="top">
      <a class="brand" href="index.html" aria-label="Կենսաբանություն">
        <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5c70"/><stop offset="1" stop-color="#b3112a"/></linearGradient></defs><path d="M16 29C5 20 3 14 3 10a7 7 0 0 1 13-3.5A7 7 0 0 1 29 10c0 4-2 10-13 19z" fill="url(#lg)"/><path d="M5 15h6l2-4 3 8 2-4h9" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span>Նախագծային <b>աշխատանք</b></span></a>
      <div class="lang" role="group" aria-label="Language"><button data-lang="hy">ՀԱՅ</button><button data-lang="ru">РУС</button><button data-lang="en">ENG</button></div>
      <button type="button" class="menu-btn" id="menuBtn" aria-label="Menu" aria-expanded="false" aria-controls="drawer"><span></span><span></span><span></span></button></header>`;
    // slide-in menu with every page
    const dr = document.createElement('div');
    dr.innerHTML = `<div class="drawer-bg" id="drawerBg" hidden></div>
      <nav class="drawer" id="drawer" aria-label="Pages" aria-hidden="true">
        <div class="drawer-head"><strong>Կենսաբանություն</strong><button type="button" class="drawer-x" id="drawerX" aria-label="Close">✕</button></div>
        ${PAGES.map((p, i) => `<a href="${p[0]}" ${p[2] === cur ? 'class="active" aria-current="page"' : ''}><em>${i + 1}</em><span data-i18n="${p[1]}"></span></a>`).join('')}
      </nav>`;
    while (dr.firstChild) document.body.appendChild(dr.firstChild);
    const drawer = document.getElementById('drawer'), bg = document.getElementById('drawerBg'), mbtn = document.getElementById('menuBtn');
    const setMenu = (open) => {
      drawer.classList.toggle('open', open); drawer.setAttribute('aria-hidden', String(!open));
      mbtn.setAttribute('aria-expanded', String(open)); bg.hidden = !open; document.body.classList.toggle('menu-open', open);
      if (open) { const a = drawer.querySelector('a.active') || drawer.querySelector('a'); if (a) a.focus({ preventScroll: true }); } else mbtn.focus({ preventScroll: true });
    };
    mbtn.addEventListener('click', () => setMenu(!drawer.classList.contains('open')));
    document.getElementById('drawerX').addEventListener('click', () => setMenu(false));
    bg.addEventListener('click', () => setMenu(false));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('open')) setMenu(false); });
    drawer.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    const f = document.getElementById('siteFooter');
    // The footer is always in Armenian, whatever language is selected.
    if (f) f.outerHTML = `<footer class="foot" lang="hy"><div class="wrap foot-in">
      <strong class="foot-title">Կենսաբանություն</strong>
      <span>Եղվարդի թիվ 2 դպրոցի աշակերտների համար</span>
      <span>Հեղինակ՝ <b>Գևորգ</b></span>
      <a class="foot-ig" href="https://www.instagram.com/gev_nikoghosyan_official/" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></svg>
        Instagram</a></div></footer>`;
  })();
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const tt = (k) => t(S[k]);
  const lab = (ty) => ty.replace('-', '−');
  const TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const FREQ = { 'O+': 37, 'A+': 36, 'B+': 8, 'AB+': 3, 'O-': 7, 'A-': 6, 'B-': 2, 'AB-': 1 };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const V = window.Viewer;

  try {
    const sv = localStorage.getItem('hemo-lang');
    if (sv && ['hy', 'ru', 'en'].indexOf(sv) >= 0) LANG = sv;
    else { const n = (navigator.language || '').slice(0, 2); LANG = n === 'hy' ? 'hy' : n === 'en' ? 'en' : 'ru'; }
  } catch (e) { /* ignore */ }

  /* ================= 3D explorer UI ================= */
  let sel = null, vmode = 'body';

  function renderParts() {
    $('#partsList').innerHTML = PART_ORDER[vmode].map(id => {
      const p = PARTS[id];
      return `<button class="pbtn" style="--c:${KINDS[p.kind].color}" data-id="${id}" aria-pressed="${sel === id}"><i></i>${t(p.name)}</button>`;
    }).join('');
  }
  function renderInfo() {
    const el = $('#info');
    if (!sel) {
      el.style.setProperty('--bar', '');
      el.innerHTML = `<span class="badge"><i></i>3D</span><h3>${tt('info_empty_t')}</h3><p>${tt('info_empty_d')}</p>`;
      return;
    }
    const p = PARTS[sel], k = KINDS[p.kind];
    el.style.setProperty('--bar', k.color);
    const extra = (sel === 'heart' && vmode === 'body')
      ? `<button class="btn" id="openHeart">${tt('open_heart')} →</button>` : '';
    el.innerHTML = `<span class="badge" style="--c:${k.color}"><i></i>${t(k.name)}</span><h3>${t(p.name)}</h3><p>${t(p.desc)}</p>${extra}`;
  }
  function renderModeSeg() {
    $$('#modeSeg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === vmode)));
  }

  $('#partsList').addEventListener('click', e => {
    const b = e.target.closest('.pbtn'); if (!b) return;
    if (V) V.select(b.dataset.id); else { sel = b.dataset.id; renderParts(); renderInfo(); }
  });
  $('#info').addEventListener('click', e => { if (e.target.id === 'openHeart' && V) V.setMode('heart'); });
  $('#modeSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (b && V) V.setMode(b.dataset.mode); });
  $('#zIn').addEventListener('click', () => V && V.zoom(0.78));
  $('#zOut').addEventListener('click', () => V && V.zoom(1.28));
  $('#zReset').addEventListener('click', () => { if (V) V.reset(); });
  $$('[data-layer]').forEach(c => c.addEventListener('change', () => V && V.setLayer(c.dataset.layer, c.checked)));
  $('#autoRot').addEventListener('change', e => V && V.setAuto(e.target.checked));
  $('#bpm').addEventListener('input', e => { $('#bpmVal').textContent = e.target.value; if (V) V.setBpm(e.target.value); });

  if (V) {
    V.on('select', id => { sel = id; renderParts(); renderInfo(); });
    V.on('mode', m => { vmode = m; renderModeSeg(); renderParts(); renderInfo(); });
    V.on('auto', v => { $('#autoRot').checked = v; });
    V.on('hover', (id, pos) => {
      const tip = $('#tip');
      if (!id || !pos) { tip.hidden = true; return; }
      tip.textContent = t(PARTS[id].name);
      tip.style.left = pos.x + 'px'; tip.style.top = pos.y + 'px'; tip.hidden = false;
    });
  }

  /* ================= Blood composition & types ================= */
  function renderComp() {
    $('#compBar').innerHTML = COMP.map(c => `<div style="flex:${Math.max(c.pct, 1.2)};background:${c.color}"></div>`).join('');
    $('#compCards').innerHTML = COMP.map(c => `<div class="ccard" style="--c:${c.id === 'wbc' ? '#6b7aa8' : c.color}">
      <b>${c.label}</b><h4>${t(c.name)}</h4><p>${t(c.desc)}</p></div>`).join('');
  }

  let typeSel = 'A+';
  const aboOf = (ty) => ty.replace(/[+-]/, '');
  function antigensOf(ty) { const a = aboOf(ty), r = []; if (a.indexOf('A') >= 0) r.push('A'); if (a.indexOf('B') >= 0) r.push('B'); if (ty.slice(-1) === '+') r.push('D'); return r; }
  function antibodiesOf(ty) { const a = aboOf(ty); return a === 'A' ? ['A_B'] : a === 'B' ? ['A_A'] : a === 'O' ? ['A_A', 'A_B'] : []; }

  function bloodSVG(ty) {
    const ags = antigensOf(ty);
    const ang = { A: [20, 110, 200, 290], B: [65, 155, 245, 335], D: [0, 90, 180, 270] };
    let s = `<svg viewBox="0 0 360 230" role="img" aria-label="${lab(ty)}"><defs><radialGradient id="rc" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ff6b7e"/><stop offset=".7" stop-color="#d7263d"/><stop offset="1" stop-color="#a50f26"/></radialGradient></defs>`;
    s += `<circle cx="110" cy="115" r="66" fill="url(#rc)"/><circle cx="110" cy="115" r="28" fill="#7c0d20" opacity=".35"/>`;
    ags.forEach(g => {
      ang[g].forEach(a => {
        const x = 110 + 71 * Math.cos(a * Math.PI / 180), y = 115 + 71 * Math.sin(a * Math.PI / 180);
        const tr = `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a + 90})`;
        if (g === 'A') s += `<path transform="${tr}" d="M0 -10 L9 7 L-9 7Z" fill="#f2b632" stroke="#fff" stroke-width="1.5"/>`;
        else if (g === 'B') s += `<circle transform="${tr}" r="7" fill="#35c6d6" stroke="#fff" stroke-width="1.5"/>`;
        else s += `<rect transform="${tr}" x="-6" y="-6" width="12" height="12" rx="2" fill="#fff" stroke="#9aa8d4" stroke-width="1.5"/>`;
      });
    });
    const spots = [[250, 38, 20], [315, 70, -25], [262, 118, 35], [322, 150, -10], [240, 180, 15], [300, 205, -35]];
    const abs = antibodiesOf(ty); let n = 0;
    abs.forEach(ab => {
      const cnt = abs.length === 1 ? 3 : 3;
      for (let i = 0; i < cnt; i++) {
        const sp = spots[(n++) % spots.length];
        const tip = (x) => ab === 'A_A'
          ? `<path d="M${x} 24 l7 12 h-14z" fill="none" stroke="#f2b632" stroke-width="2.4"/>`
          : `<circle cx="${x}" cy="31" r="6" fill="none" stroke="#35c6d6" stroke-width="2.4"/>`;
        s += `<g transform="translate(${sp[0]} ${sp[1]}) rotate(${sp[2]})"><path d="M0 0V16M0 16L-12 28M0 16L12 28" stroke="#2358d6" stroke-width="4" stroke-linecap="round" fill="none"/>${tip(-14)}${tip(14)}</g>`;
      }
    });
    return s + '</svg>';
  }

  function renderTypes() {
    $('#typeGrid').innerHTML = TYPES.map(ty => `<button class="tcard" data-t="${ty}" aria-pressed="${ty === typeSel}">
      <b>${lab(ty)}</b><small>${FREQ[ty]}%</small><span class="bar" style="width:${Math.min(FREQ[ty] * 2.6, 100)}%"></span></button>`).join('');
    const ty = typeSel, abo = aboOf(ty);
    const ag = antigensOf(ty), ab = antibodiesOf(ty);
    const pill = (txt, cls) => `<span class="pill ${cls || ''}"><i></i>${txt}</span>`;
    const agHtml = ag.length ? ag.map(g => pill(tt('antigen_' + g), 'ag-' + g)).join('') : `<span class="pill">${tt('none')}</span>`;
    const abHtml = ab.length ? ab.map(a => `<span class="pill">${tt(a === 'A_A' ? 'anti_A' : 'anti_B')}</span>`).join('') : `<span class="pill">${tt('none')}</span>`;
    let badges = '';
    if (ty === 'O-') badges += `<span class="badge2">${tt('badge_ud')}</span>`;
    if (ty === 'AB+') badges += `<span class="badge2">${tt('badge_ur')}</span>`;
    if (abo === 'AB') badges += `<span class="badge2">${tt('badge_up')}</span>`;
    $('#typeDetail').innerHTML = `<div>${bloodSVG(ty)}</div><div>
      <h3>${lab(ty)}</h3>${badges}
      <dl><dt>${tt('antigens')}</dt><dd>${agHtml}</dd>
      <dt>${tt('antibodies')}</dt><dd>${abHtml}</dd>
      <dt>${tt('freq')}</dt><dd><b>${FREQ[ty]}%</b><div class="fbar"><i style="width:${Math.min(FREQ[ty] * 2.6, 100)}%"></i></div><small style="color:var(--muted)">${tt('freq_note')}</small></dd></dl></div>`;
  }
  $('#typeGrid').addEventListener('click', e => { const b = e.target.closest('.tcard'); if (b) { typeSel = b.dataset.t; renderTypes(); } });

  /* ================= Transfusion ================= */
  let trKind = 'cells', trRole = 'recipient', trSel = 'O+';
  function compat(d, r, kind) {
    const D = { a: aboOf(d), rh: d.slice(-1) }, R = { a: aboOf(r), rh: r.slice(-1) };
    if (kind === 'cells') return (D.a === 'O' || D.a === R.a || R.a === 'AB') && (D.rh === '-' || R.rh === '+');
    return D.a === 'AB' || D.a === R.a || R.a === 'O';
  }
  function renderTr() {
    $('#trKind').innerHTML = [['cells', 'tr_cells'], ['plasma', 'tr_plasma']].map(x => `<button data-k="${x[0]}" aria-pressed="${trKind === x[0]}">${tt(x[1])}</button>`).join('');
    $('#trRole').innerHTML = [['recipient', 'tr_iam_r'], ['donor', 'tr_iam_d']].map(x => `<button data-r="${x[0]}" aria-pressed="${trRole === x[0]}">${tt(x[1])}</button>`).join('');
    $('#trPick').innerHTML = TYPES.map(ty => `<button class="chip" data-t="${ty}" aria-pressed="${ty === trSel}">${lab(ty)}</button>`).join('');
    const list = trRole === 'recipient' ? TYPES.filter(d => compat(d, trSel, trKind)) : TYPES.filter(r => compat(trSel, r, trKind));
    const chips = trKind === 'plasma'
      ? Array.from(new Set(list.map(x => aboOf(x)))).map(a => `<span class="chip ok">${a}</span>`).join('')
      : list.map(x => `<span class="chip ok">${lab(x)}</span>`).join('');
    const selLab = trKind === 'plasma' ? aboOf(trSel) : lab(trSel);
    $('#trResult').innerHTML = `<h4>${tt('tr_type')} <b>${selLab}</b> ${tt(trRole === 'recipient' ? 'tr_canrecv' : 'tr_cangive')}</h4><div class="chips">${chips}</div>${trKind === 'plasma' ? `<p class="note">${tt('tr_plasma_note')}</p>` : ''}`;
    let h = `<thead><tr><th>${tt('donor')} ↓ / ${tt('recipient')} →</th>${TYPES.map(r => `<th class="${trRole === 'recipient' && r === trSel ? 'hl' : ''}">${lab(r)}</th>`).join('')}</tr></thead><tbody>`;
    TYPES.forEach(d => {
      h += `<tr><th class="${trRole === 'donor' && d === trSel ? 'hl' : ''}">${lab(d)}</th>`;
      TYPES.forEach(r => {
        const ok = compat(d, r, trKind);
        const hl = (trRole === 'recipient' && r === trSel) || (trRole === 'donor' && d === trSel);
        h += `<td class="${ok ? 'y' : 'n'} ${hl ? 'hl' : ''}">${ok ? '✓' : '✕'}</td>`;
      });
      h += '</tr>';
    });
    $('#matrix').innerHTML = h + '</tbody>';
  }
  $('#trKind').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { trKind = b.dataset.k; renderTr(); } });
  $('#trRole').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { trRole = b.dataset.r; renderTr(); } });
  $('#trPick').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { trSel = b.dataset.t; renderTr(); } });

  /* ================= Find my type ================= */
  let findTab = 1;
  const sim = { type: 'A+', rev: [false, false, false], blobs: [[], [], []] };
  const gen = { p1: { a: 'A', r: '+' }, p2: { a: 'B', r: '-' } };

  function newSample() {
    sim.type = TYPES[Math.floor(Math.random() * TYPES.length)];
    sim.rev = [false, false, false];
    sim.blobs = [0, 1, 2].map(() => {
      const out = [];
      for (let c = 0; c < 5; c++) {
        const a = Math.random() * Math.PI * 2, d = Math.random() * 22;
        const cx = 50 + Math.cos(a) * d, cy = 50 + Math.sin(a) * d;
        const k = 3 + Math.floor(Math.random() * 3);
        for (let j = 0; j < k; j++) out.push({ x: +(cx + (Math.random() - .5) * 11).toFixed(1), y: +(cy + (Math.random() - .5) * 11).toFixed(1), r: +(3 + Math.random() * 3.2).toFixed(1) });
      }
      return out;
    });
  }
  newSample();
  const simClumps = () => [aboOf(sim.type).indexOf('A') >= 0, aboOf(sim.type).indexOf('B') >= 0, sim.type.slice(-1) === '+'];

  function wellSVG(i) {
    if (!sim.rev[i]) return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#eef2fc" stroke="#c9d3ef" stroke-width="3"/><circle cx="50" cy="50" r="36" fill="#f6c9d0"/><text x="50" y="60" text-anchor="middle" font-size="30" fill="#d7263d" font-weight="800">+</text></svg>`;
    const clump = simClumps()[i];
    const inner = clump
      ? `<circle cx="50" cy="50" r="38" fill="#fde9ec"/>` + sim.blobs[i].map(b => `<circle cx="${b.x}" cy="${b.y}" r="${b.r}" fill="#a80f27" opacity=".92"/>`).join('')
      : `<circle cx="50" cy="50" r="38" fill="#c81e36"/><ellipse cx="40" cy="36" rx="15" ry="7" fill="#fff" opacity=".18"/>`;
    return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#eef2fc" stroke="#c9d3ef" stroke-width="3"/>${inner}</svg>`;
  }
  function pheno(a, b) { const s = [a, b].sort().join(''); return (s === 'AA' || s === 'AO') ? 'A' : (s === 'BB' || s === 'BO') ? 'B' : s === 'AB' ? 'AB' : 'O'; }
  function childTypes() {
    const G = { A: [['A', 'A'], ['A', 'O']], B: [['B', 'B'], ['B', 'O']], AB: [['A', 'B']], O: [['O', 'O']] };
    const abo = new Set();
    G[gen.p1.a].forEach(g1 => G[gen.p2.a].forEach(g2 => g1.forEach(x => g2.forEach(y => abo.add(pheno(x, y))))));
    const rh = new Set();
    const R = { '+': [['D', 'D'], ['D', 'd']], '-': [['d', 'd']] };
    R[gen.p1.r].forEach(g1 => R[gen.p2.r].forEach(g2 => g1.forEach(x => g2.forEach(y => rh.add((x === 'D' || y === 'D') ? '+' : '-')))));
    return { abo, rh };
  }

  function renderFind() {
    $('#findTabs').innerHTML = [1, 2, 3].map(n => `<button class="tab" role="tab" data-n="${n}" aria-selected="${findTab === n}">${tt('fd_tab' + n)}</button>`).join('');
    const body = $('#findBody');
    if (findTab === 1) {
      body.innerHTML = `<ol class="steps"><li>${tt('fd_s1')}</li><li>${tt('fd_s2')}</li><li>${tt('fd_s3')}</li><li>${tt('fd_s4')}</li></ol>`;
    } else if (findTab === 2) {
      const names = ['well_A', 'well_B', 'well_D'], cl = simClumps();
      const all = sim.rev.every(Boolean);
      const wells = [0, 1, 2].map(i => `<button class="well" data-i="${i}" aria-label="${tt(names[i])}">${wellSVG(i)}<b>${tt(names[i])}</b>
        <span class="${sim.rev[i] ? (cl[i] ? 'res-y' : 'res-n') : ''}">${sim.rev[i] ? (cl[i] ? tt('sim_clump') : tt('sim_smooth')) : '&nbsp;'}</span></button>`).join('');
      const res = all
        ? `<div>${tt('sim_result')}</div><div class="big">${lab(sim.type)}</div>`
        : `<div>${tt('sim_click')}</div>`;
      body.innerHTML = `<div class="sim"><div><h3 style="margin:0 0 6px">${tt('sim_title')}</h3><p style="margin:0;max-width:70ch">${tt('sim_text')}</p></div>
        <div class="wells">${wells}</div><div class="sim-result">${res}</div>
        <button class="btn btn-solid" id="simNew">${tt('sim_new')}</button><p class="note" style="margin:0">${tt('sim_help')}</p></div>`;
    } else {
      const sl = (p, who) => `<div class="card"><h4>${tt(who)}</h4>
        <select data-p="${p}" data-k="a" aria-label="ABO">${['A', 'B', 'AB', 'O'].map(a => `<option ${gen[p].a === a ? 'selected' : ''}>${a}</option>`).join('')}</select>
        <select data-p="${p}" data-k="r" aria-label="Rh">${['+', '-'].map(r => `<option value="${r}" ${gen[p].r === r ? 'selected' : ''}>Rh ${r === '-' ? '−' : '+'}</option>`).join('')}</select></div>`;
      const c = childTypes();
      const row = (arr, set, f) => arr.map(x => `<span class="chip ${set.has(x) ? 'ok' : 'no'}">${f(x)}</span>`).join('');
      body.innerHTML = `<h3 style="margin:0 0 12px">${tt('ge_title')}</h3><div class="gen">${sl('p1', 'ge_p1')}${sl('p2', 'ge_p2')}</div>
        <div class="gen-out"><div><h5>${tt('ge_abo')}</h5><div class="chips">${row(['A', 'B', 'AB', 'O'], c.abo, x => x)}</div></div>
        <div><h5>${tt('ge_rh')}</h5><div class="chips">${row(['+', '-'], c.rh, x => 'Rh ' + (x === '-' ? '−' : '+'))}</div></div>
        <p class="note" style="margin:0">${tt('ge_possible')} / ${tt('ge_impossible')} · ${tt('ge_note')}</p></div>`;
    }
  }
  $('#findTabs').addEventListener('click', e => { const b = e.target.closest('.tab'); if (b) { findTab = +b.dataset.n; renderFind(); } });
  $('#findBody').addEventListener('click', e => {
    const w = e.target.closest('.well');
    if (w) { sim.rev[+w.dataset.i] = true; renderFind(); return; }
    if (e.target.id === 'simNew') { newSample(); renderFind(); }
  });
  $('#findBody').addEventListener('change', e => {
    const s = e.target.closest('select'); if (!s) return;
    gen[s.dataset.p][s.dataset.k] = s.value; renderFind();
  });

  /* ================= Cholesterol ================= */
  const chol = { unit: 'mmol', sex: 'm', total: '', ldl: '', hdl: '', tg: '', plaque: 100 };
  const CF = { total: 38.67, ldl: 38.67, hdl: 38.67, tg: 88.57 };
  const toMg = (f, v) => chol.unit === 'mmol' ? v * CF[f] : v;
  function statusOf(f, mg) {
    if (f === 'total') return mg < 200 ? ['good', 'st_opt'] : mg < 240 ? ['warn', 'st_border'] : ['bad', 'st_high'];
    if (f === 'ldl') return mg < 100 ? ['good', 'st_opt'] : mg < 130 ? ['good', 'st_near'] : mg < 160 ? ['warn', 'st_border'] : mg < 190 ? ['bad', 'st_high'] : ['bad', 'st_vhigh'];
    if (f === 'hdl') return mg < (chol.sex === 'm' ? 40 : 50) ? ['bad', 'st_low'] : mg >= 60 ? ['good', 'st_great'] : ['good', 'st_good'];
    return mg < 150 ? ['good', 'st_good'] : mg < 200 ? ['warn', 'st_border'] : mg < 500 ? ['bad', 'st_high'] : ['bad', 'st_vhigh'];
  }
  function updateStatus() {
    ['total', 'ldl', 'hdl', 'tg'].forEach(f => {
      const el = $('#st-' + f); if (!el) return;
      const v = parseFloat(chol[f]);
      if (!isFinite(v) || v <= 0) { el.className = 'st na'; el.textContent = '—'; return; }
      const s = statusOf(f, toMg(f, v));
      el.className = 'st ' + s[0]; el.textContent = tt(s[1]);
    });
  }
  function fmt(mg, f) { return chol.unit === 'mmol' ? (mg / CF[f]).toFixed(1) + ' mmol/L' : Math.round(mg) + ' mg/dL'; }
  function renderChol() {
    $('#cholCards').innerHTML = [['ldl_t', 'ldl_d', '#d7263d'], ['hdl_t', 'hdl_d', '#2358d6'], ['tg_t', 'tg_d', '#f2b632'], ['tot_t', 'tot_d', '#7c5cd6']]
      .map(x => `<div class="ccard" style="--c:${x[2]}"><h4 style="color:${x[2]}">${tt(x[0])}</h4><p>${tt(x[1])}</p></div>`).join('');
    const ph = chol.unit === 'mmol' ? { total: '5.2', ldl: '3.0', hdl: '1.3', tg: '1.5' } : { total: '200', ldl: '116', hdl: '50', tg: '130' };
    const rows = [['total', 'f_total'], ['ldl', 'f_ldl'], ['hdl', 'f_hdl'], ['tg', 'f_tg']].map(x => `<div class="frow"><label for="in-${x[0]}">${tt(x[1])}</label>
      <input id="in-${x[0]}" type="number" inputmode="decimal" step="any" min="0" data-f="${x[0]}" value="${chol[x[0]]}" placeholder="${ph[x[0]]}"><span class="st na" id="st-${x[0]}">—</span></div>`).join('');
    const hdlT = chol.sex === 'm' ? 40 : 50;
    $('#calc').innerHTML = `<h3>${tt('calc_title')}</h3>
      <div class="row2"><div>${tt('sex')}<select class="sel" id="selSex"><option value="m" ${chol.sex === 'm' ? 'selected' : ''}>${tt('sex_m')}</option><option value="f" ${chol.sex === 'f' ? 'selected' : ''}>${tt('sex_f')}</option></select></div>
      <div>${tt('unit')}<select class="sel" id="selUnit"><option value="mmol" ${chol.unit === 'mmol' ? 'selected' : ''}>mmol/L</option><option value="mg" ${chol.unit === 'mg' ? 'selected' : ''}>mg/dL</option></select></div></div>
      ${rows}<p class="note" style="margin:12px 0 0">${tt('calc_hint')}<br>${tt('f_total')} &lt; ${fmt(200, 'total')} · LDL &lt; ${fmt(100, 'ldl')} · HDL &gt; ${fmt(hdlT, 'hdl')} · ${tt('f_tg')} &lt; ${fmt(150, 'tg')}</p>`;
    updateStatus();
    $('#plaque').innerHTML = `<h3>${tt('pl_title')}</h3><div class="plaque"><div id="plSvg"></div>
      <label for="plRange" style="font-weight:600">${tt('pl_slider')}: <b id="plVal"></b></label>
      <input type="range" id="plRange" min="50" max="220" step="1" value="${chol.plaque}">
      <p style="margin:10px 0 0">${tt('pl_narrow')} <span class="pct" id="plPct"></span></p><p class="note" style="margin:6px 0 0">${tt('pl_note')}</p></div>`;
    updatePlaque();
  }
  function updatePlaque() {
    const v = chol.plaque, tN = clamp((v - 70) / 150, 0, 1), R = 64, th = tN * 38, r = R - th;
    const cx = 100 - th * 0.35, cy = 100 + th * 0.25;
    const dots = [[-8, -6], [6, 8], [-2, 12], [10, -8], [-12, 6], [2, -14], [14, 2], [-6, 0], [0, 4], [8, 14]].slice(0, Math.round(tN * 10) + 1)
      .map(d => `<circle cx="${(cx + d[0] * r / 26).toFixed(1)}" cy="${(cy + d[1] * r / 26).toFixed(1)}" r="3.2" fill="#f2b632" stroke="#fff" stroke-width=".8"/>`).join('');
    $('#plSvg').innerHTML = `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="88" fill="#f6b5be" stroke="#d7263d" stroke-width="3"/><circle cx="100" cy="100" r="${R}" fill="#f4d170"/>
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="#c4152e"/><circle cx="${(cx - r * .3).toFixed(1)}" cy="${(cy - r * .35).toFixed(1)}" r="${(r * .25).toFixed(1)}" fill="#fff" opacity=".18"/>${dots}</svg>`;
    $('#plVal').textContent = chol.unit === 'mmol' ? (v / 38.67).toFixed(1) + ' mmol/L (' + v + ' mg/dL)' : v + ' mg/dL';
    $('#plPct').textContent = Math.round((1 - (r * r) / (R * R)) * 100) + '%';
  }
  $('#calc').addEventListener('input', e => {
    const f = e.target.dataset && e.target.dataset.f; if (!f) return;
    chol[f] = e.target.value; updateStatus();
  });
  $('#calc').addEventListener('change', e => {
    if (e.target.id === 'selSex') { chol.sex = e.target.value; renderChol(); }
    if (e.target.id === 'selUnit') {
      const nu = e.target.value;
      if (nu !== chol.unit) {
        ['total', 'ldl', 'hdl', 'tg'].forEach(f => {
          const v = parseFloat(chol[f]); if (!isFinite(v)) return;
          chol[f] = nu === 'mg' ? String(Math.round(v * CF[f])) : (v / CF[f]).toFixed(1);
        });
        chol.unit = nu;
      }
      renderChol();
    }
  });
  $('#plaque').addEventListener('input', e => { if (e.target.id === 'plRange') { chol.plaque = +e.target.value; updatePlaque(); } });

  /* ================= Vitamins ================= */
  const vitOpen = new Set(['b12']);
  const symOn = new Set();
  function renderVit() {
    $('#vitGrid').innerHTML = VIT.map(v => `<article class="vcard" style="--c:${v.color}" aria-expanded="${vitOpen.has(v.id)}">
      <button class="vhead" data-id="${v.id}"><span class="vtag">${v.tag}</span><span><strong>${t(v.name)}</strong><small>${t(v.role)}</small></span></button>
      <dl class="vbody"><dt>${tt('vt_src')}</dt><dd>${t(v.src)}</dd><dt>${tt('vt_need')}</dt><dd>${t(v.need)}</dd>
      <dt>${tt('vt_test')}</dt><dd>${t(v.test)}</dd><dt>${tt('vt_range')}</dt><dd>${t(v.range)}</dd><dt>${tt('vt_def')}</dt><dd>${t(v.def)}</dd></dl></article>`).join('');
  }
  $('#vitGrid').addEventListener('click', e => {
    const b = e.target.closest('.vhead'); if (!b) return;
    const id = b.dataset.id; if (vitOpen.has(id)) vitOpen.delete(id); else vitOpen.add(id);
    b.parentElement.setAttribute('aria-expanded', String(vitOpen.has(id)));
  });
  function renderSym() {
    $('#symList').innerHTML = SYMP.map(s => `<label class="sym"><input type="checkbox" data-id="${s.id}" ${symOn.has(s.id) ? 'checked' : ''}><span>${t(s.text)}</span></label>`).join('');
    updateSymResult();
  }
  function updateSymResult() {
    const sc = {};
    SYMP.forEach(s => { if (symOn.has(s.id)) Object.keys(s.w).forEach(k => { sc[k] = (sc[k] || 0) + s.w[k]; }); });
    const top = Object.keys(sc).sort((a, b) => sc[b] - sc[a]).slice(0, 3);
    const el = $('#symResult');
    if (!top.length) { el.innerHTML = `<h3>${tt('sy_result')}</h3><p style="color:var(--muted)">${tt('sy_empty')}</p>`; return; }
    const max = sc[top[0]];
    el.innerHTML = `<h3>${tt('sy_result')}</h3>` + top.map(id => {
      const v = VIT.find(x => x.id === id);
      return `<div class="score"><div class="top"><span>${t(v.name)}</span></div>
        <div class="fbar"><i style="width:${Math.round(sc[id] / max * 100)}%;background:${v.color}"></i></div>
        <small>${tt('sy_ask')} ${t(v.test)}</small></div>`;
    }).join('') + `<p class="note" style="margin:8px 0 0">${tt('disc')}</p>`;
  }
  $('#symList').addEventListener('change', e => {
    const id = e.target.dataset.id; if (!id) return;
    if (e.target.checked) symOn.add(id); else symOn.delete(id);
    updateSymResult();
  });

  /* ================= language ================= */
  function applyLang() {
    document.documentElement.lang = LANG;
    document.title = tt('title');
    $$('[data-i18n]').forEach(el => { el.textContent = tt(el.dataset.i18n); });
    $$('[data-i18n-ph]').forEach(el => { el.placeholder = tt(el.dataset.i18nPh); });
    $$('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === LANG)));
    if (window.HemoChat) window.HemoChat.refresh();
    if (window.HemoEcg) window.HemoEcg.refresh();
    if (window.HemoExtra) window.HemoExtra.refresh();
    renderParts(); renderInfo(); renderModeSeg();
    renderComp(); renderTypes(); renderTr(); renderFind(); renderChol(); renderVit(); renderSym();
  }
  $('.lang').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    LANG = b.dataset.lang;
    try { localStorage.setItem('hemo-lang', LANG); } catch (err) { /* ignore */ }
    applyLang();
  });
  applyLang();
})();
